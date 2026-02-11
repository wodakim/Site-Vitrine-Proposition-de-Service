import TransitionManager from './TransitionManager.js';

export default class Router {
    constructor(app) {
        this.app = app;
        this.isNavigating = false;
        this.transitionManager = new TransitionManager(); // Init Transition
    }

    init() {
        if (!window.barba) {
            console.error('Barba.js not found');
            return;
        }

        const self = this;

        barba.init({
            debug: false,
            preventRunning: true, // Prevent double clicks
            transitions: [{
                name: 'garganta-transition',
                sync: false, // Run leave and enter sequentially

                async leave(data) {
                    self.isNavigating = true;

                    // 1. Open Garganta (Cover Screen)
                    await self.transitionManager.playOpen();

                    // 2. Clean up Old Page
                    if (self.app.webglManager) {
                        self.app.webglManager.destroyPlanes();
                    }

                    // Kill ScrollTriggers
                    if (window.ScrollTrigger) {
                         window.ScrollTrigger.getAll().forEach(t => t.kill());
                    }

                    // Fade out container just in case (behind the void)
                    data.current.container.style.display = 'none';

                    return true;
                },

                async enter(data) {
                    // 3. New Page is ready in DOM (Barba did it)
                    // Scroll Reset
                    if (self.app.lenis) {
                        self.app.lenis.scrollTo(0, { immediate: true });
                    }
                    window.scrollTo(0, 0);

                    // Re-init WebGL / Components
                    // We need to wait for things to be ready?
                    // The App.js usually inits things on DOMContentLoaded.
                    // But here we are SPA. We need to trigger init manually.

                    // We call a method on App to re-scan DOM
                    if (self.app.onPageEnter) {
                        await self.app.onPageEnter(data.next.container);
                    }

                    // 4. Close Garganta (Reveal New Page)
                    self.isNavigating = false;
                    await self.transitionManager.playClose();
                }
            }],
            views: []
        });

        // Hooks extra safety
        barba.hooks.after(() => {
             if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        });
    }
}
