
import { liquidVS, liquidFS } from '../shaders/liquid.js';

export class WebGLManager {
    constructor() {
        this.curtains = null;
        this.planes = [];
        this.mouse = { x: 0, y: 0 };
        this.lerpMouse = { x: 0, y: 0 };

        // Bind
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
    }

    init() {
        if (!window.Curtains) {
            console.warn("Curtains.js not found");
            return;
        }

        try {
            this.curtains = new window.Curtains({
                container: "canvas",
                pixelRatio: Math.min(1.5, window.devicePixelRatio), // Optimization
                watchScroll: false // Manual scroll via Lenis
            });

            this.curtains.onError(() => {
                document.body.classList.add("no-webgl");
            });

            window.addEventListener("mousemove", (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
                this.handleThumbMove();
            });

            // Listen for route changes
            window.addEventListener('page:rendered', () => {
                this.rebindHoverEvents();
            });

            // Init Global Planes
            this.initThumbPlane();

            // Rebind immediately for initial load
            this.rebindHoverEvents();

        } catch (e) {
            console.error(e);
        }
    }

    render() {
        if (this.curtains) {
            this.lerpMouse.x += (this.mouse.x - this.lerpMouse.x) * 0.1;
            this.lerpMouse.y += (this.mouse.y - this.lerpMouse.y) * 0.1;
            this.curtains.render();
        }
    }

    resize() {
        if (this.curtains) this.curtains.resize();
    }

    updateScroll(y) {
        if(this.curtains) this.curtains.updateScrollValues(0, y);
    }

    // --- Thumb Plane (Liquid Reveal) ---

    initThumbPlane() {
        const container = document.getElementById('project-thumb-container');
        if (!container) return;

        const params = {
            vertexShader: liquidVS,
            fragmentShader: liquidFS,
            widthSegments: 10,
            heightSegments: 10,
            uniforms: {
                uTime: { name: "uTime", type: "1f", value: 0 },
                uAlpha: { name: "uAlpha", type: "1f", value: 0 },
                uSpeed: { name: "uSpeed", type: "1f", value: 0 }
            }
        };

        this.thumbPlane = this.curtains.addPlane(container, params);

        if (this.thumbPlane) {
            this.thumbTexture = this.thumbPlane.textures[0];

            this.thumbPlane.onRender(() => {
                this.thumbPlane.updatePosition();
                this.thumbPlane.uniforms.uTime.value++;
                // Decay speed
                this.thumbPlane.uniforms.uSpeed.value *= 0.9;
            });
        }
    }

    rebindHoverEvents() {
        // Re-attach listeners to new DOM elements
        const rows = document.querySelectorAll('.project-row');
        const container = document.getElementById('project-thumb-container');

        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                const url = row.dataset.img;
                if (!url) return;

                // Load Texture
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = url;
                img.onload = () => {
                    if (this.thumbTexture) {
                        this.thumbTexture.setSource(img);
                        this.thumbPlane.uniforms.uAlpha.value = 1;
                        this.thumbPlane.uniforms.uSpeed.value = 1.0; // Trigger distortion
                    }
                    if (window.gsap) gsap.to(container, { opacity: 1, duration: 0.3 });
                };
            });

            row.addEventListener('mouseleave', () => {
                if (this.thumbPlane) this.thumbPlane.uniforms.uAlpha.value = 0;
                if (window.gsap) gsap.to(container, { opacity: 0, duration: 0.3 });
            });
        });
    }

    handleThumbMove() {
        const container = document.getElementById('project-thumb-container');
        if (container && window.gsap) {
            gsap.to(container, {
                x: this.mouse.x,
                y: this.mouse.y,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }
}
