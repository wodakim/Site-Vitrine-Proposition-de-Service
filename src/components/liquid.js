
export default class LiquidEffect {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

        if (!this.gl) {
            console.warn("WebGL not supported");
            return;
        }

        // Setup DOM
        this.container.appendChild(this.canvas);
        // Hide original img if present, but we might need it for layout?
        // We will make canvas absolute fill
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';

        // State
        this.width = 300;
        this.height = 400;
        this.aspect = 300/400;

        this.texture = null;
        this.program = null;
        this.uTime = null;
        this.startTime = Date.now();

        // Mouse/Effect
        this.intensity = 0;
        this.targetIntensity = 0;

        this.init();
    }

    init() {
        const gl = this.gl;

        // Resize
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width || 300;
        this.height = rect.height || 400;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        gl.viewport(0, 0, this.width, this.height);

        // Shaders
        const vsSource = `
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
                vUv = position * 0.5 + 0.5;
                // Flip Y because WebGL texture coords
                vUv.y = 1.0 - vUv.y;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            uniform float uTime;
            uniform float uIntensity;
            varying vec2 vUv;

            // Simple noise
            float random (vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            float noise (in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f*f*(3.0-2.0*f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            void main() {
                vec2 uv = vUv;

                // Liquid Distortion
                float n = noise(uv * 10.0 + uTime * 2.0);
                vec2 displacement = vec2(n * 0.05, n * 0.05) * uIntensity;

                gl_FragColor = texture2D(uTexture, uv + displacement);
            }
        `;

        this.program = this.createProgram(vsSource, fsSource);
        gl.useProgram(this.program);

        // Buffer (Full quad)
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1.0, -1.0,
                 1.0, -1.0,
                -1.0,  1.0,
                -1.0,  1.0,
                 1.0, -1.0,
                 1.0,  1.0
            ]),
            gl.STATIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(this.program, "position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Uniforms
        this.uTime = gl.getUniformLocation(this.program, "uTime");
        this.uIntensity = gl.getUniformLocation(this.program, "uIntensity");

        // Default Texture (1x1 pixel)
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,255]));

        this.renderLoop();
    }

    createProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    setImage(url) {
        const gl = this.gl;
        const img = new Image();
        img.crossOrigin = "Anonymous"; // In case of external
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            // Trigger intensity spike on image change
            this.intensity = 1.0;
        };
        img.src = url;
    }

    renderLoop() {
        const gl = this.gl;
        if (!gl || !this.program) return;

        // Update Time
        const time = (Date.now() - this.startTime) * 0.001;
        gl.uniform1f(this.uTime, time);

        // Lerp Intensity to 0
        this.intensity += (0 - this.intensity) * 0.05;
        gl.uniform1f(this.uIntensity, this.intensity);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(this.renderLoop.bind(this));
    }
}
