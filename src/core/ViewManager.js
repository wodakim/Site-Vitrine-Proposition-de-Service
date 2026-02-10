
export default class ViewManager {
    constructor(container, data, scrollManager, transitionManager) {
        this.container = container;
        this.data = data;
        this.scrollManager = scrollManager; // Lenis instance
        this.transitionManager = transitionManager;
        this.currentPage = null;
    }

    async loadPage(pageModule, params = {}) {
        // 1. Trigger Exit Transition (if implemented)
        // For now, we rely on the transition manager from App or simple fade
        // But let's assume immediate switch for MVP + Scroll Reset

        // 2. Unmount Current Page
        if (this.currentPage && typeof this.currentPage.unmount === 'function') {
            this.currentPage.unmount();
        }

        // 3. Clear Container
        this.container.innerHTML = '';

        // 4. Reset Scroll
        window.scrollTo(0, 0);
        if (this.scrollManager) {
            this.scrollManager.scrollTo(0, { immediate: true });
        }

        // 5. Mount New Page
        try {
            this.currentPage = pageModule;
            await pageModule.render(this.data, this.container, params);

            // 6. Re-init Scroll / Reveal
            // The Page module should return a promise that resolves when DOM is ready
            // But render is usually sync.

            // Trigger Reveal Animations
            // We can dispatch an event or call a method
            if (this.scrollManager && typeof this.scrollManager.resize === 'function') {
                this.scrollManager.resize();
            }

            this.initScrollReveal();

        } catch (error) {
            console.error("[ViewManager] Error mounting page:", error);
        }
    }

    initScrollReveal() {
        // Observer for reveal animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const targets = this.container.querySelectorAll('.reveal-hidden, .hero-title, .agency-manifesto, .service-card, .project-row, .reveal-line, .word-reveal');
        targets.forEach(el => observer.observe(el));
    }
}
