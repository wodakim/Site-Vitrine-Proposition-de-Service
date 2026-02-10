
import { renderPageHeader, renderAgency, renderFooter } from '../utils/renderHelpers.js';

export async function render(data, container) {
    if (!data) return;

    renderPageHeader("L'AGENCE", "Nous tissons des héritages numériques.", container);
    renderAgency(data.agency, container);

    // Extra Content
    const extra = document.createElement('div');
    extra.className = 'grid-container';
    extra.innerHTML = `
        <div style="grid-column: 1/-1; padding-top: 40px; opacity: 0.8; font-family: var(--font-serif); font-size: 1.5rem;">
            <p>Fondée en 2020, LogoLoom repousse les limites de l'expérience web. Notre équipe de designers et développeurs passionnés travaille à la croisée de l'art et de la technique.</p>
        </div>
    `;
    container.appendChild(extra);

    renderFooter(data.footer, container);
}
