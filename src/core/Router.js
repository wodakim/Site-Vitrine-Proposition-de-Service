
export default class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentHash = null;
        this.handleHashChange = this.handleHashChange.bind(this);
    }

    init() {
        window.addEventListener('hashchange', this.handleHashChange);
        // Handle initial load
        if (!window.location.hash) {
            window.location.hash = '#home';
        } else {
            this.handleHashChange();
        }
    }

    handleHashChange() {
        const rawHash = window.location.hash.slice(1) || 'home';
        if (rawHash === this.currentHash) return;

        this.currentHash = rawHash;

        const [path, queryString] = rawHash.split('?');
        const queryParams = {};
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                queryParams[key] = decodeURIComponent(value);
            });
        }

        const parts = path.split('/');
        const type = parts[0] || 'home';
        const id = parts[1];

        console.log(`[Router] Navigating to: ${type} (ID: ${id})`);

        if (this.routes[type]) {
            this.routes[type](id, queryParams);
        } else {
            console.warn(`[Router] Route not found: ${type}`);
            if (this.routes['home']) this.routes['home']();
        }
    }
}
