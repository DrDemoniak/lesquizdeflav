Ces règles encadrent le comportement attendu dans ce projet. Elles sont non négociables au niveau projet.

Note de cadrage : ce fichier définit les règles de travail du projet. En cas de conflit avec les contraintes système ou session de l'agent, les instructions de niveau supérieur restent prioritaires.

## GARDE-FOUS

### Règle 1 — Checkpoint obligatoire
Ne jamais écrire ou modifier du code sans approbation explicite ("GO").

### Règle 2 — Périmètre strict
Ne modifie que ce qui est explicitement demandé.

### Règle 2b — Librairies et modèle AI intouchables
Ne change JAMAIS la librairie AI (`@google/generative-ai` dans `chat.ts`, `@google/genai` dans `server.ts`), le modèle AI (`ai-config.json`), ni les dépendances `package.json` sans le GO explicite de l'utilisateur.

### Règle 3 — Réflexion avant action
Avant de demander le "GO", explique ton raisonnement de manière pédagogique.
Avant ET pendant chaque action (commande, édition), explique en termes simples CE QUE tu fais et POURQUOI. L'utilisateur doit comprendre et apprendre, même passivement.

## MÉTHODE DE TRAVAIL

### Règle 4 — Décomposition en sous-tâches
Décompose chaque tâche complexe en étapes petites et séquentielles.

### Règle 5 — 3 options systématiques
Propose 3 approches distinctes pour chaque modification significative.

### Règle 6 — Plan d'action dans la todo list
Rédige un plan d'action détaillé avant chaque génération de code.

### Règle 7 — Todo list à jour en permanence
Mets à jour la todo list en temps réel.

## QUALITÉ DU CODE

### Règle 8 — Simplicité d'abord (KISS)
Privilégie toujours la solution la plus simple.

### Règle 9 — Rien de superflu (YAGNI)
N'ajoute jamais de fonctionnalité non demandée.

### Règle 10 — Code modulaire
Structure le code de manière modulaire (un fichier par responsabilité).

### Règle 11 — Logs de débogage détaillés
Ajoute des console.log explicites à chaque étape clé.

### Règle 12 — Commentaires utiles
Explique le POURQUOI (intention) plutôt que le QUOI.

## POSTURE

### Règle 13 — Communication pédagogique
Explique chaque décision technique en termes accessibles.

## ENVIRONNEMENT

### Règle 14 — PowerShell
PowerShell n'accepte pas `&&`. Utilise `;` pour enchaîner les commandes.

### Règle 15 — Build et sandbox
Si `vite`, `npm.cmd run build` ou `npm.cmd run dev` échouent avec une erreur de type `spawn EPERM` dans ce workspace, considère d'abord qu'il s'agit probablement d'une limite du sandbox. Vérifie alors le résultat réel avec une exécution hors sandbox avant de conclure à un problème du projet.
