---
name: new-quiz
description: Crée un nouveau module quiz depuis un export HTML NotebookLM. Utiliser quand l'utilisateur veut ajouter un quiz, convertir un export NotebookLM, créer un questions.json, ou importer un contenu depuis NotebookLM — même s'il ne mentionne pas explicitement "new-quiz" ou "skill".
---

# Créer un nouveau quiz

## Étape 0 — Vérifier les prérequis (Node, Git, GitHub CLI, npm install)

Avant tout, s'assurer que l'environnement est prêt. Si `node_modules/` est absent OU si l'utilisateur découvre le projet, lancer le script de setup :

```powershell
.\setup.ps1
```

Le script (idempotent) :
- Vérifie & installe Node.js, Git, GitHub CLI via winget
- Rafraîchit le PATH dans la session courante
- Exécute `npm install` si `node_modules/` est absent

> Si le script signale un outil manquant non installable automatiquement, suivre les liens affichés et relancer le script.

---

## Étape 1 — Obtenir l'export HTML NotebookLM (si pas encore fait)

Si l'utilisateur ne dispose pas encore du fichier HTML, le guider pas à pas :

1. **Ouvrir le quiz dans NotebookLM**
   Aller sur [notebooklm.google.com](https://notebooklm.google.com) et naviguer jusqu'au quiz à exporter.

2. **Partager le quiz**
   Cliquer sur le bouton **Partager** → activer le partage public → copier l'URL générée.

3. **Ouvrir l'URL dans Chrome**
   Coller l'URL dans **Google Chrome** (l'extension SingleFile requiert Chrome).

4. **Télécharger avec SingleFile**
   - Installer l'extension **[SingleFile](https://chromewebstore.google.com/detail/mpiodijhokgodhhofbcjdecpffjipkle)** si ce n'est pas déjà fait
   - Sur la page du quiz partagé, cliquer sur l'icône **SingleFile** dans la barre d'extensions
   - SingleFile télécharge la page entière en un seul fichier `.html` autonome

5. **Déplacer le fichier dans le projet**
   Déplacer le fichier `.html` téléchargé dans le dossier `notebooklm-exports/` du projet.

> Une fois le fichier présent dans `notebooklm-exports/`, passer à l'Étape 2.

---

## Étape 2 — Identifier le fichier source

Lister les fichiers HTML disponibles :

```bash
ls notebooklm-exports/*.html
```

Si plusieurs fichiers sont présents, demander à l'utilisateur de confirmer lequel utiliser.

---

## Étape 3 — Demander title, description et nom de module

Avant de lancer l'extraction, demander :

- **Titre** du quiz (affiché dans l'en-tête de l'app)
- **Description** courte (sous-titre, 1 phrase)
- **Nom du module** en kebab-case (ex : `photoshop-avance`, `deepseek-quiz`)

> Convention kebab-case : minuscules, mots séparés par des tirets, sans accents ni espaces.

---

## Étape 4 — Lancer extract.js

```bash
node extract.js "notebooklm-exports/NOM_DU_FICHIER.html" \
  --title "Titre du quiz" \
  --desc "Description courte." \
  --module "nom-du-module"
```

Le script crée automatiquement `public/quiz-content/{module}/questions.json`.

---

## Étape 5 — Générer et valider les thèmes (human-in-the-loop)

1. Lire `public/quiz-content/{module}/questions.json`
2. Analyser les questions et les regrouper par grandes thématiques
3. Proposer 3 à 6 thèmes sous cette forme :

```
Voici les thèmes que j'ai identifiés pour ce quiz :
1. ...
2. ...
3. ...

Tu peux valider, reformuler ou supprimer des thèmes avant que je les écrive dans le JSON.
```

4. **Attendre la validation** de l'utilisateur avant de continuer.

---

## Étape 6 — Écrire les thèmes + régénérer l'index

Une fois les thèmes validés :

1. Ajouter le champ `"themes"` après `"description"` dans le `questions.json`
2. Régénérer l'index des quiz :

```bash
node generate-index.js
```

---

## Étape 7 — Confirmer

Confirmer à l'utilisateur :

- Le nombre de questions extraites
- Les thèmes retenus
- Le chemin du fichier : `public/quiz-content/{module}/questions.json`
- L'URL de test locale : `http://localhost:5173?module={nom-du-module}`

> Pour lancer le serveur de développement : `npm run dev`
