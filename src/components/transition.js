
export default class TransitionManager {
    constructor() {
        this.portal = null;
        this.voidElement = null;
        this.stage = null;
        this.label = null;
        this.isActive = false;
        this.onComplete = null;

        // State configuration from user's garganta.html
        this.state = {
            opening: false,
            entering: false,
            currentWidth: 0,
            currentHeight: 0,
            maxWidth: window.innerWidth * 1.2,
            maxHeight: window.innerHeight * 0.3,
            openingSpeed: 0.02,
            progress: 0,
            noiseIntensity: 15
        };

        this.animationId = null;
        this.audio = null;
        this.direction = null;

        // Bind methods
        this.animateFrame = this.animateFrame.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.enterGate = this.enterGate.bind(this);

        this.init();
    }

    init() {
        const portal = document.createElement('div');
        portal.id = 'garganta-portal';

        const stage = document.createElement('div');
        stage.id = 'garganta-stage';

        // Wrapper for better positioning
        const contentWrapper = document.createElement('div');
        contentWrapper.style.display = 'flex';
        contentWrapper.style.flexDirection = 'column';
        contentWrapper.style.alignItems = 'center';
        contentWrapper.style.justifyContent = 'center';
        contentWrapper.style.position = 'relative';

        const voidEl = document.createElement('div');
        voidEl.id = 'garganta-void';

        const label = document.createElement('div');
        label.className = 'g-label';
        // Initial text placeholder
        label.innerText = "INITIALISER LE SYSTÈME";

        contentWrapper.appendChild(voidEl);
        // Label is visually below via CSS margin/position, but logically next to void.
        // Actually, let's append label to stage, OUTSIDE contentWrapper if void is absolute?
        // In previous CSS: #garganta-void is absolute.
        // So contentWrapper needs to be sized or just contain them.
        // Let's keep structure simple.

        stage.appendChild(voidEl);
        stage.appendChild(label);

        portal.appendChild(stage);
        document.body.appendChild(portal);

        this.portal = portal;
        this.stage = stage;
        this.voidElement = voidEl;
        this.label = label;

        // Interaction
        this.voidElement.addEventListener('click', this.enterGate);
        this.label.addEventListener('click', this.enterGate); // Make label clickable too

        // Audio Setup
        this.audio = new Audio('assets/audio/bleach-garganta.mp3');
        this.audio.volume = 0.5;

        // Listeners
        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.state.maxWidth = window.innerWidth * 1.2;
        this.state.maxHeight = window.innerHeight * 0.3;
    }

