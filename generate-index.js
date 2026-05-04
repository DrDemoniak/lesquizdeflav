import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const quizContentDir = path.join(__dirname, 'public', 'quiz-content');
const outputPath = path.join(quizContentDir, 'index.json');

console.log('\n=== 🗂️  Génération de l\'index des quiz ===');

// Scanne les sous-dossiers de quiz-content/ et lit title + description de chaque questions.json
const entries = fs.readdirSync(quizContentDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => {
    const jsonPath = path.join(quizContentDir, d.name, 'questions.json');
    if (!fs.existsSync(jsonPath)) return null;
    const { title, description } = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    return { module: d.name, title, description };
  })
  .filter(Boolean);

fs.writeFileSync(outputPath, JSON.stringify({ quizzes: entries }, null, 2), 'utf-8');

console.log(`✅ index.json généré : ${entries.length} quiz trouvé(s)`);
entries.forEach((e) => console.log(`   • ${e.module} — ${e.title}`));
console.log('');
