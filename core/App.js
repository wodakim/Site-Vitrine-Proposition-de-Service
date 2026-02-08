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
        // 0. Ensure main content is hidden
        const main = document.querySelector('main');
        if (main) main.style.opacity = '0';

        // 1. Fetch Data
        try {
            const response = await fetch('./data/data.json');
            this.data = await response.json();

            // 2. Build DOM
            this.buildDOM();

            // 3. Init Components Logic
            this.initMagneticButtons();

        } catch (error) {
            console.error('Error loading data:', error);
        }

        // 4. Init WebGL (DISABLED FOR SAFETY ROLLBACK)
        // await this.webglManager.init();

        // 5. Init Lenis
        this.initLenis();

        // 6. Init Router
        this.router.init();

        // 7. Start Loop
        this._raf = this._raf.bind(this);
        requestAnimationFrame(this._raf);

        // 8. Event Listeners
        window.addEventListener('resize', this.onResize.bind(this));

        // 9. Reveal
        await this.loader.hide();

        if (main) {
            if (window.gsap) {
                window.gsap.to(main, {
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    onComplete: () => {
                        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
                    }
                });
            } else {
                main.style.transition = 'opacity 0.8s ease';
                main.style.opacity = '1';
                if (window.ScrollTrigger) window.ScrollTrigger.refresh();
            }
        }
    }

    buildDOM() {
        const main = document.querySelector('main');
        if (!main || !this.data) return;
        main.innerHTML = ''; // Clear existing content

        // --- SECTION A: HERO (Grid 12 Cols) ---
        if (this.data.hero_section) {
            const heroData = this.data.hero_section;
            const heroSection = document.createElement('section');
            heroSection.className = 'hero-section grid-container'; // Using grid-container class

            // Col 1-7: Title
            const heroTitleContainer = document.createElement('div');
            heroTitleContainer.className = 'hero-title-container';
            const h1 = document.createElement('h1');
            h1.className = 'hero-title';
            h1.innerHTML = heroData.title.replace(/\n/g, '<br>');
            heroTitleContainer.appendChild(h1);

            // Col 8-12: WebGL Image
            const heroMediaContainer = document.createElement('div');
            heroMediaContainer.className = 'hero-media-container';
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'hero-image-wrapper';
            const img = document.createElement('img');
            img.className = 'hero-image';
            img.crossOrigin = "anonymous";
            img.src = heroData.image.url;
            img.dataset.sampler = "planeTexture";
            imageWrapper.appendChild(img);
            heroMediaContainer.appendChild(imageWrapper);

            heroSection.appendChild(heroTitleContainer);
            heroSection.appendChild(heroMediaContainer);
            main.appendChild(heroSection);
        }

        // --- SECTION B: TICKER ---
        const tickerSection = document.createElement('section');
        tickerSection.className = 'ticker-section';
        const tickerWrap = document.createElement('div');
        tickerWrap.className = 'ticker-wrap';

        const tickerText = "STRATEGY — BRANDING — DEVELOPMENT — ART DIRECTION — ";
        // Repeat text to fill screen
        for(let i=0; i<8; i++) {
             const item = document.createElement('div');
             item.className = 'ticker-item';
             item.innerText = tickerText;
             tickerWrap.appendChild(item);
        }
        tickerSection.appendChild(tickerWrap);
        main.appendChild(tickerSection);

        // --- SECTION C: AGENCY (Swiss Grid) ---
        if (this.data.agency) {
            const agencyData = this.data.agency;
            const agencySection = document.createElement('section');
            agencySection.className = 'agency-section grid-container';

            // Col 1-5: Manifesto
            const manifestoCol = document.createElement('div');
            manifestoCol.className = 'agency-manifesto-col';
            const manifesto = document.createElement('p');
            manifesto.className = 'agency-manifesto';
            manifesto.innerText = agencyData.manifesto; // "We define brands..."
            manifestoCol.appendChild(manifesto);

            // Col 7-12: Image/Video
            const mediaCol = document.createElement('div');
            mediaCol.className = 'agency-media-col';
            const mediaImg = document.createElement('img');
            mediaImg.className = 'agency-image';
            mediaImg.src = "./assets/img/hero-texture.webp"; // Placeholder or from data if available
            mediaCol.appendChild(mediaImg);

            agencySection.appendChild(manifestoCol);
            agencySection.appendChild(mediaCol);
            main.appendChild(agencySection);
        }

        // --- SECTION D: SERVICES (Bento UI) ---
        if (this.data.services) {
            const servicesSection = document.createElement('section');
            servicesSection.className = 'services-section grid-container';
            servicesSection.id = 'services';

            // Header if needed, or directly grid
            const servicesGrid = document.createElement('div');
            servicesGrid.className = 'services-grid'; // spans 12 cols, internal grid

            this.data.services.forEach((service, index) => {
                const card = document.createElement('div');
                card.className = 'bento-card';

                const num = document.createElement('span');
                num.className = 'bento-number';
                num.innerText = `0${index + 1}`;

                const title = document.createElement('h3');
                title.className = 'bento-title';
                title.innerText = service.title;

                const list = document.createElement('ul');
                list.className = 'bento-list';
                // service.description might be plain text, let's assume deliverables or split desc
                // For now, split description by comma or use mocked items if not array
                const items = service.deliverables || ["Strategy", "Design", "Implementation"];
                items.forEach(itemText => {
                    const li = document.createElement('li');
                    li.innerText = itemText;
                    list.appendChild(li);
                });

                card.appendChild(num);
                card.appendChild(title);
                card.appendChild(list);
                servicesGrid.appendChild(card);
            });

            servicesSection.appendChild(servicesGrid);
            main.appendChild(servicesSection);
        }

        // --- SECTION E: SELECTED WORKS (Table Style) ---
        if (this.data.featured_projects) {
            const projectsSection = document.createElement('section');
            projectsSection.className = 'projects-section grid-container';
            projectsSection.id = 'projects';

            const table = document.createElement('div');
            table.className = 'projects-table';

            this.data.featured_projects.forEach((proj, index) => {
                const row = document.createElement('a');
                row.className = 'project-row project-item-clean'; // project-item-clean hook for WebGL
                row.href = proj.link || '#';
                row.dataset.img = proj.image.url;

                // Col 1: Index
                const idx = document.createElement('div');
                idx.className = 'p-idx';
                idx.innerText = `0${index + 1}`;

                // Col 2: Client
                const client = document.createElement('div');
                client.className = 'p-client';
                client.innerText = proj.client || proj.title;

                // Col 3: Services
                const services = document.createElement('div');
                services.className = 'p-services';
                services.innerText = proj.tags.join(', ');

                // Col 4: Year
                const year = document.createElement('div');
                year.className = 'p-year';
                year.innerText = "2024"; // Static or data

                // Col 5: Arrow
                const arrow = document.createElement('div');
                arrow.className = 'p-arrow';
                arrow.innerText = "↗";

                row.appendChild(idx);
                row.appendChild(client);
                row.appendChild(services);
                row.appendChild(year);
                row.appendChild(arrow);

                table.appendChild(row);
            });

            projectsSection.appendChild(table);
            main.appendChild(projectsSection);
        }

        // --- Project Thumb Container (Floating) ---
        const thumbContainer = document.createElement('div');
        thumbContainer.id = 'project-thumb-container';
        const thumbImg = document.createElement('img');
        thumbImg.id = 'project-thumb-img';
        thumbImg.crossOrigin = "anonymous";
        thumbImg.src = "";
        thumbContainer.appendChild(thumbImg);
        main.appendChild(thumbContainer);


        // --- Footer ---
        if (this.data.footer) {
             const footerData = this.data.footer;
            const footer = document.createElement('footer');
            footer.className = 'site-footer grid-container bg-dark'; // Use grid container? Or flex? footer.css might need update
            // Let's stick to simple footer logic or update it to grid.
            // For now, re-use existing footer logic but ensure container class
            footer.id = 'contact';

            // Content
            const footerContent = document.createElement('div');
            footerContent.className = 'footer-content col-span-12';

            const title = document.createElement('h2');
            title.className = 'footer-title';
            title.innerHTML = footerData.title.replace(/\n/g, '<br>');

            const ctaWrapper = document.createElement('div');
            ctaWrapper.className = 'footer-cta-wrapper';

            const btn = document.createElement('a');
            btn.className = 'magnetic-btn';
            btn.href = `mailto:${footerData.email}`;
            const btnText = document.createElement('span');
            btnText.innerText = footerData.cta || "Email Me";
            btn.appendChild(btnText);
            ctaWrapper.appendChild(btn);

            footerContent.appendChild(title);
            footerContent.appendChild(ctaWrapper);

            footer.appendChild(footerContent);
            main.appendChild(footer);
        }
    }

    initMagneticButtons() {
        const buttons = document.querySelectorAll('.magnetic-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                if (window.gsap) {
                    window.gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
                    const span = btn.querySelector('span');
                    if (span) window.gsap.to(span, { x: x * 0.1, y: y * 0.1, duration: 0.3, ease: "power2.out" });
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (window.gsap) {
                    window.gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
                    const span = btn.querySelector('span');
                    if (span) window.gsap.to(span, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
                }
            });
        });
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
            if (this.webglManager) this.webglManager.updateScroll(scroll);
        });
    }

    _raf(time) {
        if (this.lenis) this.lenis.raf(time);
        if (this.webglManager) this.webglManager.render();
        if (window.ScrollTrigger) window.ScrollTrigger.update();
        requestAnimationFrame(this._raf);
    }

    onResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (this.webglManager) this.webglManager.resize();
            if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }, 100);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App();
});
