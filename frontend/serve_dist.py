import argparse
import os
from http.client import HTTPConnection, HTTPSConnection
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urljoin, urlparse


FRONTEND_DIR = Path(__file__).resolve().parent
DIST_DIR = FRONTEND_DIR / "dist"
PROXY_TIMEOUT_SECONDS = int(os.getenv("PROXY_TIMEOUT_SECONDS", "300"))
DEFAULT_PROXY_TARGETS = {
    "/api/core": os.getenv("CORE_SERVICE_PROXY_URL", "http://localhost:8001"),
    "/api/upload": os.getenv("UPLOAD_SERVICE_PROXY_URL", "http://localhost:8002"),
    "/api/download": os.getenv("DOWNLOAD_SERVICE_PROXY_URL", "http://localhost:8003"),
    "/api/admin": os.getenv("ADMIN_SERVICE_PROXY_URL", "http://localhost:8004"),
    "/api/chat": os.getenv("CHAT_SERVICE_PROXY_URL", "http://localhost:8005"),
}
HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
}


class SPARequestHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def do_GET(self):
        if self._proxy_request():
            return
        super().do_GET()

    def do_HEAD(self):
        if self._proxy_request():
            return
        super().do_HEAD()

    def do_POST(self):
        self._handle_api_request()

    def do_PUT(self):
        self._handle_api_request()

    def do_PATCH(self):
        self._handle_api_request()

    def do_DELETE(self):
        self._handle_api_request()

    def do_OPTIONS(self):
        self._handle_api_request()

    def send_head(self):
        requested_path = urlparse(self.path).path
        resolved_path = Path(self.translate_path(requested_path))

        if resolved_path.is_file():
            return super().send_head()

        if resolved_path.is_dir():
            index_file = resolved_path / "index.html"
            if index_file.is_file():
                return super().send_head()

        if Path(requested_path).suffix:
            return super().send_head()

        self.path = "/index.html"
        return super().send_head()

    def _proxy_request(self) -> bool:
        target_url = self._resolve_proxy_target()
        if not target_url:
            return False

        try:
            upstream = urlparse(target_url)
            connection_class = HTTPSConnection if upstream.scheme == "https" else HTTPConnection
            connection = connection_class(upstream.hostname, upstream.port, timeout=PROXY_TIMEOUT_SECONDS)

            body = self._read_body()
            headers = {
                key: value
                for key, value in self.headers.items()
                if key.lower() not in HOP_BY_HOP_HEADERS and key.lower() != "host"
            }
            headers["Host"] = upstream.netloc

            request_path = upstream.path or "/"
            if upstream.query:
                request_path = f"{request_path}?{upstream.query}"

            connection.request(self.command, request_path, body=body, headers=headers)
            response = connection.getresponse()
            response_body = response.read()

            self.send_response(response.status, response.reason)
            for header, value in response.getheaders():
                header_lower = header.lower()
                if header_lower in HOP_BY_HOP_HEADERS or header_lower in {"content-length", "server", "date"}:
                    continue
                self.send_header(header, value)
            self.send_header("Content-Length", str(len(response_body)))
            self.end_headers()

            if self.command != "HEAD":
                self.wfile.write(response_body)
            connection.close()
        except OSError as exc:
            body = f'{{"detail":"Unable to reach upstream service: {exc}"}}'.encode("utf-8")
            self.send_response(502, "Bad Gateway")
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)

        return True

    def _handle_api_request(self) -> None:
        if self._proxy_request():
            return
        self.send_error(404, "Unknown API endpoint.")

    def _resolve_proxy_target(self) -> str | None:
        parsed_url = urlparse(self.path)
        request_path = parsed_url.path

        for prefix, upstream_base in DEFAULT_PROXY_TARGETS.items():
            if request_path == prefix or request_path.startswith(f"{prefix}/"):
                relative_path = request_path.removeprefix(prefix).lstrip("/")
                upstream_url = urljoin(f"{upstream_base.rstrip('/')}/", relative_path)
                if parsed_url.query:
                    upstream_url = f"{upstream_url}?{parsed_url.query}"
                return upstream_url

        return None

    def _read_body(self) -> bytes | None:
        content_length = self.headers.get("Content-Length")
        if not content_length:
            return None
        return self.rfile.read(int(content_length))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the built React frontend with SPA fallback.")
    parser.add_argument("--host", default="0.0.0.0", help="Host interface to bind to.")
    parser.add_argument("--port", type=int, default=8081, help="Port to listen on.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not DIST_DIR.exists():
        raise SystemExit(f"Build output not found: {DIST_DIR}. Run the frontend build first.")

    server = ThreadingHTTPServer((args.host, args.port), SPARequestHandler)
    print(f"Serving {DIST_DIR} on http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
