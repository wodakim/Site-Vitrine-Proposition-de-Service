
import { renderPageHeader, renderServices } from '../utils/renderHelpers.js';

export async function render(data, container) {
    if (!data) return;

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
