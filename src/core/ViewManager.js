
export default class ViewManager {
    constructor(container, data, scrollManager, transitionManager, seoManager) {
        this.container = container;
        this.data = data;
        this.scrollManager = scrollManager;
        this.transitionManager = transitionManager;
        this.seoManager = seoManager;
        this.currentPage = null;
    }

    async loadPage(pageModule, params = {}, type = 'home') {
        // SEO Update
        if (this.seoManager) {
            this.seoManager.update(type, params);
        }

        // 1. Unmount Current Page
        if (this.currentPage && typeof this.currentPage.unmount === 'function') {
            this.currentPage.unmount();
        }

        // 2. Clear Container
        this.container.innerHTML = '';

        // 3. Reset Scroll
        if (this.scrollManager) {
            this.scrollManager.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }

        // 4. Mount New Page
        try {
            this.currentPage = pageModule;
            await pageModule.render(this.data, this.container, params);

            // 5. Re-init Scroll / Reveal
            if (this.scrollManager && typeof this.scrollManager.resize === 'function') {
                this.scrollManager.resize();
            }

            this.initScrollReveal();

        } catch (error) {
            console.error("[ViewManager] Error mounting page:", error);
        }
    }

    initScrollReveal() {
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
