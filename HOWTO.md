# Guide de démarrage — NotebookLM Quiz Generator

Ce guide couvre l'intégralité du parcours : de la découverte du projet jusqu'à votre premier quiz en ligne.

---

## Prérequis

- Windows 10/11 (le script de setup automatique utilise `winget`)
- [Claude Code](https://claude.ai/code) installé
- Un compte [GitHub](https://github.com/)
- Un compte [Netlify](https://netlify.com/) (gratuit)
- [Google Chrome](https://www.google.com/chrome/) (pour l'export NotebookLM)
- L'extension Chrome [SingleFile](https://chromewebstore.google.com/detail/mpiodijhokgodhhofbcjdecpffjipkle) (pour télécharger les pages NotebookLM)

> Node.js, Git et GitHub CLI sont installés automatiquement par `setup.ps1` (étape 1 ci-dessous).

---

## Étape 1 — Installer le projet

### Depuis GitHub

1. Aller sur le dépôt GitHub du projet
2. Cliquer sur **"Use this template"** → **"Create a new repository"**
3. Nommer votre repo et le créer (choisir **Public**)
4. Cloner votre nouveau repo localement :

```bash
git clone https://github.com/VOTRE-COMPTE/VOTRE-REPO.git
cd VOTRE-REPO
```

5. Ouvrir le dossier dans **Claude Code** et lancer le setup :

```powershell
.\setup.ps1
```

Le script (idempotent) :
- Vérifie & installe **Node.js**, **Git**, **GitHub CLI** via `winget`
- Rafraîchit le `PATH` dans la session courante
- Exécute `npm install` si `node_modules/` est absent

> Si `winget` n'est pas disponible (Windows 10 ancien), le script affiche les liens de download manuel et continue avec les outils déjà présents.

> Le déploiement local via `file://` n'est pas supporté. Utiliser `npm run dev` pour tester.

---

## Étape 2 — Obtenir un export NotebookLM

Le moteur de quiz lit des fichiers HTML exportés depuis NotebookLM. Voici comment les obtenir :

### 2a. Partager le quiz depuis NotebookLM

1. Ouvrir [notebooklm.google.com](https://notebooklm.google.com)
2. Naviguer jusqu'au quiz à exporter
3. Cliquer sur le bouton **Partager**
4. Activer le **partage public** et copier l'URL générée

### 2b. Télécharger la page avec SingleFile

1. Coller l'URL copiée dans **Google Chrome**
2. Cliquer sur l'icône **SingleFile** dans la barre d'extensions Chrome
   - Si l'extension n'est pas installée : [installer SingleFile](https://chromewebstore.google.com/detail/mpiodijhokgodhhofbcjdecpffjipkle)
3. SingleFile télécharge la page entière en un seul fichier `.html` autonome

### 2c. Déposer le fichier dans le projet

Déplacer le fichier `.html` téléchargé dans le dossier `notebooklm-exports/` du projet.

---

## Étape 3 — Créer votre premier quiz

### Via Claude Code (recommandé)

Si vous utilisez [Claude Code](https://claude.ai/code), tapez simplement :

```
/new-quiz
```

Claude vous guide pas à pas : identification du fichier, titre, description, extraction, validation des thèmes.

### Via le terminal (manuel)

```bash
node extract.js "notebooklm-exports/NOM_DU_FICHIER.html" \
  --title "Titre du quiz" \
  --desc "Description courte." \
  --module "nom-du-module"
```

> Convention pour `--module` : kebab-case, minuscules, sans accents (ex : `photoshop-avance`, `deepseek-quiz`).

Le script crée automatiquement `public/quiz-content/nom-du-module/questions.json`.

Ajouter ensuite le champ `themes` dans le JSON généré :

```json
{
  "title": "...",
  "description": "...",
  "themes": ["Thème 1", "Thème 2", "Thème 3"],
  "questions": [...]
}
```

Puis régénérer l'index :

```bash
node generate-index.js
```

---

## Étape 4 — Tester localement

```bash
npm run dev
```

L'application est disponible sur **http://localhost:5173**

- Page d'accueil (liste des quiz) : `http://localhost:5173`
- Quiz spécifique : `http://localhost:5173?module=nom-du-module`

---

## Étape 5 — Déployer sur Netlify

### Via Claude Code (recommandé)

```
/deploy
```

Claude vous demande si c'est un premier déploiement ou une mise à jour, puis vous guide étape par étape.

### Manuellement — Premier déploiement

1. Initialiser Git et créer un premier commit (si pas encore fait) :

```bash
git add .
git commit -m "feat: initial commit"
```

2. Créer un repo GitHub et pousser :

```bash
gh repo create NOM-DU-REPO --public --source=. --remote=origin --push
```

3. Connecter Netlify :
   - Aller sur [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
   - Sélectionner votre repo GitHub
   - Configurer le build :
     - **Build command :** `npm run build`
     - **Publish directory :** `dist`
   - Cliquer sur **Deploy site**

> Le hook `prebuild` régénère `index.json` automatiquement à chaque déploiement.

### Manuellement — Mise à jour

```bash
npm run build   # vérifie que le build passe
git add .
git commit -m "feat: ajout quiz nom-du-module"
git push
```

Netlify détecte le push et redéploie automatiquement.

---

## Étape 6 — Ajouter d'autres quiz

Répéter les étapes 2 et 3 pour chaque nouveau quiz, puis redéployer (étape 5 — mise à jour).

Chaque quiz est accessible via `?module=nom-du-module`. La page d'accueil se met à jour automatiquement.

---

## Ressources

- [Schéma questions.json](skill/references/schema.md) — format attendu et règles de qualité
- [Skill /new-quiz](.claude/commands/new-quiz.md) — workflow d'extraction assisté par Claude
- [Skill /deploy](.claude/commands/deploy.md) — workflow de déploiement assisté par Claude
- Démo en ligne : [quizl5j.netlify.app](https://quizl5j.netlify.app/)
