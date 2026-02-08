// src/js/webgl.js

export class WebGLManager {
    constructor() {
        this.curtains = null;
        this.planes = [];
        this.mouse = { x: 0, y: 0 };
        this.lerpMouse = { x: 0, y: 0 };
    }

    init() {
        if (!window.Curtains) {
            console.warn("Curtains.js missing.");
            return;
        }

        // Init Curtains
        try {
            this.curtains = new window.Curtains({
                container: "canvas",
                watchScroll: false, // Sync manually via Lenis
                pixelRatio: Math.min(1.5, window.devicePixelRatio)
            });

            this.curtains.onError(() => {
                console.error("Curtains init error");
                document.body.classList.add("no-webgl");
            });

            // Mouse Listeners
            window.addEventListener("mousemove", (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
                this.handleThumbMove();
            });

            // Create Planes
            this.initHeroPlane();
            this.initThumbPlane();

        } catch (e) {
            console.error("WebGL Crash:", e);
        }
    }

    render() {
        if (this.curtains) {
            // Lerp Mouse
            this.lerpMouse.x += (this.mouse.x - this.lerpMouse.x) * 0.1;
            this.lerpMouse.y += (this.mouse.y - this.lerpMouse.y) * 0.1;

            this.curtains.render();
        }
    }

    updateScroll(scroll) {
        if (this.curtains) {
            this.curtains.updateScrollValues(0, scroll);
        }
    }

    resize() {
        if (this.curtains) this.curtains.resize();
    }

    // --- Planes ---

    initHeroPlane() {
        const imgEl = document.querySelector('[data-webgl="hero"]');
        if (!imgEl) return;

        // Wait for load
        const onLoad = () => {
            if (imgEl.naturalWidth > 0) {
                this._createHeroPlane(imgEl);
            } else {
                console.warn("Hero image loaded but naturalWidth is 0");
            }
        };

        if (imgEl.complete && imgEl.naturalWidth > 0) {
            this._createHeroPlane(imgEl);
        } else {
            imgEl.onload = onLoad;
        }
    }

    _createHeroPlane(imgEl) {
        // Shader
        const vs = `
            #ifdef GL_ES
            precision mediump float;
            #endif
            attribute vec3 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat4 uMVMatrix;
            uniform mat4 uPMatrix;
            uniform mat4 planeTextureMatrix;
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;
            uniform float uTime;
            uniform vec2 uMouse;

            void main() {
                vec3 vertexPosition = aVertexPosition;

                // Simple liquid distortion
                float dist = distance(uMouse, vec2(vertexPosition.x, vertexPosition.y));
                float wave = sin(dist * 10.0 - uTime * 0.05) * 0.02; // Gentle
                vertexPosition.z += wave;

                gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
                vVertexPosition = vertexPosition;
                vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
            }
        `;
        const fs = `
            #ifdef GL_ES
            precision mediump float;
            #endif
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;
            uniform sampler2D planeTexture;

            void main() {
                gl_FragColor = texture2D(planeTexture, vTextureCoord);
            }
        `;

        const params = {
            vertexShader: vs,
            fragmentShader: fs,
            widthSegments: 20,
            heightSegments: 20,
            uniforms: {
                uTime: { name: "uTime", type: "1f", value: 0 },
                uMouse: { name: "uMouse", type: "2f", value: [0, 0] }
            }
        };

        const plane = this.curtains.addPlane(imgEl.parentElement, params);

        if (plane) {
            // Load the image into the plane
            plane.loadImages(imgEl);

            plane.onReady(() => {
                // Reveal!
                // Only hide DOM image when WebGL is ready
                imgEl.style.opacity = 0;
            }).onRender(() => {
                plane.uniforms.uTime.value++;
                // Map mouse to plane
                const m = plane.mouseToPlaneCoords(this.lerpMouse.x, this.lerpMouse.y);
                plane.uniforms.uMouse.value = [m.x, m.y];
            });
        }
    }

    initThumbPlane() {
        const container = document.getElementById('project-thumb-container');
        if (!container) return;

        // Basic Plane
        const params = {
            widthSegments: 10, heightSegments: 10,
            uniforms: {
                uTime: { name: "uTime", type: "1f", value: 0 },
                uAlpha: { name: "uAlpha", type: "1f", value: 0 }
            }
        };
        // Simple fragment with alpha
        // Use default vertex, custom fragment for opacity
        params.fragmentShader = `
            #ifdef GL_ES
            precision mediump float;
            #endif
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;
            uniform sampler2D planeTexture;
            uniform float uAlpha;
            void main() {
                vec4 color = texture2D(planeTexture, vTextureCoord);
                gl_FragColor = vec4(color.rgb, color.a * uAlpha);
            }
        `;

        this.thumbPlane = this.curtains.addPlane(container, params);

        if (this.thumbPlane) {
            this.thumbTexture = this.thumbPlane.textures[0]; // Get the placeholder texture

            this.thumbPlane.onRender(() => {
                this.thumbPlane.updatePosition(); // Sync with fixed container
            });

            // Init interactions
            this._initProjectHovers(container);
        }
    }

    _initProjectHovers(container) {
        const rows = document.querySelectorAll('.project-row');

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
                duration: 0.6,
                ease: "power2.out"
            });
        }
    }
}
