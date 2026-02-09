
export default class TransitionManager {
    constructor() {
        this.portal = null;
        this.voidElement = null;
        this.stage = null;
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

        // Bind methods
        this.animateFrame = this.animateFrame.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.enterGate = this.enterGate.bind(this);

        this.init();
    }

    init() {
        // Create DOM Structure
        // <div id="garganta-portal">
        //   <div id="garganta-stage">
        //     <div id="garganta-void"></div>
        //   </div>
        // </div>

        const portal = document.createElement('div');
        portal.id = 'garganta-portal';

        const stage = document.createElement('div');
        stage.id = 'garganta-stage';

        const voidEl = document.createElement('div');
        voidEl.id = 'garganta-void';

        stage.appendChild(voidEl);
        portal.appendChild(stage);
        document.body.appendChild(portal);

        this.portal = portal;
        this.stage = stage;
        this.voidElement = voidEl;

        // Interaction
        this.voidElement.addEventListener('click', this.enterGate);

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

    startTransition(callback) {
        console.log("Starting Garganta Transition (User Version)");
        this.onComplete = callback;
        this.portal.classList.add('active');
        this.isActive = true;

        // Reset State for Opening
        this.state.opening = true;
        this.state.entering = false;
        this.state.progress = 0;
        this.state.currentWidth = 0;
        this.state.currentHeight = 0;

        // Reset Visuals
        this.stage.style.transform = 'scale(1)';
        this.stage.style.opacity = '1';
        this.stage.style.transition = 'none';

        this.playAudio();

        // Start Animation Loop
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animateFrame();
    }

    enterGate() {
        if (this.state.entering) return; // Prevent double click
        this.state.entering = true;
        console.log("Entering Garganta...");

        // Visual "Enter" Effect: Massive Zoom into the void
        this.stage.style.transition = 'transform 1s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.5s ease 0.8s';
        this.stage.style.transform = 'scale(50)'; // Zoom in
        this.stage.style.opacity = '0'; // Fade out at end

        // Complete transition after zoom
        setTimeout(() => {
            this.completeTransition();
        }, 800);
    }

    completeTransition() {
        if (this.onComplete) this.onComplete();

        // Cleanup / Hide
        setTimeout(() => {
            this.portal.classList.remove('active');
            this.isActive = false;
            cancelAnimationFrame(this.animationId);

            // Clear any lingering particles
            const particles = document.querySelectorAll('.particle');
            particles.forEach(p => p.remove());
        }, 500);
    }

    // --- Animation Logic from garganta.html ---

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    generateJaggedPolygon(width, height, noiseLevel) {
        const points = [];
        const numPoints = 80;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * (Math.PI * 2);
            const baseX = Math.cos(angle) * (width / 2);
            const baseY = Math.sin(angle) * (height / 2);

            // Noise logic from user code
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
        const p = document.createElement('div');
        p.classList.add('particle');
        this.stage.appendChild(p); // Append to stage so it scales with zoom? Or portal?
        // User appended to stage.

        const size = this.random(2, 5);
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;

        // Position relative to window center (since stage is centered)
        // User code: startX based on window width.
        // My stage is centered. The particle logic assumes absolute positioning on screen?
        // garganta.html had #stage relative, but spawnParticle calculated 'left' based on window.innerWidth
        // Since my #garganta-stage is centered flex, absolute children are relative to it?
        // No, #garganta-stage is flex, so direct children are flex items unless absolute.
        // .particle is absolute.
        // I need to adjust coordinates to be relative to the stage center if I append to stage.
        // Or append to body/portal and manage coords.
        // Let's stick to user logic but adjust for container.

        // In user code: stage is 100vw/100vh relative.
        // Particle left = window.innerWidth/2 + offset.
        // If I append to stage (width 100vw), left/top work same way.

        const startX = (window.innerWidth/2) + this.random(-this.state.currentWidth/2.2, this.state.currentWidth/2.2);
        const startY = window.innerHeight/2; // Center Y

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

        // 1. Opening Logic
        if (this.state.opening) {
            this.state.progress += (1 - this.state.progress) * this.state.openingSpeed;
            this.state.currentWidth = this.state.maxWidth * this.state.progress;
            this.state.currentHeight = this.state.maxHeight * Math.pow(this.state.progress, 2);

            if (this.state.progress > 0.99) {
                this.state.opening = false;
                this.state.progress = 1;
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

        // Combine shake with existing transform if needed, but we used style.transform for shake in user code
        // NOTE: In enterGate, I modify stage transform. Here I modify voidElement transform.
        // This is fine.
        this.voidElement.style.transform = `translate(${shakeX}px, ${shakeY}px)`;

        // 5. Particles
        if (this.state.progress > 0.1 && Math.random() > 0.8) {
            this.spawnParticle();
        }

        this.animationId = requestAnimationFrame(this.animateFrame);
    }
}
