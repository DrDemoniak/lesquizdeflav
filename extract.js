import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Parsing des arguments (positionnels + flags nommés)
// Usage : node extract.js "fichier.html" --title "Titre" --desc "Description" --module "nom-module"
const args = process.argv.slice(2);
const inputFile = args.find(a => !a.startsWith('--')) || 'NotebookLM - Lefebvre Quiz (29_04_2026 19：08：30).html';

const getFlag = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : null;
};

const title = getFlag('title') || 'Quiz interactif';
const description = getFlag('desc') || 'Testez vos connaissances.';
const module = getFlag('module');

// Si --module est fourni, on écrit dans public/quiz-content/{module}/questions.json
// Sinon, comportement legacy : public/quiz-content/questions.json
const outputFile = module
    ? `public/quiz-content/${module}/questions.json`
    : 'public/quiz-content/questions.json';

const inputPath = path.join(__dirname, inputFile);
const outputPath = path.join(__dirname, outputFile);

// Crée le dossier de destination si nécessaire
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

console.log(`\n=== 🛠️ Extraction NotebookLM → questions.json ===`);
console.log(`📄 Fichier source : ${inputFile}`);
console.log(`🏷️  Titre         : ${title}`);
console.log(`📁 Destination   : ${outputFile}`);

try {
    // 2. Lecture du fichier HTML brut
    let content = fs.readFileSync(inputPath, 'utf-8');

    // 3. Décodage primaire des entités HTML
    // Le JSON est encodé dans une string elle-même encodée (par ex: &amp;quot; devient &quot; puis ")
    console.log(`🔍 Recherche de la structure de données cachée...`);
    content = content.replace(/&amp;quot;/g, '"');

    // 4. Repérage du début du bloc JSON contenant les questions
    const searchPattern = '[\n    {\n      "question"';
    const startIndex = content.indexOf(searchPattern);

    if (startIndex === -1) {
        throw new Error("Impossible de trouver le début du bloc de questions dans le fichier.");
    }

    // 5. Extraction fine du bloc JSON en comptant les crochets pour gérer l'imbrication
    let depth = 0;
    let endIndex = -1;
    let inString = false;
    let escape = false;

    for (let i = startIndex; i < content.length; i++) {
        const char = content[i];
        
        if (!escape && char === '"') {
            inString = !inString;
        }
        
        if (!inString) {
            if (char === '[') depth++;
            if (char === ']') {
                depth--;
                if (depth === 0) {
                    endIndex = i + 1; // On inclut le crochet fermant
                    break;
                }
            }
        }
        
        if (char === '\\' && !escape) {
            escape = true;
        } else {
            escape = false;
        }
    }

    if (endIndex === -1) {
        throw new Error("Impossible de trouver la fin du bloc JSON (crochets non équilibrés).");
    }

    // 6. Extraction et nettoyage final
    let jsonStr = content.substring(startIndex, endIndex);
    
    // Remplacement des autres entités HTML potentielles (comme les apostrophes ou les esperluettes)
    jsonStr = jsonStr.replace(/&amp;#39;/g, "'").replace(/&amp;amp;/g, "&");

    // 7. Parsing et Sauvegarde
    console.log(`⚙️ Parsing des données...`);
    const questions = JSON.parse(jsonStr);
    
    const finalData = {
        title,
        description,
        questions
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');
    
    console.log(`✅ Succès ! ${questions.length} questions ont été extraites avec leurs réponses et explications.`);
    console.log(`💾 Sauvegardé dans : ${outputFile}\n`);

} catch (error) {
    console.error(`❌ Erreur lors de l'extraction : ${error.message}\n`);
    process.exit(1);
}
