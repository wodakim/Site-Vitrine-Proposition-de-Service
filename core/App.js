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
        const main = document.querySelector('main');
        if (!main || !this.data) return;

        // --- Hero Section ---
        const heroData = this.data.hero_section;
        const heroSection = document.createElement('section');
        heroSection.className = 'hero-section';

        // Hero Content
        const heroContent = document.createElement('div');
        heroContent.className = 'hero-content container';

        const h1 = document.createElement('h1');
        h1.className = 'hero-title';
        h1.innerHTML = heroData.title.replace(/\n/g, '<br>'); // Handle line breaks

        const subtitle = document.createElement('p');
        subtitle.className = 'hero-subtitle';
        subtitle.innerText = heroData.subtitle;

        const cta = document.createElement('a');
        cta.className = 'hero-cta';
        cta.href = '#projects'; // Internal anchor for now
        cta.innerText = heroData.cta;

        heroContent.appendChild(h1);
        heroContent.appendChild(subtitle);
        heroContent.appendChild(cta);

        // Hero Image (Hidden for WebGL)
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'hero-image-wrapper';

        const img = document.createElement('img');
        img.className = 'hero-image';
        img.src = heroData.image.url;
        img.alt = heroData.title;
        // Data attributes for Curtains
        img.dataset.sampler = "planeTexture";
        // Store displacement map info if needed by WebGLManager directly,
        // though WebGLManager will likely read from JSON config passed to it.

        imageWrapper.appendChild(img);

        heroSection.appendChild(imageWrapper);
        heroSection.appendChild(heroContent);

        main.appendChild(heroSection);

        // --- Services & Projects (Placeholders for now) ---
        // (Will be implemented in next phases)
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
