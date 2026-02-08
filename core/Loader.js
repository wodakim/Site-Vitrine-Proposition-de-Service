export default class Loader {
    constructor() {
        this.element = document.getElementById('loader');
        this.progress = this.element.querySelector('.loader-progress');
    }

    updateProgress(value) {
        if (this.progress) {
            this.progress.innerText = `${Math.round(value)}%`;
        }
    }

    hide() {
        // Simple fade out for now, can be enhanced with GSAP
        if (this.element) {
            this.element.style.transition = 'opacity 0.5s ease';
            this.element.style.opacity = '0';
            this.element.style.pointerEvents = 'none';

            // Ensure display: none after transition
            setTimeout(() => {
                this.element.style.display = 'none';
            }, 500);
        }
    }
}
