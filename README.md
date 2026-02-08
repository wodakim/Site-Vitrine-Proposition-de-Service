# LogoLoom - Architecture "No-Build"

## Philosophie
Architecture Web Créative optimisée pour la performance et les interactions immersives (Awwwards).
- **Zéro Build Step** : Pas de Webpack, Vite, ou npm scripts complexes. Juste du code natif.
- **Vanilla JS (ES6 Modules)** : Architecture orientée objet pour une maintenance aisée.
- **WebGL First** : Curtains.js pour des distortions d'images synchronisées au scroll.

## Stack Technique
- **Structure** : Vanilla JS, HTML5, CSS3 (Variables & Clamp)
- **Routing** : Barba.js (SPA Transitions)
- **Scroll** : Lenis (Smooth Scroll) + GSAP ScrollTrigger
- **WebGL** : Curtains.js
- **Assets** : Polices auto-hébergées (WOFF2), Images optimisées.

## Structure du Projet
- `/core`: Cœur de l'application (App.js, WebGLManager, Router, Loader).
- `/components`: Logique spécifique aux composants UI.
- `/shaders`: Shaders GLSL (.vert, .frag).
- `/data`: Données du site (JSON Simulated CMS).
- `/assets`:
  - `/fonts`: Playfair Display & Space Grotesk (WOFF2).
  - `/img`: Textures et placeholders.
- `/css`:
  - `/base`: Reset, Variables, Typographie.
  - `/layout`: Grille, Structure.
  - `/components`: Styles modulaires.

## Installation & Démarrage
1. Cloner ce dépôt.
2. Lancer un serveur local à la racine du projet.
   - Via Python : `python3 -m http.server`
   - Via Node : `npx serve .`
   - Via VSCode : Extension "Live Server".
3. Ouvrir `http://localhost:8000` (ou port correspondant).

## Notes de Développement
- Le point d'entrée JS est `core/App.js`.
- La configuration globale (couleurs, typo fluides) est dans `css/base/variables.css`.
- Les données sont modifiables dans `data/data.json`.
