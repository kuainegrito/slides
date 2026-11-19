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

// Adapted from the ten Agent tips on pages 59–61 of the source PDF.
function agentTips(edition) {
  const practice = edition === 'student'
    ? ['Try it today: Make one diagram for a course and check it against the textbook.', '今天就试：为一门课做一张机制图，再对照教材核对。']
    : ['Try it today: Make one teaching figure and check it against the source.', '今天就试：为一节课做一张教学图，再对照原始资料核验。'];
  return [
    {
      title: ['Agent 1/3 · Plan the task', 'Agent 1/3 · 开工前定目标与边界'],
      prompt: ['What should the Agent deliver, and how will you check it?', '先说清交付物、验收标准和可操作范围。'],
      rows: [
        ['Define a pass: name the output file, the checks and the expected result.', '先写验收标准：文件放哪、怎么验证、预期结果是什么。'],
        ['Limit access to named files and actions. De-identify data before upload.', '只开放指定文件和操作权限，资料上传前先去标识化。'],
        ['On a tight budget, review a draft plan from a lighter model before scaling up.', '词元紧张时，先用轻量模型起草方案，审核后再决定是否升级。'],
      ],
    },
    {
      title: ['Agent 2/3 · Verify the work', 'Agent 2/3 · 留痕、回退与核验'],
      prompt: ['Could someone retrace the work and check the result?', '让每次交付都能追溯、复核和回退。'],
      rows: [
        ['Keep a task log or commit. Back up files before editing and test rollback.', '用日志、Markdown 或提交记录留痕，修改前备份并确认能回退。'],
        ['Keep irreversible actions such as permanent deletion under human control.', '永久删除等无法撤销的操作，由人决定并执行。'],
        ['Ask for command output, the file actually read, or a verified DOI.', '核对实际命令输出、读过的文件，或确实查到的文献 DOI。'],
      ],
    },
    {
      title: ['Agent 3/3 · Build a reusable workflow', 'Agent 3/3 · 把一次成功变成可复用流程'],
      prompt: ['Keep the steps and checks that worked. Test them on a small task.', '把跑通的步骤和核验方法写下来，用小任务再试一次。'],
      rows: [
        ['Read borrowed Skills first. Review their actions and adapt them to your work.', '先读别人的 Skill，检查它会做什么，再改成适合你的流程。'],
        ['Update your own Skill after each run with fixes and checks you can reuse.', '每次实践后，把有效的改法和验收条件更新到自己的 Skill。'],
        practice,
      ],
    },
  ];
}

function closingReflection(edition) {
  const task = edition === 'student'
    ? ['Real task: Choose a small project you can finish this semester.', '真实任务：选一个本学期能完成的小项目。']
    : ['Real task: Choose one part of a lesson you want to improve.', '真实任务：选一个你想改进的教学环节。'];
  return {
    title: ['Reflection → Action', '从反思到行动'],
    prompt: ['Think back to our opening survey. Where will you try AI next?', '回想开场问卷。下一次，你想在哪一步用 AI？'],
    rows: [
      task,
      ['One step for AI: Decide what you will ask it to do.', '交给 AI 的一步：写下你希望它帮你完成什么。'],
      ['One check you own: What evidence will tell you the result is ready?', '由你验收的一步：用什么证据判断结果可以交付？'],
    ],
  };
}

function applyNarrativePage(slide, {title, prompt, rows}, toolkit = false) {
  const xml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const pair = ([en, zh], x, y, enSize, zhSize, anchor = 'start') =>
    `<g class="bi-pair"><text x="${x}" y="${y}" font-family="BiSans, sans-serif" font-size="${enSize}" fill="#111111" data-lang="en" text-anchor="${anchor}">${xml(en)}</text>
      <text x="${x}" y="${y + zhSize + 7}" font-family="BiKai, KaiTi, serif" font-size="${zhSize}" fill="#6b3696" data-lang="zh" text-anchor="${anchor}">${xml(zh)}</text></g>`;
  const layout = toolkit
    ? `${pair(title, 36, 37, 23, 29)}
      ${rows.map((row, index) => {
        const y = 132 + index * 96;
        return `<circle cx="49" cy="${y}" r="12" fill="#e8eef5" stroke="#c2cddc"/>
          <text x="49" y="${y + 4}" font-size="12" data-lang="en" text-anchor="middle">${index + 1}</text>
          ${pair(row, 76, y, 16, 20)}`;
      }).join('')}
      ${pair(prompt, 480, 491, 14, 18, 'middle')}`
    : `<rect width="960" height="540" fill="#edf5fb"/>
      <rect x="58" y="37" width="65" height="4" rx="2" fill="#8873b4"/>
      ${pair(title, 58, 87, 38, 35)}
      ${pair(prompt, 58, 169, 20, 24)}
      ${rows.map((row, index) => {
        const y = 217 + index * 86;
        return `<rect x="58" y="${y}" width="844" height="76" rx="12" fill="#f7fbff" stroke="#cbdce9"/>
          ${pair(row, 80, y + 27, 18, 23)}`;
      }).join('')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" class="slide-svg" role="img" aria-label="${xml(title.join(' / '))}">${layout}</svg>`;
  const [titleEn, titleZh] = title;
  Object.assign(slide, {
    title: titleZh, titleEn, titleZh, svg,
    text: [title, prompt, ...rows].flat().join('\n'),
    thumb: 'data:image/svg+xml,' + encodeURIComponent(svg),
    staticPresentation: !toolkit,
  });
  if (slide.studentTask) {
    slide.studentTaskEn = rows[2][0];
    slide.studentTask = rows[2][1];
  }
}

