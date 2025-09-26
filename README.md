# 🚀 GitHub Flow - Cheat Sheet Terminal

## 📋 Configuration Initiale

```bash
# Configuration globale Git
git config --global user.name "Ton Nom"
git config --global user.email "ton.email@example.com"

# Cloner un repository
git clone <url-repo>
cd <nom-repo>

# Configurer les branches de base
git checkout -b dev
git push -u origin dev
```

## 🌿 Gestion des Branches

### Création et Navigation
```bash
# Lister toutes les branches
git branch -a

# Créer et basculer vers une nouvelle branche
git checkout -b <nom-branche>
git checkout -b feature/TICKET-123_nouvelle-fonctionnalite

# Basculer vers une branche existante
git checkout <nom-branche>
git checkout dev

# Supprimer une branche locale
git branch -d <nom-branche>

# Supprimer une branche remote
git push origin --delete <nom-branche>
```

### Types de Branches
```bash
# Features (depuis dev)
git checkout dev
git pull origin dev
git checkout -b feature/TICKET-123_description

# Fixes (depuis dev)  
git checkout dev
git pull origin dev
git checkout -b fix/TICKET-456_bug-description

# Hotfixes (depuis main)
git checkout main
git pull origin main  
git checkout -b hotfix/TICKET-789_urgent-fix

# Releases (depuis dev)
git checkout dev
git pull origin dev
git checkout -b release/v1.2.0
```

## 💾 Commits et Push

### Commits Standards
```bash
# Ajouter des fichiers
git add .                    # Tous les fichiers
git add <fichier>           # Fichier spécifique
git add *.js                # Par pattern

# Committer avec message
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login validation bug" 
git commit -m "chore: update dependencies"

# Commit avec description détaillée
git commit -m "feat: add user authentication

- Implement JWT token system
- Add login/logout endpoints  
- Create user session management
- Add password encryption

Closes #123"

# Modifier le dernier commit
git commit --amend -m "nouveau message"

# Commit vide (pour déclencher CI)
git commit --allow-empty -m "chore: trigger CI rerun"
```

### Push et Pull
```bash
# Push première fois (créer la branche remote)
git push -u origin <nom-branche>

# Push normal
git push origin <nom-branche>
git push                    # Si tracking configuré

# Pull avec rebase (recommandé)
git pull --rebase origin <branche>

# Pull standard  
git pull origin <branche>

# Force push (ATTENTION!)
git push --force origin <nom-branche>
```

## 🔀 Merge et Pull Requests

### Merge Local
```bash
# Merger une branche (fast-forward si possible)
git checkout dev
git pull origin dev
git merge feature/ma-feature
git push origin dev

# Merge avec commit de merge (--no-ff)
git merge --no-ff feature/ma-feature

# Merge avec squash (combine tous les commits)
git merge --squash feature/ma-feature
git commit -m "feat: complete user authentication feature"
```

### Workflow Complet Feature → Dev → Main
```bash
# 1. Développer la feature
git checkout dev
git pull origin dev  
git checkout -b feature/TICKET-123_auth
# ... développement ...
git add .
git commit -m "feat: implement user authentication"
git push -u origin feature/TICKET-123_auth

# 2. Merger vers dev (via PR ou direct)
git checkout dev
git pull origin dev
git merge feature/TICKET-123_auth
git push origin dev

# 3. Merger vers main (via PR)
git checkout main
git pull origin main
git merge dev    # ou merge de la feature directement
git push origin main

# 4. Nettoyer
git branch -d feature/TICKET-123_auth
git push origin --delete feature/TICKET-123_auth
```

## 🔧 Correction de Pull Request

### Mettre à Jour une PR
```bash
# Tu es sur ta branche feature avec les corrections
git add .
git commit -m "fix: resolve failing tests - correct validation logic"

# Push vers la même branche (la PR se met à jour automatiquement)
git push origin feature/ma-branche
```

### Amend du Dernier Commit
```bash
# Corriger et ajouter au dernier commit  
git add .
git commit --amend --no-edit

# Force push pour mettre à jour la PR
git push --force origin feature/ma-branche
```

## 🚨 Hotfixes Urgents

