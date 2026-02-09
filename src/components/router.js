
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
        const rawHash = window.location.hash.slice(1); // Remove '#'
        if (rawHash === this.currentHash) return;

        this.currentHash = rawHash;

        // Parse Query String: #contact?service=web
        const [path, queryString] = rawHash.split('?');
        const queryParams = {};
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                queryParams[key] = decodeURIComponent(value);
            });
        }

        // Parse route: project/123 -> type: 'project', id: '123'
        const parts = path.split('/');
        const type = parts[0] || 'home';
        const id = parts[1];

        console.log(`[Router] Navigating to: ${type} (ID: ${id}) Params:`, queryParams);

        // Execute Route Callback
        if (this.routes[type]) {
            this.routes[type](id, queryParams);
        } else {
            // Default to home if route not found
            if (this.routes['home']) this.routes['home']();
        }
    }
}
