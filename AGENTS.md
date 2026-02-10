# LogoLoom Development Guidelines

## Architecture Overview
The project has transitioned from a Single Page Application (SPA) with DOM swapping to a **Multi-Page Application (MPA)** to ensure performance and stability across different rendering modes.

### Pages & Modes
1.  **Standard Mode (`index.html`):**
    -   Entry point: `src/app.js`
    -   Tech: Vanilla JS, Lenis Scroll, WebGL Liquid Distortion.
    -   Design: Minimalist, "Heavy" typography, smooth scrolling.

2.  **Retro Mode (`retro.html`):**
    -   Entry point: `src/app-retro.js`
    -   Tech: Vanilla JS, Custom Retro Renderer.
    -   Design: Terminal green, glitch effects, "Matrix" aesthetic.

### Navigation & Transitions (The "Garganta" Effect)
The transition between modes is handled by `src/components/transition.js`. It uses a "Void" overlay (SVG/Canvas) to mask the page load.

-   **Trigger:** Clicking the mode toggle button (`#mode-toggle`) initiates the transition.
-   **Step 1 (Exit):** The current page zooms into the void (`enterGate`).
-   **Step 2 (Navigate):** The browser navigates to the target page with a URL parameter (e.g., `retro.html?from=standard`).
-   **Step 3 (Entrance):** The new page detects the parameter (in `checkEntrance()`) and plays the "Entrance" animation (fading out the void).

### Key Files
-   `src/components/transition.js`: Shared logic for the void effect.
-   `src/app.js`: Standard mode initialization.
-   `src/app-retro.js`: Retro mode initialization.
-   `src/css/style.css`: Global styles (Standard + Retro specific overrides).

## Assets
-   **Audio:** Ensure `bleach-garganta.mp3` is placed in `assets/audio/`. The transition logic attempts to load this file.
-   **Images/Fonts:** Located in `assets/`.

## Developer Notes
-   **Do not revert to SPA/Twin DOM:** The previous attempt to keep both DOM trees in memory caused severe lag and complexity. The MPA approach cleanly separates contexts.
-   **Testing:** Verify navigation by checking the URL parameters and ensuring the visual transition (Void overlay) plays smoothly on both exit and entrance.
