
// src/components/renderer.js

// --- HELPER: PAGE HEADER ---
export function renderPageHeader(title, subtitle, container) {
    const section = document.createElement('section');
    section.className = 'page-header-section';
    section.style.padding = 'var(--pad)';
    section.style.paddingTop = '150px'; // Space for fixed nav
    section.style.paddingBottom = '50px';
    section.style.minHeight = '40vh';
    section.style.display = 'flex';
    section.style.flexDirection = 'column';
    section.style.justifyContent = 'flex-end';

    // Kinetic Typography for Title
    const kineticText = title.split(' ').map((word, i) => {
        const delay = i * 0.1;
        return `<span class="reveal-line-wrapper"><span class="kinetic-line reveal-line" data-skew="0.1" style="transition-delay: ${delay}s; font-size: clamp(3rem, 8vw, 6rem); line-height: 0.9;">${word}</span></span>`;
    }).join(' ');

    let subHtml = '';
    if (subtitle) {
        subHtml = `<p class="reveal-hidden" style="transition-delay: 0.3s; margin-top: 20px; max-width: 600px; font-size: 1.2rem; opacity: 0.7;">${subtitle}</p>`;
    }

    section.innerHTML = `
        <h1 class="page-title">${kineticText}</h1>
        ${subHtml}
    `;
    container.appendChild(section);
}


// --- PAGE RENDERERS ---

// 1. AGENCY PAGE
export function renderAgencyPage(data, container) {
    if (!data) return;
    renderPageHeader("L'AGENCE", "Nous tissons des héritages numériques.", container);
    renderAgency(data, container); // Reuse the agency section content

    // Additional "Team" or "History" filler for the page feel
    const extra = document.createElement('div');
    extra.className = 'grid-container';
    extra.innerHTML = `
        <div style="grid-column: 1/-1; padding-top: 40px; opacity: 0.8; font-family: var(--font-serif); font-size: 1.5rem;">
            <p>Fondée en 2020, LogoLoom repousse les limites de l'expérience web. Notre équipe de designers et développeurs passionnés travaille à la croisée de l'art et de la technique.</p>
        </div>
    `;
    container.appendChild(extra);
}

// 2. SERVICES PAGE
export function renderServicesPage(data, container) {
    if (!data) return;
    renderPageHeader("NOS EXPERTISES", "Des solutions sur mesure pour des marques visionnaires.", container);

    // Re-use the existing service grid but maybe expanded?
    // For now, reuse renderServices logic but customize class if needed
    renderServices(data, container);

    // Maybe add a call to action at the bottom of the page?
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

// 2. WORK PAGE
export function renderWorkPage(data, container) {
    if (!data) return;
    renderPageHeader("SELECTION PROJETS", "Une exploration de l'intersection entre design et technologie.", container);

    // Reuse renderProjects
    renderProjects(data, container);
}

// 3. CONTACT PAGE
export function renderContactPage(data, services, queryParams, container) {
    if (!data) return;
    renderPageHeader("CONTACT", "Prêt à tisser votre future identité numérique ?", container);

    // Create Form Section
    const section = document.createElement('section');
    section.className = 'contact-form-section grid-container';
    section.style.minHeight = '60vh';

    // Determine pre-selected service
    const preSelectedService = queryParams && queryParams.service ? queryParams.service : '';

    // Build Service Options
    let options = '<option value="" disabled selected>Sélectionnez un sujet</option>';
    if (services && Array.isArray(services)) {
        services.forEach(s => {
            const isSelected = (s.id.toLowerCase() === preSelectedService.toLowerCase()) ||
                               (s.title.toLowerCase().includes(preSelectedService.toLowerCase()));
            options += `<option value="${s.title}" ${isSelected ? 'selected' : ''}>${s.title}</option>`;
        });
    }
    options += `<option value="Autre">Autre demande</option>`;

    section.innerHTML = `
        <div style="grid-column: 4 / -1;">
            <form id="contact-form" class="contact-form" enctype="multipart/form-data">
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

                <div class="form-group">
                    <label for="file">Fichiers (Optionnel)</label>
                    <input type="file" id="file" name="file" accept=".pdf,.jpg,.png,.doc,.docx">
                    <small style="opacity:0.5; display:block; margin-top:5px; font-family:var(--font-sans);">Max 5MB. PDF, JPG, PNG.</small>
                </div>

                <!-- Recaptcha Placeholder -->
                <div class="form-group" style="margin-top:20px;">
                    <!-- REPLACE 'YOUR_SITE_KEY' WITH ACTUAL KEY -->
                    <div class="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY_HERE"></div>
                </div>

                <div class="form-actions" style="margin-top:40px;">
                    <button type="submit" class="btn-cta" data-hover="magnetic">Envoyer le message</button>
                </div>

                <div id="form-status" style="margin-top:20px; font-family:var(--font-sans);"></div>
            </form>
        </div>
    `;

    // Append to container
    container.appendChild(section);

    // Attach Event Listener
    const form = section.querySelector('#contact-form');
    form.addEventListener('submit', handleContactSubmit);

    // Render Footer (Reuse data)
    renderFooter(data, container);

    // Dynamically load Recaptcha if not present
    if (!document.getElementById('recaptcha-script')) {
        const script = document.createElement('script');
        script.id = 'recaptcha-script';
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const status = form.querySelector('#form-status');
    const btn = form.querySelector('button');

    status.innerHTML = 'Envoi en cours...';
    status.style.color = 'white';
    btn.disabled = true;
    btn.style.opacity = '0.5';

    const formData = new FormData(form);

    try {
        const response = await fetch('src/api/send_mail.php', {
            method: 'POST',
            body: formData
        });

        let result;
        const text = await response.text();
        try {
            result = JSON.parse(text);
        } catch (err) {
            console.error("Non-JSON Response:", text);
            throw new Error("Erreur serveur (réponse invalide).");
        }

        if (result.success) {
            status.innerHTML = "Message envoyé avec succès ! Nous vous répondrons sous 24h.";
            status.style.color = '#4af626'; // Terminal Green
            form.reset();
        } else {
            throw new Error(result.message || "Erreur inconnue");
        }

    } catch (error) {
        console.error(error);
        status.innerHTML = "Erreur: " + error.message;
        status.style.color = '#ff4400'; // Orange
    } finally {
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}


// --- EXISTING SECTION RENDERERS (Unchanged logic mostly) ---

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
    }).join(' '); // Space margin handled by CSS margin-right

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
