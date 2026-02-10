
import { renderHero, renderAgency, renderServices, renderProjects, renderFooter, renderProjectDetail, renderServicesPage, renderWorkPage, renderContactPage, renderAgencyPage } from './components/renderer.js';
import SmoothScroll from './components/scroll.js';
import Router from './components/router.js';
import Cursor from './components/cursor.js';
import LiquidEffect from './components/liquid.js';
import TransitionManager from './components/transition.js';

// Standard App (Main)
class App {
    constructor() {
        this.scroll = null;
        this.router = null;
        this.liquid = null;
        this.transitionManager = null;
        this.data = null;
        this.container = null;
        this.loader = null;

        // Bind
        this.handleProjectEnter = this.handleProjectEnter.bind(this);
        this.handleProjectLeave = this.handleProjectLeave.bind(this);
        this.toggleRetroMode = this.toggleRetroMode.bind(this);
    }

    async init() {
        console.log("LogoLoom: Init (Standard Mode)");
        this.loader = document.getElementById('loader');
        this.container = document.getElementById('app');

        // Add Noise
        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        document.body.appendChild(noise);

        // Transition Manager
        this.transitionManager = new TransitionManager();

        // Check if we arrived from Retro (Entrance Animation)
        this.checkEntrance();

        // Nav & Toggle
        this.createNav();
        this.createToggle();

        // Cursor
        new Cursor();

        // Liquid
        const thumbContainer = document.getElementById('project-thumb-container');
        if (thumbContainer) this.liquid = new LiquidEffect(thumbContainer);

        try {
            const response = await fetch('./src/data/data.json');
            this.data = await response.json();

            this.initRouter();

            // Scroll
            this.scroll = new SmoothScroll();

            this.initProjectHover();

            // Hide Loader
            setTimeout(() => {
                if (this.loader) {
                    this.loader.style.opacity = '0';
                    setTimeout(() => this.loader.remove(), 600);
                }
            }, 500);

        } catch (error) {
            console.error(error);
        }
    }

    checkEntrance() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'retro') {
            // Play "Close" animation (Fade out void)
            // We assume the page loads with a full-screen void overlay?
            // Or we trigger the transition manager to "open" (visual exit).
            // Actually, Garganta logic:
            // "Enter" = Zoom In (to Void).
            // "Exit" = Fade Out Void.
            // If we just arrived, we are in the Void. We need to fade it out.
            this.transitionManager.playEntrance();
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

    toggleRetroMode() {
        // Trigger Transition -> Navigate
        this.transitionManager.startTransition(() => {
            window.location.href = 'retro.html?from=standard';
        }, 'toRetro');
    }

    initRouter() {
        const routes = {
            'home': () => this.renderHome(),
            'project': (id) => this.renderProject(id),
            'agency': () => this.renderAgencyPage(),
            'services': () => this.renderServicesPage(),
            'work': () => this.renderWorkPage(),
            'contact': (id, params) => this.renderContactPage(params)
        };

        this.router = new Router(routes);
        this.router.init();
    }

    // ... Render methods (Simplified for brevity, assuming they exist in renderer.js) ...
    renderHome() {
        if (!this.data) return;
        renderHero(this.data.hero, this.container);
        renderAgency(this.data.agency, this.container);
        renderServices(this.data.services, this.container);
        renderProjects(this.data.projects, this.container);
        renderFooter(this.data.footer, this.container);
        this.refreshScroll();
    }

    renderProject(id) {
        // Implementation from memory
        const p = this.data.projects.find(x => x.id === id);
        if(p) renderProjectDetail(p, this.container);
        this.refreshScroll();
    }

    renderAgencyPage() { renderAgencyPage(this.data.agency, this.container); this.refreshScroll(); }
    renderServicesPage() { renderServicesPage(this.data.services, this.container); this.refreshScroll(); }
    renderWorkPage() { renderWorkPage(this.data.projects, this.container); this.refreshScroll(); }
    renderContactPage(p) { renderContactPage(this.data.footer, this.data.services, p, this.container); this.refreshScroll(); }

    refreshScroll() {
        if (this.scroll) {
            setTimeout(() => this.scroll.resize(), 100);
            this.initScrollReveal();
        }
    }

    initScrollReveal() {
        // ... (Same as before)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.hero-title, .agency-manifesto, .service-card, .project-row').forEach(el => {
            el.classList.add('reveal-hidden');
            observer.observe(el);
        });
    }

    initProjectHover() {
        const container = document.getElementById('project-thumb-container');
        const img = document.getElementById('project-thumb-img');
        if (!container) return;

        window.addEventListener('mousemove', (e) => {
            if (container.style.opacity !== '0') {
                container.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            }
        });

        this.container.addEventListener('mouseenter', (e) => {
             const row = e.target.closest('.project-row');
             if (row) this.handleProjectEnter(row, img, container);
        }, true);

        this.container.addEventListener('mouseleave', (e) => {
             const row = e.target.closest('.project-row');
             if (row) this.handleProjectLeave(container);
        }, true);
    }

    handleProjectEnter(row, img, container) {
        const url = row.dataset.img;
        if (!url) return;
        if (this.liquid) this.liquid.setImage(url);
        else img.src = url;
        container.style.opacity = '1';
    }

    handleProjectLeave(container) {
        container.style.opacity = '0';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App().init();
});
