
import Router from './core/Router.js';
import ViewManager from './core/ViewManager.js';
import ScrollManager from './core/ScrollManager.js';
import TransitionManager from './core/TransitionManager.js';

import * as Home from './pages/Home.js';
import * as Agency from './pages/Agency.js';
import * as Services from './pages/Services.js';
import * as Work from './pages/Work.js';
import * as Project from './pages/Project.js';
import * as Contact from './pages/Contact.js';

import Cursor from './components/cursor.js';
import LiquidEffect from './components/liquid.js';

class App {
    constructor() {
        this.scrollManager = null;
        this.router = null;
        this.viewManager = null;
        this.transitionManager = null;
        this.liquidEffect = null;
        this.data = null;
        this.container = null;
        this.loader = null;

        this.toggleRetroMode = this.toggleRetroMode.bind(this);
    }

    async init() {
        console.log("LogoLoom: Init (Standard Mode - Refactored)");
        this.loader = document.getElementById('loader');
        this.container = document.getElementById('app');

        // Add Noise Overlay
        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        document.body.appendChild(noise);

        // Components
        this.createNav();
        this.createToggle();
        new Cursor();

        // Transition Manager
        this.transitionManager = new TransitionManager();
        this.checkEntrance();

        // Scroll Manager
        this.scrollManager = new ScrollManager();

        try {
            const response = await fetch('./src/data/data.json');
            this.data = await response.json();

            // View Manager
            this.viewManager = new ViewManager(
                this.container,
                this.data,
                this.scrollManager,
                this.transitionManager
            );

            // Router
            this.initRouter();

            // Liquid Effect
            const thumbContainer = document.getElementById('project-thumb-container');
            if (thumbContainer) {
                // Initialize Liquid Effect
                this.liquidEffect = new LiquidEffect(thumbContainer);
                this.initProjectHover(thumbContainer);
            }

            // Hide Loader
            setTimeout(() => {
                if (this.loader) {
                    this.loader.style.opacity = '0';
                    setTimeout(() => this.loader.remove(), 600);
                }
            }, 500);

        } catch (error) {
            console.error("App Init Error:", error);
        }
    }

    checkEntrance() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'retro') {
            this.transitionManager.playEntrance();
        }
    }

    createNav() {
        const nav = document.createElement('nav');
        nav.className = 'main-nav';
        nav.id = 'main-nav';
        nav.innerHTML = `
            <a href="#home" class="nav-logo">LOGOLOOM</a>
            <div class="nav-links">
                <a href="#agency" data-hover="magnetic">Agency</a>
                <a href="#work" data-hover="magnetic">Work</a>
                <a href="#services" data-hover="magnetic">Services</a>
                <a href="#contact" data-hover="magnetic">Contact</a>
            </div>
        `;
        document.body.appendChild(nav);
    }

    createToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'mode-toggle';
        toggleBtn.className = 'mode-toggle';
        toggleBtn.innerText = '●';
        toggleBtn.title = "Switch Reality";
        toggleBtn.addEventListener('click', this.toggleRetroMode);
        document.body.appendChild(toggleBtn);
    }

    toggleRetroMode() {
        this.transitionManager.startTransition(() => {
            window.location.href = 'retro.html?from=standard';
        }, 'toRetro');
    }

    initRouter() {
        const routes = {
            'home': () => this.viewManager.loadPage(Home),
            'agency': () => this.viewManager.loadPage(Agency),
            'services': () => this.viewManager.loadPage(Services),
            'work': () => this.viewManager.loadPage(Work),
            'project': (id) => this.viewManager.loadPage(Project, id),
            'contact': (id, params) => this.viewManager.loadPage(Contact, params)
        };

        this.router = new Router(routes);
        this.router.init();
    }

    initProjectHover(thumbContainer) {
        const img = document.getElementById('project-thumb-img');

        // Mouse Move for Thumbnail Position
        window.addEventListener('mousemove', (e) => {
            if (thumbContainer.style.opacity !== '0') {
                thumbContainer.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            }
        });

        // Mouse Enter/Leave Projects
        // We use event delegation on 'app' because projects are dynamic
        this.container.addEventListener('mouseover', (e) => {
             const row = e.target.closest('.project-row');
             if (row) {
                 const url = row.dataset.img;
                 if (url) {
                     if (this.liquidEffect) {
                         this.liquidEffect.setImage(url);
                     } else if (img) {
                         img.src = url;
                     }
                     thumbContainer.style.opacity = '1';
                 }
             }
        });

        this.container.addEventListener('mouseout', (e) => {
             const row = e.target.closest('.project-row');
             if (row) {
                 thumbContainer.style.opacity = '0';
             }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App().init();
});
