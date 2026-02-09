
export default class TransitionManager {
    constructor() {
        this.portal = null;
        this.voidElement = null;
        this.stage = null;
        this.label = null;
        this.isActive = false;
        this.onComplete = null;

        // CONFIG from gargantaV2.html
        this.config = {
            openingSpeed: 0.008,
            maxWidth: window.innerWidth * 0.9,
            maxHeight: window.innerHeight * 0.5,
            spikiness: 15,
            density: 120,
            shakeIntensity: 2
        };

        // STATE from gargantaV2.html
        this.state = {
            openRatio: 0,
            isOpening: false,
            entering: false, // My flag for zoom
            time: 0
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

        const scene = document.createElement('div');
        scene.id = 'scene'; // Renamed from stage to scene to match v2

        const wrapper = document.createElement('div');
        wrapper.className = 'garganta-wrapper';

        const voidEl = document.createElement('div');
        voidEl.id = 'void'; // Renamed from garganta-void to void

        const label = document.createElement('div');
        label.className = 'g-label';
        label.innerText = "INITIALISER LE SYSTÈME";

        // Structure: Portal -> Scene -> Wrapper -> Void
        // Label inside Wrapper to be centered with Void? Or absolute center of screen?
        // Void is centered in Wrapper. Wrapper is centered in Scene.
        // Label should be centered absolutely in Wrapper.

        wrapper.appendChild(voidEl);
        wrapper.appendChild(label);
        scene.appendChild(wrapper);
        portal.appendChild(scene);
        document.body.appendChild(portal);

        this.portal = portal;
        this.stage = scene; // Keep reference name internal
        this.voidElement = voidEl;
        this.label = label;

        // Interaction
        this.voidElement.addEventListener('click', this.enterGate);
        this.label.addEventListener('click', this.enterGate);

        // Audio Setup
        this.audio = new Audio('assets/audio/bleach-garganta.mp3');
        this.audio.volume = 0.5;

        // Listeners
        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.config.maxWidth = window.innerWidth * 0.9;
        this.config.maxHeight = window.innerHeight * 0.5;
    }

    playAudio() {
        if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch(e => console.log("Audio autoplay prevented", e));
        }
    }

    startTransition(callback, direction) {
        console.log("Starting Garganta V2 Transition");
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

        // Reset Visuals
        this.stage.style.transform = 'scale(1)';
        this.stage.style.opacity = '1';
        this.stage.style.transition = 'none';

        // Reset Label (Hidden initially)
        this.label.style.opacity = '0';
        this.label.style.pointerEvents = 'none'; // Not clickable until open

        this.playAudio();

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animateFrame();
    }

    enterGate() {
        if (this.state.entering) return;
        this.state.entering = true;
        console.log("Entering Garganta...");

        // Visual "Enter" Effect
        this.stage.style.transition = 'transform 1s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.5s ease 0.8s';
        this.stage.style.transform = 'scale(50)';
        this.stage.style.opacity = '0';

        // Hide Label immediately
        this.label.style.opacity = '0';
        this.label.style.transition = 'opacity 0.2s';

        setTimeout(() => {
            this.completeTransition();
        }, 800);
    }

    completeTransition() {
        if (this.onComplete) this.onComplete();

        setTimeout(() => {
            this.portal.classList.remove('active');
            this.isActive = false;
            cancelAnimationFrame(this.animationId);
            const particles = document.querySelectorAll('.particle');
            particles.forEach(p => p.remove());
        }, 500);
    }

    // --- LOGIC FROM gargantaV2.html ---

    getSpike(i, total, seed) {
        const baseFrequency = 0.5;
        const jagged = Math.sin(i * baseFrequency + seed) * Math.cos(i * 0.8);
        const edgeFactor = Math.sin((i / total) * Math.PI);
        return jagged * this.config.spikiness * edgeFactor;
    }

