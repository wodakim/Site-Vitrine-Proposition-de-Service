
import { renderHero, renderAgency, renderServices, renderProjects, renderFooter, renderProjectDetail, renderServicesPage, renderWorkPage, renderContactPage, renderAgencyPage } from './components/renderer.js';
import SmoothScroll from './components/scroll.js';
import Router from './components/router.js';
import Cursor from './components/cursor.js';
import LiquidEffect from './components/liquid.js';
import RetroRenderer from './components/retroRenderer.js';
import TransitionManager from './components/transition.js';

class App {
    constructor() {
        this.observer = null;
        this.scroll = null;
        this.router = null;
        this.liquid = null;
        this.retroRenderer = null;
        this.transitionManager = null;

        this.data = null;
        this.container = null;
        this.loader = null;
        this.mouse = { x: 0, y: 0 };

        this.isRetroMode = false;

        // Bind methods
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleProjectEnter = this.handleProjectEnter.bind(this);
        this.handleProjectLeave = this.handleProjectLeave.bind(this);
        this.animateTransition = this.animateTransition.bind(this);
        this.toggleRetroMode = this.toggleRetroMode.bind(this);
        this.completeTransition = this.completeTransition.bind(this);
    }

    async init() {
        console.log("LogoLoom: Init (Vanilla v3 - SPA)");
        this.loader = document.getElementById('loader');
        this.container = document.getElementById('app');

        // Add Noise Overlay
        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        document.body.appendChild(noise);

        // Init Transition Manager
        this.transitionManager = new TransitionManager(this.completeTransition);

        // Add Navigation Header (Menu Weaving Target)
        this.createNav();

        // Add Master Switch Toggle
        this.createToggle();

        // Init Void Loader
        this.createVoidLoader();

        // Init Cursor (Physics String)
        new Cursor();

        // Init Liquid Effect (WebGL)
        const thumbContainer = document.getElementById('project-thumb-container');
        if (thumbContainer) {
            this.liquid = new LiquidEffect(thumbContainer);
        }

        try {
            // 1. Fetch Data
            const response = await fetch('./src/data/data.json');
            if (!response.ok) throw new Error("Erreur Chargement Données");
            this.data = await response.json();

            // Init Retro Renderer
            this.retroRenderer = new RetroRenderer(this.data, this.container);

            // 2. Init Router
            this.initRouter();

            // 3. Init Scroll System (Initially empty)
            console.log("Initializing SmoothScroll...");
            this.scroll = new SmoothScroll();
            console.log("SmoothScroll initialized.");

            // 4. Init Interactions
            this.initProjectHover();

            // 5. Hide Loader (Delay slightly)
            setTimeout(() => {
                if (this.loader) {
                    this.loader.style.opacity = '0';
                    this.loader.style.transition = 'opacity 0.6s ease';
                    setTimeout(() => {
                        this.loader.remove();
                        document.body.classList.add('loaded');
                    }, 600);
                }
            }, 500);

        } catch (error) {
            console.error("LogoLoom Error:", error);
            if (this.loader) this.loader.innerHTML = `<div style="color:white; text-align:center; padding-top:20vh; font-family:sans-serif;">ERREUR SYSTEME<br>${error.message}</div>`;
        }
    }

    createNav() {
        const nav = document.createElement('nav');
        nav.className = 'main-nav';
        nav.id = 'main-nav';
        nav.innerHTML = `
            <a href="#" class="nav-logo">LOGOLOOM</a>
            <div class="nav-links">
                <a href="#agency" data-hover="magnetic">Agency</a>
                <a href="#work" data-hover="magnetic">Work</a>
                <a href="#services" data-hover="magnetic">Services</a>
                <a href="#contact" data-hover="magnetic">Contact</a>
            </div>
        `;
        document.body.appendChild(nav);
    }

    createToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'mode-toggle';
        toggleBtn.className = 'mode-toggle';
        toggleBtn.innerText = '●';
        toggleBtn.title = "Switch Reality";
        toggleBtn.addEventListener('click', this.toggleRetroMode);
        document.body.appendChild(toggleBtn);
    }

    createVoidLoader() {
        const loader = document.createElement('div');
        loader.className = 'void-loader';
        document.body.appendChild(loader);
        this.voidLoader = loader;
    }

    showVoidLoader() {
        if (this.voidLoader) this.voidLoader.style.opacity = "1";
    }

    hideVoidLoader() {
        if (this.voidLoader) this.voidLoader.style.opacity = '0';
    }

    toggleRetroMode() {
        const direction = this.isRetroMode ? 'toStandard' : 'toRetro';
        // Trigger Garganta with Async Callback for Buffered Transition
        this.transitionManager.startTransition(async () => {
            await this.completeTransition(direction);
        }, direction);
    }

    async completeTransition(direction) {
        // 1. Show Void Buffer
        this.showVoidLoader();

        // Wait for paint (Force two Frames)
        // This ensures the Loader is visible and screen is stable BEFORE heavy work
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    resolve();
                });
            });
        });

        // Extra micro-delay for safety (100ms)
        await new Promise(r => setTimeout(r, 100));

        // 2. Perform HEAVY DOM SWAP in a non-blocking way (if possible)
        this.isRetroMode = !this.isRetroMode;

        if (this.isRetroMode) {
            // Destroy Standard
            if (this.scroll) this.scroll.destroy();
            document.body.style.height = '100vh';
            document.body.style.overflow = 'hidden';
            document.getElementById('main-nav').style.display = 'none';
            document.getElementById('mode-toggle').classList.add('retro');

            // Render Retro
            this.container.innerHTML = '';

            // Defer heavy Retro init slightly?
            this.retroRenderer.init();

        } else {
            // Destroy Retro
            this.retroRenderer.destroy();
            document.getElementById('main-nav').style.display = 'flex';
            document.getElementById('mode-toggle').classList.remove('retro');
            document.body.style.overflow = '';

            // Restore Standard
            this.handleRoute(this.router.currentHash || 'home');

            // Re-enable Scroll (Heaviest part)
             if (this.scroll) {
                this.scroll = new SmoothScroll();
                // Delay resize calculation until fade out begins or ends
                setTimeout(() => this.scroll.resize(), 200);
            }
        }

        // 3. Artificial Buffer Delay (Stabilization) - Increased to 1.2s
        // Allows browser to finish layout/paint of new DOM while screen is still black
        await new Promise(r => setTimeout(r, 1200));

        // 4. Hide Void Buffer
        this.hideVoidLoader();
    }

    initRouter() {
        const routes = {
            'home': () => this.handleRoute('home'),
            'project': (id) => this.handleRoute('project', id),
            'agency': () => this.handleRoute('agency'),
            'services': () => this.handleRoute('services'),
            'work': () => this.handleRoute('work'),
            'contact': (id, params) => this.handleRoute('contact', id, params)
        };

        this.router = new Router(routes);
        this.router.init();
    }

    async handleRoute(view, param, queryParams) {
        // If Retro Mode is active, Router changes should update the Retro Renderer or be ignored
        // Ideally in Retro Mode, we are in a "Desktop" single page, but let's support hash changes if we want deep linking later.
        // For now, if Retro Mode is ON, we ignore standard routing rendering, OR we map it to opening windows.

        if (this.isRetroMode) {
            console.log("Retro Mode Active: Route change ignored by Standard Renderer.");
            return;
        }

        console.log(`[App] Handling route: ${view} (param: ${param}) Query:`, queryParams);

        // Transition Out
        await this.animateTransition('out');

        window.scrollTo(0, 0);
        this.container.innerHTML = '';

        // Render New View
        if (view === 'home') {
            this.renderHome();
        } else if (view === 'project') {
            this.renderProject(param);
        } else if (view === 'agency') {
            this.renderAgencyPage();
        } else if (view === 'services') {
            this.renderServicesPage();
        } else if (view === 'work') {
            this.renderWorkPage();
        } else if (view === 'contact') {
            this.renderContactPage(queryParams);
        }

        // Re-init Scroll Height & Cache
        if (this.scroll) {
            requestAnimationFrame(() => {
                this.scroll.resize();
            });
        }

        // Transition In
        await this.animateTransition('in');

        // Re-init Observers/Interactions
        this.initScrollReveal();
    }

    renderHome() {
        if (!this.data) return;
        renderHero(this.data.hero, this.container);
        renderAgency(this.data.agency, this.container);
        renderServices(this.data.services, this.container);
        renderProjects(this.data.projects, this.container);
        renderFooter(this.data.footer, this.container);
    }

    renderAgencyPage() {
        if (!this.data) return;
        renderAgencyPage(this.data.agency, this.container);
        renderFooter(this.data.footer, this.container);
    }

    renderServicesPage() {
        if (!this.data) return;
        renderServicesPage(this.data.services, this.container);
        renderFooter(this.data.footer, this.container);
    }

    renderWorkPage() {
        if (!this.data) return;
        renderWorkPage(this.data.projects, this.container);
        renderFooter(this.data.footer, this.container);
    }

    renderContactPage(queryParams) {
        if (!this.data) return;
        renderContactPage(this.data.footer, this.data.services, queryParams, this.container);
    }

    renderProject(id) {
        if (!this.data) return;
        const project = this.data.projects.find(p => p.id === id);
        if (project) {
            renderProjectDetail(project, this.container);
        } else {
            this.container.innerHTML = `<h1>Projet non trouvé</h1><a href="#">Retour</a>`;
        }
    }

    animateTransition(direction) {
        return new Promise(resolve => {
            const duration = 500;

            if (direction === 'out') {
                this.container.style.opacity = '0';
                this.container.style.transition = `opacity ${duration}ms ease`;
                setTimeout(resolve, duration);
            } else {
                this.container.style.opacity = '1';
                setTimeout(resolve, duration);
            }
        });
    }

    initScrollReveal() {
        if (this.observer) this.observer.disconnect();

        const options = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        const targets = document.querySelectorAll('.hero-title, .agency-manifesto, .service-card, .project-row, .footer-title, .detail-title, .detail-desc, .page-title');
        targets.forEach(el => {
            el.classList.add('reveal-hidden');
            this.observer.observe(el);
        });
    }

    initProjectHover() {
        const container = document.getElementById('project-thumb-container');
        const img = document.getElementById('project-thumb-img');

        if (!container || !img) return;

        window.removeEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousemove', this.handleMouseMove);

        this.container.addEventListener('mouseenter', (e) => {
             const row = e.target.closest('.project-row');
             if (row) this.handleProjectEnter(e, row, img, container);
        }, true);

        this.container.addEventListener('mouseleave', (e) => {
             const row = e.target.closest('.project-row');
             if (row) this.handleProjectLeave(container);
        }, true);
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        const container = document.getElementById('project-thumb-container');
        if (container && container.style.opacity !== '0') {
            container.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    }

    handleProjectEnter(e, row, img, container) {
        const url = row.dataset.img;
        if (!url) return;

        if (this.liquid) {
            this.liquid.setImage(url);
        } else {
            img.src = url;
        }

        container.style.opacity = '1';
        container.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }

    handleProjectLeave(container) {
        container.style.opacity = '0';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
