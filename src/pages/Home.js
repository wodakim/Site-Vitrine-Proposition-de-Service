
import { renderHero, renderAgency, renderServices, renderProjects, renderFooter } from '../utils/renderHelpers.js';

export async function render(data, container) {
    if (!data) return;

    // Homepage Sequence
    renderHero(data.hero, container);
    renderAgency(data.agency, container);
    renderServices(data.services, container);
    renderProjects(data.projects, container);
    renderFooter(data.footer, container);
}
