
export default class Router {
    constructor(routes) {
        this.routes = routes; // Map of 'route' -> callback
        this.currentHash = null; // Init as null so first load triggers

        this.handleHashChange = this.handleHashChange.bind(this);
    }

    init() {
        window.addEventListener('hashchange', this.handleHashChange);
        this.handleHashChange(); // Handle initial load
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1); // Remove '#'
        if (hash === this.currentHash) return;

        this.currentHash = hash;

        // Parse route: #project/123 -> type: 'project', id: '123'
        const parts = hash.split('/');
        const type = parts[0] || 'home';
        const id = parts[1];

        console.log(`[Router] Navigating to: ${type} (ID: ${id})`);

        // Execute Route Callback
        if (this.routes[type]) {
            this.routes[type](id);
        } else {
            // Default to home if route not found
            if (this.routes['home']) this.routes['home']();
        }
    }
}
