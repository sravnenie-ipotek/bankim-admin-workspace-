# Sravnenie-Ipotek Repositories Push & Pull Guide

## 📋 Repository Overview

This guide covers the **sravnenie-ipotek** GitHub organization repositories for the Bankim Admin Management Portal.

### 🏗️ Repository Structure

| Repository | Purpose | Technology Stack | URL |
|------------|---------|------------------|-----|
| **🏠 bankim-admin-workspace-** | Complete monorepo for development | Turborepo + npm workspaces | `git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git` |
| **🎨 bankim-admin-dashboard** | React frontend application | React 18 + TypeScript + Vite | `git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git` |
| **🔧 bankim-admin-api** | Node.js backend API | Express + PostgreSQL | `git@github.com:sravnenie-ipotek/bankim-admin-api.git` |
| **📚 bankim-admin-shared** | Shared TypeScript types & utilities | TypeScript library | `git@github.com:sravnenie-ipotek/bankim-admin-shared.git` |

---

## 🚀 Initial Setup

### Clone All Repositories

```bash
# Clone workspace (main development repository)
git clone git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git

# Clone individual repositories
git clone git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git
git clone git@github.com:sravnenie-ipotek/bankim-admin-api.git
git clone git@github.com:sravnenie-ipotek/bankim-admin-shared.git
```

### Setup SSH Keys (if not configured)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Copy public key to GitHub
cat ~/.ssh/id_ed25519.pub
```

---

## 📤 Push Operations

### Individual Repository Pushes

#### 1. Push to Workspace Repository
```bash
cd bankim-admin-workspace-
git add .
git commit -m "feat: your commit message"
git push origin main
```

#### 2. Push to Dashboard Repository
```bash
cd bankim-admin-dashboard
git add .
git commit -m "feat: dashboard updates"
git push origin main
```

#### 3. Push to API Repository
```bash
cd bankim-admin-api
git add .
git commit -m "feat: API updates"
git push origin main
```

#### 4. Push to Shared Repository
```bash
cd bankim-admin-shared
git add .
git commit -m "feat: shared package updates"
git push origin main
```

### Automated Push Scripts

#### Push All Repositories at Once
```bash
# From workspace root
./scripts/push-4repos.sh
```

#### Push Individual Repositories
```bash
# Push workspace
./scripts/push-workspace.sh

# Push dashboard
./scripts/push-dashboard.sh

# Push API
./scripts/push-api.sh

# Push shared
./scripts/push-shared.sh
```

---

## 📥 Pull Operations

### Individual Repository Pulls

#### 1. Pull from Workspace Repository
```bash
cd bankim-admin-workspace-
git pull origin main
```

#### 2. Pull from Dashboard Repository
```bash
cd bankim-admin-dashboard
git pull origin main
```

#### 3. Pull from API Repository
```bash
cd bankim-admin-api
git pull origin main
```

#### 4. Pull from Shared Repository
```bash
cd bankim-admin-shared
git pull origin main
```

### Pull All Repositories
```bash
# Create a script to pull all repositories
for repo in bankim-admin-workspace- bankim-admin-dashboard bankim-admin-api bankim-admin-shared; do
    echo "Pulling $repo..."
    cd $repo
    git pull origin main
    cd ..
done
```

---

## 🔄 Development Workflow

### 1. Development in Workspace (Monorepo)
```bash
# Start development
cd bankim-admin-workspace-
npm install
npm run dev
```

### 2. Deploy to Individual Repositories
```bash
# Build and deploy
npm run build
./scripts/push-4repos.sh
```

### 3. Update Shared Package
```bash
# Update shared package version
cd packages/shared
npm version patch
git push origin main
```

---

## 🏷️ Version Management

### Shared Package Versioning
```bash
cd bankim-admin-shared

# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major

# Push with tags
git push origin main --tags
```

### Update Dependencies
```bash
# Update shared package in other repositories
cd bankim-admin-dashboard
npm update @bankim/shared

cd ../bankim-admin-api
npm update @bankim/shared
```

---

## 🔧 Configuration Files

### Package.json Dependencies
```json
{
  "dependencies": {
    "@bankim/shared": "git+https://github.com/sravnenie-ipotek/bankim-admin-shared.git"
  }
}
```

### Git Remote Configuration
```bash
# Check current remotes
git remote -v

# Add remote if needed
git remote add origin git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. SSH Authentication Failed
```bash
# Test SSH connection
ssh -T git@github.com

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519
```

#### 2. Permission Denied
```bash
# Check repository permissions
# Ensure you have write access to sravnenie-ipotek organization
```

#### 3. Merge Conflicts
```bash
# Resolve conflicts
git status
git add .
git commit -m "resolve merge conflicts"
git push origin main
```

#### 4. Shared Package Not Found
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Repository URLs

### GitHub Web URLs
- **Workspace**: https://github.com/sravnenie-ipotek/bankim-admin-workspace-
- **Dashboard**: https://github.com/sravnenie-ipotek/bankim-admin-dashboard
- **API**: https://github.com/sravnenie-ipotek/bankim-admin-api
- **Shared**: https://github.com/sravnenie-ipotek/bankim-admin-shared

### SSH URLs
- **Workspace**: `git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git`
- **Dashboard**: `git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git`
- **API**: `git@github.com:sravnenie-ipotek/bankim-admin-api.git`
- **Shared**: `git@github.com:sravnenie-ipotek/bankim-admin-shared.git`

### HTTPS URLs
- **Workspace**: `https://github.com/sravnenie-ipotek/bankim-admin-workspace-.git`
- **Dashboard**: `https://github.com/sravnenie-ipotek/bankim-admin-dashboard.git`
- **API**: `https://github.com/sravnenie-ipotek/bankim-admin-api.git`
- **Shared**: `https://github.com/sravnenie-ipotek/bankim-admin-shared.git`

---

## 🔐 Security Notes

### SSH Key Management
- Use SSH keys for authentication
- Keep private keys secure
- Rotate keys regularly
- Use different keys for different organizations

### Access Control
- Ensure proper permissions in sravnenie-ipotek organization
- Use branch protection rules
- Require pull request reviews
- Enable status checks

---

## 📝 Best Practices

### Commit Messages
```bash
# Use conventional commits
git commit -m "feat: add new dashboard component"
git commit -m "fix: resolve API authentication issue"
git commit -m "docs: update README with new instructions"
```

### Branch Strategy
```bash
# Create feature branches
git checkout -b feature/new-feature

# Create hotfix branches
git checkout -b hotfix/critical-fix

# Merge via pull requests
```

### Code Review
- Always create pull requests for changes
- Request reviews from team members
- Address review comments promptly
- Test changes before merging

---

## 🎯 Quick Reference

### Daily Commands
```bash
# Pull latest changes
git pull origin main

# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "your message"

# Push changes
git push origin main
```

### Emergency Commands
```bash
# Revert last commit
git revert HEAD

# Reset to remote
git reset --hard origin/main

# Clean working directory
git clean -fd
```

---

*Last updated: 2025-08-15*
*Repository: sravnenie-ipotek organization*
