
export default class TransitionManager {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.isAnimating = false;
        this.direction = null;
        this.particles = [];
        this.particleSystemRunning = false;

        // Audio
        this.audio = new Audio('src/assets/audio/bleach-garganta.mp3');
        this.audio.volume = 0.5;

        // Bind
        this.start = this.start.bind(this);
        this.enterGate = this.enterGate.bind(this);
        this.resolve = this.resolve.bind(this);
        this.animateParticles = this.animateParticles.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);

        this.createPortal();
    }

    createPortal() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'garganta-portal';

        this.overlay.innerHTML = `
            <div class="g-void-container">
                <div class="g-void-wrapper">
                    <div class="g-void"></div>
                </div>
                <canvas id="reiatsu-canvas"></canvas>
                <div class="g-label">OUVRIR LA BRECHE</div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Canvas setup
        this.canvas = this.overlay.querySelector('#reiatsu-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Click Listener on the VOID (the tear itself)
        const voidEl = this.overlay.querySelector('.g-void');
        voidEl.addEventListener('click', this.enterGate);
    }

    generateJaggedPoly() {
        // Generate a jagged vertical slit -> opens to jagged oval
        const numPoints = 120; // High detail
        const points = [];
        const centerX = 50;
        const centerY = 50;
        const radiusX = 45; // Width %
        const radiusY = 35; // Height %

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;

            // Base oval
            const rX = radiusX * Math.cos(angle);
            const rY = radiusY * Math.sin(angle);

            // Noise: varies between -5% and +5% of the radius
            // Use Math.random() directly
            const noiseFactor = 1 + (Math.random() - 0.5) * 0.15; // 15% noise

            // Apply noise
            const x = centerX + (rX * noiseFactor);
            const y = centerY + (rY * noiseFactor);

            points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
        }

        return `polygon(${points.join(', ')})`;
    }

    start(direction) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.direction = direction; // 'toRetro' or 'toStandard'

        // 1. Play Sound
        try {
            this.audio.currentTime = 0;
            this.audio.play().catch(e => console.log("Audio Play Failed:", e));
        } catch (e) { console.warn("Audio error:", e); }

        // 2. Set Colors & Content
        const voidEl = this.overlay.querySelector('.g-void');
        const labelEl = this.overlay.querySelector('.g-label');

        // Generate new random shape
        const poly = this.generateJaggedPoly();
        voidEl.style.clipPath = poly;

        if (direction === 'toRetro') {
            // Standard -> Retro (Blue/Cyan)
            voidEl.style.setProperty('--portal-glow', '#00eaff'); // Cyan
            voidEl.style.setProperty('--portal-glow-secondary', '#2c2cff'); // Blue
            labelEl.innerText = "INITIALISER LE SYSTEME";
            labelEl.style.color = "#00eaff";
            this.particleColor = '0, 234, 255'; // RGB for particles
        } else {
            // Retro -> Standard (Red/Orange/Violet)
            voidEl.style.setProperty('--portal-glow', '#ff0055'); // Magenta/Red
            voidEl.style.setProperty('--portal-glow-secondary', '#ff4400'); // Orange
            labelEl.innerText = "RETOUR A LA REALITE";
            labelEl.style.color = "#ff0055";
            this.particleColor = '255, 0, 85';
        }

        // 3. Open Portal
        this.overlay.classList.add('active');
        document.getElementById('app').classList.add('blur-transition');

        // Start Particles
        this.resizeCanvas();
        this.particleSystemRunning = true;
        this.animateParticles();

        window.addEventListener('resize', this.resizeCanvas);
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animateParticles() {
        if (!this.particleSystemRunning) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear frame
        ctx.clearRect(0, 0, w, h);

        // Emit new particles
        if (this.particles.length < 200) {
            // Emit from center area
            const angle = Math.random() * Math.PI * 2;
            const dist = 50 + Math.random() * 100; // Start slightly outside center

            this.particles.push({
                x: w/2 + (Math.cos(angle) * dist * 0.2), // Start close to center
                y: h/2 + (Math.sin(angle) * dist * 0.5),
                vx: (Math.cos(angle) * (2 + Math.random() * 4)),
                vy: (Math.sin(angle) * (2 + Math.random() * 4)),
                life: 1.0,
                decay: 0.01 + Math.random() * 0.02,
                size: 1 + Math.random() * 3
            });
        }

        // Update & Draw
        ctx.fillStyle = `rgba(${this.particleColor}, 1)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.particleColor}, 0.8)`;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        requestAnimationFrame(this.animateParticles);
    }

    enterGate() {
        console.log("Entering Garganta...");

        const voidEl = this.overlay.querySelector('.g-void');
        voidEl.classList.add('entering'); // Triggers massive zoom

        // 4. Trigger State Change mid-zoom
        setTimeout(() => {
            if (this.onComplete) this.onComplete(this.direction);

            // 5. Resolve
            this.resolve();

        }, 800);
    }

    resolve() {
        console.log("Resolving Transition...");

        // Hide overlay with fade
        this.overlay.classList.add('fading');
        document.getElementById('app').classList.remove('blur-transition');

        setTimeout(() => {
            // Reset State
            this.overlay.classList.remove('active', 'fading');
            this.overlay.querySelector('.g-void').classList.remove('entering');
            this.isAnimating = false;
            this.particleSystemRunning = false;
            this.particles = [];
            window.removeEventListener('resize', this.resizeCanvas);
        }, 1000);
    }
}
