# AI 课件网页 · 202608 PDF

Public route: `https://www.kuaiyu.site/slides/ai/survival-202608/`.

The user selected the 63-page `How to survive in the world of AI_202608.pdf`
as the content authority. The same-name PPTX contains 80 slides and is only
used to identify hidden content: PDF page 32 corresponds to hidden PPTX slide
36. The web deck therefore contains 62 pages, with original PDF page numbers
preserved in deep links (`#s6`) and the jump control. Other PPTX-only pages
are not included. Both original files remain unchanged.

## Implementation

- `build.py` extracts original PDF image objects, vector drawing paths, text
  positions, and the two font subsets already embedded in the source PDF.
- One original pale blue digital-wave background is shared. Images are hashed,
  deduplicated and encoded as WebP. The browser mounts one slide and preloads
  the next slide's artwork rather than downloading the entire PDF.
- The user explicitly authorized deterministic image processing. Background
  masks remove pale cool pixels; measured protected regions retain translucent
  cards, figures, devices and delicate diagrams. RGB foreground is not redrawn;
  final WebP compression is lossy. Artwork and photographs are not generated.
- PDF pages 6, 8 and 9 are rebuilt with original cropped graphics and native
  SVG text. Other PDF-native text stays searchable/selectable. Complex artwork
  keeps its embedded lettering. `reviewed-text.json` supplies reviewed excerpts
  of headings and labels from 24 image-heavy pages for search and reading.
- `site/ai/survival-202608/` contains the static player. It has keyboard and
  touch navigation, original-page deep links, chapter navigation, searchable
  overview, a text panel, fullscreen and a laser pointer. Decorative animation
  pauses when the tab is hidden and supports reduced motion and manual pause.
- `site/manifest.json` adds one entry to the existing live course index. The
  existing course entries and root index HTML are preserved.

## Rebuild

Run from this F-drive directory using Python with PyMuPDF, Pillow, NumPy and
SciPy. Set `TEMP`/`TMP` to `F:\codex_worktrees\tmp` and disable bytecode.

```powershell
python animate_cover.py
python build.py
python -m http.server 7316 --bind 127.0.0.1 --directory site
```

The optional source OCR inspection script uses RapidOCR from the F-drive
dependency cache. OCR is not required to rebuild; reviewed excerpts are tracked
as editable JSON. No raw OCR output or source documents are published.

## Verification and publication

`work/conversion-report.json` records source SHA-256, counts and masking details.
`work/browser/` holds per-page visual checks; `work/browser-checks.json` records
the 62-page traversal. Check release reports for the final published file hashes.
Deployment is scoped to the new deck directory and `/var/www/slides/manifest.json`;
the existing index and cardiovascular course must remain unchanged. The release
installer checks the old manifest hash, backs it up and installs the manifest
last. No Nginx or application process restart is required.

This F-drive delivery workspace is not a new Git clone. The existing independent
slides repository in Nutstore has not been moved, modified, committed or pushed.

## 2026-11-10

Converted the selected PDF to a layered web deck; removed the confirmed hidden
page; split the three requested examples into original artwork plus native text;
added a pausable portal-style decorative network and original-page navigation.

Published to the public URL on 2026-11-10. Release backup and rollback helper:
`/root/releases/slides-ai-20261110-160953/`. The final file inventory is
`release-manifest-final.json`; `work/public-verification.json` records all
183 public files matching the local SHA-256 values and the final text-fit patch.
The existing index HTML hash is unchanged. No Git commit or push was made.

Validation: all 62 slides traversed locally, every page captured for visual
review, delicate pale artwork checked again after mask adjustments. The 390px
mobile layout has no horizontal overflow; the 1440px desktop layout was also
inspected. Chapter jumps, search, copied text, hidden-page rejection, end-page
navigation and persisted animation pause were exercised. The public course
index visibly displayed the new entry. The in-app browser subsequently timed
out when entering the public deck; final public-deck visual verification remains
uncompleted. Byte-for-byte public file verification passed. Physical projector,
iOS touch behavior and an OS reduced-motion setting change were not tested.

## 2026-11-10 — Cover wave animation

Updated only PDF page 1 with an 8-second, 1440 × 810, 30 fps silent H.264 loop
(`assets/cover-wave-v1.mp4`, 3,050,779 bytes). `animate_cover.py` renders 240
distinct frames from the original PDF cover: localized wave displacement,
rolling ripples and original 0/1 cutouts as spray. No generative redraw or camera
motion. Title, author and people are pixel-identical before video compression.
The original static SVG remains the fallback and the overview thumbnail.

The video follows the existing motion toggle and reduced-motion preference;
no video fetch occurs while initially paused. Hidden tabs pause playback,
leaving the cover unloads its video, and returning starts a new loop. Other
61 slides are byte-identical as JSON values to the previous release.

Validated all 240 frames and full decoding, inspected eight full-size frames,
and checked the loop boundary (mean pixel delta 1.81 versus 1.80 for an ordinary
adjacent-frame transition). Browser checks confirmed playback, stable pause,
resume, no video on page 2 and playback after returning to page 1. The public
browser navigation timed out, so the live visual check is not claimed.

`publish_cover.py` guarded every existing published file by SHA-256, backed up
the changed files, and updated exactly five files. All five public responses
matched local hashes, including `video/mp4` for the animation. Existing course
index and unrelated assets were verified unchanged. Backup and rollback:
`/root/releases/slides-cover-20261110-180257/rollback.py`.
Evidence: `work/cover-wave/verification.json`, `deployment.json`, and `before/`.

## 2026-11-10 — Exact fonts, LeCun video and interactive page 15

Unified all 618 SVG text spans and the player UI to the requested fonts:
Chinese KaiTi (`simkai.ttf`) and English Sans Serif Collection. `build_fonts.py`
subsets the actual installed fonts into 131,740 bytes of WOFF2, covering all
827 used Chinese characters and punctuation. Latin and Chinese glyph sets are
separate, so a font cannot silently supply the other script. Explicit font
metrics and line height prevent Sans Serif Collection's tall original metrics
from overlapping HTML controls. Original lettering inside raster pictures is
preserved. `work/refinement-02/font-browser-audit.json` records 39 text-bearing
pages, all with the new family stack and no horizontal text overflow.

Page 7 now contains the supplied `C:/Users/kuaiy/Downloads/LeCun.mp4`, with
native video controls, original sound, click-to-play and no preload. The
61.30068-second file was remuxed for fast start without transcoding; both audio
and video compressed streams hash-identically to the original. Full decoding
passed. Browser playback reached 6.67 seconds with sound enabled and no error;
leaving the page removed the video element. The original source is untouched.

At the user's explicit request, Astra at xhigh reasoning reviewed the page 15
teaching design; see `work/refinement-02/design-review.md`. The implementation
uses a genuinely eight-dimensional quadratic function and displays a rotatable
two-parameter slice, all eight signed partial derivatives, and actual loss
history. The initial visible two-dimensional gradient is zero while the other
six components are nonzero. Default full update reduces loss from 20.75 to
2.3725; visible-only update stays at 20.75. Axis selection/rotation changes only
the view. Users can single-step, run/pause, change the learning rate, compare
two-dimensional/full updates, reset or return to the untouched source picture.
The model explicitly says the 3D height is loss, not a third parameter, and that
the convex example does not represent all neural-network loss landscapes.

`gradient-math.js` is the production mathematical source; `test_gradient.mjs`
independently checks central differences, 56 slice evaluations/minima, convergence,
the hidden-direction counterexample and deliberate large-step divergence. Max
gradient finite-difference error was 1.83e-9. UI checks verified first-step loss,
the stationary visible-only case, unchanged loss on view changes, Space operating
the button without turning pages, original-picture toggle and loss 32.6324 at
learning rate 0.8. Reduced motion uses immediate updates; hidden/leaving pages
stop work. Narrow screens use a scrollable stacked layout; its browser visual
check remains uncompleted after the browser service timed out. Desktop screenshots
and video verification are retained in `work/refinement-02/`.

