
export default class TransitionManager {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.isAnimating = false;
        this.direction = null;

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
            <div class="g-void">
                <div class="g-gate-container" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
                    <div class="g-gate" style="width:2px; height:60vh; background:white; box-shadow:0 0 20px white; border-radius:50%; margin-bottom:20px;"></div>
                    <div class="g-label" style="font-family:inherit; letter-spacing:0.2em; font-size:0.8rem; color:white; text-transform:uppercase;">OUVRIR LA BRECHE</div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Click Listener for the Gate (Using container for easier hit area)
        const gate = this.overlay.querySelector('.g-gate-container');
        gate.addEventListener('click', this.enterGate);
    }

    start(direction) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.direction = direction; // 'toRetro' or 'toStandard'

        // 1. Show Overlay (Start Hidden)
        this.overlay.style.display = 'block';

        // Set colors based on direction
        const voidEl = this.overlay.querySelector('.g-void');
        const gateEl = this.overlay.querySelector('.g-gate');
        const labelEl = this.overlay.querySelector('.g-label');

        if (direction === 'toRetro') {
            // Going to Darkness/Code
            voidEl.style.backgroundColor = '#000';
            gateEl.style.backgroundColor = '#4af626';
            gateEl.style.boxShadow = '0 0 30px #4af626';
            labelEl.style.color = '#4af626';
            labelEl.innerText = "INITIALISER LE SYSTEME";
        } else {
            // Going to Light/Standard
            voidEl.style.backgroundColor = '#fff';
            gateEl.style.backgroundColor = '#000';
            gateEl.style.boxShadow = '0 0 30px #000';
            labelEl.style.color = '#000';
            labelEl.innerText = "RETOUR A LA REALITE";
        }

        // 2. Animate Tear Open (CSS Class)
        // Give browser a tick to render display:block
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
            document.getElementById('app').classList.add('blur-transition');
        });
    }

    enterGate() {
        if (!this.isAnimating) return;

        console.log("Entering Gate...");

        // 3. Zoom Effect
        const gateContainer = this.overlay.querySelector('.g-gate-container');
        gateContainer.classList.add('zooming');

        // 4. Trigger State Change mid-zoom (when screen is fully covered by zoom)
        setTimeout(() => {
            if (this.onComplete) this.onComplete(this.direction);

            // 5. Resolve (Fade out to new reality)
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
            this.overlay.style.display = 'none';
            this.overlay.classList.remove('active', 'fading');
            this.overlay.querySelector('.g-gate-container').classList.remove('zooming');
            this.isAnimating = false;
        }, 1000);
    }
}
