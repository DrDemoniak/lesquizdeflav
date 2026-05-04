---
name: deploy
description: Déploie le projet sur Netlify. Couvre le premier déploiement complet (Git + GitHub + Netlify) et les mises à jour courantes. Utiliser quand l'utilisateur veut déployer, publier, mettre en ligne, pousser une mise à jour ou partager l'URL du quiz.
---

# Déployer sur Netlify

## Question d'aiguillage

Commencer par demander :

> **Est-ce ton premier déploiement, ou veux-tu pousser une mise à jour ?**
> - **"Premier déploiement"** → suivre la Branche A
> - **"Mise à jour"** → suivre la Branche B

---

## Branche A — Premier déploiement

### Étape 0 — Vérifier les prérequis

Si Git ou GitHub CLI ne sont pas installés, lancer le script de setup :

```powershell
.\setup.ps1
```

Le script (idempotent) installe Node.js, Git et GitHub CLI via winget si nécessaire, puis rafraîchit le PATH dans la session courante.

### Étape 1 — Vérifier Git

```bash
git status
```

- Si Git n'est pas initialisé : lancer `git init`
- Vérifier la présence d'un `.gitignore` incluant au minimum `node_modules/` et `dist/`

### Étape 2 — Premier commit

```bash
git add .
git commit -m "feat: initial commit"
```

### Étape 3 — Créer le repo GitHub

**Option recommandée — Via GitHub CLI :**

```bash
gh repo create NOM-DU-REPO --public --source=. --remote=origin --push
```

> Si `gh` n'est pas installé : [cli.github.com](https://cli.github.com)

**Sans GitHub CLI :**

1. Aller sur [github.com/new](https://github.com/new)
2. Créer un repo **public**, sans README ni `.gitignore` (le projet en a déjà)
3. Copier les commandes affichées par GitHub sous "…or push an existing repository"
4. Les coller dans le terminal et les exécuter

### Étape 4 — Connecter Netlify

1. Aller sur [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Choisir **GitHub**, autoriser Netlify si demandé, sélectionner le repo
3. Configurer le build :
   - **Build command :** `npm run build`
   - **Publish directory :** `dist`
4. Cliquer sur **Deploy site**

> Le hook `prebuild` régénère automatiquement `index.json` à chaque déploiement — aucune configuration supplémentaire nécessaire.

### Étape 5 — Confirmer

- Vérifier dans l'interface Netlify que le déploiement s'est terminé sans erreur
- Communiquer les URLs à l'utilisateur :
  - Page d'accueil : `https://votre-site.netlify.app`
  - Quiz spécifique : `https://votre-site.netlify.app?module=nom-du-module`

---

## Branche B — Mise à jour

### Étape 1 — Vérifier les quiz

S'assurer que tous les nouveaux modules sont bien présents dans `public/quiz-content/` avec leur `questions.json`.

### Étape 2 — Build

```bash
npm run build
```

> Le hook `prebuild` régénère `index.json` automatiquement avant le build.

### Étape 3 — Vérifier le build

S'assurer qu'il n'y a pas d'erreur dans la sortie du terminal. Le dossier `dist/` doit être généré.

### Étape 4 — Push

```bash
git add .
git commit -m "feat: ajout quiz [nom-du-module]"
git push
```

> Netlify détecte automatiquement le push sur la branche principale et déclenche un nouveau déploiement.

### Étape 5 — Confirmer

- Vérifier dans l'interface Netlify que le déploiement est terminé (statut **Published**)
- Communiquer les URLs mises à jour à l'utilisateur
