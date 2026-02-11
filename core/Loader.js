export default class Loader {
    constructor() {
        this.element = document.getElementById('loader');
        this.progress = this.element.querySelector('.loader-progress');
        this.currentValue = 0;
        this.rafId = null;
    }

    updateProgress(targetValue) {
        if (!this.progress) return;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        const start = this.currentValue;
        const end = targetValue;
        const duration = 500; // ms
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            this.currentValue = Math.floor(start + (end - start) * ease);
            this.progress.innerText = `${this.currentValue}%`;

            if (progress < 1) {
                this.rafId = requestAnimationFrame(animate);
            } else {
                this.rafId = null;
            }
        };

        this.rafId = requestAnimationFrame(animate);
    }

    hide() {
        if (this.element) {
            this.updateProgress(100);

            setTimeout(() => {
                this.element.style.transition = 'opacity 0.8s ease';
                this.element.style.opacity = '0';
                this.element.style.pointerEvents = 'none';

                // Ensure display: none after transition
                setTimeout(() => {
                    this.element.style.display = 'none';
                }, 800);
            }, 500); // Wait for 100% to show
        }

        return new Promise(resolve => setTimeout(resolve, 1300));
    }
}
