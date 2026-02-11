/* src/components/mobileMenu.js */

export default class MobileMenu {
    constructor() {
        this.overlay = null;
        this.toggleBtn = null;
        this.isOpen = false;

        this.init();
    }

    init() {
        // Create Toggle Button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'burger-menu-btn';
        this.toggleBtn.innerHTML = '☰'; // Simple unicode burger
        this.toggleBtn.ariaLabel = "Menu";
        this.toggleBtn.addEventListener('click', () => this.toggle());
        document.body.appendChild(this.toggleBtn);

        // Create Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'mobile-menu-overlay';

        const links = [
            { text: 'Agency', href: '#agency' },
            { text: 'Work', href: '#work' },
            { text: 'Services', href: '#services' },
            { text: 'Contact', href: '#contact' }
        ];

        links.forEach((link, i) => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'mobile-menu-link';
            a.innerText = link.text;
            a.style.transitionDelay = `${i * 0.1}s`;
            a.addEventListener('click', () => this.close());
            this.overlay.appendChild(a);
        });

        // Close Button inside overlay
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '2rem';
        closeBtn.addEventListener('click', () => this.close());
        this.overlay.appendChild(closeBtn);

        document.body.appendChild(this.overlay);
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        this.isOpen = true;
        this.overlay.classList.add('active');
        this.toggleBtn.style.opacity = '0';
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.remove('active');
        this.toggleBtn.style.opacity = '1';
        document.body.style.overflow = '';
    }
}
