# Référence déploiement — Netlify

Paramètres techniques pour connecter le projet à Netlify.

> Pour le workflow complet (premier déploiement ou mise à jour), utiliser le skill `/deploy`.

---

## Paramètres de build Netlify

| Paramètre | Valeur |
|---|---|
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |
| **Node version** | 18 ou supérieur |

---

## Hook `prebuild`

Le script `generate-index.js` est déclaré en hook `prebuild` dans `package.json` :

```json
"prebuild": "node generate-index.js"
```

Netlify exécute automatiquement `npm run build`, ce qui déclenche `prebuild` en premier. L'`index.json` est donc **toujours régénéré** à chaque déploiement — aucune configuration supplémentaire nécessaire.

---

## URLs

| Cible | URL |
|---|---|
| Page d'accueil | `https://votre-site.netlify.app` |
| Quiz spécifique | `https://votre-site.netlify.app?module=nom-du-module` |

Le nom du module correspond au dossier dans `public/quiz-content/` (kebab-case).

---

## Déclenchement automatique

Netlify redéploie automatiquement à chaque `git push` sur la branche principale. Aucun webhook ni configuration supplémentaire requis après la connexion initiale.