Published with all pre-existing files guarded by SHA-256. Initial update backup:
`/root/releases/slides-refine-20261110-204741/`. A public response check caught the
server's generic MIME type for `.mjs`; the production module was changed to `.js`
and cache versions advanced without changing Nginx. Compatibility patch backup:
`/root/releases/slides-module-20261110-204831/`. Public final files match local
hashes; active modules serve `application/javascript`, fonts `font/woff2`, and
the video `video/mp4`. Full rollback runs the latter release's `rollback.py`
first, then the initial refinement release's helper. No Git commit/push, root
index changes, hidden-page changes, or unrelated application release occurred.

Rebuild after preparing the source video: `python animate_cover.py`,
`python build.py`, `node test_gradient.mjs`, `python verify_package.py`.
For a metadata/font-only refresh, use `python refine_deck.py` and
`python build_fonts.py`. The archived publish scripts are guarded one-time
release installers; inspect current fingerprints before a new release.

## 2026-11-11 — Student adaptation and two edition entrances

Published the audience picker at `https://www.kuaiyu.site/slides/ai/survival/`,
with `teacher/` and `student/` players. The course-center manifest now points
to the picker. The original dated teacher URL and all its 191 inventoried
files remain byte-identical; the course-center HTML is unchanged.

The student edition retains 62 slides, their original PDF numbering and the
hidden-page-32 exclusion. Twenty-nine pages adapt the opening, application
examples, AI learning workflow and concluding advice to undergraduate students.
The emphasis is professional foundations, asking precise questions, checking
evidence, explaining mechanisms and completing a small, verifiable project.
The lecturer's simulations, comics, visual explanations and public class are
connected to student activities. Existing student-work and Chen Peng credits
are retained; the displayed paper is not claimed as the lecturer's research.
Original teacher-oriented raster graphics are retained as clearly labeled
examples where relevant. Every slide has an optional classroom-task panel;
relevant tasks link to the canonical cycling/homeostasis tools and website.

All 115 original image placements are preserved by image hash. The versions
share the existing WebP images, wave animation, LeCun sound video and page-15
eight-dimensional interaction. The new edition assets total about 597 KiB,
including 29 thumbnails, student text, two small players and subsets of the
actual requested KaiTi/Sans Serif Collection fonts. Raster-image lettering
remains original. Build with `python build_student.py`,
`python build_editions.py`, `python build_edition_fonts.py`, and
`python student_thumbnails.py`; verify with `python verify_editions.py`.

All 29 rewritten pages were rendered and visually inspected. Browser bounding
checks found no text outside the slide bounds. Local browser checks covered
both entrances, separate teacher/student content, classroom task and app link,
cover-media source, original-sound video playback (readyState 4, unmuted),
video removal on navigation, gradient loss 20.7500 to 2.3725 after one update,
and 390-pixel mobile entrance/gradient layout without horizontal overflow.
The original teacher wording on page 49 was verified through the new player.
The route checker passed. New task-link labels were made generic for external
references after the UI checks; their generated source was syntax checked.

The guarded release at `/root/releases/slides-editions-20261111-210222/`
added the new directory and atomically replaced only the course manifest.
All 39 public files matched local SHA-256 and expected MIME types; the picker,
both edition routes and old teacher route returned identical HTML/HTTP 200.
The public browser recheck timed out, so interaction/screenshot evidence is
from the local served build, whose bytes match the publication. Evidence and
before/after manifests are under `work/student-edition/`. Rollback is the
release's `rollback.py`: it checks current new-file hashes, restores the old
manifest and parks the edition directory in the release backup. No Git
commit/push, original source-document edit, or unrelated app release occurred.

## 2026-11-11 — Page 12: biological signaling and NN forward propagation

Updated PDF page 12 in both student and teacher players, including the legacy
dated teacher entrance. The original SVG/artwork remains byte-identical and
can be restored with the original-picture toggle. All other 61 pages in each
edition are unchanged. The new scene preserves the pale blue/purple palette
and uses subsets of the actual KaiTi and Sans Serif Collection fonts.

Five animated steps compare a biological visual pathway and representative
synaptic integration with a numerical neural-network forward pass. The
biological side depicts retina/optic-nerve/LGN/visual-cortex signaling,
excitatory/inhibitory inputs, a schematic membrane-potential trace, firing
near the axon initial segment and transmission to a downstream population.
It is explicitly a conceptual illustration, not a recording or an algorithm
for human recognition. The paired AI model is 35 → 8 → 6 → 10, using ReLU in
the two hidden layers and stable Softmax on output logits. The animation is
inference with frozen weights, not training/backpropagation. Primary sources
are linked within the slide: the Sincich et al. retinogeniculate-spike paper
and PyTorch's official model-building tutorial.

`train_neural_demo.py` deterministically trains the tiny model on ten 5×7
synthetic digit templates with grayscale perturbations (seed 120826, 1800
Adam updates, smoothed targets). It makes no handwriting-benchmark or clinical
claim. `neural-model.js` calculates every displayed activation, logit,
contribution and probability from the current 35 pixels. The user can select
digits, vary deterministic noise, edit individual pixels, inspect node sums,
pause/resume, single-step, change speed and replay. Clean template 8 gives
87.7774%; at 70% interference, 8 gives 49.2227% and 6 gives 42.6020%. These are
model outputs, not accuracy estimates. Student page 12 includes this comparison
as a classroom task. On narrow screens playback controls move above the
illustrations, and the network panel scrolls horizontally for readable nodes.

Local CUA browser verification covered both editions and the legacy entrance,
autoplay from phase 0 to 5 followed by stopping, traveling signal dots, clean
and noisy probabilities, digit 6, node arithmetic, pixel editing, keyboard
single-step without page navigation, motion-disabled stepping, original-art
toggle, disposal on leaving page 12 and unchanged page-15 interactive loading.
All five caption/calculation states fit their boxes. The 390×844 mobile view
had no document overflow; only the intended internal network panel scrolls.
The inspected browser console had no errors. Screenshots and detailed results
are in `work/neural-12/`. Public-browser preview timed out; local interaction
evidence and public hash/MIME verification are recorded separately.

`node test_neural.mjs` verifies every node sum, ReLU, probability normalization,
numerical Softmax stability, ten clean template predictions, fifty noise
cases, fixed weights and agreement with an independent NumPy forward pass
(maximum probability difference 5.53e-9). `python verify_neural.py` verifies
font coverage, unchanged source art, page scope, protected assets and browser
evidence. Rebuild the subset fonts with `python build_neural_fonts.py`; rebuild
audience wrappers with `python build_editions.py` and student data with
`python build_student.py`. `refine_deck.py` retains the page-12 registration
and thumbnail during a full source rebuild.

Published with `publish_neural.py`: 7 new files and 7 existing files updated,
99,374 bytes of new animation/model/font/thumbnail resources. All 223 other
inventoried files were hash-protected. All 14 public responses matched SHA-256
and expected MIME types; all three entry routes matched the local HTML.
Backup/rollback: `/root/releases/slides-neural-20261111-213614/rollback.py`.
The source PDF/PPTX, root course index/manifest and unrelated apps were not
changed. No Git commit or push was performed.


## 2026-11-12 — English-first purple/charcoal bilingual styling

User request: teacher and student slides use English first in charcoal
(`#3f3f46`, Sans Serif Collection), followed by Chinese in purple
(`#7030a0`, KaiTi). Both editions still contain 62 slides; PDF page 32 remains
excluded. Original raster artwork, screenshots, videos, model weights and
numerical model files are unchanged.