export function arrangeClassroomSlides(deck, edition) {
  const intro = deck.slides.find(slide => slide.n === 23);
  const transfer = deck.slides.find(slide => slide.n === 72);
  if (!intro || !transfer || deck.slides.some(slide => slide.n === 74)) return deck;

  // Reuse the former P32 once. The later tips/toolkits cover the former P21.
  const removed = new Set([
    19, 23, 24, 25, 26, 27, 28, 29,
    // Former P41 and P45–P52 by stable slide IDs.
    37, 41, 42, 43, 44, 45, 46, 47, 48,
  ]);
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
  const generalTipsIndex = deck.slides.findIndex(slide => slide.n === 51);
  if (generalTipsIndex >= 0) {
    const pages = agentTips(edition).map((content, index) => {
      const slide = {n: 79 + index, chapter, originalLinks: []};
      if (edition === 'student') {
        slide.studentTaskEn = content.rows[2][0];
        slide.studentTask = content.rows[2][1];
      }
      applyNarrativePage(slide, content, true);
      return slide;
    });
    deck.slides.splice(generalTipsIndex + 1, 0, ...pages);
  }
  const comicIndex = deck.slides.findIndex(slide => slide.n === 33);
  if (comicIndex >= 0) {
    const comic = deck.slides[comicIndex];
    const titleEn = 'Original comic: English prompt';
    const titleZh = '原版漫画：英文提示词';
    deck.slides.splice(comicIndex, 1, {
      ...comic,
      n: 78,
      title: titleZh,
      titleEn,
      titleZh,
      text: titleEn + '\n' + titleZh,
      staticPresentation: true,
      ...(edition === 'student' && {
        studentTaskEn: 'Use this comic as the English reference for the comparison on the next slide.',
        studentTask: '把这张漫画作为英文提示词的参照，比较下一页的多语言版本。',
      }),
    });
  }
  const closing = deck.slides.find(slide => slide.n === 63);
  if (closing) {
    applyNarrativePage(closing, closingReflection(edition));
    const pollPage = (n, kind, titleEn, titleZh) => ({
      n, chapter: closing.chapter, title: titleZh, titleEn, titleZh,
      text: titleEn + '\n' + titleZh, originalLinks: [],
      thumb: new URL('./survey/thumb.svg', import.meta.url).href,
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"></svg>',
      interactive: 'survey-closing-' + kind, staticPresentation: true,
    });
    const thanks = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" class="slide-svg" role="img" aria-label="Thank you! / 谢谢！"><text x="480" y="246" text-anchor="middle" font-size="66" data-lang="en">Thank you!</text><text x="480" y="331" text-anchor="middle" font-size="58" data-lang="zh">谢谢！</text></svg>';
    deck.slides.splice(deck.slides.indexOf(closing) + 1, 0,
      pollPage(82, 'join', 'Lecture highlights · Vote', '课末快问 · 扫码投票'),
      pollPage(83, 'results', 'Lecture highlights · Results', '课末快问 · 结果'),
      {
        n: 84, chapter: closing.chapter, title: '谢谢！', titleEn: 'Thank you!', titleZh: '谢谢！',
        text: 'Thank you! / 谢谢！', originalLinks: [], svg: thanks,
        thumb: 'data:image/svg+xml,' + encodeURIComponent(thanks), staticPresentation: true,
      },
    );
  }
  return deck;
}
