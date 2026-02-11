/* src/core/SeoManager.js */

export default class SeoManager {
    constructor(data) {
        this.data = data;
        this.baseTitle = "LogoLoom | Architecture Web Créative";
        this.defaultDesc = "Agence de design web et développement créatif. Nous tissons des expériences numériques immersives et performantes.";
    }

    update(pageType, params = {}) {
        let title = this.baseTitle;
        let desc = this.defaultDesc;
        let url = window.location.href;
        let jsonLd = {};

        switch(pageType) {
            case 'home':
                title = "LogoLoom | Agence Web Design & Branding";
                jsonLd = this.getOrganizationSchema();
                break;
            case 'agency':
                title = "L'Agence | LogoLoom";
                desc = "Découvrez l'équipe et la vision de LogoLoom. Nous fusionnons art et technologie.";
                jsonLd = this.getOrganizationSchema();
                break;
            case 'services':
                // params might be an object from query string or a string ID
                // In Router: routes['services'](id, queryParams) -> params = id || queryParams
                // If it's an object (empty query), we treat as list
                const serviceParam = (typeof params === 'string' && params.length > 0) ? params : null;

                if (serviceParam) {
                    // Specific Service
                    title = `${serviceParam} | LogoLoom Expertise`;
                    desc = `Service de ${serviceParam} par LogoLoom. Solutions sur mesure.`;
                    jsonLd = this.getServiceSchema(serviceParam, desc);
                } else {
                    title = "Nos Expertises | LogoLoom";
                    desc = "Web Design, Développement, Branding, SEO. Nos solutions complètes.";
                    jsonLd = this.getServiceListSchema();
                }
                break;
            case 'work':
                title = "Projets & Réalisations | LogoLoom";
                desc = "Une sélection de nos meilleurs projets web et identités visuelles.";
                break;
            case 'project':
                // We need project data here. Ideally ViewManager passes it or we look it up.
                // For MVP we use generic or need access to data
                const project = this.data.projects.find(p => p.id === params);
                if (project) {
                    title = `${project.title} | LogoLoom Portfolio`;
                    desc = `Étude de cas : ${project.title} pour ${project.client}. ${project.services}.`;
                }
                break;
            case 'contact':
                title = "Contact | Démarrer un Projet";
                desc = "Parlez-nous de votre vision. Devis gratuit sous 24h.";
                jsonLd = this.getLocalBusinessSchema();
                break;
        }

        document.title = title;
        this.setMeta('description', desc);
        this.setCanonical(url);
        this.injectJsonLd(jsonLd);
    }

    setMeta(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    setCanonical(url) {
        let link = document.querySelector(`link[rel="canonical"]`);
        if (!link) {
            link = document.createElement('link');
            link.rel = 'canonical';
            document.head.appendChild(link);
        }
        link.href = url.split('#')[0]; // Canonical should probably be clean URL
    }

    injectJsonLd(schema) {
        let script = document.getElementById('json-ld');
        if (!script) {
            script = document.createElement('script');
            script.id = 'json-ld';
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schema);
    }

    getOrganizationSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LogoLoom",
            "url": "https://logoloom.com",
            "logo": "https://logoloom.com/assets/logo.png",
            "sameAs": [
                "https://twitter.com/logoloom",
                "https://instagram.com/logoloom"
            ]
        };
    }

    getLocalBusinessSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "LogoLoom",
            "image": "https://logoloom.com/assets/office.jpg",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Rue de la Création",
                "addressLocality": "Paris",
                "postalCode": "75011",
                "addressCountry": "FR"
            },
            "priceRange": "$$$",
            "telephone": "+33100000000"
        };
    }

    getServiceSchema(name, desc) {
        return {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": name,
            "provider": {
                "@type": "Organization",
                "name": "LogoLoom"
            },
            "description": desc
        };
    }

    getServiceListSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": this.data.services.map((s, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": s.title,
                "description": s.list.join(', ')
            }))
        };
    }
}
