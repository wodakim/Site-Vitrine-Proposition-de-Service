
from playwright.sync_api import sync_playwright
import time

def verify_projects():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate
        print("Navigating to localhost:8080...")
        page.goto("http://localhost:8080")

        # 2. Wait for Loader to hide
        print("Waiting for loader...")
        try:
            page.wait_for_selector("#loader", state="hidden", timeout=5000)
        except:
            print("Loader didn't hide in time, checking if it exists...")

        # 3. Locate Projects
        print("Locating project items...")
        projects = page.locator(".project-item")
        count = projects.count()
        print(f"Found {count} project items.")

        if count > 0:
            # Scroll to projects
            print("Scrolling to projects...")
            projects.first.scroll_into_view_if_needed()
            time.sleep(1) # Wait for scroll

            # 4. Hover first item
            print("Hovering first project item...")
            projects.first.hover()

            # Wait for GSAP transition (0.5s)
            time.sleep(1.0)

            # 5. Take Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification_projects.png")
            print("Screenshot saved to verification_projects.png")

        else:
            print("No projects found!")
            page.screenshot(path="verification_error.png")

        browser.close()

if __name__ == "__main__":
    verify_projects()
