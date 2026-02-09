
import asyncio
from playwright.async_api import async_playwright
import http.server
import socketserver
import threading
import time

PORT = 8002

def start_server():
    try:
        handler = http.server.SimpleHTTPRequestHandler
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print("serving at port", PORT)
            httpd.serve_forever()
    except OSError:
        pass # Port already in use maybe

def run_server():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1)

async def main():
    run_server()
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        await page.goto(f"http://localhost:{PORT}")

        # Wait for app init
        await page.wait_for_timeout(2000)

        # Check body height
        body_height = await page.evaluate("document.body.style.height")
        print(f"Body Height: {body_height}")

        # Scroll
        await page.evaluate("window.scrollTo(0, 500)")
        await page.wait_for_timeout(1000)

        # Get transform
        transform = await page.evaluate("document.getElementById('app').style.transform")
        print(f"App Transform: {transform}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
