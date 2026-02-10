
import { renderPageHeader, renderFooter } from '../utils/renderHelpers.js';

export async function render(data, container, params) {
    if (!data) return;

    renderPageHeader("CONTACT", "Prêt à tisser votre future identité numérique ?", container);

    const section = document.createElement('section');
    section.className = 'contact-form-section grid-container';
    section.style.minHeight = '60vh';

    // Handle query params (e.g. ?service=web)
    // In Router, `queryParams` is passed as 2nd arg.
    // ViewManager needs to pass it through.

    const preSelectedService = params && params.service ? params.service : '';

    let options = '<option value="" disabled selected>Sélectionnez un sujet</option>';
    if (data.services) {
        data.services.forEach(s => {
            const isSelected = (s.id.toLowerCase() === String(preSelectedService).toLowerCase()) ||
                               (s.title.toLowerCase().includes(String(preSelectedService).toLowerCase()));
            options += `<option value="${s.title}" ${isSelected ? 'selected' : ''}>${s.title}</option>`;
        });
    }
    options += `<option value="Autre">Autre demande</option>`;

    section.innerHTML = `
        <div style="grid-column: 4 / -1;">
            <form id="contact-form" class="contact-form">
                <div class="form-group">
                    <label for="name">Nom / Entreprise</label>
                    <input type="text" id="name" name="name" required placeholder="Votre nom">
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required placeholder="votre@email.com">
                </div>

                <div class="form-group">
                    <label for="service">Sujet</label>
                    <div class="select-wrapper">
                        <select id="service" name="service" required>
                            ${options}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" required rows="5" placeholder="Parlez-nous de votre projet..."></textarea>
                </div>

                <div class="form-actions" style="margin-top:40px;">
                    <button type="submit" class="btn-cta" data-hover="magnetic">Envoyer le message</button>
                </div>
            </form>
        </div>
    `;

    container.appendChild(section);

    // Add Event Listener for form
    const form = section.querySelector('#contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Simulation: Message envoyé !');
    });

    renderFooter(data.footer, container);
}
