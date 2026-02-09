
// src/components/renderer.js

export function renderHero(data, container) {
    if (!data) return;
    const section = document.createElement('section');
    section.className = 'hero-section';

    // Kinetic Typography Container
    // Split for animation & Staggered Reveal
    const kineticText = data.title.split('\n').map((line, i) => {
        const delay = i * 0.15;
        // Wrapped in reveal-line for slide-up effect
        return `<span class="reveal-line-wrapper"><span class="kinetic-line reveal-line" data-skew="0.15" style="transition-delay: ${delay}s">${line}</span></span>`;
    }).join('<br>');

    section.innerHTML = `
        <div class="hero-content">
            <h1 class="hero-title">${kineticText}</h1>
            <p class="hero-subtitle reveal-hidden" style="transition-delay: 0.5s" data-speed="0.05">${data.subtitle}</p>
            <a href="#contact" class="btn-cta reveal-hidden" style="transition-delay: 0.7s" data-hover="magnetic">${data.cta}</a>
        </div>
        <!-- Background placeholder (CSS Only) -->
        <div class="hero-bg" data-speed="-0.1" style="background-image: url('assets/nebula.jpg'); opacity: 0.2; background-size: cover; background-position: center; mix-blend-mode: exclusion;"></div>
    `;
    container.appendChild(section);
}

export function renderAgency(data, container) {
    if (!data) return;
    const section = document.createElement('section');
    section.className = 'agency-section grid-container';

    // Split Manifesto into Words for Stagger Reveal
    const words = data.manifesto.split(' ').map((word, i) => {
        const delay = i * 0.03; // Fast stagger
        return `<span class="word-wrapper"><span class="word-reveal" style="transition-delay: ${delay}s">${word}</span></span>`;
    }).join(''); // Space margin handled by CSS margin-right

    section.innerHTML = `
        <div class="agency-text">
            <h2 class="agency-manifesto" data-skew="0.1">${words}</h2>
        </div>
        <div class="agency-media reveal-hidden" data-speed="0.1" style="transition-delay: 0.5s">
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
    header.className = 'section-header reveal-hidden';
    header.innerText = "Expertise.";
    header.dataset.skew = "0.1";

    const grid = document.createElement('div');
    grid.className = 'services-grid';

    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'service-card reveal-hidden';
        card.style.transitionDelay = `${index * 0.1}s`;
        card.dataset.speed = (index % 2 === 0) ? "0" : "0.05"; // Stagger effect
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
    header.className = 'section-header reveal-hidden';
    header.innerText = "Sélection.";
    header.dataset.skew = "0.1";

    const list = document.createElement('div');
    list.className = 'projects-list';

    data.forEach((proj, index) => {
        // Changed to anchor tag for routing
        const row = document.createElement('a');
        row.href = `#project/${proj.id}`;
        row.className = 'project-row reveal-hidden';
        row.style.transitionDelay = `${index * 0.1}s`;
        row.dataset.img = proj.image; // Hook for Hover
        row.dataset.skew = "0.05"; // Slight skew on rows

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

    // Split footer title into lines
    const titleLines = data.title.split('\n').map((line, i) => {
         return `<span class="reveal-line-wrapper"><span class="reveal-line" style="transition-delay: ${i*0.2}s">${line}</span></span>`;
    }).join('<br>');

    section.innerHTML = `
        <div class="footer-main">
            <h2 class="footer-title" data-skew="0.15">${titleLines}</h2>
            <a href="mailto:${data.email}" class="footer-email btn-cta reveal-hidden" style="transition-delay: 0.4s" data-hover="magnetic">${data.email}</a>
            <a href="#" class="footer-cta reveal-hidden" style="transition-delay: 0.6s">${data.cta}</a>
        </div>
        <div class="footer-bottom reveal-hidden" style="transition-delay: 0.8s">
            <span>© ${new Date().getFullYear()} LogoLoom.</span>
            <span>Paris, France.</span>
        </div>
    `;
    container.appendChild(section);
}

export function renderProjectDetail(project, container) {
    if (!project) return;

    const section = document.createElement('section');
    section.className = 'project-detail-section';

    // Back Button
    const backBtn = document.createElement('a');
    backBtn.href = "#"; // Triggers home
    backBtn.className = "back-btn reveal-hidden"; // Initial state
    backBtn.innerText = "← Retour";

    section.appendChild(backBtn);

    // Title (Split for reveal)
    const title = document.createElement('h1');
    title.className = "detail-title";
    title.dataset.skew = "0.2";

    // Split title words
    const titleWords = project.title.split(' ').map((w, i) =>
        `<span class="word-wrapper"><span class="word-reveal" style="transition-delay: ${i*0.1}s">${w}</span></span>`
    ).join('');

    title.innerHTML = titleWords;
    section.appendChild(title);

    // Meta
    const meta = document.createElement('div');
    meta.className = "detail-meta reveal-hidden";
    meta.style.transitionDelay = "0.4s";
    meta.innerHTML = `
        <span>CLIENT: ${project.client}</span>
        <span>YEAR: ${project.year}</span>
        <span>SERVICE: ${project.services}</span>
    `;
    section.appendChild(meta);

    // Big Image
    const imgWrapper = document.createElement('div');
    imgWrapper.className = "detail-img-wrapper reveal-hidden";
    imgWrapper.style.transitionDelay = "0.5s";
    imgWrapper.dataset.speed = "0.1";

    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;
    img.className = "detail-img";

    imgWrapper.appendChild(img);
    section.appendChild(imgWrapper);

    // Description
    const desc = document.createElement('div');
    desc.className = "detail-desc reveal-hidden";
    desc.style.transitionDelay = "0.7s";
    desc.innerHTML = `
        <p>Une approche sur mesure pour ${project.client}. Nous avons exploré les frontières du design numérique pour créer une identité visuelle unique.</p>
        <p>Le projet combine typographie cinétique et interactions fluides pour capturer l'essence de la marque.</p>
    `;
    section.appendChild(desc);

    container.appendChild(section);
}
