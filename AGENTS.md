# LogoLoom Development Guidelines

## Architecture Overview
The project is a **Multi-Page Application (MPA)** with a "No-Build" Vanilla JS architecture, designed for maximum performance and stability.

### Directory Structure
-   `src/core/`: Application logic (Router, ScrollManager, ViewManager, TransitionManager).
-   `src/pages/`: Page-specific rendering logic (Home, Agency, Services, Work, etc.).
-   `src/components/`: Reusable UI components (Cursor, LiquidEffect).
-   `src/utils/`: Helper functions (renderHelpers.js).
-   `src/data/`: Content (data.json).

### Pages & Modes
1.  **Standard Mode (`index.html`):**
    -   Entry point: `src/app.js`
    -   Router: `src/core/Router.js` + `src/core/ViewManager.js`
    -   Tech: Vanilla JS, Custom Scroll, WebGL Liquid Distortion.
    -   Design: Minimalist, "Heavy" typography, smooth scrolling.

2.  **Retro Mode (`retro.html`):**
    -   Entry point: `src/app-retro.js`
    -   Tech: Vanilla JS, Custom Retro Renderer.
    -   Design: Terminal green, glitch effects, "Matrix" aesthetic.

### Navigation & Transitions (The "Garganta" Effect)
The transition between modes is handled by `src/core/TransitionManager.js`. It uses a Canvas-based "Void" overlay to mask the page load.

-   **Trigger:** Clicking the mode toggle button (`#mode-toggle`) initiates the transition.
-   **Step 1 (Exit):** The current page zooms into the void (`enterGate`).
-   **Step 2 (Navigate):** The browser navigates to the target page with a URL parameter (e.g., `retro.html?from=standard`).
-   **Step 3 (Entrance):** The new page detects the parameter (in `checkEntrance()`) and plays the "Entrance" animation (fading out the void).

### Key Files
-   `src/core/TransitionManager.js`: Shared logic for the void effect (Canvas).
-   `src/core/ScrollManager.js`: Custom smooth scroll implementation.
-   `src/core/ViewManager.js`: Handles page mounting/unmounting and scroll resetting.
-   `src/app.js`: Standard mode initialization.
-   `src/app-retro.js`: Retro mode initialization.

## Assets
-   **Audio:** Ensure `bleach-garganta.mp3` is placed in `assets/audio/`. The transition logic attempts to load this file.
-   **Images/Fonts:** Located in `assets/`.

## Developer Notes
-   **Do not revert to SPA/Twin DOM:** The previous attempt to keep both DOM trees in memory caused severe lag and complexity. The MPA approach cleanly separates contexts.
-   **Strict Separation:** Keep rendering logic in `src/pages/` and core logic in `src/core/`.
-   **Testing:** Verify navigation by checking URL parameters and ensuring the visual transition (Void overlay) plays smoothly.
