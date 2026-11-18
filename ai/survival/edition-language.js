const HAN = /[\u3400-\u9fff]/;
const LATIN = /[A-Za-z]/;
const SVG = 'http://www.w3.org/2000/svg';
const COPY_BREAK = /(\s+\/\s*|\/(?=[\u3400-\u9fff])|\n|[|｜]|\s+·\s+)/;

function languageOf(value) {
  return HAN.test(value) ? 'zh' : LATIN.test(value) ? 'en' : '';
}

function copyParts(value) {
  const lines = value.split(/(\n|[|｜])/);
  return lines.flatMap((line, i) => {
    if (i % 2 || !HAN.test(line) || !LATIN.test(line)) return [line];
    // A separator between different languages marks a translation boundary.
    // Keep an acronym-only fragment in its surrounding Chinese sentence.
    const chunks = line.split(COPY_BREAK);
    const parts = [];
    let current = chunks[0];
    for (let j = 1; j < chunks.length; j += 2) {
      const next = chunks[j + 1];
      if (languageOf(current) && languageOf(next) && languageOf(current) !== languageOf(next)
          && !/^(?:AI|Agent|LLM|CNN|NLP|API)$/i.test((HAN.test(current) ? next : current).trim())) {
        parts.push(current, chunks[j]);
        current = next;
      } else {
        current += chunks[j] + next;
      }
    }
    parts.push(current);
    return parts;
  });
}

// Survey labels use " / " or a line break to separate complete translations.
export function setBilingualCopy(element, value) {
  element.replaceChildren(...copyParts(String(value)).map(part => {
    const language = languageOf(part);
    if (!language) return document.createTextNode(part);
    const span = document.createElement('span');
    span.className = `deck-copy-${language}`;
    span.lang = language === 'zh' ? 'zh-CN' : 'en';
    span.textContent = part;
    return span;
  }));
}

function markLanguage(node, language) {
  if (language && node.dataset.deckLang !== language) node.dataset.deckLang = language;
}

function paintSvgText(text) {
  if (text.matches('.ai-zh') || text.closest('.ai-raster-overlays,[data-cluster]')) return;
  const declared = text.dataset.deckLang || text.dataset.lang || text.dataset.copyLine;
  if (declared) { markLanguage(text, declared); return; }
  const spans = [...text.children].filter(child => child.matches('tspan[data-lang]'));
  if (spans.some(span => span.hasAttribute('y'))) {
    for (const span of spans) markLanguage(span, languageOf(span.textContent) || span.dataset.lang);
    return;
  }
  const value = text.textContent;
  const parts = copyParts(value);
  if (text.dataset.copySplit && !text.querySelector('tspan[data-deck-lang]')) delete text.dataset.copySplit;
  if (!text.dataset.copySplit && new Set(parts.map(languageOf).filter(Boolean)).size > 1
      && !/[ ,]/.test(text.getAttribute('x')?.trim() || '')
      && !text.querySelector('tspan[x],tspan[y]')) {
    text.dataset.copySplit = 'true';
    text.replaceChildren(...parts.map(part => {
      const span = document.createElementNS(SVG, 'tspan');
      const language = languageOf(part);
      markLanguage(span, language);
      if (language) span.setAttribute('lang', language === 'zh' ? 'zh-CN' : 'en');
      span.textContent = part;
      return span;
    }));
  } else if (!text.dataset.copySplit) {
    // Re-evaluate live SVG labels whose value changes from one language to another.
    const language = languageOf(value);
    if (language && text.dataset.liveLang !== language) text.dataset.liveLang = language;
  }
}

const SKIP_HTML = 'script,style,textarea,select,option,input,code,pre,.ai-zh,.deck-copy-en,.deck-copy-zh,.lang-en,.lang-zh,[lang="en"],[lang="zh-CN"]:not(html)';

export function watchEditionColors(root) {
  function paintText(node) {
    const parent = node.parentElement;
    if (!parent || !root.contains(parent)) return;
    if (parent.namespaceURI === SVG) {
      const text = parent.closest('text');
      if (text) paintSvgText(text);
      return;
    }
    if (parent.closest(SKIP_HTML) || !languageOf(node.data)) return;
    const paint = document.createElement('span');
    setBilingualCopy(paint, node.data);
    node.replaceWith(...paint.childNodes);
  }
  function collect(node, into) {
    if (node.nodeType === Node.TEXT_NODE) { into.add(node); return; }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) into.add(text);
  }
  const initial = new Set();
  collect(root, initial);
  initial.forEach(paintText);
  const observer = new MutationObserver(records => {
    const changed = new Set();
    for (const record of records) {
      if (record.type === 'characterData') changed.add(record.target);
      else for (const node of record.addedNodes) collect(node, changed);
    }
    changed.forEach(paintText);
  });
  observer.observe(root, {subtree:true, childList:true, characterData:true});
  return observer;
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
    // Keep the historical video available on demand, using the static frame as its poster.
    if (slide.media) {
      slide.media = {...slide.media, poster: slide.media.poster.replace('0cc9d9ebb1bce11f.webp', 'lenet-demo-still-v1.webp')};
    }
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

  // PDF exports sometimes put a Latin term in a separate run on a Chinese baseline.
  const runs = [...svg.querySelectorAll(':scope > text')];
  const baseline = text => parseFloat(text?.getAttribute('y'));
  for (const [i, run] of runs.entries()) {
    const value = run.textContent.trim();
    if (run.dataset.lang || HAN.test(value) || !/^(?:[A-Z][A-Z0-9-]{0,9}|LeNet1|\.skill|\d{4})$/.test(value)) continue;
    const adjacent = [runs[i-1], runs[i+1]].filter(other => other && Math.abs(baseline(run)-baseline(other))<.15);
    if (adjacent.some(other => HAN.test(other.textContent) && !other.dataset.lang)) markLanguage(run,'zh');
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