### Workflow Hotfix Complet
```bash
# 1. Créer hotfix depuis main
git checkout main
git pull origin main
git checkout -b hotfix/TICKET-999_critical-bug

# 2. Développer le fix
git add .
git commit -m "hotfix: resolve critical payment processing bug"

# 3. Push et créer PR vers main
git push -u origin hotfix/TICKET-999_critical-bug

# 4. Après merge sur main, reporter sur dev
git checkout dev  
git pull origin dev
git merge hotfix/TICKET-999_critical-bug
git push origin dev
```

## 📦 Releases

### Workflow Release
```bash
# 1. Créer branche release depuis dev
git checkout dev
git pull origin dev
git checkout -b release/v1.2.0

# 2. Finaliser (version, changelog, etc.)
git add .
git commit -m "chore: prepare release v1.2.0"
git push -u origin release/v1.2.0

# 3. Merger vers main via PR
# 4. Créer tag
git checkout main
git pull origin main  
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# 5. Reporter sur dev
git checkout dev
git merge main
git push origin dev
```

## 🔍 Statut et Historique

### Informations Repository
```bash
# Statut des fichiers
git status

# Historique des commits
git log --oneline -10        # 10 derniers commits
git log --graph --oneline    # Graphique des branches

# Différences
git diff                     # Changements non stagés
git diff --staged           # Changements stagés
git diff main..dev          # Différences entre branches

# Branches tracking
git branch -vv              # Voir le tracking des branches

# Remote repositories
git remote -v               # Voir les remotes configurés
```

### Recherche et Diagnostic
```bash
# Trouver un commit
git log --grep="fix"        # Chercher dans messages de commit
git log --author="nom"      # Commits d'un auteur

# Voir qui a modifié une ligne
git blame <fichier>

# Historique d'un fichier
git log --follow <fichier>
```

## 🔄 Rebase et Nettoyage

### Rebase Interactif
```bash
# Rebase des 3 derniers commits
git rebase -i HEAD~3

# Rebase sur une branche
git rebase main
git rebase --continue       # Continuer après résolution conflits
git rebase --abort         # Annuler le rebase
```

### Nettoyage
```bash
# Nettoyer les branches merged
git branch --merged | grep -v main | grep -v dev | xargs -n 1 git branch -d

# Nettoyer les branches remote supprimées
git remote prune origin

# Reset vers un commit
git reset --hard HEAD~1     # Annuler dernier commit
git reset --soft HEAD~1     # Garder les changements staged
```

## 🛠️ GitHub CLI (gh)

### Pull Requests avec gh
```bash
# Installer GitHub CLI
# voir: https://cli.github.com/

# Créer une PR
gh pr create --base dev --title "Add user authentication" --body "Description détaillée"

# Lister les PRs
gh pr list

# Voir une PR
gh pr view 42

# Merger une PR  
gh pr merge 42 --merge      # Merge commit
gh pr merge 42 --squash     # Squash merge
gh pr merge 42 --rebase     # Rebase merge

# Checkout une PR
gh pr checkout 42
```

## 🚀 Workflows Automatisés

### Commandes Rapides
```bash
# Script pour nouvelle feature
new_feature() {
  git checkout dev
  git pull origin dev
  git checkout -b feature/$1
  echo "Feature branch $1 créée depuis dev"
}

# Usage: new_feature "TICKET-123_auth"
```

### Aliases Git Utiles
```bash
# Ajouter dans ~/.gitconfig
git config --global alias.st status
git config --global alias.co checkout  
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.unstage "reset HEAD --"
```

## 🎯 Séquences de Workflows Courantes

### 📋 Séquence 1: Nouvelle Fonctionnalité (Feature Branch)
```
# Cas: Développer une nouvelle fonctionnalité depuis zéro
git checkout dev
git pull origin dev
git checkout -b feature/TICKET-123_user-login
# Développement en plusieurs commits
git add src/auth/
git commit -m "feat: add authentication service"
git add src/components/LoginForm.jsx
git commit -m "feat: add login form component"
git add tests/auth.test.js
git commit -m "test: add authentication tests"
git push -u origin feature/TICKET-123_user-login
# Créer PR vers dev → merge → supprimer branche
```

