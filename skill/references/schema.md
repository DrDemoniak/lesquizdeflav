# Schéma JSON — questions.json

## Structure complète

```json
{
  "title": "string — titre affiché dans l'en-tête de l'app",
  "description": "string — sous-titre ou accroche courte",
  "themes": ["string — thème 1", "string — thème 2"],
  "questions": [
    {
      "question": "string — énoncé complet de la question, se terminant par ?",
      "answerOptions": [
        {
          "text": "string — texte de la réponse",
          "isCorrect": true,
          "rationale": "string — explication pédagogique"
        },
        {
          "text": "string — texte d'un distracteur",
          "isCorrect": false,
          "rationale": "string — explication pédagogique"
        }
      ],
      "hint": "string — indice formulé pour guider sans révéler la réponse"
    }
  ]
}
```

## Contraintes

| Champ | Contrainte |
|---|---|
| `title` | Obligatoire, non vide |
| `description` | Obligatoire, non vide |
| `themes` | Obligatoire, tableau de 3 à 6 chaînes — validé par l'utilisateur |
| `questions` | Tableau, minimum 1 question |
| `question` | Obligatoire, non vide |
| `answerOptions` | Entre 2 et 6 options (typiquement 4) |
| `isCorrect: true` | Exactement 1 par question |
| `rationale` | Obligatoire pour **chaque** option, correcte ou non |
| `hint` | Obligatoire, non vide |

## Règles de qualité

### Rationale de la bonne réponse
Explique *pourquoi* cette réponse est correcte. Apporte un fait ou un contexte qui ancre la connaissance.

### Rationale d'un distracteur
Explique *pourquoi* c'est incorrect, en pointant la confusion fréquente que ce distracteur peut provoquer. Ne pas se contenter de dire "c'est faux".

Longueur cible : 1 à 2 phrases claires. Pas de jargon inutile.

### Hint (indice)
Oriente sans révéler. Peut s'appuyer sur :
- Une analogie ou une métaphore
- Une étymologie ou un sigle
- Un contexte temporel ou géographique
- Une caractéristique distinctive de la bonne réponse

Longueur cible : 1 phrase.

## Exemple complet (1 question)

```json
{
  "title": "DeepSeek — Quiz interactif",
  "description": "Testez vos connaissances sur l'architecture et les enjeux de DeepSeek.",
  "questions": [
    {
      "question": "Quelle technique d'entraînement DeepSeek a-t-il utilisée pour réduire drastiquement ses coûts de calcul ?",
      "answerOptions": [
        {
          "text": "Le Mixture of Experts (MoE)",
          "isCorrect": true,
          "rationale": "DeepSeek active uniquement un sous-ensemble d'experts par token, ce qui réduit le coût de calcul tout en maintenant la capacité du modèle."
        },
        {
          "text": "Le Fine-Tuning supervisé classique",
          "isCorrect": false,
          "rationale": "Le Fine-Tuning supervisé est une technique d'adaptation courante mais ne réduit pas le coût d'entraînement initial — c'est l'inverse."
        },
        {
          "text": "La distillation de connaissances",
          "isCorrect": false,
          "rationale": "La distillation transfère les connaissances d'un grand modèle vers un petit, mais n'est pas le mécanisme central de l'efficacité de DeepSeek."
        },
        {
          "text": "Le Reinforcement Learning from Human Feedback (RLHF)",
          "isCorrect": false,
          "rationale": "Le RLHF est utilisé pour aligner les modèles sur les préférences humaines, pas pour réduire les coûts de calcul à l'entraînement."
        }
      ],
      "hint": "Pensez à une équipe d'experts où seuls quelques-uns interviennent à chaque étape."
    }
  ]
}
```
