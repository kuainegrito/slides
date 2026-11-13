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
