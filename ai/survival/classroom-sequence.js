const CYCLING_POSTER = new URL('./classroom-posters/cycling-definitive-dual-qr.jpg', import.meta.url).href;
const CARDIAC_POSTER = new URL('./classroom-posters/cardiac-cycle-poster-watercolor-tri-qr.png', import.meta.url).href;

function demoSlide(n, chapter, titleEn, titleZh, poster, classroomApp, isPoster = false) {
  const image = `<image href="${poster}" x="0" y="0" width="960" height="540" preserveAspectRatio="xMidYMid meet"/>`;
  return {
    n, chapter, title: titleZh, titleEn, titleZh, thumb: poster,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" class="slide-svg${isPoster ? ' classroom-poster' : ''}" role="img" aria-label="${titleEn} / ${titleZh}">${isPoster ? image : ''}</svg>`,
    text: `${titleEn}\n${titleZh}`, originalLinks: [], staticPresentation: true,
    ...(isPoster ? {classroomApp} : {interactive: classroomApp}),
  };
}

export function arrangeClassroomSlides(deck) {
  const intro = deck.slides.find(slide => slide.n === 23);
  const transfer = deck.slides.find(slide => slide.n === 72);
  if (!intro || !transfer || deck.slides.some(slide => slide.n === 74)) return deck;

  // Reuse the former P32 once. The later tips/toolkits cover the former P21.
  const removed = new Set([19, 23, 24, 25, 26, 27, 28, 29]);
  deck.slides = deck.slides.filter(slide => !removed.has(slide.n));
  const insertAt = deck.slides.indexOf(transfer) + 1;
  const chapter = intro.chapter;
  deck.slides.splice(insertAt, 0, intro,
    demoSlide(74, chapter, 'Cycling Energy Metabolism Simulator', '骑行能量代谢模拟器', CYCLING_POSTER, 'classroom-cycling'),
    demoSlide(75, chapter, 'Cycling classroom QR poster', '骑行课堂扫码图', CYCLING_POSTER, 'classroom-cycling', true),
    demoSlide(76, chapter, 'CardiacCycle 3D', '心动周期三维同步教学系统', CARDIAC_POSTER, 'classroom-cardiac-cycle'),
    demoSlide(77, chapter, 'CardiacCycle classroom QR poster', '心动周期课堂扫码图', CARDIAC_POSTER, 'classroom-cardiac-cycle', true),
  );
  deck.chapters = deck.chapters.map(chapter => chapter.start === 19 ? {...chapter, start: 20} : chapter);
  return deck;
}
