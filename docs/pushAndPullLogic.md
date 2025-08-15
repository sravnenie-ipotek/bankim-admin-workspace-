# 🚀 Push and Pull Logic Guide for Developers

This guide explains how to push code changes and pull updates using the BankIM Management Portal hybrid 4-repository architecture.

---

## 📋 **OVERVIEW**

**Architecture**: Hybrid Development Monorepo + Deployment Multi-repos
- **Development**: All work happens in `bankim-admin-workspace`
- **Deployment**: Code is automatically synced to specialized repositories
- **Workflow**: Automated push commands handle both workspace and deployment repositories

**⚠️ CRITICAL WORKFLOW RULE**: 
- **PACKAGES ARE THE LEADING SOURCE** - Each package (`client`, `server`, `shared`) is the authoritative source
- **MONOREPO IS DERIVED** - The monorepo workspace is updated FROM the packages, not the other way around
- **PACKAGE-FIRST DEVELOPMENT** - Always develop and commit in the individual packages first, then sync to monorepo

---

## 🚀 **PUSHING CODE CHANGES**

### **Quick Reference - Push Commands**

```bash
# Push specific package changes
npm run push:dashboard    # Push client changes to workspace + dashboard repos
npm run push:api         # Push server changes to workspace + api repos  
npm run push:shared      # Push shared changes to workspace + shared repos

# Push all changes at once
npm run push:all         # Push all changes to workspace + all deployment repos

# Traditional workspace-only push
git push origin main     # Push only to workspace (use for work-in-progress)
```

### **Step-by-Step Push Workflow**

#### **1. Complete Your Development Work in Individual Packages**
```bash
# ⚠️ IMPORTANT: Work in individual packages first, not monorepo

# For client changes:
cd packages/client/
# Make your changes
git add .
git commit -m "feat: add new component"
git push origin main

# For server changes:
cd packages/server/
# Make your changes  
git add .
git commit -m "feat: add new API endpoint"
git push origin main

# For shared changes:
cd packages/shared/
# Make your changes
git add .
git commit -m "feat: add new types"
git push origin main

# Then sync to monorepo:
cd ../../
npm run sync:from-packages
```

#### **2. Sync Changes from Packages to Monorepo**
```bash
# ⚠️ CRITICAL: Monorepo is updated FROM packages, not the other way around

# After committing in individual packages, sync to monorepo:
cd bankim-admin-workspace/

# Pull latest changes from all package repositories
git pull dashboard main
git pull api main  
git pull shared main

# Or use automated sync command:
npm run sync:from-packages

# Verify monorepo is in sync with packages
git status
git log --oneline -10
```

#### **3. Choose Your Push Strategy**

**Option A: Push Specific Package (Recommended)**
```bash
# ⚠️ PACKAGE-FIRST: Push to individual package repositories first

# If you only changed client code
cd packages/client/
git push origin main

# If you only changed server code  
cd packages/server/
git push origin main

# If you only changed shared types/utilities
cd packages/shared/
git push origin main

# Then sync monorepo from packages
cd ../../
npm run sync:from-packages
```

**Option B: Push All Packages**
```bash
# Push all individual packages first
cd packages/client/ && git push origin main && cd ../..
cd packages/server/ && git push origin main && cd ../..
cd packages/shared/ && git push origin main && cd ../..

# Then sync monorepo
npm run sync:from-packages
```

**Option C: Monorepo-Only Sync (After Package Updates)**
```bash
# Only sync monorepo from updated packages
npm run sync:from-packages
```

#### **4. Verify Push Success**

The push script will show you the results:
```bash
✅ Pushed to workspace: bankim-admin-workspace
✅ Pushed to deployment: bankim-admin-dashboard  
🚀 Deployment pipeline triggered automatically
```

---

## ⬇️ **PULLING CODE CHANGES**

### **Quick Reference - Pull Commands**

```bash
# Pull latest changes from workspace
git pull origin main

# Pull and update all package dependencies
npm install && npm run build

# Fresh start (after major changes by other developers)
npm run clean && npm install && npm run build
```

