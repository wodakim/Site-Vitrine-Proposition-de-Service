
// src/components/renderer.js

export function renderHero(data, container) {
    if (!data) return;
    const section = document.createElement('section');
    section.className = 'hero-section';

    // Kinetic Typography Container
    // Split for animation
    const kineticText = data.title.split('\n').map(line => `<span class="kinetic-line">${line}</span>`).join('<br>');

    section.innerHTML = `
        <div class="hero-content">
            <h1 class="hero-title">${kineticText}</h1>
            <p class="hero-subtitle">${data.subtitle}</p>
            <a href="#contact" class="btn-cta" data-hover="magnetic">${data.cta}</a>
        </div>
        <!-- Background placeholder (CSS Only) -->
        <div class="hero-bg" style="background-image: url('assets/nebula.jpg'); opacity: 0.2; background-size: cover; background-position: center; mix-blend-mode: exclusion;"></div>
    `;
    container.appendChild(section);
}

export function renderAgency(data, container) {
    if (!data) return;
    const section = document.createElement('section');
    section.className = 'agency-section grid-container';

    section.innerHTML = `
        <div class="agency-text">
            <h2 class="agency-manifesto">${data.manifesto}</h2>
        </div>
        <div class="agency-media">
            <!-- Lazy load image -->
            <img src="${data.media}" class="agency-img" alt="Agency" loading="lazy">
        </div>
    `;
    container.appendChild(section);
}

export function renderServices(data, container) {
    if (!data || !Array.isArray(data)) return;
    const section = document.createElement('section');
    section.className = 'services-section grid-container';
    section.id = "services";

    const header = document.createElement('h2');
    header.className = 'section-header';
    header.innerText = "Expertise.";

    const grid = document.createElement('div');
    grid.className = 'services-grid';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <span class="service-id">${item.id}</span>
            <h3 class="service-title">${item.title}</h3>
            <ul class="service-list">
                ${item.list.map(li => `<li>${li}</li>`).join('')}
            </ul>
        `;
        grid.appendChild(card);
    });

    section.appendChild(header);
    section.appendChild(grid);
    container.appendChild(section);
}

export function renderProjects(data, container) {
    if (!data || !Array.isArray(data)) return;
    const section = document.createElement('section');
    section.className = 'projects-section grid-container';
    section.id = "work";

    const header = document.createElement('h2');
    header.className = 'section-header';
    header.innerText = "Sélection.";

    const list = document.createElement('div');
    list.className = 'projects-list';

    data.forEach(proj => {
        const row = document.createElement('div'); // Div because we handle click differently now
        row.className = 'project-row';
        row.dataset.img = proj.image; // Hook for Hover

        row.innerHTML = `
            <span class="p-client">${proj.client}</span>
            <span class="p-title">${proj.title}</span>
            <span class="p-service">${proj.services}</span>
            <span class="p-year">${proj.year}</span>
        `;
        list.appendChild(row);
    });

    section.appendChild(header);
    section.appendChild(list);
    container.appendChild(section);
}

export function renderFooter(data, container) {
    if (!data) return;
    const section = document.createElement('footer');
    section.className = 'footer-section grid-container';
    section.id = "contact";

    section.innerHTML = `
        <div class="footer-main">
            <h2 class="footer-title">${data.title.replace(/\n/g, '<br>')}</h2>
            <a href="mailto:${data.email}" class="footer-email btn-cta" data-hover="magnetic">${data.email}</a>
            <a href="#" class="footer-cta">${data.cta}</a>
        </div>
        <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} LogoLoom.</span>
            <span>Paris, France.</span>
        </div>
    `;
    container.appendChild(section);
}
