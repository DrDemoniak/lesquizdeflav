# Architecture — Moteur React Quiz

Ce document décrit la structure technique du projet pour permettre à un agent de comprendre le fonctionnement sans lire le code source.

---

## Structure des fichiers

```
/QUIZ/
├── .claude/
│   └── commands/
│       ├── new-quiz.md       # Skill /new-quiz — création d'un quiz
│       └── deploy.md         # Skill /deploy — déploiement Netlify
├── notebooklm-exports/       # Exports HTML NotebookLM (sources brutes, non versionnées)
├── public/
│   └── quiz-content/
│       ├── logo.png          # Logo commun à tous les quiz
│       ├── index.json        # Généré automatiquement — ne pas éditer
│       ├── lefebvre-quiz/
│       │   └── questions.json
│       └── [nom-module]/     # Convention : kebab-case
│           └── questions.json
├── skill/
│   ├── SKILL.md              # Skill implicite (déclenchement automatique par Claude)
│   ├── ARCHITECTURE.md       # Ce fichier
│   ├── DEPLOY.md             # Référence technique Netlify
│   └── references/
│       └── schema.md         # Schéma JSON documenté + règles qualité
├── src/
│   ├── App.jsx               # Composant React unique — toute la logique ici
│   ├── main.jsx              # Point d'entrée React
│   ├── App.css               # Styles globaux
│   └── index.css             # Reset / Tailwind
├── extract.js                # Script d'extraction HTML → questions.json
├── generate-index.js         # Script de génération de l'index des quiz
├── package.json              # Scripts npm (predev, dev, prebuild, build)
├── HOWTO.md                  # Guide utilisateur complet
└── README.md                 # Vitrine du projet
```

> **Règle :** ne jamais modifier `src/`. C'est le moteur React — toute la personnalisation passe par les fichiers dans `public/quiz-content/`.

---

## Flux de données

```
URL (?module=nom)
      │
      ▼
App.jsx — lit le paramètre au chargement
      │
      ├─ MODULE = null → fetch(/quiz-content/index.json) → page d'accueil
      │
      └─ MODULE = "nom" → fetch(/quiz-content/nom/questions.json)
                               │
                               ▼
                         setQuestionsData(data)
                               │
                               ▼
                         Rendu du quiz (questions, options, hint, rationale)
```

**États React gérés dans `App.jsx` :**

| État | Rôle |
|---|---|
| `questionsData` | Données du quiz chargées depuis le JSON |
| `quizList` | Liste des quiz (mode accueil) |
| `started` | Quiz démarré ou non |
| `currentIndex` | Index de la question courante |
| `answers` | Réponses enregistrées par index |
| `currentAnswer` | Réponse sélectionnée sur la question courante |
| `revealedHints` | Indices affichés par index de question |
| `showResult` | Écran de résultats affiché ou non |

---

## Paramètre `?module=` et localStorage

- L'URL `?module=nom-du-module` détermine quel quiz charger.
- Sans paramètre → page d'accueil (liste des quiz depuis `index.json`).
- La clé localStorage est **isolée par module** : `quiz_progress_{MODULE}`.
- La progression est sauvegardée automatiquement à chaque changement d'état.
- `handleRestart()` supprime la clé localStorage et réinitialise tous les états.

---

## Schéma `questions.json`

Chaque module expose un fichier `questions.json` avec cette structure :

```json
{
  "title": "string — affiché dans l'en-tête",
  "description": "string — sous-titre",
  "themes": ["string", "string"],
  "questions": [
    {
      "question": "string — énoncé",
      "answerOptions": [
        { "text": "string", "isCorrect": true, "rationale": "string" },
        { "text": "string", "isCorrect": false, "rationale": "string" }
      ],
      "hint": "string — indice sans révéler la réponse"
    }
  ]
}
```

Contraintes clés : exactement 1 `isCorrect: true` par question, `rationale` obligatoire sur chaque option, `hint` obligatoire.

→ Référence complète : [`references/schema.md`](references/schema.md)

---

## Script `extract.js`

Extrait les questions depuis un export HTML NotebookLM et génère le `questions.json`.

**Usage :**
```bash
node extract.js "notebooklm-exports/fichier.html" \
  --title "Titre du quiz" \
  --desc "Description courte." \
  --module "nom-du-module"
```

**Paramètres :**

| Paramètre | Obligatoire | Description |
|---|---|---|
| `fichier.html` | Oui | Chemin relatif vers l'export HTML |
| `--title` | Non | Titre affiché (défaut : `Quiz interactif`) |
| `--desc` | Non | Description courte (défaut : `Testez vos connaissances.`) |
| `--module` | Non | Nom du module en kebab-case — crée le dossier automatiquement |

**Comportement :**
1. Lit le fichier HTML et décode les entités (`&amp;quot;` → `"`)
2. Repère le bloc JSON des questions via le pattern `[\n    {\n      "question"`
3. Extrait le bloc en comptant les crochets (gestion de l'imbrication)
4. Parse le JSON et écrit `public/quiz-content/{module}/questions.json`
5. Le champ `themes` n'est **pas** généré par ce script — il doit être ajouté manuellement ou via Claude

**Sortie :**
```
public/quiz-content/{module}/questions.json
```
Structure : `{ title, description, questions[] }` — sans `themes` (à ajouter ensuite).

---

## Script `generate-index.js`

Scanne `public/quiz-content/` et génère `index.json` (liste des quiz disponibles).

**Usage :**
```bash
node generate-index.js
```

**Comportement :**
1. Liste les sous-dossiers de `public/quiz-content/`
2. Pour chaque dossier contenant un `questions.json`, lit `title` et `description`
3. Écrit `public/quiz-content/index.json`

**Sortie :**
```json
{
  "quizzes": [
    { "module": "nom-du-module", "title": "...", "description": "..." }
  ]
}
```

**Hooks npm automatiques :**
- `predev` → exécuté avant `npm run dev`
- `prebuild` → exécuté avant `npm run build` (y compris sur Netlify)

Le script est donc **toujours à jour** sans intervention manuelle.