### **Step-by-Step Pull Workflow**

#### **1. Pull Latest Changes**
```bash
# Navigate to workspace root
cd bankim-admin-workspace/

# Pull latest changes from the development repository
git pull origin main

# Alternative: if you have local changes, use rebase
git pull --rebase origin main
```

#### **2. Update Dependencies** 
```bash
# Install any new dependencies that were added
npm install

# Build shared package if it was updated
cd packages/shared && npm run build && cd ../..

# Verify everything works
npm run dev
```

#### **3. Handle Merge Conflicts** (if any)
```bash
# If there are merge conflicts, resolve them
git status                    # See conflicted files
# Edit files to resolve conflicts
git add .                     # Stage resolved files
git commit                    # Complete the merge

# Test after resolving conflicts
npm run test
```

---

## 🔧 **ADVANCED WORKFLOWS**

### **Working with Branches**

#### **Creating a Feature Branch**
```bash
# Create and switch to a new branch
git checkout -b feature/new-mortgage-calculator

# Work on your feature
# ... make changes ...

# Push feature branch to workspace
git push origin feature/new-mortgage-calculator

# Push feature to deployment repos (only when ready)
npm run push:all
```

#### **Merging Feature Branch**
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature branch
git merge feature/new-mortgage-calculator

# Push merged changes
npm run push:all

# Clean up feature branch
git branch -d feature/new-mortgage-calculator
git push origin --delete feature/new-mortgage-calculator
```

### **Emergency Rollback**

#### **Rollback Workspace Only**
```bash
# Find the last good commit
git log --oneline -10

# Revert to previous commit
git revert HEAD
git push origin main
```

#### **Rollback All Repositories**
```bash
# Revert the problematic commit
git revert HEAD

# Push revert to all repositories
npm run push:all
```

### **Working with Large Changes**

#### **Making Changes Across Multiple Packages**
```bash
# Example: Adding a new API endpoint with frontend integration

# 1. Update shared types first
vim packages/shared/src/types/api.ts
cd packages/shared && npm run build && cd ../..

# 2. Implement server endpoint
vim packages/server/server.js
cd packages/server && npm run test && cd ../..

# 3. Update client to use new endpoint
vim packages/client/src/services/api.ts
cd packages/client && npm run test && cd ../..

# 4. Test full integration
npm run test

# 5. Commit and push all changes together
git add .
git commit -m "feat: add advanced mortgage calculator with new API endpoint"
npm run push:all
```

---

## 👥 **COLLABORATION PATTERNS**

### **Daily Development Workflow**

#### **Start of Day**
```bash
# Pull latest changes
git pull origin main

# Update dependencies and build
npm install
npm run build

# Start development environment
npm run dev
```

#### **During Development**
```bash
# Frequently check for updates from team
git pull origin main

# Push work-in-progress to workspace (without deployment)
git add . && git commit -m "wip: working on feature X"
git push origin main
```

#### **End of Day/Feature Complete**
```bash
# Final testing
npm run test
npm run build

# Clean commit and push to all repositories
git add .
git commit -m "feat: complete feature X implementation"
npm run push:all
```

### **Team Coordination**

#### **Before Major Changes**
```bash
# Announce to team before making breaking changes
# Pull latest changes to avoid conflicts
git pull origin main

# Create feature branch for major changes
git checkout -b feature/major-refactor
```

#### **After Team Member Pushes Major Changes**
```bash
# Pull their changes
git pull origin main

# Rebuild everything to ensure compatibility
npm run clean
npm install
npm run build

# Test your code still works
npm run test
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Push Issues**

#### **Push Rejected (out of sync)**
```bash
# Error: Updates were rejected because the remote contains work...

# Solution: Pull first, then push
git pull origin main
npm run push:all
```

#### **Push Script Fails**
```bash
# Error: Failed to push to deployment repository

# Check if the push script is available
ls scripts/push-4repos.sh

# Check git remotes are configured correctly
git remote -v

# Should show:
# origin    git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git
# dashboard git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git
# api       git@github.com:sravnenie-ipotek/bankim-admin-api.git
# shared    git@github.com:sravnenie-ipotek/bankim-admin-shared.git
```

