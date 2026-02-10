
export default class TransitionManager {
    constructor() {
        this.portal = null;
        this.canvas = null;
        this.ctx = null;
        this.label = null;
        this.isActive = false;
        this.onComplete = null;

        // CONFIG from gargantaV3.html (Canvas Optimized)
        this.config = {
            openingSpeed: 0.02,       // Vitesse d'ouverture (was 0.005 in demo, adjusted for UX)
            maxHeightRatio: 0.6,      // Hauteur max (60% de l'écran)
            maxWidthRatio: 0.9,       // Largeur max
            teethAmplitude: 20,       // Taille des pics
            particleCount: 50,        // Max particules actives
            glowColor: 'rgba(0, 255, 255, 0.6)', // Couleur du Reiatsu
            glowBlur: 20              // Intensité du néon
        };

        // STATE from gargantaV3.html
        this.state = {
            openRatio: 0,
            time: 0,
            particles: [],
            isOpening: false,
            entering: false // Zoom flag
        };

        this.animationId = null;
        this.audio = null;
        this.direction = null;

        // Bind methods
        this.animateFrame = this.animateFrame.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.enterGate = this.enterGate.bind(this);

        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;

        this.init();
    }

    init() {
        const portal = document.createElement('div');
        portal.id = 'garganta-portal';
        // Ensure portal covers screen but is initially hidden/transparent
        // CSS handles display: none -> flex

        // Canvas Setup
        const canvas = document.createElement('canvas');
        canvas.id = 'gargantaCanvas';
        // Style handled by CSS or JS reset
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none'; // Canvas shouldn't block clicks initially

        const label = document.createElement('div');
        label.className = 'g-label';
        label.innerText = "INITIALISER LE SYSTÈME";
        // Label must be above canvas
        label.style.zIndex = '20';

        portal.appendChild(canvas);
        portal.appendChild(label);
        document.body.appendChild(portal);

        this.portal = portal;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.label = label;

        // Interaction
        // Canvas is the "void" visual. We need a way to click "the void".
        // Since it's a canvas, we can listen on the canvas element itself,
        // but checking if the click is "inside" the black shape is complex.
        // For simplicity, if the portal is open, clicking anywhere on canvas (which covers screen) works?
        // Or we just rely on the Label.
        // User asked: "fige le totalement une fois le lien permetant d'entrer ou sortir de l'anomalie est clicable"
        // So clicking the Label is the primary action.
        // But maybe clicking the void center too?
        // Let's add listener to canvas, but it will be pointer-events: none until freeze.
        this.canvas.addEventListener('click', this.enterGate);
        this.label.addEventListener('click', this.enterGate);

        // Audio Setup
        this.audio = new Audio('assets/audio/bleach-garganta.mp3');
        this.audio.volume = 0.5;

        // Listeners
        window.addEventListener('resize', this.handleResize);
        this.handleResize(); // Initial size
    }

    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        if (this.canvas) {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    playAudio() {
        if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch(e => console.log("Audio autoplay prevented", e));
        }
    }

    // --- MATHS (Bruit fluide) ---
    getNoise(x, t) {
        return Math.sin(x * 0.01 + t) * Math.sin(x * 0.03 + t * 2) * Math.sin(x * 0.1 + t * 0.5);
    }

    playEntrance() {
        console.log("TM: Playing Entrance (V3 Canvas)");
        // We simulate the "End state" then fade out
        this.portal.classList.add('active');
        // Initialize state to "Open"
        this.state.openRatio = 1;
        this.state.isOpening = false;

        // Draw one frame to ensure visual is there
        this.handleResize();
        this.drawCanvas(); // Render static open state

        // Immediately trigger fade out
        requestAnimationFrame(() => {
             this.completeTransition();
        });
    }

    startTransition(callback, direction) {
        console.log("Starting Garganta V3 (Canvas) Transition");
        this.onComplete = callback;
        this.direction = direction;

        // Set Text
        if (this.direction === 'toRetro') {
            this.label.innerText = "ENTRER DANS L'ANOMALIE";
            this.label.style.color = "#4af626";
        } else {
            this.label.innerText = "SORTIR DE L'ANOMALIE";
            this.label.style.color = "#eaeaea";
        }

        this.portal.classList.add('active');
        this.isActive = true;

        // Reset State
        this.state.openRatio = 0;
        this.state.isOpening = true;
        this.state.entering = false;
        this.state.time = 0;
        this.state.particles = [];

        // Reset Visuals
        this.label.style.opacity = '0';
        this.label.style.pointerEvents = 'none';
        this.canvas.style.pointerEvents = 'none';

        this.playAudio();

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animateFrame();
    }

