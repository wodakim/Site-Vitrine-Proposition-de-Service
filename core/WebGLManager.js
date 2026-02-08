export default class WebGLManager {
    constructor() {
        this.curtains = null;
        this.scrollOffset = 0;
        this.mouse = { x: 0, y: 0 };
    }

    async init() {
        if (!window.Curtains) {
            console.error('Curtains.js not found');
            return;
        }

        this.curtains = new window.Curtains({
            container: "canvas",
            watchScroll: false, // Sync manually via Lenis
            pixelRatio: Math.min(1.5, window.devicePixelRatio) // Performance optimization
        });

        this.curtains.onError(() => {
            document.body.classList.add("no-curtains");
        });

        // Global Mouse Events
        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Initialize Planes
        await Promise.all([
            this.initHeroPlane(),
            this.initProjects()
        ]);
    }

    async initHeroPlane() {
        const heroWrapper = document.querySelector('.hero-image-wrapper');
        const heroImage = document.querySelector('.hero-image');

        if (!heroWrapper || !heroImage) {
             return;
        }

        heroImage.crossOrigin = "anonymous";

        // Manually force load logic
        const imgUrl = heroImage.src;
        heroImage.src = "";
        heroImage.src = imgUrl;

        await new Promise((resolve) => {
            if (heroImage.complete) {
                resolve();
            } else {
                heroImage.onload = () => resolve();
                heroImage.onerror = () => {
                     console.error('Failed to load hero image src:', heroImage.src);
                     resolve();
                };
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
                    uTime: {
                        name: "uTime",
                        type: "1f",
                        value: 0,
                    },
                    uMousePosition: {
                        name: "uMousePosition",
                        type: "2f",
                        value: [0, 0],
                    },
                    uMouseStrength: {
                        name: "uMouseStrength",
                        type: "1f",
                        value: 0.04,
                    },
                    uAlpha: {
                        name: "uAlpha",
                        type: "1f",
                        value: 1.0, // Hero starts visible
                    }
                },
            };

            const plane = this.curtains.addPlane(heroWrapper, params);

            if (plane) {
                plane.onRender(() => {
                    plane.uniforms.uTime.value++;
                    const mousePos = plane.mouseToPlaneCoords(this.mouse.x, this.mouse.y);
                    plane.uniforms.uMousePosition.value = [mousePos.x, mousePos.y];
                });
            }

        } catch (error) {
            console.error('Error loading shaders for hero:', error);
        }
    }

    async initProjects() {
        // Wait for DOM to be built - usually called after buildDOM
        // Use a slight delay or rely on execution order (init is called after buildDOM in App.js)

        const projectImages = document.querySelectorAll('.project-gl-image');
        if (projectImages.length === 0) return;

        try {
            const [vs, fs] = await Promise.all([
                fetch('./shaders/plane.vert').then(r => r.text()),
                fetch('./shaders/plane.frag').then(r => r.text())
            ]);

            projectImages.forEach((img, index) => {
                // Ensure image is loaded before adding plane? Curtains handles it but safer to wait or just add.
                // We'll trust Curtains to handle the texture loading from the img tag.

                const params = {
                    vertexShader: vs,
                    fragmentShader: fs,
                    widthSegments: 20,
                    heightSegments: 20,
                    uniforms: {
                        uTime: {
                            name: "uTime",
                            type: "1f",
                            value: 0,
                        },
                        uMousePosition: {
                            name: "uMousePosition",
                            type: "2f",
                            value: [0, 0],
                        },
                        uMouseStrength: {
                            name: "uMouseStrength",
                            type: "1f",
                            value: 0.0, // Start with no distortion
                        },
                        uAlpha: {
                            name: "uAlpha",
                            type: "1f",
                            value: 0.0, // Start invisible
                        }
                    },
                };

                // The plane is attached to the img element (which covers the project item)
                const plane = this.curtains.addPlane(img, params);

                if (plane) {
                    const parentItem = img.closest('.project-item');

                    // Interaction
                    if (parentItem) {
                        parentItem.addEventListener('mouseenter', () => {
                            if (window.gsap) {
                                window.gsap.to(plane.uniforms.uAlpha, { value: 1, duration: 0.5 });
                                window.gsap.to(plane.uniforms.uMouseStrength, { value: 0.1, duration: 0.5, ease: "power2.out" });
                            }
                        });

                        parentItem.addEventListener('mouseleave', () => {
                            if (window.gsap) {
                                window.gsap.to(plane.uniforms.uAlpha, { value: 0, duration: 0.5 });
                                window.gsap.to(plane.uniforms.uMouseStrength, { value: 0.0, duration: 0.5 });
                            }
                        });
                    }

                    plane.onRender(() => {
                        plane.uniforms.uTime.value++;
                        const mousePos = plane.mouseToPlaneCoords(this.mouse.x, this.mouse.y);
                        plane.uniforms.uMousePosition.value = [mousePos.x, mousePos.y];
                    });
                }
            });

        } catch (error) {
            console.error('Error loading shaders for projects:', error);
        }
    }

    render() {
        if (this.curtains) {
            this.curtains.render();
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
