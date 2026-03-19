from __future__ import annotations

import json
import mimetypes
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


PREVIEW_ROOT = Path(__file__).resolve().parent
SITE_ROOT = PREVIEW_ROOT / "site"
OVERRIDES_FILE = SITE_ROOT / "assets" / "data" / "layout-overrides.json"


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PREVIEW_ROOT), **kwargs)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/__studio/save-overrides":
            self.handle_save_overrides()
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Unknown studio endpoint")

    def handle_save_overrides(self) -> None:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(content_length)

        try:
            data = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON payload")
            return

        OVERRIDES_FILE.parent.mkdir(parents=True, exist_ok=True)
        OVERRIDES_FILE.write_text(f"{json.dumps(data, indent=2)}\n", encoding="utf-8")

        payload = json.dumps({"ok": True, "path": str(OVERRIDES_FILE)}).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def end_headers(self) -> None:
        if self.path.endswith(".json"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def guess_type(self, path: str) -> str:
        mimetypes.add_type("application/json", ".json")
        return super().guess_type(path)


def main() -> None:
    port = 8123
    server = ThreadingHTTPServer(("127.0.0.1", port), PreviewHandler)
    print(f"Redesign preview server running at http://127.0.0.1:{port}")
    print("Site:   http://127.0.0.1:8123/site/")
    print("Studio: http://127.0.0.1:8123/site/studio.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
