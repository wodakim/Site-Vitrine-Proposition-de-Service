
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:8080")
            page.goto("http://localhost:8080")

            # Wait for content
            print("Waiting for .hero-title")
            page.wait_for_selector(".hero-title", state="visible", timeout=10000)

            # Wait for CSS animations
            time.sleep(1)

            print("Taking screenshot")
            page.screenshot(path="verification_vanilla.png", full_page=True)
            print("Screenshot saved to verification_vanilla.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