Applied the rule to 620 teacher and 556 student native SVG text objects,
student adaptation paragraphs, all 62 student task prompts, overview titles,
and page 12/page 15 interactive explanations and controls. English translations
were added to student-only Chinese content. Chinese text can contain English
terms, which retain the English color. Original text embedded in raster source
images remains part of those images. Page 48 teacher art was scaled uniformly
to 94% and its footer inset 8 units; student pages 25 and 48 artwork is uniformly
scaled to make room for bilingual explanations. Image bytes are preserved.

Source helpers: `bilingual_layout.py`, `bilingual_metadata.py`, and
`build_bilingual_thumbnails.py`. The ordinary `refine_deck.py` and
`build_student.py` entry points call the bilingual helpers; `build_editions.py`
uses shared ES modules and cache version `20261112-bi4`. `bilingual.css` and
`bilingual.js` provide the shared UI language styling. Fonts are subset from
the installed Sans Serif Collection and KaiTi files by `build_bilingual_fonts.py`.
The `apply_bilingual_*` scripts are one-time migration records, not rebuild
commands. Re-render static previews with `prepare_bilingual_previews.py`, then
run `build_bilingual_thumbnails.py`; page 12/15 thumbnails use the saved browser
stage captures and should be refreshed when those interfaces change.

Validation: `verify_bilingual.py` passed the page inventory, every native
English/Chinese text color, font declarations, bilingual pair ordering, original
image references/media preservation and the release allowlist. Local browser
checks visited all 124 pages and found no text crossing the stage boundary after
the page-48 fix. Page 12's five stages fit their explanatory panels, and both
editions reached the same 87.8% model output for the clean digit 8. Page 15
reached loss 2.3725 after a completed full-dimensional first step and remained
at 20.75 when restricted to the two visible parameters. Model tests
`test_neural.mjs` and `test_gradient.mjs` passed. Desktop and 390×844 mobile
layouts were inspected; the mobile network scrolls inside its panel without
horizontal overflow of the document. The final player version has no observed
browser console errors. These are engineering/visual checks, not scientific
validation of the illustrative neuroscience model.

Release: `/root/releases/slides-bilingual-20261112-065830/rollback.py`.
Nine existing files updated and 69 files added, including 65 shared/deduplicated
WebP previews; the total new assets are 858,254 bytes. All other 228 inventoried
files and the course root index were hash-protected. All 78 changed/new public
responses matched their local SHA-256 and MIME types, and all three teacher,
student and legacy entry HTML responses matched. Public HTTP verification and
local browser verification are recorded separately. No Git commit/push was
performed in this standalone courseware workspace.

Evidence: `work/bilingual-v1/verification.json`, `deployment.json`,
`release-manifest.json`, both `*-browser-bounds.json` files, and desktop/mobile
screenshots. The prior publication inventory and source snapshots are retained
under `work/bilingual-v1/before/`.


## 2026-11-13 — P13 gradient animation and P21 3D token nebula

User requested automatic gradient-descent playback with manual learning-rate
control on student P13 and the teacher equivalent, then added a 3D, interactive
A Universe of Tokens on P21. Both implementations are shared by the student,
teacher and legacy entry points. Only pages 13 and 21 changed in slide data;
the original SVG/image content is byte-for-byte preserved behind Original /
查看原图. The 62-page inventory, excluded PDF page 32, media and P12/P15 models
remain unchanged. English-first charcoal/Sans Serif Collection and Chinese-second
purple/KaiTi are preserved. New glyph subsets add KaiTi coverage for the new
captions/tasks and Sans Serif Collection coverage for Δ and the prime symbol.

P13 uses L(w)=½(w−1)², g=w−1 and w′=w−ηg, starting at w=−3. It animates slope,
update calculation and the change in loss. Default playback repeats after
convergence; Pause preserves an in-flight visual update, Play resumes, Step
executes one update, and Reset restarts with the chosen learning rate. Changing
the rate cancels an uncommitted visual transition; preset buttons reset the same
starting point for comparison. Controls expose η=0.05…2.20 and presets 0.10,
0.25, 1.30 and 2.10. In this specific quadratic: η<1 approaches directly,
1<η<2 overshoots and converges, η=2 cycles, and η>2 increases loss. Diverging
runs stop after loss exceeds eight times the initial loss; convergence threshold
is |g|<0.035. These thresholds are demonstration controls, not general optimizer
criteria. The curve and every displayed quantity come from `descent-math.js`.

P21 uses 48 explicitly synthetic 8D word/context vectors in six themes and
1,140 decorative dust points. A true 3D perspective camera rotates and zooms
the projected cloud; particles, haze, orbit curves and moving bridge lights
provide depth. Keyboard and pointer controls, word selection, four context
bridges (bank, light, 花, mouse), and three changing projections are available.
The projection basis has orthonormal rows at all interpolated angles. The bank
context pair has fixed 8D distance 10.053395, with projected distances 5.273022
in A and 0.766028 in C. Camera rotation preserves the 3D distance. These are
Euclidean distances in a synthetic illustration, not learned embeddings,
attention weights or claims about a deployed language model. Word labels can
span multiple tokens. The page links the TensorFlow word-embedding guide:
https://www.tensorflow.org/text/guide/word_embeddings .

Both animations respect the global motion-off state on entry and stop work
when the page becomes hidden or is unmounted. Automatic playback is enabled
by default when motion is allowed. Users can explicitly play the demonstration
when automatic motion is disabled. Touch dragging and keyboard zoom were tested;
pinch support is implemented but was not exercised on physical hardware.

Implementation: `descent.js`, `descent-math.js`, `descent.css`, `tokens.js`,
`tokens-math.js`, `tokens.css`; cache key `20261113-gd5`. The source player adds
scoped mounting/disposal and prevents slide navigation from consuming gestures
inside the new interactions. `refine_interactive_20261113.py` registers both
pages during source rebuilds; student tasks and metadata are updated in their
normal generators. Run `build_interaction_fonts.py` for glyph subsets and
`build_editions.py` for the wrappers. Preview thumbnails are WebP exports of
verified stage captures retained in `work/descent-13/`.

Validation: `test_interactions_20261113.mjs` checks analytic derivatives, loss
ratios, convergence/overshoot/divergence, plot ranges, projection orthonormality,
distance contraction and rotation invariance. `verify_interactions_20261113.py`
checks release scope, unchanged neighboring slides/source art, font coverage,
syntax and browser evidence. Local browser tests covered all three entry routes,
autoplay and loop restart, pause/resume, manual updates, learning-rate control,
original-image switching, 3D drag/keyboard zoom, word/context selection and
projection switching. The first step yields loss 4.5, 0.72 and 9.68 for η=0.25,
1.30 and 2.10 respectively. Desktop and 390×844 phone layouts were inspected;
there was no document horizontal overflow. P12 and P15 still mounted normally,
and no browser console errors were observed. Browser evidence is recorded
separately from the independent mathematical checks.

Published release: `/root/releases/slides-interactions-20261113-072135/rollback.py`.
Seven existing files updated and eleven resources added (124,312 new bytes).
All other 299 inventory files, the root course index and manifest were
hash-protected. All 18 public file responses matched SHA-256/MIME types; the
student, teacher and legacy HTML routes matched their local artifacts. A final
public CUA navigation timed out after 30 seconds, so public browser rendering
was not verified; local browser rendering and public HTTP verification passed.
No Git commit or push was performed in this standalone workspace. Evidence:
`work/descent-13/verification.json`, `browser-evidence.json`, `deployment.json`,
the publication inventory and desktop/mobile screenshots. The prior publication
inventory and source snapshots remain under `work/descent-13/before/`.

## 2026-11-13 — P21 multilingual context tour (20261113-tk2)

