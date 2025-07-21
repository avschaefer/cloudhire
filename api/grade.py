import os
from http.server import BaseHTTPRequestHandler

def get_config():
    return {'xai_key': os.environ['XAI_API_KEY']}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        config = get_config()
        # ... existing AI logic ...
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'{"score": 85}')  # Example
