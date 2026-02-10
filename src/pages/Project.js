
import { renderProjectDetail } from '../utils/renderHelpers.js';

export async function render(data, container, params) {
    // Determine project ID from params
    // params comes from Router as the first argument after container?
    // Wait, ViewManager calls `pageModule.render(this.data, this.container, params)`
    // Router passes `id` as first param.
    // So params here is actually the ID if it's passed as such.

    // Actually ViewManager signature: `loadPage(pageModule, params)`
    // Then `pageModule.render(data, container, params)`

    const id = params; // In router.js, it passes `id` as first arg to callback.
    // Router: routes[type](id, queryParams) -> ViewManager.loadPage(Project, id) -> Project.render(data, container, id)

    const project = data.projects.find(p => p.id === id);

    if (!project) {
        container.innerHTML = "<h1>Projet introuvable</h1><a href='#work'>Retour</a>";
        return;
    }

    renderProjectDetail(project, container);
}