P21 now uses the entire scene width after removal of the selected-word/vector
sidebar. Small related labels fill six semantic clouds (up to 46 labels in the
verified desktop mouse scene): cat/dog/cheese near the animal and
keyboard/screen/click near the device. The flower example uses
spring/leaf/seed/bloom/garden/petal. French and Spanish equivalents appear in
the corresponding clouds. English and other Latin labels use Sans Serif
Collection in charcoal; Chinese remains purple KaiTi, with English first.
New font subsets include the French/Spanish accents. Original art remains
available from Original, with no alteration to its SVG or raster assets.

The four stories are bank (river bank/deposit money), light (lamp/light
suitcase), Chinese 花 (flower/spend), and mouse (animal/computer device).
Each lasts 8 seconds: hold context A for 2 seconds, interpolate the illustrative
8D contextual state over 3.5 seconds, then hold B until the next case.
The gold point and vector arrow move with that state. Automatic switching can
be paused; case buttons pause the tour, and sentence buttons animate either
context manually. Orbit is independent; drag, keyboard rotation, zoom and
three projection choices remain available. Motion-off, hidden-page and
unmount cleanup are honored. Mobile uses an internally scrolling layout and
prioritizes neighbors in the two active clouds; no horizontal overflow was
observed at 390 x 844. Pinch is implemented, not physically tested.

Teaching boundary: both endpoint states are synthetic, and interpolation is
an authored illustration rather than a trained model's inference trace.
Changing a contextual representation is distinct from changing a token's
static lookup embedding. Word labels can span multiple tokens. Reference:
https://arxiv.org/abs/1802.05365 . French souris's animal/device meanings were
checked against https://www.larousse.fr/dictionnaires/francais-anglais/souris/72920 .

Build maintenance: only P21 metadata and tasks changed, with corresponding
updates to refine_interactive_20261113.py, build_student.py and
bilingual_metadata.py. build_editions.py uses 20261113-tk2 for the player/data
and token assets; P12/P13/P15 module cache keys are unchanged. Use
build_tokens_v2_fonts.py for the new token font subsets; do not run the older
build_interaction_fonts.py to regenerate previously published v1 assets.
The new preview is a WebP derivative of work/tokens-v2/p21-stage.png.

Validation: test_tokens_v2.mjs checks all 8-second boundaries, endpoint vectors,
interpolation and camera invariance; the previous interaction math suite still
passes. verify_tokens_v2.py checks the explicit file manifest, identical other
61 slides per edition, preserved source SVG/art/media, font glyph coverage,
syntax, wrappers and browser evidence. Final-runtime local UI checks covered
student, teacher and legacy; 8/16/24/32-second transitions; pause freeze;
manual A/B movement; orbit and keyboard rotation; projection C; original-art
return; persistent global motion-off; desktop and phone layouts. P12/P13/P15
mounted successfully. No console errors were recorded. Numeric and UI results
are retained separately in work/tokens-v2/verification.json and
browser-evidence.json, alongside the desktop/mobile screenshots.

Release: /root/releases/slides-tokens-v2-20261113-075955/rollback.py.
Ten existing files updated, three new assets added (81,884 bytes), 307 prior
inventory files protected. All 13 public responses passed SHA-256 and MIME
checks; student, teacher and legacy HTML responses matched local artifacts.
Public acceptance here is HTTP/hash verification; visual and interaction
checks were on the local preview. The course root index and manifest stayed
unchanged. Updated inventory: 320 files. No Git commit/push was performed in
this standalone courseware workspace. Backup: work/tokens-v2/before/.

## 2026-11-13 — P21 flowing SVG galaxy (20261113-tk3)

Replaced the Canvas label-grid rendering with a persistent native SVG scene:
1,800 spiral-arm stars, 1,140 semantic-cloud particles, 24 moving light sprites,
32 fine spiral paths and radial-gradient cloud lobes. Synthetic 8D semantic
positions are projected to 3D, camera rotated and perspective projected into
SVG screen coordinates. Decorative galaxy particles are authored 3D geometry,
not additional embedding data. Camera rotation and gentle inclination changes
start automatically (unless motion is disabled). Local cloud dust swirls;
star opacity twinkles. Text floats at projected positions with depth-dependent
scale, opacity and painter ordering. Labels may overlap, intentionally; there
are no rectangular pills or collision-avoidance grid.

Removed h(context), h, coordinate origin and all vector arrows/straight context
connections. Four lifted 3D curves connect the context pairs, with an emphasized
active arc and a moving luminous trail. Trail endpoints remain on the chosen
context at progress 1. The existing 8-second contextual tour remains; selecting
a case pauses the tour while allowing the galaxy to continue orbiting. The
separate Orbit button pauses spatial motion, and the global motion-off control
stops both. Original-image access and bilingual fonts/colors remain intact.

Verified local SVG rendering, advancing yaw and scene time, manual context B,
original-image return, teacher and legacy entry mounting, global motion pause,
390px phone layout without horizontal overflow, and no console errors. The
existing timeline/vector unit checks passed. UI screenshots and data live in
work/tokens-v3/. Public verification was HTTP/SHA-256/MIME, not a public browser
rendering check. Nine existing files changed and one WebP preview was added;
311 previously inventoried files and all slide content/art are protected.
Release: /root/releases/slides-tokens-v3-20261113-081308/rollback.py.
All ten public assets and three entrance HTML routes matched local files.
Inventory is now 321 files. verify_tokens_v3.py and publish_tokens_v3.py retain
scope and deployment checks. No Git commit or push in this standalone workspace.

## 2026-11-13 — A Galaxy of Tokens / deeper, denser P21 (20261113-tk4)

Chose A Galaxy of Tokens to match the visual scale and connected semantic
clouds. Updated the interactive heading, page title/search/transcript metadata
and durable generators in both editions; original source SVG/art is retained.
The scene now contains 3,600 spiral stars, 1,140 semantic dust particles,
56 light-trail sprites and eight endpoint halos (4,804 SVG circles), with
60 radial cloud lobes. Increased depth extent, perspective strength, camera
rotation and inclination variation. Text and particles use stronger near/far
scale and opacity contrasts. Rendering is limited to about 30 frames per
second, while the tour clock uses elapsed wall time.

Context connections use a blurred outer glow, a progressively revealed inner
ribbon, moving luminous beads and endpoint illumination. Both manual and
automatic transitions show this flow. Global motion-off stops orbit and tour;
the independent orbit button now immediately updates its displayed state.

Validation: test_tokens_v2.mjs retains the 8-second timing/vector checks.
verify_tokens_v4.py checks scope, title-only/transcript/thumbnail changes on
P21, immutable other pages/source art and browser evidence. Final local UI
checks verified advancing yaw/flow offsets, an automatic 8-second case change,
manual completion, original return, teacher/legacy titles, global pause,
390px layout without horizontal overflow, SVG blur/trail structures and no
console errors. Screenshots and browser evidence: work/tokens-v4/.

Release: /root/releases/slides-tokens-v4-20261113-083007/rollback.py.
Eight existing files changed; one WebP preview added. All nine public file
SHA-256/MIME checks and three entrance HTML checks passed; 313 existing files
were protected. Inventory is 322 files. Visual/interaction checks were local;
public checks used HTTP hashes. No Git commit/push in this standalone workspace.

## 2026-11-13 — P21 six puns and camera-follow tour (20261113-tk5)

Added date (romantic company / date fruit) and French avocat (lawyer / avocado),
with French/Spanish counterparts and bilingual neighbors. Three new synthetic
semantic regions cover romance/company, fruit/food and law/justice: nine
clusters, 72 word vectors, six context cases. The original first 48 vectors
retain their deterministic construction. Puns are retained in the transcript
and accessible status text; the main slide leaves spoken explanation to the
presenter. The source SVG remains untouched.

