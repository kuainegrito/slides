"""Idempotently add analytics to every public slides HTML entry before publishing.
Pass --check to fail if an entry is missing. Dev references are not public pages.
"""
from pathlib import Path
import sys
root = Path(sys.argv[1]).resolve() if len(sys.argv)>1 and not sys.argv[1].startswith('--') else Path(__file__).resolve().parents[1]
tag = b'<script defer src="/slides/visit-log.js?v=20261122-fragments2"></script>'
missing=[]
for p in sorted(root.rglob('*.html')):
    if any(x in p.relative_to(root).parts for x in ('dev','.git','node_modules')): continue
    data=p.read_bytes()
    if b'/slides/visit-log.js' in data or b'/scripts/visit-log.js' in data: continue
    if b'location.replace(' in data and b'</body>' not in data: continue  # Redirect destination records the visit once.
    missing.append(p.relative_to(root).as_posix())
    assert b'</body>' in data, p
    if '--check' not in sys.argv: p.write_bytes(data.replace(b'</body>', tag+b'\n</body>', 1))
print({'missing' if '--check' in sys.argv else 'updated':missing})
if '--check' in sys.argv and missing: sys.exit(1)
