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
        // 1. Fetch Data
        try {
            const response = await fetch('./data/data.json');
            this.data = await response.json();

            // 2. Build DOM
            this.buildDOM();

        } catch (error) {
            console.error('Error loading data:', error);
        }

        // 3. Init WebGL
        // We pass the data to WebGLManager if needed, but it will read from DOM
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
        h1.innerHTML = heroData.title.replace(/\n/g, '<br>');

        const subtitle = document.createElement('p');
        subtitle.className = 'hero-subtitle';
        subtitle.innerText = heroData.subtitle;

        const cta = document.createElement('a');
        cta.className = 'hero-cta';
        cta.href = '#projects';
        cta.innerText = heroData.cta;

        heroContent.appendChild(h1);
        heroContent.appendChild(subtitle);
        heroContent.appendChild(cta);

        // Hero Image (Hidden for WebGL)
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'hero-image-wrapper';

        const img = document.createElement('img');
        img.className = 'hero-image';
        img.crossOrigin = "anonymous";
        img.src = heroData.image.url;
        img.alt = heroData.title;
        img.dataset.sampler = "planeTexture";

        imageWrapper.appendChild(img);

        heroSection.appendChild(imageWrapper);
        heroSection.appendChild(heroContent);

        main.appendChild(heroSection);

        // --- Projects Section ---
        if (this.data.featured_projects && this.data.featured_projects.length > 0) {
            const projectsSection = document.createElement('section');
            projectsSection.className = 'projects-section container';
            projectsSection.id = 'projects';

            const projectsList = document.createElement('div');
            projectsList.className = 'projects-list';

            this.data.featured_projects.forEach((proj, index) => {
                const item = document.createElement('a');
                item.className = 'project-item';
                item.href = proj.link || '#';
                item.dataset.id = proj.id;

                // Index
                const idx = document.createElement('span');
                idx.className = 'project-index';
                idx.innerText = `0${index + 1}.`;

                // Title
                const title = document.createElement('h2');
                title.className = 'project-title';
                title.innerText = proj.title;

                // Tags
                const tags = document.createElement('div');
                tags.className = 'project-tags';
                tags.innerText = proj.tags.join(' / ');

                // Hidden GL Image
                // IMPORTANT: opacity: 0 and position: absolute via CSS class
                const glImg = document.createElement('img');
                glImg.className = 'project-gl-image';
                glImg.crossOrigin = "anonymous";
                glImg.src = proj.image.url;
                glImg.alt = proj.title;
                glImg.dataset.displacement = proj.image.displacementMap;
                glImg.dataset.intensity = proj.image.intensity;

                item.appendChild(idx);
                item.appendChild(title);
                item.appendChild(tags);
                item.appendChild(glImg);

                projectsList.appendChild(item);
            });

            projectsSection.appendChild(projectsList);
            main.appendChild(projectsSection);
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

        this.lenis.on('scroll', ({ scroll }) => {
            if (this.webglManager) {
                this.webglManager.updateScroll(scroll);
            }
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
            if (this.webglManager) {
                this.webglManager.resize();
            }
            if (window.ScrollTrigger) {
                window.ScrollTrigger.refresh();
            }
        }, 100);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App();
});