Removed the two sentence cards and intervening arrow completely. The desktop
SVG region increased from 310 to 371 CSS px; phone scene height is 430px.
A compact Switch meaning button retains manual A/B transitions. Six case
buttons and the 8-second tour remain available. Selecting a case pauses
rotation/tour for steady inspection and eases the camera to the source.
During automatic or manual meaning transitions, the camera follows a scaled
position along the same curved light path in 3D. Case changes interpolate the
camera and focus lighting over 1.3 seconds. The two associated regions have
focus weight 1; the others .23, applied to cloud lobes, dust and word opacity.
Global motion-off freezes camera, orbit and tour; reduced-motion manual
changes update the camera immediately. New v5 font subsets cover added
Chinese vocabulary and accented Latin words, retaining prior KaiTi glyphs.

Validation: test_tokens_v5.mjs tests six-case/48-second cycles, 8-second
boundaries, synthetic interpolation and endpoint meanings. Final local UI
checks covered date A/B, avocat A/B/A (camera returns to exactly its original
position), both active focus weights, six buttons on mobile, 390px no
horizontal overflow, removed sentence panel, footer containment, teacher
48-second wrap from avocat to bank, legacy mounting and global pause freeze.
verify_tokens_v5.py additionally compares observed endpoint cameras against
projected 8D endpoint vectors, verifies glyph coverage, source art and the
other 61 pages per edition, JS syntax and the explicit release manifest.
No browser console errors. Screenshot/evidence directory: work/tokens-v5/.

Release: /root/releases/slides-tokens-v5-20261113-085249/rollback.py.
Ten existing files updated and three assets added. All 13 public responses
matched local SHA-256/MIME; all three entrance HTML routes matched. Protected
312 existing inventory files; inventory is 325 files. Visual/interaction QA
was local, public QA used HTTP hashes. Updated rebuild hooks and student task
metadata preserve these changes. No Git commit/push in this standalone folder.

## 2026-11-13 — P21 introduction, enlarged focus and speaking pauses (20261113-tk6)

Each fresh P21 mount starts with an 8-second overall galaxy view: centered
camera, uniform cloud lighting and no active-case emphasis. It then eases
into bank and continues the six-case tour. The intro flag belongs to the
mounted slide instance, so subsequent 84-second cycles do not repeat it;
navigating away and back creates a fresh 8-second opening. Explicit case
selection skips the introduction. Motion-off retains the existing opt-in
animation behavior.

Each case now uses a 14-second timeline: source state 3 seconds, travel 6
seconds, destination hold 5 seconds. Quintic smootherstep provides zero
velocity and acceleration at travel endpoints. Case-to-case approach eases
over 2 seconds within the source phase. Manual sense switches take 6 seconds
and remain at the chosen endpoint. Automatic camera yaw and tilt stop during
source/destination holds; background star motion can continue independently.
The focus regions expand by 22% around their synthetic centers, with matching
word size, cloud extent and particle size. Curve endpoints and camera targets
use that same display expansion so the light still lands on the word. Added
endpoint rings and larger halos, with word labels rendered above the glow.
Phone framing adapts to keep both active endpoints inside the scene.

Validation: test_tokens_v6.mjs checks the 3/6/5-second boundaries, 14-second
period, six-case wrapping, monotonic quintic progress and stationary endpoint
velocity. Local browser evidence verifies an 8.05-second intro, bank as the
first case, no intro at loop wrap, intro restored after P20/P21 navigation,
manual travel around 6 seconds, focused scales 1.22 vs background 1, 12 ring
nodes, and unchanged camera/yaw/tilt through sampled arrival-hold frames.
Teacher, student and legacy mount checks, 390px width and endpoint bounds,
screenshots, no console errors, and release scope/glyph coverage passed.
An intermediate browser tool timed out and was recovered; final evidence is
saved under work/tokens-v6/, independent from the earlier interrupted session.

Release: /root/releases/slides-tokens-v6-20261113-090801/rollback.py.
Nine existing files changed, one WebP preview added. All ten public file
SHA-256/MIME checks and three entrance HTML checks passed. The 316 other
inventory files and all original slide artwork are protected; inventory is
326 files. UI checks were local; public acceptance used HTTP/hash verification.
No Git commit/push in this standalone workspace.

## 2026-11-13 — Cloud-owned grain texture (20261113-tk7)

Rebalanced particle texture around the semantic clouds. Replaced 3,600 spiral
stars and 32 geometric arm paths with 420 faint, neutrally colored ambient
grains. Each semantic region now contains 570 local particles (5,130 total),
using deterministic jitter around its existing 8D decorative dust positions.
Reduced cloud mist from ten lobes to six, with lighter gradient opacity, so
the colored grains remain distinct. Cloud particles retain the region's color,
focus weighting, scale and local swirl; occasional small pale cores add texture.
No changes to source vectors, six examples, 8-second intro, 3/6/5-second timing,
camera travel or endpoint holds. The added particle module is decorative geometry.

Local checks: desktop and 390px phone appearance, teacher/student loading,
manual A/B camera travel, balanced deterministic particle generation and no
mutation of source dust, syntax, timing regression tests, no console errors.
An interrupted browser tool call was recovered before saving the final evidence.
Public checks: ten updated/added assets passed SHA-256 and MIME, three entrance
HTML routes matched. Protected 318 prior inventory files; inventory is 328 files.
Release: /root/releases/slides-tokens-v7-20261113-093042/rollback.py.
Evidence: work/tokens-v7/. Browser visual checks were local; public verification
used HTTP hashes. Runtime and authoring changes are synchronized to the slides
Git master workspace for this explicitly requested commit/push.

## 2026-11-13 — Twelve-second intro, Urdu kal and translucent mist (20261113-tk8)

Extended the mount-only overview from 8 to 12 seconds. Subsequent loops and the
14-second per-case pacing are unchanged. Added a seventh context example,
Urdu کل (kal), yesterday/tomorrow, with past/memory and future/possibility
regions. There are now 11 regions, 88 synthetic word vectors, 6,270 cloud grains
and 420 faint ambient grains. Dedicated Noto Naskh Arabic WOFF2 provides Urdu
joining and RTL text; the font's OFL license is included with the assets.
Chinese and Latin subsets cover the added words. Each endpoint shows کل near
its English/Chinese meaning, with Urdu semantic neighbors and French/Spanish
translations. The student task now invites classmates familiar with Urdu to
explain the tense cues. New lecturer notes explain the authored wordplay and
link the dictionary source. This does not assert all Pakistani students have
the same first language.

Slightly increased the existing mist gradient (.24/.085 to .30/.105) and added
one low-opacity drifting veil per region. All mist remains behind unblurred
particles; no individual-particle blur or spiral bands were introduced.
Endpoint fitting now also protects the desktop view for the wider time pair.

Validation: deterministic particle balance and seven-case timeline tests,
local 12.05-second opening, Urdu glyph coverage and shaping table, RTL DOM
attributes and positive text bounds, manual past/future camera travel,
teacher/student mounting, mobile 390px no horizontal overflow and seven controls,
no console errors. Original source artwork/other slides remain protected.
Evidence: work/tokens-v8/. Public acceptance is SHA-256/MIME rather than public
browser rendering. Release: /root/releases/slides-tokens-v8-20261113-094140/rollback.py.
All 15 public assets and three entrance HTML routes matched local files;
318 prior files protected; inventory 333 files. Explicit source/runtime paths
are synchronized to Git master for the ongoing authorized release workflow.

## 2026-11-13 — Revised wordplays and lower-right playback (20261113-tk9)

Replaced the active mouse case with French glace (ice/mirror), and avocat with
Spanish llama (Andean llama/flame). Animal label uses 大羊驼 for zoological
precision. Added Chinese 东西: things/belongings vs east/west, with distinct
pronunciations dōngxi and dōngxī. The object region now contains bags/keys/books;
the added direction region contains east/west/compass/map/sunrise/sunset.
Glace and llama use context-specific related words. Sources checked:
https://dle.rae.es/llama and
https://www.larousse.fr/dictionnaires/francais-anglais/glace/36976 .

