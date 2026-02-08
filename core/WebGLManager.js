export default class WebGLManager {
    constructor() {
        this.curtains = null;
        this.scrollOffset = 0;
        this.mouse = { x: 0, y: 0 };
        this.lerpMouse = { x: 0, y: 0 };
        this.thumbPlane = null;
    }

    async init() {
        if (!window.Curtains) {
            console.error('Curtains.js not found');
            return;
        }

        this.curtains = new window.Curtains({
            container: "canvas",
            watchScroll: false, // Sync manually via Lenis
            pixelRatio: Math.min(1.5, window.devicePixelRatio)
        });

        this.curtains.onError(() => {
            document.body.classList.add("no-curtains");
        });

        // Global Mouse Events
        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.handleThumbMove();
        });

        // Initialize Planes
        await Promise.all([
            this.initHeroPlane(),
            this.initThumbPlane()
        ]);
    }

    render() {
        if (this.curtains) {
            // Lerp mouse
            this.lerpMouse.x += (this.mouse.x - this.lerpMouse.x) * 0.1;
            this.lerpMouse.y += (this.mouse.y - this.lerpMouse.y) * 0.1;

            this.curtains.render();
        }
    }

    async initHeroPlane() {
        const heroWrapper = document.querySelector('.hero-image-wrapper');
        const heroImage = document.querySelector('.hero-image');

        if (!heroWrapper || !heroImage) return;

        heroImage.crossOrigin = "anonymous";
        // Force load
        const imgUrl = heroImage.src;
        heroImage.src = "";
        heroImage.src = imgUrl;

        await new Promise((resolve) => {
            if (heroImage.complete) resolve();
            else {
                heroImage.onload = () => resolve();
                heroImage.onerror = () => resolve();
            }
        });

        try {
            const [vs, fs] = await Promise.all([
                fetch('./shaders/plane.vert').then(r => r.text()),
                fetch('./shaders/plane.frag').then(r => r.text())
            ]);

            const params = {
                vertexShader: vs,
                fragmentShader: fs,
                uniforms: {
                    uTime: { name: "uTime", type: "1f", value: 0 },
                    uMousePosition: { name: "uMousePosition", type: "2f", value: [0, 0] },
                    uMouseStrength: { name: "uMouseStrength", type: "1f", value: 0.04 },
                    uAlpha: { name: "uAlpha", type: "1f", value: 1.0 }
                },
            };

            const plane = this.curtains.addPlane(heroWrapper, params);
            if (plane) {
                plane.onRender(() => {
                    plane.uniforms.uTime.value++;
                    const mousePos = plane.mouseToPlaneCoords(this.lerpMouse.x, this.lerpMouse.y);
                    plane.uniforms.uMousePosition.value = [mousePos.x, mousePos.y];
                });
            }
        } catch (error) {
            console.error('Error loading shaders for hero:', error);
        }
    }

    async initThumbPlane() {
        // Single plane for the floating thumbnail
        const thumbContainer = document.getElementById('project-thumb-container');
        const thumbImg = document.getElementById('project-thumb-img');

        if (!thumbContainer || !thumbImg) return;

        try {
            const [vs, fs] = await Promise.all([
                fetch('./shaders/plane.vert').then(r => r.text()),
                fetch('./shaders/plane.frag').then(r => r.text())
            ]);

            const params = {
                vertexShader: vs,
                fragmentShader: fs,
                uniforms: {
                    uTime: { name: "uTime", type: "1f", value: 0 },
                    uMousePosition: { name: "uMousePosition", type: "2f", value: [0, 0] },
                    uMouseStrength: { name: "uMouseStrength", type: "1f", value: 0.02 }, // Subtle
                    uAlpha: { name: "uAlpha", type: "1f", value: 0.0 } // Start hidden
                },
            };

            this.thumbPlane = this.curtains.addPlane(thumbContainer, params);

            if (this.thumbPlane) {
                this.thumbPlane.onRender(() => {
                    this.thumbPlane.uniforms.uTime.value++;
                    // Mouse relative to the small plane might be tricky if plane moves.
                    // But Curtains handles plane position.
                    const mousePos = this.thumbPlane.mouseToPlaneCoords(this.lerpMouse.x, this.lerpMouse.y);
                    this.thumbPlane.uniforms.uMousePosition.value = [mousePos.x, mousePos.y];

                    // Force update position because the container is moved via Fixed + Transform
                    this.thumbPlane.updatePosition();
                });

                // Init Project Hover Logic Here
                this.initProjectHovers();
            }

        } catch (error) {
            console.error('Error loading shaders for thumb:', error);
        }
    }

    initProjectHovers() {
        const items = document.querySelectorAll('.project-item-clean');
        const thumbContainer = document.getElementById('project-thumb-container');
        const thumbImg = document.getElementById('project-thumb-img');

        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const imgUrl = item.dataset.img;

                // Load new texture
                if (this.thumbPlane && imgUrl) {
                    // Simple texture swap logic for Curtains
                    // In a robust app, we'd preload textures.
                    // Here we assume the image element updates and we load from it.

                    thumbImg.src = imgUrl;

                    // We need to tell the plane to load the new source
                    // Wait for load?
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = imgUrl;
                    img.onload = () => {
                        this.thumbPlane.loadImages(img); // Load this specific image as texture
                    };

                    // Reveal
                    if (window.gsap) {
                        window.gsap.to(this.thumbPlane.uniforms.uAlpha, { value: 1, duration: 0.3 });
                        window.gsap.to(thumbContainer, { opacity: 1, duration: 0.3 });
                    } else {
                        thumbContainer.style.opacity = 1;
                    }
                }
            });

            item.addEventListener('mouseleave', () => {
                // Hide
                if (window.gsap && this.thumbPlane) {
                     window.gsap.to(this.thumbPlane.uniforms.uAlpha, { value: 0, duration: 0.3 });
                     window.gsap.to(thumbContainer, { opacity: 0, duration: 0.3 });
                } else {
                    thumbContainer.style.opacity = 0;
                }
            });
        });
    }

    handleThumbMove() {
        const thumbContainer = document.getElementById('project-thumb-container');
        if (thumbContainer && window.gsap) {
            // Move the container to mouse pos
            window.gsap.to(thumbContainer, {
                x: this.mouse.x,
                y: this.mouse.y,
                duration: 0.5, // Inertia
                ease: "power2.out"
            });
        }
    }

    updateScroll(offset) {
        if (this.curtains) {
            this.scrollOffset = offset;
            this.curtains.updateScrollValues(0, offset);
        }
    }

    resize() {
        if (this.curtains) {
            this.curtains.resize();
        }
    }
}
