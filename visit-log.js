/* Slides-only visit collector. Sharing helper adds public address attribution; no second collector. */
(function () {
  "use strict";
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;
  if (!/^\/slides(?:\/|$)/.test(location.pathname) ||
      window.__kuaiyuVisitLoggerLoaded || window.__kuaiyuSlidesVisitLoggerLoading) return;
  window.__kuaiyuSlidesVisitLoggerLoading = true;
  function beginCollector() {
  function id() { return window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : "slides-" + Date.now().toString(36) + Math.random().toString(36).slice(2); }
  function stored(name, key) {
    try { var storage = window[name], value = storage.getItem(key); if (value) return value;
      value = id(); storage.setItem(key, value); return value; } catch (_) { return id(); }
  }
  var visitor = stored("localStorage", "kuaiyu_visit_visitor_id");
  var session = stored("sessionStorage", "kuaiyu_visit_session_id");
  var sequence = 0, page, sharingReady = false, pending = [];
  var slideFragment = /^#(?:s|app-)[1-9]\d{0,3}$/;
  var deckRoot = document.documentElement;
  function publicUrl(value) {
    var url = new URL(value, location.href);
    Array.from(url.searchParams.keys()).forEach(function (key) {
      if (url.origin !== location.origin || url.searchParams.getAll(key).length !== 1 ||
          !(key === "via" && /^[A-Za-z0-9_-]{12,32}$/.test(url.searchParams.get(key)) ||
            key === "lang" && /^[a-z]{2}(?:-[A-Za-z]{2,4})?$/.test(url.searchParams.get(key)) ||
            key === "sec" && /^sec[1-5]$/.test(url.searchParams.get(key)) ||
            key === "backups" && url.searchParams.get(key) === "1")) {
        url.searchParams.delete(key);
      }
    });
    if (url.origin !== location.origin || !slideFragment.test(url.hash)) url.hash = "";
    return url;
  }
  var referrer = document.referrer ? publicUrl(document.referrer).href : null;
  function contentUrl() {
    var url = publicUrl(location.href);
    var slide = deckRoot.getAttribute("data-visit-slide");
    // The renderer reports which slide actually opened, including defaults and failed deep links.
    if (slide !== null) url.hash = slideFragment.test(slide) ? slide : "";
    return url;
  }
  function begin(url) {
    url = url || contentUrl();
    page = { id: id(), started: new Date().toISOString(), at: performance.now(), sequence: ++sequence,
      url: url.href, fragment: url.hash, title: document.title, final: false };
  }
  function send(type, reason, final) {
    if (!page || page.final) return;
    if (final) page.final = true;
    var ms = Math.max(0, Math.round(performance.now() - page.at));
    var data = { eventType: type, url: page.url, title: page.title, referrer: referrer,
      language: navigator.language || null, loggerVersion: "slides-visits/20261122-fragments2",
      visitorId: visitor, sessionId: session,
      duration: { ms: ms, seconds: Math.round(ms / 100) / 10, reason: reason, sequence: page.sequence,
        pageId: page.id, startedAt: page.started, endedAt: new Date().toISOString(), final: !!final } };
    try { data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (_) {}
    if (sharingReady) transmit(data);
    else {
      pending.push(data);
      if (pending.length >= 64) finishSharing();
    }
  }
  function transmit(data) {
    var share = window.KuaiyuShareLink && window.KuaiyuShareLink.fields();
    if (share) {
      data.share = share;
      if (share.ownCode) {
        var url = new URL(data.url);
        url.searchParams.set("via", share.ownCode);
        data.url = url.href;
      }
    }
    var json = JSON.stringify(data);
    try { if (navigator.sendBeacon && navigator.sendBeacon("/api/visit", new Blob([json], {type: "application/json"}))) return; } catch (_) {}
    try { fetch("/api/visit", { method: "POST", headers: {"Content-Type": "application/json"}, body: json,
      credentials: "same-origin", keepalive: true }).catch(function () {}); } catch (_) {}
  }
  function finishSharing() {
    if (sharingReady) return;
    sharingReady = true;
    window.__kuaiyuVisitLoggerLoaded = true;
    pending.forEach(transmit);
    pending = [];
  }
  begin(); send("pageview", "pageview", false);
  if (document.visibilityState === "hidden") send("page_duration", "visibility_hidden", true);
  window.setInterval(function () { if (document.visibilityState !== "hidden") send("page_duration", "heartbeat", false); }, 10000);
  function contentChanged() {
    if (document.visibilityState === "hidden") return;
    var url = contentUrl();
    if (url.hash === page.fragment) return;
    send("page_duration", "hashchange", true);
    begin(url);
    send("hashchange", "hashchange_start", false);
  }
  window.addEventListener("hashchange", contentChanged);
  new MutationObserver(contentChanged).observe(deckRoot, { attributes: true, attributeFilter: ["data-visit-slide"] });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") send("page_duration", "visibility_hidden", true);
    else if (page.final) { begin(); send("pageshow", "visible_again", false); }
  });
  window.addEventListener("pagehide", function () {
    send("page_duration", "pagehide", true);
    finishSharing();
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted && page.final && document.visibilityState !== "hidden") { begin(); send("pageshow", "pageshow", false); }
  });
  return finishSharing;
  }
  // Capture rendered slides immediately while the optional share helper loads.
  var finishSharing = beginCollector();
  if (window.KuaiyuShareLink) finishSharing();
  else {
    var helper = document.createElement("script");
    helper.src = "/scripts/share-link.js?v=20261120-visible1";
    var fallback = window.setTimeout(finishSharing, 2000);
    function ready() { window.clearTimeout(fallback); finishSharing(); }
    helper.onload = ready;
    helper.onerror = ready;
    document.head.appendChild(helper);
  }
})();