Moved the tour play/pause button to the right end of the lower control row.
The freed first navigation slot holds 东西. Visual order is [7,0,1,2,3,4,5,6],
while the internal tour still starts at bank and loops through eight cases.
Progress bars now use the button's case ID instead of DOM order. Preserved
12-second entry-only overview, 14-second cases, pause, camera follow, light
flow, Urdu shaping and the thin-mist/particle balance. New Chinese/Latin font
subsets cover the changed vocabulary. Static original artwork is unchanged.

Validation: eight-case timing and deterministic particle tests (12 semantic
regions, 6,840 cloud grains); local A/B camera transitions for glace, llama
and 东西; right-aligned playback; first-slot 东西; 390px eight-case layout with
no document horizontal overflow; teacher labels and no console errors. One
browser call was interrupted after the main checks and recovered; evidence
was persisted before and after the recovery. Screenshots and assertions are
in work/tokens-v9/. All 13 updated/new public files passed SHA-256/MIME and all
three entrance HTML routes matched local artifacts. Protected 323 prior files;
inventory 336 files. Public verification was HTTP/hash, UI rendering local.
Release: /root/releases/slides-tokens-v9-20261113-095654/rollback.py.
Runtime/source changes are synchronized to the slides Git master workspace.

## 2026-11-13 — Language annotations and inline title (20261113-tk10 / tk11)

Added case suffixes in visual order (中Zh),(英En),(英En),(中Zh),(法Fr),(英En),
(西Es),(乌Ur). Added 36 semantically placed decorative foreign neighbors from
Portuguese, German, Italian, French and Spanish; selection varies per mount
but stays seeded and stable within a case. Existing foreign labels, including
Urdu, now use word (中文语言一字+两字母代码). Chinese tag glyphs are KaiTi/purple;
Latin words and codes remain Sans Serif Collection/charcoal. Correct Portuguese
apple spelling is maçã; source checked at https://dicionario.priberam.org/ma%C3%A7%C3%A3 .

Title is now one line: A Galaxy of Tokens | 词元的语义星云. Responsive header
moves Original below the title on narrow screens. Play/space starts tour and
orbit together; pause stops both, and source/arrival camera holds remain.
Validated desktop/mobile, tag order, randomized-pool reproducibility, glyph
coverage, teacher/student shared loading, play/pause coupling and no errors.
Public tk10 release: /root/releases/slides-tokens-v10-20261113-101025/rollback.py;
tk11: /root/releases/slides-tokens-v11-20261113-101348/rollback.py. Both passed
scoped public SHA-256/MIME and all three HTML entry checks. Local screenshots
and browser evidence remain in work/tokens-v10/ and work/tokens-v11/.

## 2026-11-13 — Smoothness-first hybrid rendering (20261113-tk12)

Measured the SVG-heavy baseline before replacing its hot paths. Dense grain
animation updated more than 7,000 SVG circles each frame. The new renderer
keeps primary words, Urdu joining, links, endpoint emphasis and controls in
SVG, and renders decorative particles in a single Canvas2D foreignObject.
It batches grain paths by color/opacity and culls offscreen particles. Fog is
pre-rendered into reusable transparent textures beneath the grains. Secondary
Latin/Chinese labels are cached at 2x resolution from their original styled
tspan runs and composited as sprites; major and Urdu text remain native SVG.
Font readiness invalidates those caches. This preserves multilingual colors
and sharp primary text while avoiding most per-frame SVG text repainting.

Camera trig/projection bases and projected region centers are cached per
frame. Word DOM order changes only when depth order changes. Inactive blurred
paths/spark effects are omitted, the old 30fps cap is removed, and sustained
frame pressure automatically reduces uniformly sampled particle density.
Narrow viewports start with lower decorative density and capped raster DPR.
Timeline uses elapsed time independently of rendering quality. Original
vectors, 12-second opening, 3/6/5-second narrative, camera hold and controls
remain intact. Do not rerun old one-off renderer patch scripts over this final
module; tokens.js is the authoritative implementation, and build_editions.py
emits the shared wrappers with the current cache key.

In the same local IAB preview session, baseline average draw work was 69.00ms,
frame interval 142.95ms, with 8,295 subtree elements. Warm final playback:
10.99ms draw work, 17.36ms interval, 950 elements, automatic stride 2. Narrow
preview: 6.19ms draw work and 17.01ms interval. These are environment-specific
observations, not a universal hardware guarantee or physical-phone test.
The quality policy prioritizes steady motion on slower devices.

Validated syntax, unchanged timeline/language unit tests, actual context
camera movement, hybrid visual appearance, both editions, mobile no horizontal
overflow, adaptive density, linked play/pause and no console errors. Evidence:
work/tokens-v12/ (baseline/intermediate/final metrics, screenshots, browser and
release records). Final public checks are HTTP hashes rather than live-browser
rendering. Release: /root/releases/slides-tokens-v12-20261113-102612/rollback.py.
All nine public changed/added files matched SHA-256/MIME, all three entrance
HTML routes matched; 333 previous inventory files protected. Inventory 342.


## 2026-11-13 · Presentation controls v1

Shared presentation.js groups native bullet glyphs and their following bilingual text lines into one click step; student bilingual list paragraphs and their adjacent numbered markers reveal together. Next reveals one item before advancing; previous reverses reveals before leaving the page. Lists reset when re-entered. Source SVG/artwork bytes stay unchanged. Raster-baked text remains part of its original image.

Navigation buttons now live at the bottom right inside the stage. Fullscreen requests only the viewport, fits the 16:9 slide to the screen with black letterboxing where needed, and hides surrounding page chrome. Existing left/right/up/down, space and page-key navigation reuse the step controller; form and interactive-widget keyboard guards remain in place.

Validation: JS syntax checks; local browser teacher P19 one bilingual bullet per click, Down reveals next; student P4 three items then Right advances to P5, P5 number and corresponding bilingual paragraph reveal together, Up hides the last revealed item. Teacher/student fullscreen accessibility trees contain only slide content and the two internal navigation buttons; screenshot at F:/codex_worktrees/projects/slides/ai-survival-202608/work/presentation-v1/fullscreen.png. No new particle or timeline work.

Published six files with preflight hashes for all previous managed files; 337 existing files protected. Release /root/releases/slides-presentation-v1-20261113-105707 has backups and rollback.py. Public SHA/MIME verification passed for six files and all three entrance HTML routes. Browser checks were localhost, public checks were HTTP hashes. The edition generator now separates playerVersion from unchanged data and interaction versions.

## 2026-11-17：P20 从知识到含义动态叙事

当前放映 P20（稳定内容 ID `#s18`）升级为两版共享的 SVG 动画：12 个学科依次汇聚，模型关联逐步点亮，再展开上下文、语气、情感线索、意图、细微含义与跨学科灵感。24 秒播放后停留全景，支持暂停/继续、重播、阶段选择、原图切换；遵守全局动效开关、后台冻结和减少动态效果偏好，切页卸载并重入复位。原始图文不删除，正常生成器保留挂载。中文楷体与英文无衬线字体沿用课件风格；手机独立控制区避免遮图。动画为编排的教学示意，非真实模型激活或情感体验证据。

本地与公网两版浏览器测试通过：正确页码、自动播放、暂停、四阶段、六输出、原图、重播、全局动效、窄屏、卸载/重入与 reduced motion。公网学生版完整 24 秒播放验证通过；本机 Chrome 采样 1460 帧，帧间隔 p95 16.8 ms，最大 145.5 ms（包含页面早期加载，不能视为零卡顿或其他设备保证）。截图已检查，未进行实体手机/微信测试。无新增用户事件上传；阶段及时间状态保留在 DOM 用于本地验收，采集边界见 `docs/MEANING_FLOW_COVERAGE.json`。

