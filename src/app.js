
import { renderHero, renderAgency, renderServices, renderProjects, renderFooter, renderProjectDetail } from './components/renderer.js';
import SmoothScroll from './components/scroll.js';
import Router from './components/router.js';
import Cursor from './components/cursor.js';
import LiquidEffect from './components/liquid.js';

class App {
    constructor() {
        this.observer = null;
        this.scroll = null;
        this.router = null;
        this.liquid = null;
        this.data = null;
        this.container = null;
        this.loader = null;
        this.mouse = { x: 0, y: 0 };

        // Bind methods
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleProjectEnter = this.handleProjectEnter.bind(this);
        this.handleProjectLeave = this.handleProjectLeave.bind(this);
        this.animateTransition = this.animateTransition.bind(this);
    }

    async init() {
        console.log("LogoLoom: Init (Vanilla v3 - SPA)");
        this.loader = document.getElementById('loader');
        this.container = document.getElementById('app');

        // Add Noise Overlay
        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        document.body.appendChild(noise);

        // Add Navigation Header (Menu Weaving Target)
        const nav = document.createElement('nav');
        nav.className = 'main-nav';
        nav.innerHTML = `
            <a href="#" class="nav-logo">LOGOLOOM</a>
            <div class="nav-links">
                <a href="#work" data-hover="magnetic">Work</a>
                <a href="#services" data-hover="magnetic">Services</a>
                <a href="#contact" data-hover="magnetic">Contact</a>
            </div>
        `;
        document.body.appendChild(nav);

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

    initRouter() {
        const routes = {
            'home': () => this.handleRoute('home'),
            'project': (id) => this.handleRoute('project', id),
            'services': () => this.handleRoute('home'), // Fallback for now
            'contact': () => this.handleRoute('home')   // Fallback
        };

        this.router = new Router(routes);
        this.router.init();
    }

    async handleRoute(view, param) {
        console.log(`[App] Handling route: ${view} (param: ${param})`);

        // Transition Out
        await this.animateTransition('out');
        console.log("[App] Transition OUT complete");

        // Scroll to Top
        window.scrollTo(0, 0);

        // Clear DOM
        this.container.innerHTML = '';

        // Render New View
        console.log("[App] Rendering view...");
        if (view === 'home') {
            this.renderHome();
        } else if (view === 'project') {
            this.renderProject(param);
        }

        // Re-init Scroll Height & Cache
        if (this.scroll) {
            // Wait a tick for DOM to reflow
            requestAnimationFrame(() => {
                console.log("[App] Resizing Scroll...");
                this.scroll.resize(); // Recalculate height and recache elements
            });
        }

        // Transition In
        await this.animateTransition('in');
        console.log("[App] Transition IN complete");

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

        // Observer for reveal animations
        const options = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        // Target elements
        const targets = document.querySelectorAll('.hero-title, .agency-manifesto, .service-card, .project-row, .footer-title, .detail-title, .detail-desc');
        targets.forEach(el => {
            el.classList.add('reveal-hidden');
            this.observer.observe(el);
        });
    }

    initProjectHover() {
        // Since DOM is dynamic, we delegate or rebind.
        // For simplicity here, we rebind on route change, but we need to handle the container availability.
        const container = document.getElementById('project-thumb-container');
        const img = document.getElementById('project-thumb-img');

        if (!container || !img) return;

        // Ensure we don't duplicate listener on window
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousemove', this.handleMouseMove);

        // Wait for DOM to be ready
        // Delegation:
        this.container.addEventListener('mouseenter', (e) => {
             const row = e.target.closest('.project-row');
             if (row) this.handleProjectEnter(e, row, img, container);
        }, true); // Capture phase might be needed or just bubble

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

        // Use WebGL Liquid Effect if available
        if (this.liquid) {
            this.liquid.setImage(url);
        } else {
            // Fallback
            img.src = url;
        }

        container.style.opacity = '1';
        container.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }

    handleProjectLeave(container) {
        container.style.opacity = '0';
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
