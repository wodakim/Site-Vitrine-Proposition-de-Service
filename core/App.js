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
            // Note: initAccordion removed as services are now Bento cards

        } catch (error) {
            console.error('Error loading data:', error);
        }

        // 4. Init WebGL
        await this.webglManager.init();

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

        // --- SECTION 1: HERO (Revisited) ---
        if (this.data.hero_section) {
            const heroData = this.data.hero_section;
            const heroSection = document.createElement('section');
            heroSection.className = 'hero-section container'; // Added container for framing

            const heroGrid = document.createElement('div');
            heroGrid.className = 'hero-grid';

            // Text Column
            const heroTextCol = document.createElement('div');
            heroTextCol.className = 'hero-text-col';

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

            heroTextCol.appendChild(h1);
            heroTextCol.appendChild(subtitle);
            heroTextCol.appendChild(cta);

            // Media Column (Contained WebGL)
            const heroMediaCol = document.createElement('div');
            heroMediaCol.className = 'hero-media-col';

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'hero-image-wrapper'; // Target for Plane

            const img = document.createElement('img');
            img.className = 'hero-image';
            img.crossOrigin = "anonymous";
            img.src = heroData.image.url;
            img.dataset.sampler = "planeTexture";

            imageWrapper.appendChild(img);
            heroMediaCol.appendChild(imageWrapper);

            heroGrid.appendChild(heroTextCol);
            heroGrid.appendChild(heroMediaCol);
            heroSection.appendChild(heroGrid);
            main.appendChild(heroSection);
        }

        // --- SECTION 2: THE AGENCY (New) ---
        if (this.data.agency) {
            const agencyData = this.data.agency;
            const agencySection = document.createElement('section');
            agencySection.className = 'agency-section container bg-dark';

            const agencyGrid = document.createElement('div');
            agencyGrid.className = 'agency-grid';

            // Left: Manifesto
            const leftCol = document.createElement('div');
            leftCol.className = 'agency-left';
            const manifestoTitle = document.createElement('h2');
            manifestoTitle.className = 'section-title';
            manifestoTitle.innerText = agencyData.title;
            const manifestoText = document.createElement('p');
            manifestoText.className = 'manifesto-text';
            manifestoText.innerText = agencyData.manifesto;

            leftCol.appendChild(manifestoTitle);
            leftCol.appendChild(manifestoText);

            // Right: Stats
            const rightCol = document.createElement('div');
            rightCol.className = 'agency-right';
            const statsGrid = document.createElement('div');
            statsGrid.className = 'stats-grid';

            agencyData.stats.forEach(stat => {
                const statItem = document.createElement('div');
                statItem.className = 'stat-item';
                const num = document.createElement('span');
                num.className = 'stat-number';
                num.innerText = stat.number;
                const label = document.createElement('span');
                label.className = 'stat-label';
                label.innerText = stat.label;

                statItem.appendChild(num);
                statItem.appendChild(label);
                statsGrid.appendChild(statItem);
            });
            rightCol.appendChild(statsGrid);

            agencyGrid.appendChild(leftCol);
            agencyGrid.appendChild(rightCol);
            agencySection.appendChild(agencyGrid);
            main.appendChild(agencySection);
        }

        // --- SECTION 3: SERVICES (Bento Grid) ---
        if (this.data.services) {
            const servicesSection = document.createElement('section');
            servicesSection.className = 'services-section container bg-anthracite';
            servicesSection.id = 'services';

            const header = document.createElement('div');
            header.className = 'section-header';
            const h2 = document.createElement('h2');
            h2.className = 'section-title';
            h2.innerText = "Expertise.";
            header.appendChild(h2);
            servicesSection.appendChild(header);

            const bentoGrid = document.createElement('div');
            bentoGrid.className = 'bento-grid';

            this.data.services.forEach(service => {
                const card = document.createElement('div');
                card.className = `bento-card theme-${service.bg || 'light'}`;

                const icon = document.createElement('div');
                icon.className = 'bento-icon';
                icon.innerText = service.icon || '•';

                const title = document.createElement('h3');
                title.className = 'bento-title';
                title.innerText = service.title;

                const desc = document.createElement('p');
                desc.className = 'bento-desc';
                desc.innerText = service.description;

                card.appendChild(icon);
                card.appendChild(title);
                card.appendChild(desc);
                bentoGrid.appendChild(card);
            });

            servicesSection.appendChild(bentoGrid);
            main.appendChild(servicesSection);
        }

        // --- SECTION 4: SELECTED WORKS (Clean List + Floating Thumb) ---
        if (this.data.featured_projects) {
            const projectsSection = document.createElement('section');
            projectsSection.className = 'projects-section container bg-dark';
            projectsSection.id = 'projects';

            const header = document.createElement('div');
            header.className = 'section-header';
            const h2 = document.createElement('h2');
            h2.className = 'section-title';
            h2.innerText = "Selected Works.";
            header.appendChild(h2);
            projectsSection.appendChild(header);

            const projectsList = document.createElement('div');
            projectsList.className = 'projects-list-clean';

            this.data.featured_projects.forEach((proj, index) => {
                const item = document.createElement('a');
                item.className = 'project-item-clean';
                item.href = proj.link || '#';

                // Store image URL in dataset for hover logic
                item.dataset.img = proj.image.url;
                item.dataset.disp = proj.image.displacementMap;

                const left = document.createElement('div');
                left.className = 'project-left';
                const idx = document.createElement('span');
                idx.className = 'project-idx';
                idx.innerText = `(0${index + 1})`;
                const title = document.createElement('h3');
                title.className = 'project-name';
                title.innerText = proj.title;
                left.appendChild(idx);
                left.appendChild(title);

                const right = document.createElement('div');
                right.className = 'project-right';
                const client = document.createElement('span');
                client.className = 'project-client';
                client.innerText = proj.client;
                const tags = document.createElement('span');
                tags.className = 'project-tags';
                tags.innerText = proj.tags.join(', ');
                right.appendChild(client);
                right.appendChild(tags);

                item.appendChild(left);
                item.appendChild(right);
                projectsList.appendChild(item);
            });

            projectsSection.appendChild(projectsList);

            // Floating Thumb Container
            const thumbContainer = document.createElement('div');
            thumbContainer.id = 'project-thumb-container'; // Fixed, hidden by default
            const thumbImg = document.createElement('img');
            thumbImg.id = 'project-thumb-img';
            thumbImg.crossOrigin = "anonymous";
            thumbImg.src = ""; // Empty initially
            thumbContainer.appendChild(thumbImg);

            // Append to main (outside section to be global? or inside section relative?)
            // Global is better for following mouse freely, but if we use fixed position it works anywhere.
            // Let's put it in main.
            main.appendChild(thumbContainer);
            main.appendChild(projectsSection);
        }

        // --- Footer ---
        if (this.data.footer) {
            const footerData = this.data.footer;
            const footer = document.createElement('footer');
            footer.className = 'site-footer container bg-anthracite';
            footer.id = 'contact';

            // Content
            const footerContent = document.createElement('div');
            footerContent.className = 'footer-content';

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

            // Bottom
            const footerBottom = document.createElement('div');
            footerBottom.className = 'footer-bottom';
            const credits = document.createElement('div');
            credits.className = 'footer-credits';
            credits.innerText = `© ${new Date().getFullYear()} LogoLoom.`;
            const socials = document.createElement('div');
            socials.className = 'footer-socials';
            if (footerData.socials) {
                footerData.socials.forEach(social => {
                    const link = document.createElement('a');
                    link.className = 'footer-link';
                    link.href = social.url;
                    link.innerText = social.name;
                    socials.appendChild(link);
                });
            }
            footerBottom.appendChild(credits);
            footerBottom.appendChild(socials);

            footer.appendChild(footerContent);
            footer.appendChild(footerBottom);
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
