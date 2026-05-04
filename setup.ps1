# setup.ps1 — Installation automatique des prérequis pour NotebookLM Quiz Generator
#
# Rôle : Vérifier et installer Node.js, Git et GitHub CLI via winget,
#        puis exécuter `npm install` pour préparer le projet.
#
# Usage : .\setup.ps1  (exécuté par Claude lors d'un /new-quiz ou /deploy)
#
# Idempotent : ce script peut être relancé sans risque — il saute les étapes
#              déjà réalisées et n'altère que les éléments manquants.

# Arrêter immédiatement si une commande échoue (sécurité)
$ErrorActionPreference = "Stop"

# Forcer la sortie console en UTF-8 pour que les accents s'affichent
# correctement quel que soit le shell qui appelle ce script (PowerShell
# direct, Bash sous Windows, Claude Code, extension VS Code).
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# ---------------------------------------------------------------------------
# Message d'accueil — explique ce que le script va faire et pourquoi
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "=== Setup NotebookLM Quiz Generator ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bienvenue ! Ce script vérifie que ton ordinateur a tout ce qu'il" -ForegroundColor White
Write-Host "faut pour créer et déployer ton quiz. Si un outil manque, je"   -ForegroundColor White
Write-Host "l'installerai automatiquement."                                 -ForegroundColor White
Write-Host ""
Write-Host "Outils nécessaires :"                                             -ForegroundColor White
Write-Host "  - Node.js     : moteur qui fait tourner l'application"          -ForegroundColor Gray
Write-Host "  - Git         : système de sauvegarde de ton projet"            -ForegroundColor Gray
Write-Host "  - GitHub CLI  : outil pour publier ton projet sur GitHub"       -ForegroundColor Gray
Write-Host ""
Write-Host "Cela peut prendre quelques minutes au premier lancement."         -ForegroundColor White
Write-Host "---------------------------------------------------------"        -ForegroundColor DarkGray
Write-Host ""

# ---------------------------------------------------------------------------
# Étape 1/5 — Vérifier qu'on est bien dans le repo QUIZ
# ---------------------------------------------------------------------------
# On cherche un marqueur unique du projet pour éviter d'exécuter le script
# par erreur dans un dossier non lié.
Write-Host "[1/5] Vérification du dossier projet..." -ForegroundColor Cyan
if (-not (Test-Path "package.json") -or -not (Test-Path "extract.js")) {
    Write-Host "       X  Ce script doit être lancé depuis la racine du projet QUIZ." -ForegroundColor Red
    Write-Host "          Fichiers attendus : package.json + extract.js"              -ForegroundColor Red
    Write-Host ""
    exit 1
}
Write-Host "       OK Tu es bien dans le dossier QUIZ." -ForegroundColor Green
Write-Host ""

# ---------------------------------------------------------------------------
# Vérifier la disponibilité de winget (gestionnaire de paquets Windows)
# ---------------------------------------------------------------------------
# winget est livré avec Windows 11 et Windows 10 récent. S'il manque,
# on bascule sur des instructions manuelles pour les outils à installer.
$wingetAvailable = $null -ne (Get-Command winget -ErrorAction SilentlyContinue)
if (-not $wingetAvailable) {
    Write-Host "Attention : winget n'est pas disponible sur cette machine." -ForegroundColor Yellow
    Write-Host "Si un outil manque, il faudra l'installer manuellement :"   -ForegroundColor Yellow
    Write-Host "  - Node.js : https://nodejs.org/"                          -ForegroundColor Yellow
    Write-Host "  - Git     : https://git-scm.com/download/win"             -ForegroundColor Yellow
    Write-Host "  - GH CLI  : https://cli.github.com/"                      -ForegroundColor Yellow
    Write-Host ""
}

