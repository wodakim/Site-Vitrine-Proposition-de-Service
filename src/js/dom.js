// src/js/dom.js

export function renderHero(data, container) {
    if (!data) return;
    const section = document.createElement('section');
    section.className = 'grid-container hero-section';

    // Text
    const textDiv = document.createElement('div');
    textDiv.className = 'hero-text';
    textDiv.innerHTML = `
        <h1 class="hero-title">${data.title.replace(/\n/g, '<br>')}</h1>
        <p class="hero-subtitle">${data.subtitle}</p>
        <a href="#contact" class="btn-cta">${data.cta}</a>
    `;

    // Media
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'hero-media';
    mediaDiv.innerHTML = `
        <img src="${data.image}" class="hero-img" alt="Hero" crossorigin="anonymous" data-webgl="hero">
    `;

    section.appendChild(textDiv);
    section.appendChild(mediaDiv);
    container.appendChild(section);
}

export function renderTicker(container) {
    const section = document.createElement('section');
    section.className = 'ticker-section';
    const wrap = document.createElement('div');
    wrap.className = 'ticker-wrap';
    const text = "STRATEGY — BRANDING — DEVELOPMENT — ART DIRECTION — ";
    // Repeat enough times
    let content = "";
    for(let i=0; i<8; i++) content += `<span class="ticker-item">${text}</span>`;
    wrap.innerHTML = content;
    section.appendChild(wrap);
    container.appendChild(section);
}

export function renderAgency(data, container) {
    if (!data) return;
    const section = document.createElement('section');
    section.className = 'grid-container agency-section';

    section.innerHTML = `
        <div class="agency-text">
            <h2 class="agency-manifesto">${data.manifesto}</h2>
        </div>
        <div class="agency-media">
            <img src="${data.media}" class="agency-img" alt="Agency" loading="lazy">
        </div>
    `;
    container.appendChild(section);
}

export function renderServices(data, container) {
    if (!data) return;
    const section = document.createElement('section');
    section.className = 'grid-container services-section';
    section.id = "services";

    const header = document.createElement('h2');
    header.className = 'services-header';
    header.innerText = "Expertise.";

    const grid = document.createElement('div');
    grid.className = 'bento-grid';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bento-card';
        card.innerHTML = `
            <span class="bento-num">${item.id}</span>
            <div>
                <h3 class="bento-title">${item.title}</h3>
                <ul class="bento-list">
                    ${item.list.map(li => `<li>${li}</li>`).join('')}
                </ul>
            </div>
        `;
        grid.appendChild(card);
    });

    section.appendChild(header);
    section.appendChild(grid);
    container.appendChild(section);
}

export function renderProjects(data, container) {
    if (!data) return;
    const section = document.createElement('section');
    section.className = 'grid-container projects-section';
    section.id = "work";

    const header = document.createElement('h2');
    header.className = 'projects-header';
    header.innerText = "Selected Works.";

    const table = document.createElement('div');
    table.className = 'projects-table';

    data.forEach(proj => {
        const row = document.createElement('a');
        row.href = "#";
        row.className = 'project-row';
        row.dataset.img = proj.image; // Hook for WebGL

        row.innerHTML = `
            <span class="p-year">${proj.year}</span>
            <span class="p-client">${proj.client}</span>
            <span class="p-service">${proj.services}</span>
            <span class="p-arrow">↗</span>
        `;
        table.appendChild(row);
    });

    section.appendChild(header);
    section.appendChild(table);
    container.appendChild(section);
}

export function renderFooter(data, container) {
    if (!data) return;
    const section = document.createElement('section');
    section.className = 'grid-container footer-section';
    section.id = "contact";

    section.innerHTML = `
        <div class="footer-main">
            <h2 class="footer-title">${data.title.replace(/\n/g, '<br>')}</h2>
            <a href="mailto:${data.email}" class="btn-cta">${data.cta}</a>
        </div>
        <div style="text-align:center; opacity:0.5; font-size:0.8rem;">
            © ${new Date().getFullYear()} LogoLoom.
        </div>
    `;
    container.appendChild(section);
}
