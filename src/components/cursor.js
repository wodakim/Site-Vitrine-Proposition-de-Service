export default class Cursor {
    constructor() {
        // Bind methods
        this.render = this.render.bind(this);
        this.update = this.update.bind(this);

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.mouse = { x: this.width / 2, y: this.height / 2 };
        this.target = { x: this.width / 2, y: this.height / 2 }; // Where the head wants to go

        this.points = [];
        this.nPoints = 20; // Number of segments in the thread
        this.stiffness = 0.15; // Increased slightly for tighter trail
        this.damping = 0.8;

        this.isHovering = false;
        this.activeElement = null; // Store reference for re-calc

        this.animationId = null;
        this.isPaused = false;

        // Init points
        for (let i = 0; i < this.nPoints; i++) {
            this.points.push({ x: this.mouse.x, y: this.mouse.y });
        }

        this.init();
    }

    pause() {
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.render();
        }
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '20000'; // Above everything, including Garganta
        this.canvas.style.mixBlendMode = 'difference';
        this.canvas.style.opacity = '0'; // Hidden initially
        this.canvas.style.transition = 'opacity 0.5s ease';

        // Set actual resolution
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        document.body.appendChild(this.canvas);

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Activate Custom Cursor on First Click
        const activateCursor = () => {
            this.canvas.style.opacity = '1';
            document.body.classList.add('custom-cursor-active');
            window.removeEventListener('click', activateCursor);

            // Sync initial position immediately
            this.points.forEach(p => {
                p.x = this.mouse.x;
                p.y = this.mouse.y;
            });
        };
        window.addEventListener('click', activateCursor);

        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Hover Delegation
        document.addEventListener('mouseover', (e) => {
            const el = e.target.closest('[data-hover="magnetic"]');
            if (el) {
                this.isHovering = true;
                this.activeElement = el;
                this.stiffness = 0.25;
            }
        });

        document.addEventListener('mouseout', (e) => {
             const el = e.target.closest('[data-hover="magnetic"]');
             if (el) {
                 this.isHovering = false;
                 this.activeElement = null;
                 this.stiffness = 0.15;
             }
        });
    }

    update() {
        // If hovering, update target to element center (in case of scroll)
        if (this.isHovering && this.activeElement) {
            const rect = this.activeElement.getBoundingClientRect();
            this.target.x = rect.left + rect.width / 2;
            this.target.y = rect.top + rect.height / 2;
        } else {
            this.target.x = this.mouse.x;
            this.target.y = this.mouse.y;
        }

        // Physics: Head follows target (Mouse or Element)
        let head = this.points[0];

        // Lerp head position - Increased for better responsiveness (was 0.25)
        head.x += (this.target.x - head.x) * (this.isHovering ? 0.2 : 0.6);
        head.y += (this.target.y - head.y) * (this.isHovering ? 0.2 : 0.6);

        // Tail points (Verlet-ish / Spring Chain)
        for (let i = 1; i < this.nPoints; i++) {
            let p = this.points[i];
            let prev = this.points[i - 1];

            // Move towards previous point
            // Distance constraint?
            // Simple ease:
            p.x += (prev.x - p.x) * this.stiffness;
            p.y += (prev.y - p.y) * this.stiffness;
        }
    }

    render() {
        this.update();

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Thread
        this.ctx.beginPath();

        // Mix-blend-mode difference makes white -> black on white bg.
        this.ctx.strokeStyle = '#EAEAEA';

        // If hovering, thicken the line slightly
        this.ctx.lineWidth = this.isHovering ? 2 : 1.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Move to first point
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

        // Curve through points (Catmull-Rom or Quadratic)
        for (let i = 1; i < this.nPoints - 1; i++) {
            const p = this.points[i];
            const next = this.points[i + 1];

            const xc = (p.x + next.x) / 2;
            const yc = (p.y + next.y) / 2;

            this.ctx.quadraticCurveTo(p.x, p.y, xc, yc);
        }

        const last = this.points[this.nPoints - 1];
        this.ctx.lineTo(last.x, last.y);

        this.ctx.stroke();

        // Draw Dot at Head (The "Needle")
        this.ctx.beginPath();
        this.ctx.arc(this.points[0].x, this.points[0].y, this.isHovering ? 6 : 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#EAEAEA';
        this.ctx.fill();

        if (!this.isPaused) {
            this.animationId = requestAnimationFrame(this.render);
        }
    }
}
