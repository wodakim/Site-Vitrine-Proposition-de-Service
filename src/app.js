
import { renderHero, renderAgency, renderServices, renderProjects, renderFooter } from './components/renderer.js';

class App {
    constructor() {
        this.observer = null;
        this.mouse = { x: 0, y: 0 };
        this.scrollTimeout = null;

        // Bind methods
        this.handleScroll = this.handleScroll.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleProjectEnter = this.handleProjectEnter.bind(this);
        this.handleProjectLeave = this.handleProjectLeave.bind(this);
    }

    async init() {
        console.log("LogoLoom: Init (Vanilla v2)");
        const loader = document.getElementById('loader');

        try {
            // 1. Fetch Data
            const response = await fetch('./src/data/data.json');
            if (!response.ok) throw new Error("Erreur Chargement Données");
            const data = await response.json();

            // 2. Render DOM
            const appContainer = document.getElementById('app');
            if (!appContainer) throw new Error("Element #app manquant");

            renderHero(data.hero, appContainer);
            renderAgency(data.agency, appContainer);
            renderServices(data.services, appContainer);
            renderProjects(data.projects, appContainer);
            renderFooter(data.footer, appContainer);

            // 3. Init Interactions
            this.initScrollReveal();
            this.initProjectHover();
            this.initKineticType();

            // 4. Hide Loader
            if (loader) {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.6s ease';
                setTimeout(() => {
                    loader.remove(); // Actually remove from DOM
                    document.body.classList.add('loaded'); // Trigger any CSS entrance
                }, 600);
            }

        } catch (error) {
            console.error("LogoLoom Error:", error);
            if (loader) loader.innerHTML = `<div style="color:white; text-align:center; padding-top:20vh; font-family:sans-serif;">ERREUR SYSTEME<br>${error.message}</div>`;
        }
    }

    initScrollReveal() {
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
        document.querySelectorAll('.hero-title, .agency-manifesto, .service-card, .project-row, .footer-title').forEach(el => {
            el.classList.add('reveal-hidden');
            this.observer.observe(el);
        });
    }

    initProjectHover() {
        const rows = document.querySelectorAll('.project-row');
        const container = document.getElementById('project-thumb-container');
        const img = document.getElementById('project-thumb-img');

        if (!container || !img) return;

        window.addEventListener('mousemove', this.handleMouseMove);

        rows.forEach(row => {
            row.addEventListener('mouseenter', (e) => this.handleProjectEnter(e, row, img, container));
            row.addEventListener('mouseleave', () => this.handleProjectLeave(container));
        });
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        const container = document.getElementById('project-thumb-container');
        if (container && container.style.opacity !== '0') {
            // Simple follow with slight lag or direct
            // Direct for performance in Vanilla without lerp loop
            container.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    }

    handleProjectEnter(e, row, img, container) {
        const url = row.dataset.img;
        if (!url) return;

        img.src = url;
        container.style.opacity = '1';
        container.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }

    handleProjectLeave(container) {
        container.style.opacity = '0';
    }

    initKineticType() {
        this.lastScroll = window.scrollY;
        window.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    handleScroll() {
        const currentScroll = window.scrollY;
        const diff = currentScroll - this.lastScroll;
        const speed = Math.min(Math.abs(diff) * 0.1, 5); // Clamp skew

        const skewVal = diff > 0 ? speed : -speed;

        // Apply skew to titles that are visible
        const titles = document.querySelectorAll('.hero-title, .agency-manifesto');
        titles.forEach(title => {
            // Simple check if visible? Or just apply to all (less performant but simpler code)
            title.style.transform = `skewX(${-skewVal}deg)`;
            title.style.transition = 'transform 0.1s ease-out';
        });

        this.lastScroll = currentScroll;

        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            titles.forEach(title => {
                title.style.transform = `skewX(0deg)`;
            });
        }, 100);
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
