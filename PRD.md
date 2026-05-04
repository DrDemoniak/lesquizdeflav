# Product Requirements Document (PRD) - Quiz NotebookLM

## 1. Objectif du Produit
Créer un outil (Skill) capable de générer des quiz interactifs de haute qualité à partir d'exports HTML bruts provenant de NotebookLM. L'application finale doit être fluide, persistante et professionnelle.

## 2. Design et UX (Option 1)
- **Style Visuel** : Minimaliste, sérieux et pur. Calqué sur l'esthétique de NotebookLM et Google Material Design (Fonds blancs, bordures grises douces, texte contrasté, boutons épurés, polices lisibles de type Inter/Roboto).
- **Cohérence** : L'interface doit donner l'impression d'être une extension native de l'écosystème Google.

## 3. Mécanique de Jeu (Option B : Pédagogique)
- **Déroulement** : Pas-à-pas avec correction immédiate.
- **Interaction** : 
  1. L'utilisateur sélectionne une proposition.
  2. Le système verrouille le choix et affiche immédiatement le statut (Correct en vert, Incorrect en rouge).
  3. L'explication détaillée (`rationale`) s'affiche pour justifier la réponse.
  4. L'utilisateur clique sur "Question suivante" pour avancer.
- **Persistance (Auto-save)** : Sauvegarde automatique de la progression (réponses données, question en cours) dans la mémoire locale du navigateur (`localStorage`). Si l'utilisateur ferme l'onglet, il reprendra exactement là où il s'est arrêté.

## 4. Écran de Fin (Page de Récapitulatif)
L'écran de fin doit s'inspirer fidèlement de la maquette NotebookLM fournie.
- **En-tête** : Titre "Bravo ! Quiz terminé."
- **Bloc Supérieur (Score)** :
  - À gauche : Un grand cercle de progression affichant le score (ex: 4/10) et le pourcentage au centre, avec la bordure colorée selon le ratio de réussite.
  - À droite : Le détail chiffré (Correctes, Incorrectes, Passées).
- **Bloc Inférieur (Contenu)** :
  - "Thèmes abordés" : Une liste à puces récapitulant les grands thèmes vus dans les questions.
- **Boutons d'action (Footer)** : 
  - "Examiner le quiz" (revoir ses réponses).
  - "Recommencer le quiz" (efface le localStorage et relance).
