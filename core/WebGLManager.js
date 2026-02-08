export default class WebGLManager {
    constructor() {
        this.curtains = null;
        this.scrollOffset = 0;
        this.mouse = { x: 0, y: 0 };
    }

    init() {
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

        // Initialize specific planes
        this.initHeroPlane();

        // Global Mouse Events
        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        console.log('WebGL Manager Initialized');
    }

    async initHeroPlane() {
        const heroImage = document.querySelector('.hero-image');
        if (!heroImage) return;

        try {
            // Load shader code
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
                },
            };

            const plane = this.curtains.addPlane(heroImage, params);

            if (plane) {
                plane.onRender(() => {
                    // Update uniforms
                    plane.uniforms.uTime.value++;

                    // Map mouse position to plane coordinates
                    const mousePos = plane.mouseToPlaneCoords(this.mouse.x, this.mouse.y);
                    plane.uniforms.uMousePosition.value = [mousePos.x, mousePos.y];
                });
            }

        } catch (error) {
            console.error('Error loading shaders:', error);
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