### 🐛 Séquence 2: Correction de Bug Simple
```
# Cas: Bug découvert en développement
git checkout dev
git pull origin dev
git checkout -b fix/TICKET-456_validation-error
git add src/utils/validation.js
git commit -m "fix: resolve email validation regex issue"
git push -u origin fix/TICKET-456_validation-error
# PR vers dev → merge → cleanup
```

### 🚨 Séquence 3: Hotfix Critique en Production
```
# Cas: Bug critique découvert en production
git checkout main
git pull origin main
git checkout -b hotfix/TICKET-789_payment-crash
git add src/payment/processor.js
git commit -m "hotfix: fix null pointer in payment processing"
git push -u origin hotfix/TICKET-789_payment-crash

# Merger vers main (PR d'urgence)
git checkout main
git merge hotfix/TICKET-789_payment-crash
git push origin main
git tag -a v1.2.1 -m "Hotfix release v1.2.1"
git push origin v1.2.1

# Reporter le fix sur dev
git checkout dev
git merge hotfix/TICKET-789_payment-crash
git push origin dev
git branch -d hotfix/TICKET-789_payment-crash
```

### 📦 Séquence 4: Préparation de Release
```
# Cas: Préparer une nouvelle version
git checkout dev
git pull origin dev
git checkout -b release/v1.3.0

# Finalisation de la release
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.3.0 and update changelog"
git add docs/
git commit -m "docs: update API documentation for v1.3.0"
git push -u origin release/v1.3.0

# Merger vers main (via PR)
git checkout main
git merge release/v1.3.0
git tag -a v1.3.0 -m "Release version 1.3.0"
git push origin v1.3.0
git push origin main

# Reporter sur dev et cleanup
git checkout dev
git merge main
git push origin dev
git branch -d release/v1.3.0
```

### 🔄 Séquence 5: Travail Collaboratif (Plusieurs Développeurs)
```
# Développeur A
git checkout dev && git pull origin dev
git checkout -b feature/TICKET-100_api-endpoints
git commit -m "feat: add user API endpoints"
git push -u origin feature/TICKET-100_api-endpoints

# Développeur B (travail sur la même fonctionnalité)
git checkout feature/TICKET-100_api-endpoints
git pull origin feature/TICKET-100_api-endpoints
git commit -m "feat: add API validation middleware"
git push origin feature/TICKET-100_api-endpoints

# Développeur A (récupérer les changes de B)
git pull origin feature/TICKET-100_api-endpoints
git commit -m "feat: add API tests"
git push origin feature/TICKET-100_api-endpoints
```

### ⚡ Séquence 6: Mise à Jour Technique (Dépendances/Refactoring)
```
# Cas: Mise à jour des dépendances
git checkout dev
git pull origin dev
git checkout -b chore/update-dependencies
npm update
git add package.json package-lock.json
git commit -m "chore: update npm dependencies to latest versions"
git add src/
git commit -m "refactor: adapt code to new dependency APIs"
npm test
git push -u origin chore/update-dependencies
```

### 🔧 Séquence 7: Gestion de Conflit
```
# Cas: Conflit lors du merge
git checkout dev
git pull origin dev
git checkout feature/ma-branche
git rebase dev  # ou git merge dev

# Résolution manuelle des conflits
git add fichier-conflit.js
git rebase --continue  # ou git commit si merge
git push --force origin feature/ma-branche  # si rebase
```

### 📝 Séquence 8: Mise à Jour Documentation
```
# Cas: Mise à jour de la documentation uniquement
git checkout main
git pull origin main
git checkout -b docs/update-readme
git add README.md docs/
git commit -m "docs: update installation guide and API reference"
git push -u origin docs/update-readme
# PR directe vers main (pas de tests requis)
```

### 🔄 Séquence 9: Rollback d'une Release
```
# Cas: Release défaillante, retour à la version précédente
git checkout main
git log --oneline -5  # identifier le commit à restaurer

# Option 1: Revert (recommandé)
git revert v1.3.0..HEAD
git commit -m "revert: rollback to v1.2.0 due to critical issues"
git tag -a v1.3.1 -m "Rollback release v1.3.1"
git push origin main
git push origin v1.3.1

# Option 2: Reset (dangereux en production)
# git reset --hard v1.2.0
# git push --force origin main  # TRÈS DANGEREUX
```

