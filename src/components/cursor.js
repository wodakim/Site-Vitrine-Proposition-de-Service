export default class Cursor {
    constructor() {
        this.render = this.render.bind(this);
        this.update = this.update.bind(this);

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.mouse = { x: this.width / 2, y: this.height / 2 };
        this.target = { x: this.width / 2, y: this.height / 2 };

        this.points = [];
        this.nPoints = 20;
        this.stiffness = 0.15;

        this.isHovering = false;

        for (let i = 0; i < this.nPoints; i++) {
            this.points.push({ x: this.mouse.x, y: this.mouse.y });
        }

        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '20000';
        this.canvas.style.mixBlendMode = 'difference';
        this.canvas.style.opacity = '0';
        this.canvas.style.transition = 'opacity 0.5s ease';

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        document.body.appendChild(this.canvas);

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        const activateCursor = () => {
            this.canvas.style.opacity = '1';
            document.body.classList.add('custom-cursor-active');
            window.removeEventListener('click', activateCursor);
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

        document.addEventListener('mouseover', (e) => {
            const el = e.target.closest('[data-hover="magnetic"]');
            if (el) {
                this.isHovering = true;
                this.stiffness = 0.25;
            }
        });

        document.addEventListener('mouseout', (e) => {
             const el = e.target.closest('[data-hover="magnetic"]');
             if (el) {
                 this.isHovering = false;
                 this.stiffness = 0.15;
             }
        });
    }

    update() {
        this.target.x = this.mouse.x;
        this.target.y = this.mouse.y;

        let head = this.points[0];
        head.x += (this.target.x - head.x) * (this.isHovering ? 0.2 : 0.6);
        head.y += (this.target.y - head.y) * (this.isHovering ? 0.2 : 0.6);

        for (let i = 1; i < this.nPoints; i++) {
            let p = this.points[i];
            let prev = this.points[i - 1];
            p.x += (prev.x - p.x) * this.stiffness;
            p.y += (prev.y - p.y) * this.stiffness;
        }
    }

    render() {
        this.update();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#EAEAEA';
        this.ctx.lineWidth = this.isHovering ? 2 : 1.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

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

        this.ctx.beginPath();
        this.ctx.arc(this.points[0].x, this.points[0].y, this.isHovering ? 6 : 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#EAEAEA';
        this.ctx.fill();

        requestAnimationFrame(this.render);
    }
}
