const HAN = /[\u3400-\u9fff]/;
const LATIN = /[A-Za-z]/;

// Survey labels use " / " or a line break to separate complete translations.
export function setBilingualCopy(element, value) {
  const parts = String(value).split(/(\s\/\s|\n|[|｜])/);
  element.replaceChildren(...parts.map((part, index) => {
    if (index % 2 || (!HAN.test(part) && !LATIN.test(part))) return document.createTextNode(part);
    const span = document.createElement('span');
    const language = HAN.test(part) ? 'zh' : 'en';
    span.className = `deck-copy-${language}`;
    span.lang = language === 'zh' ? 'zh-CN' : 'en';
    span.textContent = part;
    return span;
  }));
}

export function refineEditionSlide(slide, edition, isBackup) {
  if (isBackup) return;
  // Stable source IDs 5 and 7 are presentation pages 7 and 9.
  if (slide.n === 5) {
    if (edition === 'student') {
      slide.titleEn = 'Today’s plan: understand, use and create';
      slide.titleZh = '今天的计划：理解、使用与创造';
      slide.text = slide.text?.replace('Our route through the AI wave', slide.titleEn)
        .replace('今天的路线：理解 → 使用 → 创造', slide.titleZh);
    } else {
      slide.titleEn = 'Outline';
      slide.titleZh = '目录';
    }
    slide.title = slide.titleZh;
  }
  if (slide.n === 7) {
    slide.staticPresentation = true;
    slide.text = slide.text?.replace('手写字母', '手写数字');
    delete slide.video;
    delete slide.media;
  }
}

export function colorEditionArtwork(svg, slide) {
  if (!svg?.classList.contains('slide-svg')) return;
  if (slide.n === 5) {
    const english = svg.querySelector('.bi-pair [data-lang="en"]') || svg.querySelector('text');
    const chinese = svg.querySelector('.bi-pair [data-lang="zh"]') || english?.nextElementSibling;
    for (const [text, title] of [[english, slide.titleEn], [chinese, slide.titleZh]]) {
      if (!text || text.localName !== 'text') continue;
      for (const axis of ['x', 'y']) {
        const position = text.getAttribute(axis);
        if (position) text.setAttribute(axis, position.split(/\s+/)[0]);
      }
      text.textContent = title;
    }
  }

  for (const text of svg.querySelectorAll('text')) {
    if (text.closest('.ai-raster-overlays') || text.matches('.ai-zh')) continue;
    // Respect diagrams with their own visual encoding and explicit bilingual tspans.
    if (text.querySelector('[data-lang]') && !text.dataset.lang) continue;
    const fill = text.getAttribute('fill');
    if (!text.dataset.lang && fill && !['#3f3f46', '#7030a0', '#000', '#000000', 'black'].includes(fill.toLowerCase())) continue;
    const language = text.dataset.lang || (HAN.test(text.textContent) ? 'zh' : LATIN.test(text.textContent) ? 'en' : '');
    if (language) text.dataset.deckLang = language;
  }

  if (slide.n === 7) {
    // The original PDF splits the Chinese sentence's 1990, LeNet and CNN into separate runs.
    const still = svg.querySelector('image[href$="0cc9d9ebb1bce11f.webp"]');
    if (still) still.setAttribute('href', new URL(still.getAttribute('href').replace('0cc9d9ebb1bce11f.webp', 'lenet-demo-still-v1.webp'), document.baseURI).href);
    const texts = [...svg.querySelectorAll(':scope > text')];
    for (const span of svg.querySelectorAll('text tspan')) {
      if (span.textContent.includes('手写字母')) span.textContent = span.textContent.replace('手写字母', '手写数字');
    }
    const separator = texts.find(text => /handwritten digits\.\s*\|/.test(text.textContent));
    if (separator) {
      const row = parseFloat(separator.getAttribute('y'));
      for (const text of texts.slice(texts.indexOf(separator) + 1)) {
        if (parseFloat(text.getAttribute('y')) !== row) break;
        text.dataset.deckLang = 'zh';
      }
    }
  }
}