### 🚀 Séquence 10: Feature Toggle (Déploiement Progressif)
```
# Cas: Fonctionnalité avec flag de feature
git checkout dev
git pull origin dev
git checkout -b feature/TICKET-200_new-dashboard-toggle
git add src/config/features.js
git commit -m "feat: add dashboard v2 feature flag"
git add src/components/DashboardV2.jsx
git commit -m "feat: implement new dashboard (behind feature flag)"
git push -u origin feature/TICKET-200_new-dashboard-toggle

# Merge vers dev avec feature désactivée
# Plus tard, activation via config:
git checkout main
git add src/config/features.js
git commit -m "feat: enable dashboard v2 for all users"
```

### 🔄 Séquence 11: Synchronisation Branch Outdated
```
# Cas: Branche feature très en retard sur dev
git checkout feature/ma-vieille-branche
git fetch origin

# Option 1: Rebase (historique propre)
git rebase origin/dev
# Résoudre conflits si nécessaire
git push --force origin feature/ma-vieille-branche

# Option 2: Merge (préserve l'historique)
git merge origin/dev
git push origin feature/ma-vieille-branche
```

### 🎯 Séquence 12: Quick Fix sur Feature Branch
```
# Cas: Correction rapide sur une PR en cours de review
git checkout feature/ma-branche-en-review
git add src/component.js
git commit -m "fix: address PR review comments - improve error handling"
git push origin feature/ma-branche-en-review
# La PR se met à jour automatiquement

# Ou pour un fix très mineur:
git add .
git commit --amend --no-edit
git push --force origin feature/ma-branche-en-review
```

### 🔍 Séquence 13: Investigation et Debug
```
# Cas: Investiguer un problème en créant une branche de test
git checkout dev
git checkout -b debug/investigate-performance-issue
git add src/performance/profiler.js
git commit -m "debug: add performance profiling tools"
git add tests/performance.test.js  
git commit -m "debug: add performance regression tests"

# Après investigation, soit merge les améliorations:
git checkout dev
git merge debug/investigate-performance-issue

# Soit supprimer si c'était juste pour tester:
git branch -D debug/investigate-performance-issue
```

## 📊 Matrice de Décision - Quelle Séquence Utiliser ?

| Situation | Branche Source | Type Branch | Target Merge | Urgence |
|-----------|---------------|-------------|--------------|---------|
| Nouvelle fonctionnalité | `dev` | `feature/` | `dev` | Normal |
| Bug non critique | `dev` | `fix/` | `dev` | Normal |
| Bug critique en prod | `main` | `hotfix/` | `main` → `dev` | Urgent |
| Préparation release | `dev` | `release/` | `main` → `dev` | Planifié |
| Documentation | `main` | `docs/` | `main` | Normal |
| Refactoring | `dev` | `refactor/` | `dev` | Normal |
| Dépendances | `dev` | `chore/` | `dev` | Normal |
| Expérimentation | `dev` | `experiment/` | Optionnel | Normal |

## ⚡ Raccourcis pour Séquences Communes

### Script de Nouvelle Feature
```
# Fonction à ajouter dans ~/.bashrc
new_feature() {
    local ticket_id=$1
    local description=$2
    git checkout dev
    git pull origin dev
    git checkout -b "feature/${ticket_id}_${description}"
    echo "✅ Feature branch créée: feature/${ticket_id}_${description}"
}

# Usage: new_feature "TICKET-123" "user-authentication"
```

### Script de Hotfix
```
hotfix() {
    local ticket_id=$1
    local description=$2
    git checkout main
    git pull origin main
    git checkout -b "hotfix/${ticket_id}_${description}"
    echo "🚨 Hotfix branch créée: hotfix/${ticket_id}_${description}"
}
```

### Script de Cleanup Post-Merge
```
cleanup_merged() {
    git checkout dev
    git pull origin dev
    git branch --merged | grep -E "(feature/|fix/|chore/)" | xargs -n 1 git branch -d
    git remote prune origin
    echo "🧹 Branches mergées supprimées"
}
```
```
