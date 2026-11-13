"""Local preview with the public /slides/ prefix; no browser automation."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parent/'site'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def translate_path(self,path):
        if path.startswith('/slides/'):path=path[len('/slides'):]
        return super().translate_path(path)
    def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',7316),Handler).serve_forever()
