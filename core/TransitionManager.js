export default class TransitionManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.rafId = null;

        // Config
        this.config = {
            maxHeightRatio: 0.7,
            maxWidthRatio: 0.95,
            teethAmplitude: 20,
            particleCount: 60,
            glowColor: 'rgba(44, 44, 255, 0.8)', // Bleu LogoLoom
            glowBlur: 30
        };

        this.state = {
            openRatio: 0, // 0 = fermé, 1 = ouvert (écran couvert)
            time: 0,
            particles: []
        };

        this.init();
    }

    init() {
        // Create Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'transition-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '9999'; // Very high
        this.canvas.style.pointerEvents = 'none'; // Click through when hidden

        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    getNoise(x, t) {
        return Math.sin(x * 0.01 + t) * Math.sin(x * 0.03 + t * 2) * Math.sin(x * 0.1 + t * 0.5);
    }

    // Animation Loop
    animate() {
        if (!this.ctx) return;

        // Clear
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.state.time += 0.05;

        // Optimization: Stop drawing if closed and ratio is 0
        if (this.state.openRatio <= 0.001 && this.state.particles.length === 0) {
             // this.ctx.clearRect(0, 0, this.width, this.height); // Ensure clean
             return; // Stop RAF
        }

        // Draw Garganta
        this.drawGarganta();
        this.drawParticles();

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    drawGarganta() {
        // If ratio is small, don't draw much
        if (this.state.openRatio <= 0) return;

        // To cover the screen fully at ratio 1, we need to be clever.
        // The V3 code draws a "strip" in the middle.
        // We want it to expand to FULL HEIGHT.
        // So maxHeightRatio should be > 1.0 or we scale it.

        const currentW = this.width * (this.config.maxWidthRatio + (1-this.config.maxWidthRatio)*this.state.openRatio);
        // When ratio 1, width is full.

        // Height needs to cover screen at ratio 1.
        // Let's say at ratio 1, height is 1.5 * screen height to be sure.
        const currentH = this.height * 1.5 * this.state.openRatio;

        this.ctx.beginPath();
        this.ctx.fillStyle = '#000'; // Void color
        this.ctx.shadowBlur = this.config.glowBlur;
        this.ctx.shadowColor = this.config.glowColor;

        const steps = 50; // Performance

        // TOP LINE
        for (let i = 0; i <= steps; i++) {
            const pct = i / steps;
            const x = this.centerX - (currentW / 2) + (currentW * pct);

            // Arch shape
            const arch = Math.sin(pct * Math.PI);

            // Teeth Noise
            // Less noise when fully open to look like a clean "cut" or "screen"?
            // Or keep it jagged? Let's keep it organic.
            const noiseFactor = (1 - (this.state.openRatio * 0.5));
            const noise = this.getNoise(x, this.state.time) * this.config.teethAmplitude * noiseFactor * arch;

            const y = this.centerY - (currentH / 2 * arch) + noise;

            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }

        // BOTTOM LINE
        for (let i = steps; i >= 0; i--) {
            const pct = i / steps;
            const x = this.centerX - (currentW / 2) + (currentW * pct);
            const arch = Math.sin(pct * Math.PI);

            const noiseFactor = (1 - (this.state.openRatio * 0.5));
            const noise = this.getNoise(x + 100, this.state.time) * this.config.teethAmplitude * noiseFactor * arch;

            const y = this.centerY + (currentH / 2 * arch) + noise;

            this.ctx.lineTo(x, y);
        }

        this.ctx.closePath();
        this.ctx.fill();

        // Reset shadow
        this.ctx.shadowBlur = 0;
    }

    drawParticles() {
        // Generate particles only if open
        if (this.state.openRatio > 0 && this.state.particles.length < this.config.particleCount && Math.random() < 0.5) {
            this.state.particles.push({
                x: this.centerX + (Math.random() - 0.5) * this.width * 0.5,
                y: this.centerY + (Math.random() - 0.5) * this.height * 0.5 * this.state.openRatio,
                size: Math.random() * 3 + 1,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 1) * 2 - 1,
                life: 1
            });
        }

        this.ctx.fillStyle = '#2C2CFF'; // Accent Color

        for (let i = this.state.particles.length - 1; i >= 0; i--) {
            let p = this.state.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;

            if (p.life <= 0) {
                this.state.particles.splice(i, 1);
            } else {
                this.ctx.globalAlpha = p.life;
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        }
        this.ctx.globalAlpha = 1;
    }

    // Public methods for Router
    playOpen() {
        // Start Loop
        if (!this.rafId) this.animate();

        // Reset
        // this.state.openRatio = 0; // Don't reset if we want to toggle?

        // GSAP Tween to 1
        return new Promise(resolve => {
            if (window.gsap) {
                window.gsap.to(this.state, {
                    openRatio: 1,
                    duration: 1.2,
                    ease: "power3.inOut",
                    onComplete: resolve
                });
            } else {
                // Fallback
                this.state.openRatio = 1;
                setTimeout(resolve, 1000);
            }
        });
    }

    playClose() {
        return new Promise(resolve => {
            if (window.gsap) {
                window.gsap.to(this.state, {
                    openRatio: 0,
                    duration: 1.0,
                    ease: "power3.inOut",
                    onComplete: () => {
                        // Stop Loop handled by animate() check
                        resolve();
                    }
                });
            } else {
                this.state.openRatio = 0;
                setTimeout(resolve, 1000);
            }
        });
    }
}
