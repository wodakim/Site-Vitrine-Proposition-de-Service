# LOGOLOOM - FEUILLE DE ROUTE PROJET

Ce document suit l'avancement du développement de l'architecture "LogoLoom".

Légende :
- 🟩 **Terminé** (Architecture stable, testée).
- 🟡 **En Cours** (Développement actif, polish).
- 🔺 **A Faire** (Prévu, non commencé).
- ❌ **Rejeté** (Non conforme aux attentes ou contraintes).

**CONTRAINTE MAJEURE :** ZÉRO DÉPENDANCE EXTERNE (Zéro Build Step, Zéro Frameworks lourds). Tout doit être Vanilla JS / CSS.

---

## 1. ARCHITECTURE & CORE (Le Socle)
- 🟩 **Migration MPA (Multi-Page Application) :** Séparation stricte `index.html` (Standard) et `retro.html` (Mode Rétro) pour la stabilité.
- 🟩 **Système de Routing (Hash-Based) :** `Router.js` gère la navigation SPA fluide au sein du mode Standard.
- 🟩 **ViewManager :** Gestion du cycle de vie des pages (Nettoyage du DOM, Montage, Reset du Scroll).
- 🟩 **ScrollManager (Custom Smooth Scroll) :** Implémentation type "Lenis" avec inertie, parallax et reset programmable (`scrollTo(0)`).
- 🟩 **TransitionManager (Garganta V3) :** Effet "Void" en Canvas (optimisé pour ne pas figer le navigateur), transition fluide entre les modes.
- 🟩 **Gestion des Assets :** Chargement dynamique des données via `data.json`.

## 2. STANDARD MODE (L'Expérience Visuelle)
- 🟩 **Squelette HTML & Layout :** Structure sémantique, grille CSS Grid asymétrique.
- 🟩 **Rendu Dynamique des Pages :** Modules `Home.js`, `Agency.js`, `Work.js`, etc. injectant le contenu.
- 🟡 **Interactions "Magnetic" :** Curseur physique (Corde) implémenté, mais le magnétisme sur les boutons doit être affiné.
- 🟡 **Effet "Liquid" (WebGL) :** Shader de distorsion sur les miniatures de projets (Base posée, polish visuel en cours).
- ❌ **Transition "Deep Sea" WebGL Background** (Rejeté : Trop de charge / Dépendances).
- ❌ **Transitions "Silencieuses" (Fade/Wipe)** (Rejeté : Complexité inutile).

## 3. RETRO MODE (L'Expérience "Hacker")
- 🟩 **Structure de Base :** `retro.html` et `app-retro.js` fonctionnels.
- 🟩 **Retour vers Standard :** Transition inverse fonctionnelle.
- ❌ **Terminal Interactif (CLI)** (Rejeté : Gimmick inutile pour le client cible).
- 🔺 **Easter Eggs :** Konami Code et secrets cachés.
- 🔺 **Glitch Effects :** Shaders RGB Split sur le texte et les images.

## 4. OPTIMISATION, SEO & SÉCURITÉ (Priorité Actuelle)
- 🟩 **Bug Fixes (Navigation) :** Résolution du bug d'empilement des pages (AppendChild -> innerHTML clear).
- 🟩 **Bug Fixes (Hero Visibility) :** Résolution du texte invisible due au scroll state (Scroll Reset).
- 🔺 **SEO Technique (JSON-LD) :** Structuration des données pour Google (LocalBusiness, Organization).
- 🔺 **Sécurité (CSP & Headers) :** Configuration `.htaccess` stricte (HSTS, X-Frame-Options).
- 🔺 **Performance (Images & Lazy Loading) :** Optimisation WebP/AVIF et attributs `loading="lazy"`.
- 🔺 **Responsive Design :** Menu burger mobile, touch events pour les interactions.
- 🔺 **Contenu Étendu :** Pages dédiées pour "App Mobile", "Hébergement", "Branding".

---

## PROPOSITIONS EN COURS (Focus Client & Business)
1.  **Architecture SEO Parfaite (JSON-LD & Semantic HTML).**
2.  **Sécurité Renforcée (Headers HTTP stricts & CSP).**
3.  **Expansion Contenu Services (Pages dédiées Apps/Hosting).**
4.  **Expérience Mobile (Touch & Responsive Menu).**
5.  **Performance Absolue (Lighthouse 100/100).**
