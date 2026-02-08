export default class Router {
    constructor(app) {
        this.app = app;
        this.isNavigating = false;
    }

    init() {
        if (!window.barba) {
            console.error('Barba.js not found');
            return;
        }

        const self = this;

        barba.init({
            debug: true,
            transitions: [{
                name: 'default-transition',
                leave(data) {
                    self.isNavigating = true;
                    // Animation de sortie (GSAP)
                    return gsap.to(data.current.container, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => {
                            // Nettoyage WebGL / Events
                            if (self.app.webglManager) {
                                // self.app.webglManager.destroyPlanes();
                            }
                        }
                    });
                },
                enter(data) {
                    self.isNavigating = false;
                    // Re-initialisation du scroll (Lenis)
                    if (self.app.lenis) {
                        self.app.lenis.scrollTo(0, { immediate: true });
                    }

                    // Animation d'entrée
                    return gsap.from(data.next.container, {
                        opacity: 0,
                        duration: 0.5,
                        onStart: () => {
                            // Initialisation des nouveaux composants / WebGL
                            // self.app.initPage(data.next.container);
                        }
                    });
                }
            }],
            views: []
        });

        barba.hooks.beforeLeave(() => {
            // Nettoyage events lourds
            ScrollTrigger.getAll().forEach(t => t.kill());
        });

        barba.hooks.after(() => {
            // Rafraichir ScrollTrigger après transition
            ScrollTrigger.refresh();
        });
    }
}
