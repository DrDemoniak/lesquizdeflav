# 🎓 NotebookLM Quiz Generator

> Un moteur de quiz interactif open-source, conçu pour transformer les exports NotebookLM en expériences d'apprentissage pédagogiques et engageantes.

[![Licence: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🎯 Démarrage en 4 étapes

> Ton premier quiz en ligne en moins de 10 minutes.

1. **Clone ce template**
   Clique sur le bouton **"Use this template"** en haut de cette page → **"Create a new repository"**.

2. **Installe Claude Code**
   Télécharge Claude Code sur [claude.ai/code](https://claude.ai/code) (gratuit, Mac/Windows).

3. **Ouvre ton dossier dans Claude Code**
   Clone ton nouveau repo localement, puis ouvre le dossier dans Claude Code.

4. **Tape `/new-quiz`**
   Claude prend la main : il installe les outils manquants, t'aide à exporter ton quiz NotebookLM, et te guide jusqu'au déploiement en ligne.

> Pas envie de lire la suite ? Tu peux passer directement à l'étape 4 — Claude fait le reste.

---

## 💡 Pourquoi ce projet ?

[NotebookLM](https://notebooklm.google.com/) est au top pour créer des contenus pédagogiques — les Quiz générés sont pertinents, bien structurés, et pédagogiquement solides.

Seul bémol : partager un quiz NotebookLM publiquement oblige le participant à avoir un **compte Google** et à se connecter pour y accéder. Un frein réel pour une diffusion large.

Ce projet résout ce problème : en récupérant le contenu du quiz depuis une sauvegarde HTML (via SingleFile), on le met en forme dans un **moteur React open-source**, déployable gratuitement sur Netlify — **accessible par tous, sans compte**.

Développé en **#VibeCoding** avec Claude Code.

---

## 📖 Guide de démarrage

Nouveau sur ce projet ? Le guide complet couvre l'installation, la création de votre premier quiz et le déploiement Netlify.

👉 [Lire le guide HOWTO](HOWTO.md)

---

## ✨ Fonctionnalités

- 🧠 **Feedback pédagogique immédiat** — Chaque réponse affiche une explication ciblée (*rationale*)
- 💾 **Persistance automatique** — La progression est sauvegardée dans le `localStorage`, isolée par module
- 📊 **Écran de résultats** — Score, taux de réussite, graphique de progression et thèmes abordés
- 🎨 **Design minimaliste** — Inspiré de l'interface NotebookLM
- 📚 **Multi-quiz** — Plusieurs quiz sur un seul déploiement, sélectionnables via `?module=`
- 🏠 **Page d'accueil automatique** — Liste les quiz disponibles, générée sans configuration manuelle
- 🤖 **Skill IA intégré** — Claude peut créer un nouveau quiz complet depuis un export HTML
- ⚡ **Setup automatique** — Script `setup.ps1` qui installe Node.js, Git et GitHub CLI via `winget` (Windows)

---

## 🗂️ Structure du projet

```
/QUIZ/
├── notebooklm-exports/         # 📥 Exports HTML NotebookLM (sources)
├── public/
│   └── quiz-content/           # 📦 Contenus des quiz
│       ├── logo.png            # Logo commun à tous les quiz
│       ├── index.json          # Généré automatiquement (ne pas éditer)
│       ├── lefebvre-quiz/
│       │   └── questions.json
│       └── [votre-module]/     # Kebab-case (ex: "photoshop-avance")
│           └── questions.json
├── skill/                      # 🤖 Skill IA (instructions pour Claude)
│   ├── SKILL.md                # Point d'entrée du Skill
│   └── references/
│       └── schema.md           # Schéma JSON documenté
├── src/                        # ⚛️ Moteur React (ne pas modifier)
├── extract.js                  # 🛠️ Script d'extraction HTML → JSON
├── generate-index.js           # ⚙️ Génère index.json automatiquement
├── setup.ps1                   # ⚡ Installation automatique des prérequis (Windows)
└── README.md
```

## 🌐 Démo en ligne

👉 **[quizl5j.netlify.app](https://quizl5j.netlify.app/)**

---

## 📜 Licence

Ce projet est distribué sous la licence **GNU General Public License v3.0**.

Cela signifie que tu es libre d'utiliser, modifier et redistribuer ce code, **à condition que toute version dérivée reste également open-source sous la même licence**.

---

## 👤 Auteur

**Jean-Noël Lefebvre — Le 5ème Jour (L5J)**

Expert en IA générative, formation et prototypage rapide.

🔗 [cv-jean-noel.netlify.app](https://cv-jean-noel.netlify.app/)