已窄范围部署 4 文件，公网 SHA256 全部一致，521 个其他课件文件不变。发布与备份：/root/releases/slides-meaning-20261117-105354，`rollback.py` 已验证语法，未执行回滚。证据唯一保留于 `F:/codex_worktrees/projects/slides/evidence/meaning-20261117/`。本次未提交或推送 Git。

## 2026-11-17：P20 SVG 图形与粒子特效重制

根据用户反馈，去掉以单字符代表学科的做法，改为原生 SVG DNA、听诊器、曲线图、原子轨道、对话气泡、书页、乐谱、调色盘、齿轮、人物、历史建筑与显微镜插画。中央模型采用深蓝粒子球、70 个旋转投影节点、45 条网络连接、三层旋转轨道和扩散脉冲；18 条固定曲线路径承载 180 个光粒，路径采样缓存不在逐帧重复计算。

六种输出分别有独立图形及特效：上下文的场景与人物连接，语气的 21 根动态声波，情感线索的三张表情变化，意图的目标聚焦光束，细微含义的双路径分岔，以及灯泡灵感的旋转粒子绽放。编排为 24 秒逐步展开，随后持续运行全景特效；手动全景停留、暂停、全局关闭动效、原图查看、重入和减少动态效果继续适用。说明文字保留但不是画面主角。

本地两版回归通过，并新增“展开完成后特效继续改变 / 暂停后图形冻结”的断言；公网两版回归与完整实时播放通过。零页面异常。当前 Chrome 1468 帧采样 p95 16.8 ms，最大 66.7 ms；不等同于真机或所有设备表现。正常生成器同步新图形模块；未新增追踪或上传用户数据。

发布：/root/releases/slides-meaning-particles-20261117-120033，5 个公网文件哈希一致，521 个其他课件文件保持不变，覆盖前备份与回滚脚本已保留。证据：`F:/codex_worktrees/projects/slides/evidence/meaning-particles-20261117/`。本轮独立提交纳入 P20 动画、两版入口、生成器与验收脚本。

## 2026-11-17：P22 成文与 P25 成码的 SVG 粒子叙事

- 以实际放映顺序定位：P22 为稳定内容 ID `#s20`（从提示到成文），P25 为 `#s22`（对话成码）；P24 的上下文窗口插页保留，P26 骑行展示未改。教师/学生共享 SVG 模块，开场说明分别面向教学资源制作与个人学习实践；原 SVG 与课堂任务保留。
- P22：目的、对象和素材通过三束光流进入稿纸，段落逐行生成，四路粒子展开文章、翻译、逻辑与法律文本图形；笔尖、语义支路、逻辑连线、天平与环绕粒子持续变化。复杂小说的线索与专业文本人工核验提示保留。
- P25：需求对话进入电路与代码编辑器，扫描线、三个真实本地换算检查、反馈回路依次展开，连接工具终端、动态图表、智能家居与游戏控制器。可展示缺少括号的错误并修复复测：三个华氏转摄氏用例实际计算成功/失败；这不是调用 AI 或一般程序正确性的证明。
- 两页均有自动四阶段、全景持续动效、暂停/继续、重播、手动阶段、原图查看；共享时钟冻结全部 SVG，遵守全局关闭动效、减少动态效果与离页卸载。窄屏独立控制区，键盘操作不触发翻页。正常生成器同步导入、挂载、交互排除与三个模块复制；隔离执行新增生成语句得到的播放器与当前源码一致。新控件刻意不上传交互数据，只留本地 DOM 状态；见 `docs/APPLICATION_SCENES_COVERAGE.json`。
- 验收：`node scripts/test-application-scenes.cjs --timeline` 本地四组合通过；`--live --timeline` 公网四组合通过（本次测试进程显式使用可用代理，未改系统代理；初次旧浏览器代理连接超时）。页面异常与所检查 JS/CSS/JSON 请求失败、课件资源 HTTP 错误均为零。两种场景学生版完整 24.5 秒实时播放覆盖四阶段，线上帧间隔 p95 均为 16.8 ms，最大分别 100.0 / 17.1 ms；这是本机 Chrome 帧间隔，不是绘制耗时或所有设备保证。桌面及 390px 截图已检查，未测实体手机/微信。P20 回归、模块语法、生成器集成与公开路由检查通过。
- 已窄范围发布六个前端文件，公网哈希全部一致，523 个其他课件文件保持不变。发布及覆盖前备份：`/root/releases/slides-application-scenes-20261117-133728`；保留带哈希保护的回滚脚本，未执行生产回滚。唯一证据：`F:/codex_worktrees/projects/slides/evidence/application-scenes-20261117/`。本轮独立提交包括源码、生成器、覆盖矩阵和测试。

## 2026-11-17：P22 / P25 粒子汇聚与成果动态增强

- 两版继续共享场景：七路光流升级为有纵深的螺旋粒子束、批量彗星拖尾与亮核光晕；输入及输出各有一个旋涡汇聚场。远端光流改走上方及外缘，避开成果标题。曲线几何只在初始化采样，固定节点复用；全部动效由同一场景时钟控制。
- 八套独立成果过程替换静态图标：叠页与书写、翻译地球及交互光点、逻辑网络脉冲、文稿扫描与天平；终端执行、动态图表、智能家居信号与亮窗、手机小游戏。各自配有组装缩放、轨道粒子与扩散环；保留原有文本、原图、控制及真实的本地代码错误/修复用例。
- 本地和公网教师/学生 × P22/P25 四组合全部通过，新增逐成果内部 SVG 变化断言；暂停冻结全部 SVG、全景持续播放、重播、全局动效、减少动态效果、重入与 390px 控制区均通过。公网学生两场景完整播放覆盖四阶段，零页面异常及检查范围内资源请求错误。实际页面截图已核对，未测实体手机/微信。
- 公网本机 Chrome 采样：P22/P25 分别 1466/1471 帧，帧间隔 p95 均 16.8 ms，最大 51.9/17.0 ms；JS 场景 render 耗时 p95 为 2.2/2.1 ms，最大 4.1/3.9 ms，场景 DOM 节点 764/777。render 耗时不包含全部布局、合成和 GPU 工作，不代表所有设备表现。测量只留本地属性，无新增追踪或上传。
- 正常生成器集成验证通过，播放器与五个模块复制结果匹配当前源码；源代码及路由检查通过。已发布八个前端文件，公网 SHA256 全部一致，523 个其他课件文件不变。发布备份与带哈希保护的回滚脚本：`/root/releases/slides-application-particles-20261117-135304`，未执行回滚。唯一证据：`F:/codex_worktrees/projects/slides/evidence/application-particles-20261117/`。本轮独立提交包含效果模块、生成器、测试与文档。

## 2026-11-17：Agent 主线前移、问卷回看与生活比喻

原 ID 36 智能代理页未删除，但顺序靠后、偏信息收集；本轮前移到成码页后，形成 P26–P30 的五页过渡：单项成果与互动提问（69）、本场问卷模式回看（70）、妈妈统筹用餐类比（36）、出门查天气与反馈（71）、学习/教学任务迁移（72）。原 36 图留在场景内，旧稳定链接继续可用；新增四页，两版各 69 页。P22/P25 及其他原页面源码保留。

问卷仅只读现有汇总，按本题实际作答数与所选身份计算；不确定单列，小样本不推断，首读失败不显示假零，刷新失败标注过时。建议为讲解启发，不自动跳页，不新增答卷或后台字段。生活场景使用 SVG 插画、共享粒子流、逐步点亮与反馈回路；库存足够跳过采购，缺菜时自动停在模拟确认；天气失败保持未知，重试再继续。教学模拟不会实际看冰箱、采购、查询天气或发消息。教师/学生分别落到教学包与复习包，均要求验收。

