
import { renderPageHeader, renderProjects, renderFooter } from '../utils/renderHelpers.js';

export async function render(data, container) {
    if (!data) return;

    renderPageHeader("SELECTION PROJETS", "Une exploration de l'intersection entre design et technologie.", container);
    renderProjects(data.projects, container);
    renderFooter(data.footer, container);
}