    updateShape() {
        if (this.state.entering) return; // Optimize during zoom

        const points = [];
        const currentHeight = this.config.maxHeight * Math.pow(this.state.openRatio, 0.8);

        // 1. TOP LINE
        for (let i = 0; i <= this.config.density; i++) {
            const x = (i / this.config.density) * 100;
            const archY = Math.sin((i / this.config.density) * Math.PI) * (currentHeight / 2) * this.state.openRatio;
            const spike = this.getSpike(i, this.config.density, this.state.time);

            // Center Y is 50%. Top arch goes UP (subtract Y).
            // Normalize archY to percentage based on some reference height or window height?
            // In user code: y = 50 - (archY / (window.innerHeight*0.6) * 100) + (spike/5);
            // I should stick to that logic relative to window height.

            const y = 50 - (archY / (window.innerHeight * 0.6) * 100) + (spike/5);
            points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
        }

        // 2. BOTTOM LINE
        for (let i = this.config.density; i >= 0; i--) {
            const x = (i / this.config.density) * 100;
            const archY = Math.sin((i / this.config.density) * Math.PI) * (currentHeight / 2) * this.state.openRatio;
            const spike = this.getSpike(i, this.config.density, this.state.time + 10);

            // Bottom arch goes DOWN (add Y).
            const y = 50 + (archY / (window.innerHeight * 0.6) * 100) + (spike/5);
            points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
        }

        this.voidElement.style.clipPath = `polygon(${points.join(',')})`;

        // Dynamic Width
        this.voidElement.style.width = `${this.config.maxWidth * (0.1 + 0.9 * Math.sqrt(this.state.openRatio))}px`;
    }

    spawnParticle() {
        if (this.state.entering) return;
        if (this.state.openRatio < 0.1) return;

        const p = document.createElement('div');
        p.classList.add('particle');
        // Append to wrapper so z-index works correctly relative to void
        // In CSS: wrapper z-index 10, void z-index auto (inside wrapper).
        // particles z-index 5.
        // Wait, wrapper has filter.
        // If particle is inside wrapper, it gets the filter too?
        // User code: scene.appendChild(p). Scene is parent of wrapper.
        // I should append to stage (scene).
        this.stage.appendChild(p);

        // Position Logic (User Code)
        const spreadX = this.config.maxWidth * 0.8;
        const startX = (Math.random() - 0.5) * spreadX;
        const startY = (Math.random() - 0.5) * (this.config.maxHeight * this.state.openRatio * 0.5);

        const size = Math.random() * 4 + 1;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        // Centered in scene?
        // Translate is relative to element position.
        // .particle needs to be absolutely centered in #scene first?
        // CSS for .particle: position: absolute.
        // Since #scene is flex center center, position absolute defaults to top-left of relative parent?
        // No, flex items absolute are removed from flow but positioned relative to nearest positioned ancestor.
        // #scene is relative.
        // So top:0 left:0 is top-left of scene.
        // We want center.
        p.style.left = '50%';
        p.style.top = '50%';
        // So translate(startX, startY) works from center.

        p.style.transform = `translate(${startX}px, ${startY}px)`;
        p.style.opacity = '0';

        const angle = Math.atan2(startY, startX);
        const velocity = Math.random() * 100 + 50;
        const moveX = Math.cos(angle) * velocity;
        const moveY = Math.sin(angle) * velocity;

        const anim = p.animate([
            { transform: `translate(${startX}px, ${startY}px) rotate(0deg)`, opacity: 0 },
            { transform: `translate(${startX}px, ${startY}px) rotate(45deg)`, opacity: 1, offset: 0.2 },
            { transform: `translate(${startX + moveX}px, ${startY + moveY - 50}px) rotate(90deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 1000 + 800,
            easing: 'ease-out'
        });

        anim.onfinish = () => p.remove();
    }

    animateFrame() {
        if (!this.isActive) return;
        if (this.state.entering) return; // Optimization

        this.state.time += 0.1;

        // 1. Opening
        if (this.state.isOpening) {
            this.state.openRatio += this.config.openingSpeed;
            if (this.state.openRatio >= 1) {
                this.state.openRatio = 1;
                this.state.isOpening = false;
            }
        }

        // 2. Shape
        this.updateShape();

        // 3. Shake
        if (this.state.openRatio < 1) {
            const shake = (1 - this.state.openRatio) * this.config.shakeIntensity;
            const sx = (Math.random() - 0.5) * shake;
            const sy = (Math.random() - 0.5) * shake;
            this.voidElement.style.transform = `translate(${sx}px, ${sy}px)`;
        } else {
            this.voidElement.style.transform = `translate(0,0)`;
        }

        // 4. Label Visibility (Center Appearance)
        // Invisible when closed (ratio < 0.5). Fade in after.
        if (this.state.openRatio > 0.6) {
             this.label.style.opacity = '1';
             this.label.style.pointerEvents = 'auto';
             // Scale up slightly for dramatic effect?
             // this.label.style.transform = `scale(${0.8 + 0.2 * this.state.openRatio})`;
        } else {
             this.label.style.opacity = '0';
             this.label.style.pointerEvents = 'none';
        }

        // 5. Reiatsu
        if (Math.random() < this.state.openRatio) {
             this.spawnParticle();
             this.spawnParticle();
        }

        this.animationId = requestAnimationFrame(this.animateFrame);
    }
}
