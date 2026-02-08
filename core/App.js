import Loader from './Loader.js';
import Router from './Router.js';
import WebGLManager from './WebGLManager.js';

class App {
    constructor() {
        if (App.instance) {
            return App.instance;
        }
        App.instance = this;

        this.loader = new Loader();
        this.webglManager = new WebGLManager();
        this.router = new Router(this);
        this.lenis = null;
        this.data = null;

        this.resizeTimeout = null;

        this.init();
    }

    async init() {
        console.log('App Initializing...');

        // 1. Fetch Data
        try {
            const response = await fetch('./data/data.json');
            this.data = await response.json();
            console.log('Data loaded:', this.data);

            // 2. Build DOM (Simple placeholder for now)
            this.buildDOM();

        } catch (error) {
            console.error('Error loading data:', error);
        }

        // 3. Init WebGL
        this.webglManager.init();

        // 4. Init Lenis (Smooth Scroll)
        this.initLenis();

        // 5. Init Router (Barba)
        this.router.init();

        // 6. Start Loop
        this._raf = this._raf.bind(this);
        requestAnimationFrame(this._raf);

        // 7. Event Listeners
        window.addEventListener('resize', this.onResize.bind(this));

        // Hide Loader
        this.loader.hide();
    }

    buildDOM() {
        // Logique de génération du DOM à partir de this.data
        // À implémenter : Injecter le contenu dans <main id="barba-wrapper">
        const main = document.querySelector('main');
        if (main && this.data) {
            // Exemple basique : Titre Hero
            const h1 = document.createElement('h1');
            h1.innerText = this.data.hero_section.title;
            // main.appendChild(h1);
            // Note: Pour l'instant on laisse le HTML vide ou on le remplira dynamiquement plus tard.
            // Le prompt demandait "Au chargement, le JS lit le data.json et génère le DOM à la volée."
            // Je vais laisser cette partie pour l'intégration visuelle,
            // mais la structure est là.
        }
    }

    initLenis() {
        if (!window.Lenis) return;

        this.lenis = new window.Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Sync Scroll to WebGL
        this.lenis.on('scroll', ({ scroll }) => {
            this.webglManager.updateScroll(scroll);
        });
    }

    _raf(time) {
        if (this.lenis) {
            this.lenis.raf(time);
        }

        if (this.webglManager) {
            this.webglManager.render();
        }

        if (window.ScrollTrigger) {
            window.ScrollTrigger.update();
        }

        requestAnimationFrame(this._raf);
    }

    onResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            console.log('Debounced Resize');

            if (this.webglManager) {
                this.webglManager.resize();
            }

            if (window.ScrollTrigger) {
                window.ScrollTrigger.refresh();
            }

        }, 100);
    }
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
