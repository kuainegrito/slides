# Source archive

The repository-root ai/ tree is the ready-to-serve static release. It matches
published-inventory.json; the existing root index and physiology decks are
preserved. See DEVELOPMENT.md for the full development and publication record.

Authoring scripts originally use ROOT/site as the web root. Copy this dev/
folder into a separate F-drive workspace, copy repository ai/ to its site/ai/,
and copy the root index.html and manifest.json to site/ before running scripts.
Run preview_editions.py for the public /slides/ prefix on localhost:7316.
External inputs include the original PDF/PPTX, installed fonts and Python
libraries documented in DEVELOPMENT.md. The static site needs no rebuild.

Historical release installers, raw logs, screenshots and work/ baselines remain
in the original F-drive workspace. Evidence-dependent verifiers need that
workspace. Published hashes record release identity, not deployment permission.