    async enterGate() {
        try {
            if (this.state.entering) return;
            this.state.entering = true;
            console.log("Entering Garganta...");

            // Visual "Enter" Effect (Zoom via CSS Transform on Canvas?)
            // Canvas is just an image. We can scale it.
            this.canvas.style.transition = 'transform 1s cubic-bezier(0.7, 0, 0.2, 1)';
            this.canvas.style.transform = 'scale(50)';

            // Hide Label immediately
            this.label.style.opacity = '0';
            this.label.style.transition = 'opacity 0.2s';

            // Wait for Zoom (1000ms)
            await new Promise(r => setTimeout(r, 1000));

            // Navigation trigger
            if (this.onComplete) {
                await this.onComplete();
            }

        } catch (e) {
            console.error("TM: Error", e);
        }
    }

    completeTransition() {
        console.log("TM: completeTransition called. Fading out.");
        this.portal.classList.add('fading');
        this.portal.style.opacity = '0';
        this.portal.style.transition = 'opacity 0.8s ease';

        setTimeout(() => {
            console.log("TM: Removing active class.");
            this.portal.classList.remove('active');
            this.portal.classList.remove('fading');
            this.portal.style.opacity = ''; // Reset
            this.portal.style.transition = ''; // Reset
            this.canvas.style.transform = 'scale(1)'; // Reset

            this.isActive = false;
            this.state.entering = false;

            cancelAnimationFrame(this.animationId);
            // Clear canvas
            this.ctx.clearRect(0, 0, this.width, this.height);
        }, 800);
    }

    drawCanvas() {
        // Core drawing logic extracted for re-use (Freeze state)
        const { width, height, centerX, centerY, ctx, state, config } = this;

        ctx.clearRect(0, 0, width, height);

        const currentW = width * config.maxWidthRatio * Math.sqrt(state.openRatio);
        const currentH = height * config.maxHeightRatio * state.openRatio;

        ctx.beginPath();
        ctx.fillStyle = '#000';
        ctx.shadowBlur = config.glowBlur;
        ctx.shadowColor = config.glowColor;

        const steps = 100;

        // TOP LINE
        for (let i = 0; i <= steps; i++) {
            const pct = i / steps;
            const x = centerX - (currentW / 2) + (currentW * pct);
            const arch = Math.sin(pct * Math.PI);
            const noiseFactor = (1 - (state.openRatio * 0.8));
            const noise = this.getNoise(x, state.time) * config.teethAmplitude * noiseFactor * arch;
            const y = centerY - (currentH / 2 * arch) + noise;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        // BOTTOM LINE
        for (let i = steps; i >= 0; i--) {
            const pct = i / steps;
            const x = centerX - (currentW / 2) + (currentW * pct);
            const arch = Math.sin(pct * Math.PI);
            const noiseFactor = (1 - (state.openRatio * 0.8));
            const noise = this.getNoise(x + 100, state.time) * config.teethAmplitude * noiseFactor * arch;
            const y = centerY + (currentH / 2 * arch) + noise;
            ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for particles
    }

    animateFrame() {
        if (!this.isActive) return;
        if (this.state.entering) return;

        // Update State
        this.state.time += 0.05;

        // Opening Logic
        if (this.state.isOpening) {
            // Easing: Lerp towards 1
            if (this.state.openRatio < 1) {
                this.state.openRatio += (1 - this.state.openRatio) * this.config.openingSpeed;
                // Snap to 1
                if (this.state.openRatio > 0.99) {
                     this.state.openRatio = 1;
                     this.state.isOpening = false;

                     // FREEZE LOGIC
                     this.drawCanvas(); // Final static draw

                     // Enable Interactions
                     this.label.style.opacity = '1';
                     this.label.style.pointerEvents = 'auto';
                     this.canvas.style.pointerEvents = 'auto'; // Clickable void

                     console.log("TM V3: Garganta fully open. Animation frozen.");
                     cancelAnimationFrame(this.animationId);
                     return;
                }
            }
        }

        // Draw Shape
        this.drawCanvas();

        // Label Fade (Intermediate)
        if (this.state.openRatio > 0.8) {
             this.label.style.opacity = (this.state.openRatio - 0.8) * 5;
        }

        // Particles Logic
        if (this.state.particles.length < this.config.particleCount && Math.random() < 0.3 * this.state.openRatio) {
            this.state.particles.push({
                x: this.centerX + (Math.random() - 0.5) * (this.width * this.config.maxWidthRatio * Math.sqrt(this.state.openRatio)) * 0.8,
                y: this.centerY + (Math.random() - 0.5) * (this.height * this.config.maxHeightRatio * this.state.openRatio) * 0.2,
                size: Math.random() * 3 + 1,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 1) * 2 - 1,
                life: 1
            });
        }

        this.ctx.fillStyle = '#0ff';
        for (let i = this.state.particles.length - 1; i >= 0; i--) {
            let p = this.state.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;

            if (p.life <= 0) {
                this.state.particles.splice(i, 1);
            } else {
                this.ctx.globalAlpha = p.life;
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        }
        this.ctx.globalAlpha = 1;

        this.animationId = requestAnimationFrame(this.animateFrame);
    }
}
