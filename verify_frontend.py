from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:8000")

        # Wait for potential JS execution and loader fade out
        page.wait_for_timeout(2000)

        # Check if title is correct
        title = page.title()
        print(f"Page title: {title}")

        # Take screenshot
        page.screenshot(path="verification_screenshot.png")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