#### **Merge Conflicts During Pull**
```bash
# Error: Automatic merge failed; fix conflicts and then commit the result

# 1. See which files have conflicts
git status

# 2. Open conflicted files and resolve
# Look for <<<<<<< and >>>>>>> markers

# 3. Stage resolved files
git add resolved-file.ts

# 4. Complete merge
git commit
```

### **Common Development Issues**

#### **Dependencies Out of Sync**
```bash
# Problem: "Module not found" errors after pulling

# Solution: Reinstall dependencies
rm -rf node_modules packages/*/node_modules
npm install
cd packages/shared && npm run build && cd ../..
```

#### **Build Failures After Pull**
```bash
# Problem: Build errors after pulling changes

# Solution: Clean rebuild
npm run clean
npm install
npm run build
```

#### **Database Migration Issues**
```bash
# Problem: Server fails to start after pulling database changes

# Solution: Run migrations
npm run db:migrate --workspace=@bankim/server

# Or check migration status
npm run db:status --workspace=@bankim/server
```

---

## 📊 **MONITORING YOUR PUSHES**

### **Deployment Status**

After pushing with `npm run push:*` commands, monitor deployments:

#### **Client Deployment**
```bash
# Check deployment repository
# Visit: https://github.com/sravnenie-ipotek/bankim-admin-dashboard

# Check if latest commit appears in deployment repo
git log dashboard/main --oneline -5
```

#### **Server Deployment**
```bash
# Check deployment repository
# Visit: https://github.com/sravnenie-ipotek/bankim-admin-api

# Check deployment logs if using Railway/cloud hosting
# Monitor server status at your hosting platform
```

#### **Shared Package**
```bash
# Check package versions
# Visit: https://github.com/sravnenie-ipotek/bankim-admin-shared

# Check if latest commit appears with version tags
git log shared/main --oneline -5
```

### **Repository Synchronization Status**

Monitor all repositories for sync status:
- **Workspace**: https://github.com/sravnenie-ipotek/bankim-admin-workspace-
- **Dashboard**: https://github.com/sravnenie-ipotek/bankim-admin-dashboard
- **API**: https://github.com/sravnenie-ipotek/bankim-admin-api
- **Shared**: https://github.com/sravnenie-ipotek/bankim-admin-shared

---

## ✅ **CHECKLISTS**

### **Before Pushing Checklist**

- [ ] All tests pass: `npm run test`
- [ ] All packages build: `npm run build`
- [ ] Code follows project conventions
- [ ] Commit message follows conventional commits format
- [ ] No sensitive data (API keys, passwords) in code
- [ ] Updated documentation if needed

### **After Pushing Checklist**

- [ ] Verify push success messages
- [ ] Check deployment repository for updates
- [ ] Test deployed application if critical changes
- [ ] Notify team if breaking changes
- [ ] Update project management tools if needed

### **Weekly Maintenance Checklist**

- [ ] Pull latest changes: `git pull origin main`
- [ ] Update dependencies: `npm install`
- [ ] Run security audit: `npm audit`
- [ ] Clean build artifacts: `npm run clean`
- [ ] Verify all tests still pass: `npm run test`

---

## 🚨 **EMERGENCY PROCEDURES**

### **Immediate Rollback (Production Issue)**

```bash
# 1. Identify the problematic commit
git log --oneline -10

# 2. Revert the commit (replace abc123 with actual commit hash)
git revert abc123

# 3. Push revert to all repositories immediately
npm run push:all

# 4. Verify production is restored
# Check deployment repositories for rollback
```

### **Recovery from Corrupted Repository**

```bash
# 1. Backup your current work
cp -r bankim-admin-workspace bankim-admin-workspace-backup

# 2. Clone fresh copy
git clone git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git bankim-admin-workspace-fresh

# 3. Copy your changes to fresh copy
# Manually copy files from backup

# 4. Setup development environment
cd bankim-admin-workspace-fresh
npm install
npm run build
```

### **Fix Deployment Repository Sync Issues**

