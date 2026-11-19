const APPS = Object.freeze({
  'classroom-cycling': {
    title: 'Cycling Energy Metabolism Simulator / 骑行能量代谢模拟器',
    path: '/apps/cycling/'
  },
  'classroom-cardiac-cycle': {
    title: 'CardiacCycle 3D / 心动周期三维同步教学系统',
    path: '/apps/cardiac_cycle/'
  }
});

let embeddedApp;

// Events inside a frame stay there. When focus is on the deck, reserve arrows
// on these pages too, so focusing a navigation button never advances by accident.
export function classroomAppConsumesKey(slide, key) {
  return Object.hasOwn(APPS, slide?.interactive) && (key === 'ArrowLeft' || key === 'ArrowRight');
}

function installStyles() {
  if (document.getElementById('classroom-app-styles')) return;
  const style = document.createElement('style');
  style.id = 'classroom-app-styles';
  style.textContent = `
    #viewport:has(> #stage.classroom-app-active) { max-height: none; }
    #stage.classroom-app-active {
      --app-nav-height: 48px;
      width: 100%; max-width: none; aspect-ratio: auto;
      height: clamp(360px, calc(100dvh - 216px), 900px);
      background: #f4f8fc;
    }
    #stage.classroom-app-active #slide-content { pointer-events: none; }
    #stage.classroom-app-active .slide-navigation {
      right: 8px; bottom: 5px; height: calc(var(--app-nav-height) - 10px); align-items: center;
    }
    #stage.classroom-app-active .slide-navigation button { width: 42px; height: 34px; }
    .classroom-app-layer { position: absolute; inset: 0 0 var(--app-nav-height, 48px); z-index: 1; }
    #stage.classroom-app-poster .classroom-app-layer { bottom: var(--poster-nav-height, 34px); pointer-events: none; }
    #stage.classroom-app-poster #slide-content { background: #eaf3f9; }
    .classroom-app-frame { display: block; width: 100%; height: 100%; border: 0; background: #f4f8fc; }
    .classroom-app-standalone {
      position: absolute; left: 14px; bottom: 0; height: var(--app-nav-height);
      align-items: center; font-size: 13px; z-index: 3;
    }
    .classroom-app-standalone:not([hidden]) { display: flex; }
    @media (max-width: 800px) {
      #stage.classroom-app-active { height: clamp(350px, calc(100dvh - 192px), 900px); }
    }
    @media (max-height: 520px) and (orientation: landscape) {
      #stage.classroom-app-active { height: max(180px, calc(100dvh - 132px)); }
    }
    #viewport:fullscreen #stage.classroom-app-active {
      width: 100%; height: 100%; max-width: none; aspect-ratio: auto;
    }
  `;
  document.head.append(style);
}

function createClassroomApp(stage, key) {
  const app = APPS[key];
  installStyles();
  const layer = document.createElement('div');
  layer.className = 'classroom-app-layer';
  const frame = document.createElement('iframe');
  frame.className = 'classroom-app-frame';
  frame.title = app.title;
  frame.src = app.path;
  frame.allowFullscreen = true;

  const link = document.createElement('a');
  link.className = 'classroom-app-standalone';
  link.href = app.path;
  link.target = '_blank';
  link.rel = 'noopener';
  const english = document.createElement('span');
  english.className = 'lang-en';
  english.textContent = 'Open app separately';
  const chinese = document.createElement('span');
  chinese.className = 'lang-zh';
  chinese.textContent = '单独打开';
  link.append(english, '\u00a0/\u00a0', chinese, ' ↗');

  layer.append(frame);
  stage.append(layer, link);
  return { key, layer, frame, link };
}

export function renderClassroomApp(host, slide) {
  const stage = host.closest('#stage');
  const active = Object.hasOwn(APPS, slide?.interactive);
  const poster = Object.hasOwn(APPS, slide?.classroomApp);
  const key = active ? slide.interactive : slide?.classroomApp;
  stage.classList.toggle('classroom-app-active', active);
  stage.classList.toggle('classroom-app-poster', poster);

  if (embeddedApp && (!active || embeddedApp.key !== key)) {
    const { layer, link } = embeddedApp;
    if (layer.contains(document.activeElement) || document.activeElement === link) {
      stage.focus({ preventScroll: true });
    }
    if (embeddedApp.key !== key) {
      layer.remove();
      link.remove();
      embeddedApp = undefined;
    }
  }
  if (active && !embeddedApp) embeddedApp = createClassroomApp(stage, key);
  if (!embeddedApp) return;

  // Keep the original document running while students scan the paired poster.
  const { layer, frame, link } = embeddedApp;
  layer.toggleAttribute('inert', !active);
  if (active) {
    layer.removeAttribute('aria-hidden');
    frame.removeAttribute('tabindex');
  } else {
    layer.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
  }
  link.hidden = !active;
}
