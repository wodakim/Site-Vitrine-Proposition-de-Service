
import RetroRenderer from './components/retroRenderer.js';
import TransitionManager from './core/TransitionManager.js';
import Cursor from './components/cursor.js';

// Retro App (Secondary Entry)
class RetroApp {
    constructor() {
        this.retroRenderer = null;
        this.transitionManager = null;
        this.data = null;
        this.container = null;
        this.loader = null;
        this.toggleRetroMode = this.toggleRetroMode.bind(this);
    }

    async init() {
        console.log("LogoLoom: Init (Retro Mode)");
        this.loader = document.getElementById('loader');
        this.container = document.getElementById('app');

        // Add Noise
        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        document.body.appendChild(noise);

        // Init Transition Manager
        this.transitionManager = new TransitionManager();

        // Check Entrance
        this.checkEntrance();

        // Add Switch
        this.createToggle();

        // Init Cursor (Physics String)
        new Cursor();

        try {
            const response = await fetch('./src/data/data.json');
            this.data = await response.json();

            // Init Retro Renderer
            this.retroRenderer = new RetroRenderer(this.data, this.container);
            this.retroRenderer.init();

            // Hide Loader
            setTimeout(() => {
                if (this.loader) {
                    this.loader.style.opacity = '0';
                    setTimeout(() => this.loader.remove(), 600);
                }
            }, 500);

        } catch (error) {
            console.error("Error Retro:", error);
        }
    }

    checkEntrance() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'standard') {
            // We arrived from Standard mode.
            // Play "Exit" animation (Fade out void)
            this.transitionManager.playEntrance();
        }
    }

    createToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'mode-toggle';
        toggleBtn.className = 'mode-toggle retro';
        toggleBtn.innerText = '●';
        toggleBtn.title = "Switch Reality";
        toggleBtn.addEventListener('click', this.toggleRetroMode);
        document.body.appendChild(toggleBtn);
    }

    toggleRetroMode() {
        // Trigger Transition -> Navigate back to Standard
        this.transitionManager.startTransition(() => {
            window.location.href = 'index.html?from=retro';
        }, 'toStandard');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new RetroApp().init();
});
