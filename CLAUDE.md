# CLAUDE.md — NotebookLM Quiz Generator

Point d'entrée pour tout agent Claude sur ce projet. Lire ce fichier avant toute action.

---

## Contexte projet

Moteur de quiz React open-source qui transforme les exports HTML NotebookLM en quiz interactifs déployables sur Netlify — accessibles sans compte Google.

- **Stack :** React 19 / Vite / Tailwind CSS / Node.js
- **Déploiement :** Netlify (build : `npm run build`, publish : `dist`)
- **Démo :** [quizl5j.netlify.app](https://quizl5j.netlify.app/)
- **Repo :** GitHub template — les utilisateurs clonent via "Use this template"

---

## État des phases

| Phase | Contenu | État |
|---|---|---|
| A | Moteur React + script `extract.js` | ✅ Terminé |
| A-bis | Multi-quiz via `?module=`, page d'accueil, `generate-index.js` | ✅ Terminé |
| B | Skill d'extraction IA (SKILL.md, schema, evals) | ✅ Terminé |
| C | Packaging : skills Claude Code, HOWTO, ARCHITECTURE, DEPLOY, CLAUDE.md | 🔄 En cours |

---

## Skills disponibles

| Commande | Rôle |
|---|---|
| `/new-quiz` | Crée un quiz depuis un export NotebookLM (onboarding SingleFile inclus) |
| `/deploy` | Déploie sur Netlify — premier déploiement (Git + GitHub + Netlify) ou mise à jour |

---

## Premier contact avec un nouvel utilisateur

Si l'utilisateur ouvre la conversation par un message générique — *"bonjour"*, *"salut"*, *"comment ça marche"*, *"aide"*, *"par quoi je commence"*, *"?"* ou tout autre signal qu'il découvre le projet — considère qu'il en est au tout début et propose-lui directement :

> "Bienvenue ! Pour créer ton premier quiz à partir d'un export NotebookLM, tape **`/new-quiz`** — je m'occupe de tout (installation des outils, extraction, déploiement). Si tu veux d'abord comprendre comment ça marche, va voir [HOWTO.md](HOWTO.md)."

**Indice supplémentaire :** si `public/quiz-content/` ne contient que les modules de démo (`lefebvre-quiz`, `LLM-quiz`, `quiz-pdca`), c'est le signe que l'utilisateur n'a pas encore créé son premier quiz — oriente proactivement vers `/new-quiz`.

---

## Fichiers clés

| Fichier / Dossier | Rôle |
|---|---|
| `public/quiz-content/{module}/questions.json` | Données d'un quiz (à créer/modifier) |
| `public/quiz-content/index.json` | Généré automatiquement — **ne pas éditer** |
| `notebooklm-exports/` | Exports HTML sources — non versionnés |
| `extract.js` | Extraction HTML → `questions.json` |
| `generate-index.js` | Génère `index.json` (hook `predev` / `prebuild`) |
| `src/` | Moteur React — **ne pas modifier** |
| `skill/ARCHITECTURE.md` | Architecture technique complète |
| `skill/references/schema.md` | Schéma et contraintes du `questions.json` |
| `TODO.md` | État réel du projet — à maintenir à jour |
| `HOWTO.md` | Guide utilisateur complet |

---

## Conventions

- **Nommage des modules :** kebab-case, minuscules, sans accents (ex : `photoshop-avance`)
- **`themes[]` :** toujours inférés par l'IA et **validés par l'utilisateur** avant écriture
- **`index.json` :** jamais édité à la main — toujours via `node generate-index.js`
- **`src/` :** moteur générique, ne pas toucher — toute personnalisation passe par `quiz-content/`

---

## Référence technique

@skill/ARCHITECTURE.md

---

## Règles de collaboration

1. **Checkpoint** — Ne jamais écrire ou modifier du code sans GO explicite de l'utilisateur.
2. **Périmètre strict** — Ne modifier que ce qui est explicitement demandé ; signaler tout changement hors périmètre.
3. **Réflexion avant action** — Analyser les impacts et effets de bord avant de demander le GO.
4. **Décomposition** — Décomposer toute tâche complexe en étapes séquentielles numérotées.
8. **KISS** — Toujours choisir la solution la plus simple qui répond au besoin.
9. **YAGNI** — Ne jamais ajouter de fonctionnalité non explicitement demandée.
13. **Pédagogie** — Expliquer chaque décision technique en termes accessibles, sans présupposer le niveau de l'utilisateur.
