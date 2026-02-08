export default class WebGLManager {
    constructor() {
        this.curtains = null;
        this.scrollOffset = 0;
    }

    init() {
        // Initialisation de Curtains.js
        if (!window.Curtains) {
            console.error('Curtains.js not found');
            return;
        }

        this.curtains = new window.Curtains({
            container: "canvas",
            watchScroll: false, // Désactivé pour synchronisation manuelle avec Lenis
            pixelRatio: Math.min(1.5, window.devicePixelRatio) // Perf optimization
        });

        this.curtains.onError(() => {
            document.body.classList.add("no-curtains");
        });

        console.log('WebGL Manager Initialized');
    }

    render() {
        if (this.curtains) {
            this.curtains.render();
        }
    }

    updateScroll(offset) {
        if (this.curtains) {
            this.scrollOffset = offset;
            this.curtains.updateScrollValues(0, offset);
        }
    }

    resize() {
        if (this.curtains) {
            // Recalculer les tailles des plans
            this.curtains.resize();
        }
    }

    // Méthode pour ajouter des plans
    addPlane(element, params) {
        if (!this.curtains) return null;
        return this.curtains.addPlane(element, params);
    }
}
