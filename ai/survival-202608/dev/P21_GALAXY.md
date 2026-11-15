# P21 multilingual semantic galaxy

## 2026-11-15: dense labels, focused travel and neutral exploration

Both student and teacher players share this implementation. The initial neutral galaxy orbits for 14 seconds, then visits 东西, bank, light, 花, glace, date, llama and کل in 8-second slots (2-second source hold, 4-second travel, 2-second destination hold). Autoplay focuses to 1.9x at a meaning, pulls back during travel and focuses again. Manual tab changes retain a two-meaning comparison and smoothly retarget the currently displayed camera/framing, including interrupted clicks.

Random explore, beside Reset view, selects a neutral galaxy with automatic orbit and interactive wheel/pinch zoom. It does not highlight future examples or advance the tour. Play returns to the current example; tab selection leaves exploration. Reduced-motion and the global motion pause prevent automated movement, including subsequent Play/Orbit/Space clicks. Static meaning selection, zoom and direct manipulation remain usable.

The 672 contextual neighbors are 144 English, 240 Chinese, 96 Spanish, 96 Portuguese and 24 each Arabic, Korean, Japanese and Russian. The Urdu example displays کل rather than a Latin transliteration. Native SVG renders Arabic/Urdu shaping; cached Canvas atlases render other minor labels. Local subset fonts retain shaping tables and all required codepoints. Distances and size tiers are authored illustrations, not measured model embeddings; the visible legend states this limitation.

### Verification

- `node ai/survival-202608/dev/test_tokens_timing.mjs`
- `node ai/survival-202608/dev/test-tokens-neighbors.mjs`
- `node scripts/test-tokens-zoom.cjs` (Chrome via locally installed Playwright; `SLIDES_TEST_ROOT` may point to an isolated tree)
- `node scripts/test-tokens-zoom-cold.cjs` (cold first-use routes)
- Add `--live` for public student and teacher checks. A configured HTTPS_PROXY is used only by the disposable live test browser.
- Font regeneration on Windows K: `node scripts/export-token-language-text.cjs`, then `python -B ai/survival-202608/dev/build_tokens_international_fonts.py`; fontTools is installed in the F-drive cache. Existing v10 subsets and Windows font sources are inputs.

Desktop 1440px and phone-width 390px tests cover actual intro/slot timing, neutral/selected emphasis, source/travel/arrival zoom, script coverage, explore persistence and zoom, far/rapid switches, pause/resume, reduced motion, global pause, navigation reentry, original-image fallback, and overflow. Screenshots and JSON evidence stay outside the repository under the F-drive runs workspace.

Only the P21 modules, font assets, tests/docs and required shared import/cache lines belong to this change. Cover, other slide animations, general typography, Stats and cardiovascular work are intentionally excluded.
