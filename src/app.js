
import { Router } from './core/router.js';
import { WebGLManager } from './core/webgl.js';

class App {
    constructor() {
        this.webgl = new WebGLManager();
        this.router = null;
        this.lenis = null;

        // Bind
        this.tick = this.tick.bind(this);
    }

    async init() {
        console.log("LogoLoom: Init Sequence Started");
        const loader = document.getElementById('loader');

        try {
            // 1. Fetch Data
            const response = await fetch('./src/data/data.json');
            if (!response.ok) throw new Error("Failed to load data.json");
            const data = await response.json();

            // 2. Init Router (Renders the initial DOM)
            this.router = new Router(data);

            // 3. Init WebGL (Must happen after DOM is rendered)
            // Wait a tick to ensure DOM is ready
            requestAnimationFrame(() => {
                this.webgl.init();
            });

            // 4. Init Smooth Scroll (Lenis)
            if (window.Lenis) {
                this.lenis = new Lenis({
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smooth: true,
                    direction: 'vertical',
                    gestureDirection: 'vertical',
                    smoothTouch: false,
                    touchMultiplier: 2,
                });

                this.lenis.on('scroll', ({ scroll }) => {
                    // Pass scroll to WebGL if needed (e.g. for plane positions)
                    if(this.webgl.updateScroll) this.webgl.updateScroll(scroll);
                });

                // GSAP ScrollTrigger Integration
                if (window.ScrollTrigger) {
                    window.Lenis = this.lenis; // Expose for debugging

                    // Sync ScrollTrigger with Lenis
                    this.lenis.on('scroll', ScrollTrigger.update);

                    gsap.ticker.add((time) => {
                        this.lenis.raf(time * 1000);
                    });

                    gsap.ticker.lagSmoothing(0);
                }
            }

            // 5. Reveal Site
            if (loader) {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        loader.style.display = 'none';
                    }
                });
            }

            // 6. Start Loop
            requestAnimationFrame(this.tick);

        } catch (error) {
            console.error("LogoLoom Critical Error:", error);
            if (loader) loader.innerHTML = `<div style="color:white; text-align:center; padding-top:20vh;">ECHEC SYSTEME<br>${error.message}</div>`;
        }
    }

    tick(time) {
        // Lenis is handled by GSAP ticker if ScrollTrigger is present,
        // but if not, we need manual raf.
        // Since we added it to gsap.ticker, we don't need to call lenis.raf(time) here IF gsap is running.
        // But to be safe in case GSAP fails:
        if (!window.ScrollTrigger && this.lenis) {
            this.lenis.raf(time);
        }

        if (this.webgl) this.webgl.render();

        requestAnimationFrame(this.tick);
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
