# Roadmap — Skill « NotebookLM to Quiz »

## Brief passation — 01/05/2026

> À lire en premier si tu prends la suite sur ce projet.

**État actuel :** Phase C quasiment terminée. Le projet est opérationnel et déployé. Onboarding non-tech industrialisé via `setup.ps1`.

**Ce qui a été fait récemment :**
- Quiz `quiz-pdca` créé via `/new-quiz` (5 questions, 3 thèmes validés human-in-the-loop)
- Test end-to-end du skill `/new-quiz` + `/deploy` réussi sur un 3ème export NotebookLM
- Export HTML source versionné dans `notebooklm-exports/` sur GitHub
- Déploiement Netlify — 3 quiz en ligne sur [quizl5j.netlify.app](https://quizl5j.netlify.app)
- Suppression du dossier `skill/evals/` (cas de test pas utilisés)
- **Ajout de `setup.ps1`** (01/05/2026) : installation automatique de Node.js, Git, GitHub CLI via winget
- Skills `/new-quiz` et `/deploy` enrichis d'une Étape 0 qui lance `setup.ps1`
- HOWTO.md et README.md mis à jour pour refléter le nouveau parcours non-tech

**Quiz disponibles :** `lefebvre-quiz`, `LLM-quiz`, `quiz-pdca`

**Prochaines actions prioritaires :**
1. Tester `setup.ps1` sur une machine vierge (ou simuler un environnement non-tech)
2. Décider si `.cursorrules` est toujours pertinent (ou clore la Phase C)

---

## Objectif
Industrialiser la conversion d'un export HTML NotebookLM en quiz interactif déployable,
packagée sous forme d'un **Skill réutilisable** compatible Claude Code, Claude Cowork,
Antigravity et Cursor.

> **Chaîne cible :** HTML NotebookLM → (Skill IA) → `questions.json` → Quiz React déployé

---

## Phase A — Moteur React & Script d'extraction ✅ TERMINÉ

### Moteur React
- [x] Projet React/Vite/Tailwind initialisé
- [x] Design validé : minimaliste type NotebookLM
- [x] Mécanique pédagogique : feedback immédiat + rationale
- [x] Écran de récapitulatif (score, progression, thèmes)
- [x] Persistance via `localStorage` (correction bug lazy init)
- [x] Architecture CMS : données chargées depuis `public/quiz-content/`
- [x] Titre, description et logo dynamiques (depuis `questions.json` et `logo.png`)
- [x] Liens Growth Hacking (Header + Footer → `cv-jean-noel.netlify.app`)
- [x] UX alignée NotebookLM (labels A/B/C/D, bouton Indice, layout hauteur contrôlée)
- [x] Calcul final correct (correctes / incorrectes / passées)
- [x] Build de production vérifié

### Script d'extraction
- [x] Script `extract.js` robuste (entités HTML, profondeur JSON)
- [x] Paramétrage complet : `--title`, `--desc`, `--module` (création du dossier auto)
- [x] Champs `title`, `description`, `themes[]` intégrés dans l'export

### Infra & Legal
- [x] Git initialisé + dépôt GitHub : `lecinquiemejour-code/Quiz`
- [x] Licence GNU GPLv3
- [x] Stratégie de distribution confirmée : **GitHub template ("Use this template") → Netlify**
  - Le repo est configuré comme template GitHub (bouton "Use this template" actif)
  - Le fork est exclu (l'utilisateur repart sur un historique git propre)
  - Le déploiement local via `file://` n'est pas supporté (`fetch()` incompatible)

---

## Phase A bis — Multi-quiz via URL param ✅ TERMINÉ

> Objectif : Permettre de diffuser plusieurs quiz depuis un seul déploiement.

- [x] Lire le paramètre `?module=` depuis l'URL dans `App.jsx`
- [x] Charger `public/quiz-content/{module}/questions.json` dynamiquement
- [x] `localStorage` isolé par module (pas de mélange des progressions)
- [x] Page d'accueil automatique listant les quiz disponibles (sans `?module=`)
- [x] `generate-index.js` : scan auto de `quiz-content/` → génère `index.json` (hook `predev` / `prebuild`)
- [x] État d'erreur si module introuvable ("Retour au choix de quiz")
- [x] Icône Home dans le header des écrans quiz (Logo | Home | Titre)
- [x] Convention de nommage kebab-case (ex : `deepseek-quiz`, `photoshop-avance`)
- [x] Restructuration `quiz-content/` : un dossier par module, `logo.png` commun à la racine
- [x] Dossier `notebooklm-exports/` pour stocker les exports HTML sources
- [x] Champ `themes[]` dans `questions.json` — inféré par l'IA, validé human-in-the-loop
- [x] 2 quiz opérationnels : `lefebvre-quiz` et `LLM-quiz`

---

## Phase B — Skill d'extraction IA ✅ TERMINÉ

> Objectif : permettre à Claude de convertir un HTML NotebookLM en `questions.json`
> valide, avec validation human-in-the-loop pour les thèmes.

- [x] Rédiger `skill/SKILL.md` (Skill Claude formel avec frontmatter YAML)
- [x] Définir et documenter le schéma JSON cible (`skill/references/schema.md`)
- [x] Tester la conversion complète : HTML → JSON via le Skill (LLM-quiz validé)
- [x] Workflow human-in-the-loop : thèmes proposés par l'IA, validés par l'utilisateur

> **Note technique :** Les exports NotebookLM sont trop volumineux pour être lus directement
> (2-3M tokens). Le Skill délègue l'extraction à `extract.js` via Bash, puis complète
> le `questions.json` avec les thèmes inférés.

---

## Phase C — Packaging du Skill Multi-Outils 🔄 EN COURS

> Objectif : packager tout le savoir-faire en un Skill structuré,
> utilisable dans Claude Code, Claude Cowork, Antigravity et Cursor.

### Structure actuelle du Skill
```
skill/
  SKILL.md            ✅ Skill Claude formel (frontmatter YAML + workflow complet)
  references/
    schema.md         ✅ Schéma JSON documenté + règles qualité + exemple
```

### Tâches restantes
- [x] Créer `.claude/commands/new-quiz.md` (skill Claude Code formel `/new-quiz` — onboarding NotebookLM + extraction + thèmes)
- [x] Créer `.claude/commands/deploy.md` (skill Claude Code formel `/deploy` — premier déploiement Git/GitHub/Netlify + mises à jour)
- [x] Créer `HOWTO.md` (guide utilisateur complet : prérequis → export → quiz → test → déploiement)
- [x] Mettre à jour `README.md` (lien explicite vers HOWTO.md)
- [x] Créer `skill/ARCHITECTURE.md` (description du moteur React : structure, conventions, schéma)
- [x] Créer `skill/DEPLOY.md` (référence technique Netlify : build command, publish dir, hook, URLs)
- [x] Créer `CLAUDE.md` à la racine (point d'entrée Claude Code/Cowork pour prendre le relais)
- [ ] Créer `.cursorrules` (adaptation pour Cursor) — reporté à version suivante
- [x] Tester le Skill end-to-end sur un 3ème export NotebookLM (`quiz-pdca` — 30/04/2026)

---

## Backlog (idées futures)
- [ ] Optimiser la description du frontmatter SKILL.md (run_loop.py du Skill Creator)
- [ ] Prévoir l'évolution vers BDD + Leaderboard