    playAudio() {
        if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch(e => console.log("Audio autoplay prevented", e));
        }
    }

    startTransition(callback, direction) {
        console.log("Starting Garganta Transition (Optimized)");
        this.onComplete = callback;
        this.direction = direction; // 'toRetro' or 'toStandard'

        // Set Text
        if (this.direction === 'toRetro') {
            this.label.innerText = "ENTRER DANS L'ANOMALIE";
            this.label.style.color = "#4af626"; // Terminal Green hint
        } else {
            this.label.innerText = "SORTIR DE L'ANOMALIE";
            this.label.style.color = "#eaeaea";
        }

        this.portal.classList.add('active');
        this.isActive = true;

        // Reset State
        this.state.opening = true;
        this.state.entering = false;
        this.state.progress = 0;
        this.state.currentWidth = 0;
        this.state.currentHeight = 0;

        // Reset Visuals
        this.stage.style.transform = 'scale(1)';
        this.stage.style.opacity = '1';
        this.stage.style.transition = 'none';

        // Reset Label
        this.label.style.opacity = '0';
        this.label.style.transform = 'translateY(20px)';

        this.playAudio();

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animateFrame();
    }

    enterGate() {
        if (this.state.entering) return;
        this.state.entering = true;
        console.log("Entering Garganta...");

        // OPTIMIZATION: Stop calculating clip-path immediately.
        // The last frame of the polygon is fine for the zoom.
        // We set entering=true, which animateFrame checks.

        // Visual "Enter" Effect
        this.stage.style.transition = 'transform 1s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.5s ease 0.8s';
        this.stage.style.transform = 'scale(50)';
        this.stage.style.opacity = '0';

        // Hide Label immediately on enter
        this.label.style.opacity = '0';
        this.label.style.transition = 'opacity 0.2s';

        setTimeout(() => {
            this.completeTransition();
        }, 800);
    }

    completeTransition() {
        if (this.onComplete) this.onComplete();

        // Cleanup
        setTimeout(() => {
            this.portal.classList.remove('active');
            this.isActive = false;
            cancelAnimationFrame(this.animationId);
            const particles = document.querySelectorAll('.particle');
            particles.forEach(p => p.remove());
        }, 500);
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    generateJaggedPolygon(width, height, noiseLevel) {
        const points = [];
        const numPoints = 60; // Reduced from 80 for perf
        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * (Math.PI * 2);
            const baseX = Math.cos(angle) * (width / 2);
            const baseY = Math.sin(angle) * (height / 2);

            const horizontalFactor = Math.abs(Math.sin(angle));
            const noiseX = this.random(-noiseLevel, noiseLevel) * horizontalFactor;
            const noiseY = this.random(-noiseLevel, noiseLevel);

            const xPct = ((centerX + baseX + noiseX) / width) * 100;
            const yPct = ((centerY + baseY + noiseY) / height) * 100;

            points.push(`${xPct.toFixed(2)}% ${yPct.toFixed(2)}%`);
        }
        return `polygon(${points.join(',')})`;
    }

    spawnParticle() {
        if (this.state.entering) return; // Stop particles during zoom

        const p = document.createElement('div');
        p.classList.add('particle');
        this.stage.appendChild(p);

        const size = this.random(2, 5);
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;

        const startX = (window.innerWidth/2) + this.random(-this.state.currentWidth/2.2, this.state.currentWidth/2.2);
        const startY = window.innerHeight/2;

        p.style.left = `${startX}px`;
        p.style.top = `${startY}px`;

        const destinationX = startX + this.random(-100, 100);
        const destinationY = startY + this.random(-100, 100);

        const duration = this.random(500, 1000);

        p.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1, backgroundColor: '#fff' },
            { transform: `translate(${destinationX - startX}px, ${destinationY - startY}px) scale(0)`, opacity: 0, backgroundColor: '#00ffff' }
        ], {
            duration: duration,
            easing: 'ease-out'
        }).onfinish = () => p.remove();
    }

    animateFrame() {
        if (!this.isActive) return;

        // CRITICAL OPTIMIZATION:
        // If entering (zooming), do NOT update clip-path or dimensions.
        // Just let the CSS transform scale handle it.
        if (this.state.entering) {
             // Just keep loop alive for cleanup if needed, but skip logic
             // Or cancel here?
             // We need to keep requesting frames if we had JS animations, but we rely on CSS transition for zoom.
             // So we can actually stop requesting frames to free up Main Thread for the layout/paint of the huge div.
             return;
        }

        // 1. Opening Logic
        if (this.state.opening) {
            this.state.progress += (1 - this.state.progress) * this.state.openingSpeed;
            this.state.currentWidth = this.state.maxWidth * this.state.progress;
            this.state.currentHeight = this.state.maxHeight * Math.pow(this.state.progress, 2);

            if (this.state.progress > 0.99) {
                this.state.opening = false;
                this.state.progress = 1;

                // Show Label when fully open
                this.label.style.opacity = '1';
                this.label.style.transform = 'translateY(150px)'; // Push it down below the void
            }
        }

        // 2. Dimensions
        const displayWidth = Math.max(10, this.state.currentWidth);
        const displayHeight = Math.max(4, this.state.currentHeight);

        this.voidElement.style.width = `${displayWidth}px`;
        this.voidElement.style.height = `${displayHeight}px`;

        // 3. Clip Path (Frame-by-frame generation)
        const currentNoise = this.state.noiseIntensity * (0.5 + this.state.progress / 2);
        this.voidElement.style.clipPath = this.generateJaggedPolygon(displayWidth, displayHeight, currentNoise);

        // 4. Shake
        const shakeX = this.random(-2, 2) * this.state.progress;
        const shakeY = this.random(-1, 1) * this.state.progress;
        this.voidElement.style.transform = `translate(${shakeX}px, ${shakeY}px)`;

        // 5. Particles
        if (this.state.progress > 0.1 && Math.random() > 0.8) {
            this.spawnParticle();
        }

        this.animationId = requestAnimationFrame(this.animateFrame);
    }
}
