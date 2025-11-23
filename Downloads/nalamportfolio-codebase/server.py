#!/usr/bin/env python3
"""
Simple HTTP server for the portfolio website.
Serves static files with proper MIME types and handles routing for both interfaces.
"""

import http.server
import socketserver
import os
import sys
import time
from urllib.parse import urlparse
import json
from threading import Thread

# Local Gemini client
try:
    from api.gemini_client import generate_response, GeminiError
except Exception:
    generate_response = None
    GeminiError = RuntimeError

# Load environment variables from a .env file if present
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass

class PortfolioHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add cache control headers to prevent caching issues in Replit
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Parse the requested path
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Handle root path - serve index.html (modern portfolio)
        if path == '/' or path == '':
            self.path = '/index.html'
        # Handle classic interface routing
        elif path == '/classic' or path == '/classic/':
            self.path = '/classic/index.html'
        
        # Call the parent handler
        return super().do_GET()

    def _send_json(self, status: int, body: dict):
        payload = json.dumps(body).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _read_json(self):
        length = int(self.headers.get('Content-Length', '0'))
        if length <= 0:
            return None
        raw = self.rfile.read(length).decode('utf-8', errors='replace')
        try:
            return json.loads(raw)
        except Exception:
            return None

    def _load_portfolio_context(self) -> str:
        # Read index.html as context for the assistant using proper HTML parsing
        try:
            from html.parser import HTMLParser

            class TextExtractor(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self.text_parts = []
                    self.skip_tags = {'script', 'style', 'noscript'}
                    self.current_tag = None

                def handle_starttag(self, tag, attrs):
                    if tag in self.skip_tags:
                        self.current_tag = tag

                def handle_endtag(self, tag):
                    if tag == self.current_tag:
                        self.current_tag = None

                def handle_data(self, data):
                    if self.current_tag is None:
                        stripped = data.strip()
                        if stripped:
                            self.text_parts.append(stripped)

            with open('index.html', 'r', encoding='utf-8') as f:
                content = f.read()

            parser = TextExtractor()
            parser.feed(content)
            text = ' '.join(parser.text_parts)
            return text[:20000]
        except Exception as e:
            # Fallback to empty context on error
            print(f"Warning: Failed to load portfolio context: {e}")
            return ''

    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        if path != '/api/chat':
            return self._send_json(404, {"error": "Not found"})

        if generate_response is None:
            return self._send_json(500, {"error": "Server not ready: missing dependencies"})

        if self.headers.get('Content-Type', '').split(';')[0].strip() != 'application/json':
            return self._send_json(415, {"error": "Content-Type must be application/json"})

        data = self._read_json() or {}
        question = data.get('question') if isinstance(data, dict) else None
        history = data.get('history') if isinstance(data, dict) else None
        
        if not isinstance(question, str) or not question.strip():
            return self._send_json(400, {"error": "'question' must be a non-empty string"})

        # Load context from portfolio
        context_text = self._load_portfolio_context()

        try:
            reply = generate_response(question.strip(), context_text=context_text, history=history)
        except ValueError as e:
            # Likely configuration issue like missing API key
            return self._send_json(500, {"error": str(e)})
        except GeminiError as e:
            print(f"❌ Gemini API Error: {e}")
            return self._send_json(502, {"error": str(e)})
        except Exception as e:
            return self._send_json(500, {"error": f"Unexpected error: {e}"})

        return self._send_json(200, {"reply": reply})

class ReuseAddrTCPServer(socketserver.TCPServer):
    """TCP Server that allows address reuse"""
    allow_reuse_address = True
    
    def server_bind(self):
        # Enable SO_REUSEADDR
        self.socket.setsockopt(socketserver.socket.SOL_SOCKET, socketserver.socket.SO_REUSEADDR, 1)
        self.socket.bind(self.server_address)

def main():
    # Use PORT from environment when available (e.g., Replit assigns this)
    PORT = int(os.getenv("PORT", "5000"))
    HOST = os.getenv("HOST", "0.0.0.0")
    
    # Change to the directory containing the portfolio files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"🚀 Starting portfolio server on http://{HOST}:{PORT}")
    
    max_retries = 5
    for attempt in range(max_retries):
        try:
            # Create server with address reuse
            with ReuseAddrTCPServer((HOST, PORT), PortfolioHTTPRequestHandler) as httpd:
                print(f"✅ Portfolio server running at http://{HOST}:{PORT}")
                print(f"📖 Modern portfolio interface: http://{HOST}:{PORT}/")
                print(f"🎨 Classic interface: http://{HOST}:{PORT}/classic/")
                print("Press Ctrl+C to stop the server")
                
                try:
                    httpd.serve_forever()
                except KeyboardInterrupt:
                    print("\n👋 Server stopped")
                    sys.exit(0)
                    
        except OSError as e:
            if e.errno == 98 or e.errno == 48:  # Address already in use (98 on Linux, 48 on macOS)
                print(f"⚠️  Port {PORT} is busy, trying next port...")
                PORT += 1
                if attempt < max_retries - 1:
                    time.sleep(1)  # Wait before retrying
                    continue
                else:
                    print(f"❌ Could not bind to port {PORT} after {max_retries} attempts")
                    print("Please ensure no other process is using port 5000")
                    sys.exit(1)
            else:
                print(f"❌ Error starting server: {e}")
                sys.exit(1)
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
