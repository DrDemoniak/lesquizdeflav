---
name: notebooklm-quiz-generator
description: Converts a NotebookLM HTML export into a valid questions.json for the Quiz React engine. Use this skill whenever the user provides a NotebookLM HTML file to convert, asks to generate a quiz from NotebookLM content, wants to create or update a questions.json, or mentions extracting quiz data from an HTML export — even if they don't use the exact words "skill" or "questions.json".
---

> **Note :** Ce workflow est disponible comme skill Claude Code formel — taper `/new-quiz` dans Claude Code pour le déclencher directement (`.claude/commands/new-quiz.md`).

# NotebookLM Quiz Generator

Ta mission : extraire les données d'un export HTML NotebookLM et produire un `questions.json` valide pour le moteur de quiz React.

## Étape 1 — Identifier le fichier source

L'utilisateur fournit le nom d'un fichier HTML dans `notebooklm-exports/`.

> Les exports NotebookLM sont des fichiers volumineux (plusieurs Mo). Ne pas tenter de les lire avec Read — utilise directement le script d'extraction.

## Étape 2 — Demander title, description et nom de module

Avant de lancer l'extraction, demande à l'utilisateur :
- **Titre** du quiz (affiché dans l'app)
- **Description** courte (sous-titre)
- **Nom du module** en kebab-case (ex : `deepseek-quiz`, `photoshop-avance`)

## Étape 3 — Lancer extract.js

Exécute la commande suivante via Bash :

```bash
node extract.js "notebooklm-exports/NOM_DU_FICHIER.html" \
  --title "Titre du quiz" \
  --desc "Description courte." \
  --module "nom-du-module"
```

Le script crée automatiquement `public/quiz-content/{module}/questions.json`.

## Étape 4 — Générer et valider les thèmes (human-in-the-loop)

Les thèmes ne sont pas présents dans l'export HTML. Tu dois les inférer à partir du contenu des questions.

1. Lis `public/quiz-content/{module}/questions.json` (généré à l'étape 3)
2. Analyse les questions et regroupe-les par grandes thématiques
3. **Propose** une liste de 3 à 6 thèmes à l'utilisateur sous cette forme :

```
Voici les thèmes que j'ai identifiés pour ce quiz :
1. ...
2. ...
3. ...

Tu peux valider, reformuler ou supprimer des thèmes avant que je les écrive dans le JSON.
```

4. **Attends la validation** de l'utilisateur avant de continuer.
5. Une fois validés, ajoute le champ `themes` dans le `questions.json` :

```bash
# Lire le fichier, ajouter themes[], réécrire
```

Utilise l'outil Edit ou Write pour insérer le champ `"themes"` après `"description"` dans le JSON.

## Étape 5 — Vérifier et confirmer

Lis le fichier final et vérifie :
- `title`, `description`, `themes` corrects
- Nombre de questions extrait
- Schéma valide (consulte [`references/schema.md`](references/schema.md) si besoin)

Confirme à l'utilisateur :
- Le nombre de questions extraites
- Les thèmes retenus
- Le chemin du fichier : `public/quiz-content/{module}/questions.json`
- L'URL de test : `http://localhost:5173?module={nom-du-module}` (après Phase A bis)
