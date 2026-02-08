// src/js/main.js
import * as DOM from './dom.js';
import { WebGLManager } from './webgl.js';

class App {
    constructor() {
        this.webgl = new WebGLManager();
        this.lenis = null;
        this.rafId = null;
    }

    async init() {
        console.log("App Init...");
        const loaderBar = document.querySelector('.loader-bar');
        if(loaderBar) loaderBar.style.width = "30%";

        // 1. Load Data
        let data;
        try {
            const res = await fetch('./data/data.json');
            data = await res.json();
            if(loaderBar) loaderBar.style.width = "70%";
        } catch (e) {
            console.error("Data Load Failed", e);
            return;
        }

        // 2. Render DOM
        const appContainer = document.getElementById('app');
        if (appContainer && data) {
            DOM.renderHero(data.hero, appContainer);
            DOM.renderTicker(appContainer);
            DOM.renderAgency(data.agency, appContainer);
            DOM.renderServices(data.services, appContainer);
            DOM.renderProjects(data.projects, appContainer);
            DOM.renderFooter(data.footer, appContainer);
        }

        if(loaderBar) {
            loaderBar.style.width = "100%";
            // Hide Loader after short delay
            setTimeout(() => {
                document.body.classList.add('loaded');
            }, 600);
        }

        // 3. Init Lenis
        if (window.Lenis) {
            this.lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smooth: true
            });
            this.lenis.on('scroll', ({ scroll }) => {
                this.webgl.updateScroll(scroll);
            });
        }

        // 4. Init WebGL (Safe Mode)
        // Only init if device is capable? For now, yes.
        this.webgl.init();

        // 5. Start RAF
        this.tick();

        // 6. Resize Listener
        window.addEventListener('resize', () => {
            this.webgl.resize();
        });
    }

    tick(time) {
        if (this.lenis) this.lenis.raf(time);
        if (this.webgl) this.webgl.render();

        this.rafId = requestAnimationFrame(this.tick.bind(this));
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