```bash
# If deployment repositories get out of sync, force resync:

# Reset specific deployment repository
npm run push:dashboard --force

# Reset all deployment repositories
npm run push:all --force

# Verify sync by checking repository histories
git log dashboard/main --oneline -5
git log api/main --oneline -5
git log shared/main --oneline -5
```

---

## 📖 **REPOSITORY REFERENCE**

### **Current Repository URLs**

| Repository | SSH URL | Purpose |
|------------|---------|---------|
| **Workspace** | `git@github.com:sravnenie-ipotek/bankim-admin-workspace-.git` | Main development |
| **Dashboard** | `git@github.com:sravnenie-ipotek/bankim-admin-dashboard.git` | Frontend deployment |
| **API** | `git@github.com:sravnenie-ipotek/bankim-admin-api.git` | Backend deployment |
| **Shared** | `git@github.com:sravnenie-ipotek/bankim-admin-shared.git` | Package distribution |

### **What Gets Deployed Where**

| Source | Target | Content |
|--------|--------|---------|
| **Complete monorepo** | Workspace | Everything: packages, docs, scripts, tools |
| **packages/client/** | Dashboard | React app + production config + dependencies |
| **packages/server/** | API | Express server + DB configs + dependencies |
| **packages/shared/** | Shared | Compiled TypeScript + version tags |

### **Dependency Flow**

```
Development:
packages/client/  ──uses──> packages/shared/ (local file reference)
packages/server/  ──uses──> packages/shared/ (local file reference)

Deployment:
dashboard repo    ──uses──> shared repo (git reference)
api repo         ──uses──> shared repo (git reference)
```

---

## 🆘 **GETTING HELP**

### **Quick Help Commands**

```bash
# Show available npm scripts
npm run

# Show git status with helpful info
git status

# Show recent commits
git log --oneline -10

# Show repository remotes and verify configuration
git remote -v
```

### **Common Commands Reference**

```bash
# Development
npm install                    # Install dependencies
npm run dev                   # Start development servers
npm run build                 # Build all packages
npm run test                  # Run all tests
npm run lint                  # Lint all packages
npm run type-check           # TypeScript validation

# Deployment
npm run push:all             # Deploy to all repositories
npm run push:dashboard       # Deploy frontend only
npm run push:api            # Deploy backend only
npm run push:shared         # Deploy shared package only
npm run push:dry-run        # Test deployment without executing

# Maintenance
git pull origin main         # Pull latest changes
npm run clean               # Clean build artifacts
git remote -v              # Check remote configuration
```

### **Production Issue Example: Dropdown Fix**

```bash
# Real-world scenario: Production dropdowns not working

# 1. Database is fixed ✅, API works ✅, but frontend UI broken ❌
# Issue: React component not mapping API response correctly

# 2. Fix React dropdown component in packages/client/
vim packages/client/src/components/ContentEditModals/DropdownEditModal.tsx

# 3. Test locally
npm run dev
# Verify dropdowns work in development

# 4. Deploy frontend fix to production
npm run push:dashboard -m "Fix dropdown data mapping for mortgage calculator"

# 5. Verify production
# Check https://github.com/sravnenie-ipotek/bankim-admin-dashboard
# Test production website dropdowns

# 6. Sync all repos (optional)
npm run push:all -m "Sync all repos after dropdown fix"
```

---

## 📝 **DOCUMENTATION**

### **Related Documentation**

- **Main README**: `/README.md` - Project overview
- **Architecture Guide**: `/docs/REPOSITORIES_README.md` - Repository architecture
- **Development Guide**: `/docs/CLAUDE.md` - Development instructions
- **Database Guide**: `/docs/systemTranslationLogic.md` - Database architecture

### **Team Resources**

- **GitHub Organizations**: sravnenie-ipotek
- **Documentation**: Check `/docs/` folder
- **Issues**: Create GitHub issue in workspace repository
- **Code Review**: Use pull requests for major changes

---

**Last Updated**: 2025-08-07  
**Architecture Version**: 4-Repository Hybrid  
**Target Users**: Development Team  
**Status**: Production Ready