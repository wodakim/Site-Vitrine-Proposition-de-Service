import { renderPageHeader, renderServices } from '../utils/renderHelpers.js';

export async function render(data, container, params) {
    if (!data) return;

    // Check if params is an ID or query object
    // If it's a string (ID), show detail
    // If it's empty or object, show list

    // In Router: routes['services'](id, queryParams) -> ViewManager.loadPage(Services, id)
    // So params is the ID string if present.

    const serviceId = typeof params === 'string' ? params : null;

    if (serviceId) {
        // Render Service Detail
        const service = data.services.find(s => s.id === serviceId || s.title.toLowerCase().replace(/\s+/g, '-') === serviceId);

        if (service) {
            renderServiceDetail(service, container);
        } else {
             container.innerHTML = "<h1>Service introuvable</h1><a href='#services'>Retour</a>";
        }
    } else {
        // Render Service List (Default)
        renderPageHeader("NOS EXPERTISES", "Des solutions sur mesure pour des marques visionnaires.", container);
        renderServices(data.services, container);

        const cta = document.createElement('div');
        cta.className = 'grid-container';
        cta.style.paddingTop = '0';
        cta.innerHTML = `
            <div style="grid-column: 1/-1; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 40px;">
                <p style="font-size: 2rem; margin-bottom: 20px;">Un projet en tête ?</p>
                <a href="#contact" class="btn-cta">Démarrer une discussion</a>
            </div>
        `;
        container.appendChild(cta);
    }
}

function renderServiceDetail(service, container) {
    renderPageHeader(service.title.toUpperCase(), "Expertise détaillée.", container);

    const section = document.createElement('section');
    section.className = 'grid-container';
    section.style.minHeight = '50vh';

    const content = document.createElement('div');
    content.style.gridColumn = '3 / -1';

    // Ensure list exists before mapping
    const listHtml = service.list ? service.list.map(item => `<li style="margin-bottom: 10px; font-size: 1.2rem;">${item}</li>`).join('') : '';

    content.innerHTML = `
        <div style="margin-bottom: 40px; font-size: 1.5rem; line-height: 1.6;">
            <p>${service.description || "Description détaillée à venir..."}</p>
        </div>
        <h3 style="margin-bottom: 20px; font-family: var(--font-serif);">Ce que nous faisons :</h3>
        <ul style="list-style: none; padding: 0;">
            ${listHtml}
        </ul>
        <div style="margin-top: 60px;">
            <a href="#contact?service=${service.title}" class="btn-cta">Commander ce service</a>
            <a href="#services" class="btn-link" style="margin-left: 20px;">← Retour aux services</a>
        </div>
    `;

    section.appendChild(content);
    container.appendChild(section);
}
