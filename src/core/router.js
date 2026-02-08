
import { renderHero, renderAgency, renderServices, renderProjects, renderFooter } from '../components/renderer.js';

export class Router {
    constructor(data) {
        this.data = data;
        this.currentPath = window.location.pathname;
        this.isAnimating = false;

        // Bind methods
        this.handleLink = this.handleLink.bind(this);
        this.handlePopState = this.handlePopState.bind(this);

        this.init();
    }

    init() {
        // Intercept clicks
        document.addEventListener('click', this.handleLink);

        // Handle Back/Forward
        window.addEventListener('popstate', this.handlePopState);

        // Initial Load
        this.render(this.currentPath);
    }

    handleLink(e) {
        const link = e.target.closest('a');
        if (link && link.href.startsWith(window.location.origin) && !link.hash) {
            e.preventDefault();
            this.navigate(link.getAttribute('href'));
        }
    }

    handlePopState() {
        this.render(window.location.pathname);
    }

    async navigate(path) {
        if (this.isAnimating || path === this.currentPath) return;
        this.isAnimating = true;

        window.history.pushState({}, '', path);
        this.currentPath = path;

        await this.transition(path);
        this.isAnimating = false;
    }

    async transition(path) {
        const app = document.getElementById('app');

        // Leave
        await gsap.to(app, { opacity: 0, duration: 0.5, ease: 'power2.in' });

        // Render
        this.render(path);
        window.scrollTo(0, 0);

        // Enter
        await gsap.to(app, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    }

    render(path) {
        const container = document.getElementById('app');
        container.innerHTML = '';

        // Routing Logic
        // Normalize path (remove trailing slash, etc)
        const p = path.replace(/\/$/, '') || '/';

        if (p === '/' || p === '/index.html') {
            // Home: Hero -> Agency -> Services (Preview) -> Projects (Preview) -> Footer
            renderHero(this.data.hero, container);
            renderAgency(this.data.agency, container);
            renderServices(this.data.services, container);
            renderProjects(this.data.projects, container);
            renderFooter(this.data.footer, container);
        }
        else if (p.includes('work')) {
            renderProjects(this.data.projects, container); // Maybe a full version?
            renderFooter(this.data.footer, container);
        }
        else if (p.includes('contact')) {
            renderFooter(this.data.footer, container);
        }
        else {
            // 404 -> Home
            renderHero(this.data.hero, container);
        }

        // Re-trigger WebGL updates if needed (e.g. create planes for new images)
        window.dispatchEvent(new CustomEvent('page:rendered'));
    }
}
