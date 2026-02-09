
export default class SmoothScroll {
    constructor() {
        console.log("[SmoothScroll] Constructor called");
        this.bindMethods();

        this.data = {
            current: 0,
            target: 0,
            last: 0,
            ease: 0.08, // Inertia factor (lower = smoother/slower)
            rounded: 0
        };

        this.dom = {
            el: document.querySelector('#app'), // The content container
            body: document.body
        };

        this.cache = {
            skew: [],
            parallax: []
        };

        this.rAF = null;
        this.isActive = false;

        this.init();
    }

    bindMethods() {
        this.run = this.run.bind(this);
        this.resize = this.resize.bind(this);
    }

    init() {
        console.log("[SmoothScroll] init");
        this.setupStyles();
        this.cacheElements();
        this.on();
    }

    setupStyles() {
        console.log("[SmoothScroll] setupStyles");
        if (!this.dom.el) {
            console.error("Element #app not found in SmoothScroll");
            this.dom.el = document.querySelector('#app');
        }

        if (this.dom.el) {
            // Initial set styles for Virtual Scroll
            Object.assign(this.dom.el.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                willChange: 'transform',
                backfaceVisibility: 'hidden'
            });
        }

        // Ensure body allows scrolling
        this.dom.body.style.overflowY = 'scroll';
    }

    cacheElements() {
        // Cache elements for performance
        const skewEls = document.querySelectorAll('[data-skew]');
        this.cache.skew = Array.from(skewEls).map(el => ({
            el,
            intensity: parseFloat(el.dataset.skew) || 0
        }));

        const parallaxEls = document.querySelectorAll('[data-speed]');
        this.cache.parallax = Array.from(parallaxEls).map(el => ({
            el,
            speed: parseFloat(el.dataset.speed) || 0
        }));

        console.log(`[SmoothScroll] Cached ${this.cache.skew.length} skew elements and ${this.cache.parallax.length} parallax elements.`);
    }

    on() {
        this.setHeight();
        window.addEventListener('resize', this.resize);
        this.isActive = true;
        this.run();
    }

    off() {
        if (this.rAF) cancelAnimationFrame(this.rAF);
        window.removeEventListener('resize', this.resize);
        this.isActive = false;

        // Reset styles
        if (this.dom.el) {
            this.dom.el.style.transform = '';
            this.dom.el.style.position = '';
        }
        this.dom.body.style.height = '';
    }

    setHeight() {
        // Calculate height of the content
        // We use scrollHeight of the fixed container
        if (!this.dom.el) return;
        const height = this.dom.el.scrollHeight;
        console.log(`[SmoothScroll] Setting body height to: ${height}px`);
        this.dom.body.style.height = `${height}px`;
    }

    resize() {
        this.setHeight();
        this.cacheElements(); // Re-cache in case of layout changes
        this.data.current = window.scrollY;
        this.data.target = window.scrollY;
    }

    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    run() {
        this.data.target = window.scrollY;

        // Lerp
        this.data.current = this.lerp(this.data.current, this.data.target, this.data.ease);

        // Round to 2 decimals for performance
        this.data.rounded = Math.round(this.data.current * 100) / 100;

        // Apply Transform
        // We translate the fixed container UP
        if (this.dom.el) {
            this.dom.el.style.transform = `translate3d(0, -${this.data.rounded}px, 0)`;
        }

        // Calculate Velocity for Skew
        const velocity = this.data.target - this.data.current;

        // Apply Parallax & Skew
        this.renderEffects(velocity);

        if (this.isActive) {
            this.rAF = requestAnimationFrame(this.run);
        }
    }

    renderEffects(velocity) {
        // Skew Typography
        this.cache.skew.forEach(item => {
            const skewAmount = velocity * item.intensity * 0.1; // Multiplier
            // Limit skew
            const clampedSkew = Math.max(Math.min(skewAmount, 5), -5);
            item.el.style.transform = `skewY(${clampedSkew}deg)`;
        });

        // Parallax Images/Elements
        this.cache.parallax.forEach(item => {
            // Parallax offset = scroll position * speed factor
            // Since the container moves up by -current, we want the element to move
            // slower (positive translate) or faster (negative translate).
            // data-speed > 0 : slower scroll (far away)
            // data-speed < 0 : faster scroll (closer)
            const y = this.data.current * item.speed;
            item.el.style.transform = `translate3d(0, ${y}px, 0)`;
        });
    }
}