本地与公网两版流程通过：顺序、问卷（本地分布/故障夹具及公网独立空场次只读）、库存分支、自动确认关卡、天气失败/重试、原图、暂停/全局动效、重播/重入、减少动态效果、窄屏和开场备份。新增四页与原 36 唯一性、插页幂等、六种问卷建议条件、生成器复制及挂载匹配、路由检查通过。实际线上截图已核对；未测实体手机/微信。母亲/天气场景各约四秒的本机 Chrome 采样为 241/238 帧，帧间隔 p95 均 16.8 ms，最大 17/50 ms，JS render p95 为 1.0/0.6 ms；不包括全部布局和 GPU 工作，也不代表所有设备。

已窄范围发布七个前端文件，公网哈希一致，527 个其他课件文件不变，问卷后台及数据未改。发布备份和回滚脚本：`/root/releases/slides-agent-lesson-20261117-143100`；唯一证据：`F:/codex_worktrees/projects/slides/evidence/agent-lesson-20261117/`。讲解顺序、问卷阈值、两版任务、来源和采集边界见 `docs/AGENT_LESSON.md`。本轮独立提交包含新增场景、入口、生成器与测试。

## 2026-11-17：Agent 连续生活场景与真实电脑工具工作台

将 P28/P29 的图标流程重制为连续 SVG 场景：同一人物行走并伸手开冰箱，缺菜时镜头移到菜摊，确认后拿菜、显示付款回执，再回家准备一餐；库存足够则直接准备。天气页沿用家庭环境，拿手机查询、查看雨情、提包撑伞并出门；工具失败与重试保留。沿用 1.2 倍共享时钟，人物、镜头、雨滴和蒸汽一起暂停，遵守全局关闭动效、减少动态效果与离页卸载，原 Agent 图继续可查看。

新增 P31（稳定 ID 73）“真实任务：让电脑里的工具协同工作”。以骑行能量代谢资料为源，教师制作课堂微课，学生制作医学跨学科展示；项目文件、Word 分镜、Blender 骑行预览、PPTX 版面、FFmpeg 字幕视频依次呈现，并演示字幕裁切检查失败后退回 FFmpeg 修复、复查和人的最终验收。命令、文件与工具返回均明确为工作流示范，未在观众电脑执行，也没有宣称已生成实际交付文件。两版各 70 页，原 ID 23 骑行作品后移至 P32，开场备份仍独立保留。

本地与公网两版回归通过：开冰箱/菜摊/采购/天气中间幕、完整状态分支、六个工具阶段、字幕失败返工、原图、重播/重入、暂停与全局动效、减少动态效果、390px 布局及原有问卷回看与备份。线上截图已检查，零页面异常及所检查课件资源 HTTP 错误；未测实体手机/微信。独立 QA 场次问卷只读接口为 HTTP 200、零答卷，未提交测试答卷。正常生成器的播放器与六个 Agent 文件复制结果匹配当前源码。

本机 Chrome 公网母亲/天气/工作台各约四秒采样均 241 帧，帧间隔 p95 为 16.8 ms，最大约 17 ms，场景 JS render p95 为 0.2 ms、最大 0.4 ms；不包括全部布局、合成与 GPU 工作，不代表所有设备。已窄范围发布九个前端文件，公网 SHA256 全部一致，528 个其他课件文件不变。覆盖前备份和带哈希保护的回滚脚本：`/root/releases/slides-agent-story-20261117-150445`，未执行回滚。唯一证据：`F:/codex_worktrees/projects/slides/evidence/agent-story-20261117/`；讲解与工具依据见 `docs/AGENT_LESSON.md`。

## 2026-11-18：P31 真实应用录屏与连续制作动画

学生/教师两版共享 P31（稳定 ID 73）的连续制作场景：真实 Cycling 游戏与 CardiacCycle 3D 心脏录屏进入素材区，Word 逐段写出分镜，Blender 镜头逐步显现，PPTX 图文课件组装，FFmpeg 视频/旁白示意/字幕三轨合成，文件沿轨迹传给下一工具。默认约 29 秒播放完整故事；检查字幕被裁切后，review.json 返回 FFmpeg，字幕回到安全区，保留 v1 并生成 v2，再次预览验收。

成片用 HTML 编排两段真实录屏，包含单画面、交叉转场、双画面对照、字幕、片段标题、时间码和进度条，十二秒循环。新增“播放成片”和“素材来源”。输入片段各八秒、960×540、25 fps、无音轨，约 1.42 MB 合计；源片保留在独立证据目录，FFmpeg 完整解码与 FFprobe 探测通过。外围工具调用和文件生成是教学动画，没有导出完整微课 MP4；旁白轨明确标为示意。心脏录屏及截图保留 BodyParts3D / Z-Anatomy 署名与 CC BY-SA 许可。

本地与公网 P31 两版专项通过：媒体实际解码和播放、逐字写稿、文件传递、全部自动阶段及失败返工、成片单/双画面切换、录屏暂停联动、全局动效、减少动态效果、离页释放视频、390px 布局。Agent 整段本地回归通过；公网整段运行完成学生流程和教师工作台后，在教师页重载等待 DOMContentLoaded 时出现一次 30 秒超时，失败记录已保留。随后单独复测两版重载、减少动态效果、概览、问卷跳页与备份入口，均通过且无页面异常。专项线上脚本无页面异常或所检查课件资源 HTTP 错误。实际线上截图已核对，未测实体手机/微信。

本机 Chrome 公网成片十二秒采样 603 帧，帧间隔 p95 33.4 ms、最大 33.5 ms；JS 场景更新 p95 0.4 ms、最大 0.8 ms。两播放器报告 338/333 个视频帧，丢帧 4/3；这是本机采样，JS 计时不含全部合成与 GPU 工作，不代表所有设备。全部媒体与图形共享暂停/重播语义，没有新增交互上传。

正常生成器的播放器、八个 Agent 资源和五个素材/来源文件匹配当前源码。已发布十四个前端/媒体文件，公网 SHA256 全部一致，530 个其他课件文件保持不变。发布备份及带哈希保护的回滚脚本：`/root/releases/slides-agent-studio-20261117-224517`，未执行回滚。唯一证据：`F:/codex_worktrees/projects/slides/evidence/agent-studio-20261118/`。问卷后台与数据未改，主放映仍各 70 页。

## 2026-11-18：P31 全流程中英双语

两版 P31 补齐任务、素材说明、Word 逐字讲稿、Blender 渲染说明、PPT 标题/说明、剪辑轨道、文件传递、检查失败/返工/复查、片段标题、成片字幕、来源与控件的中英文。主要解释使用英文上行、中文下行；中文沿用楷体，深色背景采用浅色中文。两种语言的讲稿按同一进度出现，字幕与状态随动画同步切换；命令、文件名和真实录屏中的原应用界面保留原样。

本地与公网两版各八个状态（共十六个）双语配对和文本边界检查通过；逐幕截图、双语错误反馈与成片字幕、视频暂停、390px 控件换行均已核对。未测实体手机/微信。正常生成器的播放器、八个 Agent 资源及媒体复制与源码一致。公开九个前端文件 SHA256 一致，535 个其他文件不变；问卷后台、媒体录屏与总页数未改。

本机 Chrome 公网成片十二秒采样 569 帧，帧间隔 p95 35.7 ms、最大 36.1 ms；JS 场景更新 p95 0.3 ms、最大 0.4 ms。两播放器帧数/丢帧分别 346/5 与 341/6。JS 计时不含全部合成与 GPU 工作，不代表所有设备。发布备份与回滚脚本：`/root/releases/slides-agent-studio-bilingual-20261117-230705`，未执行回滚。唯一证据：`F:/codex_worktrees/projects/slides/evidence/agent-studio-bilingual-20261118/`。
