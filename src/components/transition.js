
export default class TransitionManager {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.isAnimating = false;
        this.direction = null;

        // Audio
        this.audio = new Audio('src/assets/audio/bleach-garganta.mp3');
        this.audio.volume = 0.5;

        // Bind
        this.start = this.start.bind(this);
        this.enterGate = this.enterGate.bind(this);
        this.resolve = this.resolve.bind(this);

        this.createPortal();
    }

    createPortal() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'garganta-portal';

        this.overlay.innerHTML = `
            <div class="g-void-container">
                <div class="g-void"></div>
                <div class="g-label">OUVRIR LA BRECHE</div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Click Listener on the VOID (the tear itself)
        const voidEl = this.overlay.querySelector('.g-void');
        voidEl.addEventListener('click', this.enterGate);

        // Also allow clicking the container if the void is hard to hit,
        // but void has pointer-events: auto and container might not?
        // Let's stick to void as it's the visual target.
    }

    start(direction) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.direction = direction; // 'toRetro' or 'toStandard'

        // 1. Play Sound
        try {
            this.audio.currentTime = 0;
            this.audio.play().catch(e => console.log("Audio Play Failed (User interaction needed?):", e));
        } catch (e) {
            console.warn("Audio error:", e);
        }

        // 2. Set Colors
        const voidEl = this.overlay.querySelector('.g-void');
        const labelEl = this.overlay.querySelector('.g-label');

        if (direction === 'toRetro') {
            // Standard -> Retro (Entering the Code/Void)
            // Blue/Cyan glow (Bleach standard) or Green (Matrix)?
            // User asked for "Bleach Garganta", usually blue/black.
            voidEl.style.setProperty('--portal-glow', '#2C2CFF');
            labelEl.innerText = "INITIALISER LE SYSTEME";
            labelEl.style.color = "#2C2CFF";
            labelEl.style.textShadow = "0 0 10px #2C2CFF";
        } else {
            // Retro -> Standard (Returning to Reality)
            // Orange/Red (Hell Butterfly?) or White?
            voidEl.style.setProperty('--portal-glow', '#FF4400');
            labelEl.innerText = "RETOUR A LA REALITE";
            labelEl.style.color = "#FF4400";
            labelEl.style.textShadow = "0 0 10px #FF4400";
        }

        // 3. Open Portal
        this.overlay.classList.add('active');
        document.getElementById('app').classList.add('blur-transition');
    }

    enterGate() {
        console.log("Entering Garganta...");

        const voidEl = this.overlay.querySelector('.g-void');
        voidEl.classList.add('entering'); // Triggers massive zoom

        // 4. Trigger State Change mid-zoom (when screen is black)
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
        }, 1000);
    }
}