# ---------------------------------------------------------------------------
# Fonction utilitaire — Vérifier puis installer un outil si nécessaire
# ---------------------------------------------------------------------------
# Paramètres :
#   $command   : nom de la commande à tester (ex : "node", "git", "gh")
#   $wingetId  : identifiant winget (ex : "OpenJS.NodeJS")
#   $label     : nom lisible affiché à l'utilisateur (ex : "Node.js")
#   $purpose   : courte description du rôle de l'outil pour l'utilisateur
# Retour :
#   $true si l'outil est disponible (déjà présent ou nouvellement installé)
#   $false sinon (winget absent ou échec d'installation)
function Install-IfMissing {
    param(
        [string]$command,
        [string]$wingetId,
        [string]$label,
        [string]$purpose
    )

    Write-Host "       $purpose" -ForegroundColor Gray

    if (Get-Command $command -ErrorAction SilentlyContinue) {
        Write-Host "       OK $label est déjà installé." -ForegroundColor Green
        return $true
    }

    if (-not $wingetAvailable) {
        Write-Host "       X  $label manquant — installation manuelle requise (voir liens ci-dessus)." -ForegroundColor Red
        return $false
    }

    Write-Host "       .. $label non détecté. Installation en cours via winget..." -ForegroundColor Yellow
    Write-Host "          (cela peut prendre 30 à 60 secondes)"                    -ForegroundColor DarkGray
    try {
        winget install --id $wingetId --silent --accept-source-agreements --accept-package-agreements
        Write-Host "       OK $label installé avec succès." -ForegroundColor Green
        return $true
    } catch {
        Write-Host "       X  Échec de l'installation de $label : $_" -ForegroundColor Red
        return $false
    }
}

# ---------------------------------------------------------------------------
# Étape 2/5 — Node.js
# ---------------------------------------------------------------------------
Write-Host "[2/5] Vérification de Node.js..." -ForegroundColor Cyan
$nodeOk = Install-IfMissing -command "node" -wingetId "OpenJS.NodeJS" `
                            -label "Node.js" -purpose "Node.js fait tourner le moteur du quiz et les scripts d'extraction."
Write-Host ""

# ---------------------------------------------------------------------------
# Étape 3/5 — Git
# ---------------------------------------------------------------------------
Write-Host "[3/5] Vérification de Git..." -ForegroundColor Cyan
$gitOk = Install-IfMissing -command "git" -wingetId "Git.Git" `
                           -label "Git" -purpose "Git sauvegarde l'historique de ton projet et permet de le pousser en ligne."
Write-Host ""

# ---------------------------------------------------------------------------
# Étape 4/5 — GitHub CLI
# ---------------------------------------------------------------------------
Write-Host "[4/5] Vérification de GitHub CLI..." -ForegroundColor Cyan
$ghOk = Install-IfMissing -command "gh" -wingetId "GitHub.cli" `
                          -label "GitHub CLI" -purpose "GitHub CLI permet de créer ton dépôt GitHub depuis le terminal."
Write-Host ""

# ---------------------------------------------------------------------------
# Rafraîchir le PATH dans la session courante
# ---------------------------------------------------------------------------
# Après une installation winget, les nouveaux exécutables ne sont pas
# accessibles dans la session PowerShell active tant que le PATH n'est pas
# rechargé. On force ici la fusion Machine + User pour récupérer Node, Git, gh.
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + `
            [System.Environment]::GetEnvironmentVariable("Path", "User")

# ---------------------------------------------------------------------------
# Étape 5/5 — Installer les dépendances du projet (npm install)
# ---------------------------------------------------------------------------
Write-Host "[5/5] Installation des dépendances du projet..." -ForegroundColor Cyan
Write-Host "       Les dépendances sont les briques externes (React, Vite, Tailwind)" -ForegroundColor Gray
Write-Host "       que le projet utilise. Elles s'installent dans node_modules/."     -ForegroundColor Gray

if (-not $nodeOk) {
    Write-Host "       -- Étape ignorée : Node.js n'est pas disponible." -ForegroundColor Yellow
} elseif (Test-Path "node_modules") {
    Write-Host "       OK Les dépendances sont déjà installées." -ForegroundColor Green
} else {
    Write-Host "       .. npm install en cours (peut prendre 1 à 2 minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "       OK Dépendances installées avec succès." -ForegroundColor Green
    } else {
        Write-Host "       X  npm install a échoué (code $LASTEXITCODE)."             -ForegroundColor Red
        Write-Host "          Relance ce script ou exécute 'npm install' manuellement." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
Write-Host ""

# ---------------------------------------------------------------------------
# Récap final + prochaine étape claire
# ---------------------------------------------------------------------------
Write-Host "---------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""
if ($nodeOk -and $gitOk -and $ghOk) {
    Write-Host "*** Setup terminé !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaine étape :" -ForegroundColor Cyan
    Write-Host "  Dans Claude Code, tape " -NoNewline -ForegroundColor White
    Write-Host "/new-quiz" -NoNewline -ForegroundColor Yellow
    Write-Host "  pour créer ton premier quiz." -ForegroundColor White
} else {
    Write-Host "Setup partiellement terminé." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Certains outils manquent encore. Installe-les manuellement"   -ForegroundColor Yellow
    Write-Host "via les liens affichés plus haut, puis relance ce script."    -ForegroundColor Yellow
}
Write-Host ""
