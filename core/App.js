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

            // 3. Init Components Logic
            this.initAccordion();
            this.initMagneticButtons();

        } catch (error) {
            console.error('Error loading data:', error);
        }

        // 4. Init WebGL
        // We pass the data to WebGLManager if needed, but it will read from DOM
        this.webglManager.init();

        // 5. Init Lenis (Smooth Scroll)
        this.initLenis();

        // 6. Init Router (Barba)
        this.router.init();

        // 7. Start Loop
        this._raf = this._raf.bind(this);
        requestAnimationFrame(this._raf);

        // 8. Event Listeners
        window.addEventListener('resize', this.onResize.bind(this));

        // Hide Loader
        this.loader.hide();
    }

    buildDOM() {
        const main = document.querySelector('main');
        if (!main || !this.data) return;

        // --- Hero Section ---
        if (this.data.hero_section) {
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
        }

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

        // --- Services Section ---
        if (this.data.services && this.data.services.length > 0) {
            const servicesSection = document.createElement('section');
            servicesSection.className = 'services-section container';
            servicesSection.id = 'services';

            const servicesList = document.createElement('div');
            servicesList.className = 'services-list';

            this.data.services.forEach((service, index) => {
                const item = document.createElement('div');
                item.className = 'service-item';
                item.id = service.id;

                // Header
                const header = document.createElement('div');
                header.className = 'service-header';

                const titleGroup = document.createElement('div');
                const idx = document.createElement('span');
                idx.className = 'service-index';
                idx.innerText = `0${index + 1}.`;

                const title = document.createElement('span');
                title.className = 'service-title';
                title.innerText = service.title;

                titleGroup.appendChild(idx);
                titleGroup.appendChild(title);

                const indicator = document.createElement('span');
                indicator.className = 'service-indicator';
                indicator.innerText = '+';

                header.appendChild(titleGroup);
                header.appendChild(indicator);

                // Content
                const content = document.createElement('div');
                content.className = 'service-content';

                const inner = document.createElement('div');
                inner.className = 'service-inner';

                const desc = document.createElement('p');
                desc.className = 'service-description';
                desc.innerText = service.description;

                const deliverables = document.createElement('div');
                deliverables.className = 'service-deliverables';

                service.deliverables.forEach(deliv => {
                    const tag = document.createElement('span');
                    tag.className = 'deliverable-tag';
                    tag.innerText = deliv;
                    deliverables.appendChild(tag);
                });

                inner.appendChild(desc);
                inner.appendChild(deliverables);
                content.appendChild(inner);

                item.appendChild(header);
                item.appendChild(content);

                servicesList.appendChild(item);
            });

            servicesSection.appendChild(servicesList);
            main.appendChild(servicesSection);
        }

        // --- Footer ---
        if (this.data.footer) {
            const footerData = this.data.footer;
            const footer = document.createElement('footer');
            footer.className = 'site-footer container';
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
            credits.innerText = `© ${new Date().getFullYear()} LogoLoom. All rights reserved.`;

            const socials = document.createElement('div');
            socials.className = 'footer-socials';

            if (footerData.socials) {
                footerData.socials.forEach(social => {
                    const link = document.createElement('a');
                    link.className = 'footer-link';
                    link.href = social.url;
                    link.innerText = social.name;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    socials.appendChild(link);
                });
            }

            footerBottom.appendChild(credits);
            footerBottom.appendChild(socials);

            footer.appendChild(footerContent);
            footer.appendChild(footerBottom);

            main.appendChild(footer); // Append footer to main or body? Main is safer for Barba transitions if we animate the whole page.
        }
    }

    initAccordion() {
        const headers = document.querySelectorAll('.service-header');

        headers.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const content = item.querySelector('.service-content');
                const isActive = item.classList.contains('active');

                // Close all other items
                document.querySelectorAll('.service-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherContent = otherItem.querySelector('.service-content');
                        // Use GSAP if available, or style height
                        if (window.gsap) {
                             window.gsap.to(otherContent, { height: 0, duration: 0.5, ease: "power2.out" });
                        } else {
                            otherContent.style.height = '0px';
                        }
                    }
                });

                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                     if (window.gsap) {
                        window.gsap.to(content, { height: 0, duration: 0.5, ease: "power2.out" });
                    } else {
                        content.style.height = '0px';
                    }
                } else {
                    item.classList.add('active');
                     if (window.gsap) {
                        window.gsap.to(content, { height: 'auto', duration: 0.5, ease: "power2.out" });
                    } else {
                        // For vanilla CSS transition, we need specific height
                        content.style.height = content.scrollHeight + 'px';
                    }
                }
            });
        });
    }

    initMagneticButtons() {
        const buttons = document.querySelectorAll('.magnetic-btn');

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Magnetic strength
                const strength = 0.3;

                if (window.gsap) {
                    window.gsap.to(btn, {
                        x: x * strength,
                        y: y * strength,
                        duration: 0.3,
                        ease: "power2.out"
                    });

                    // Optional: Move text/inner element slightly more/less for parallax
                    const span = btn.querySelector('span');
                    if (span) {
                        window.gsap.to(span, {
                            x: x * 0.1,
                            y: y * 0.1,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    }
                }
            });

            btn.addEventListener('mouseleave', () => {
                if (window.gsap) {
                    window.gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
                    const span = btn.querySelector('span');
                    if (span) {
                        window.gsap.to(span, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
                    }
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
