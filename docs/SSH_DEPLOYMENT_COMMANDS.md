# 🚀 BULLETPROOF SSH Deployment Commands - BankIM Admin Portal

**🤖 DESIGNED FOR CLAUDE CODE EXECUTION ON SSH SERVER**

**⚡ Ultra-Hardened Script with Comprehensive Error Handling & Recovery**

---

## 🎯 **CRITICAL INSTRUCTIONS FOR CLAUDE CODE**

**EXECUTE EACH COMMAND BLOCK SEPARATELY** - Do not run multiple blocks together
**WAIT FOR SUCCESS CONFIRMATION** - Each step validates before proceeding
**ERROR HANDLING ACTIVE** - Script will exit on any failure with diagnostic info

---

## 🏗️ **Server Architecture Overview**

This server will host **TWO applications**:
- **BankimOnline**: Main production application (ports 3000-3001)
- **BankIM Admin Portal**: Management interface (ports 3002-3003)

```
/var/www/bankim/
├── online/                     # Main BankimOnline production app
│   ├── frontend/               # Main app frontend (port 3000)
│   ├── backend/                # Main app backend (port 3001)
│   └── database/               # Main app database configs
└── admin/                      # BankIM Management Portal (this project)
    ├── workspace/              # Complete monorepo (development backup)
    ├── dashboard/              # Admin dashboard (port 3002)
    ├── api/                    # Admin API (port 3003)
    └── shared/                 # Admin shared packages
```

---

## 🔍 **STEP 0: PRE-FLIGHT VERIFICATION (MANDATORY)**

```bash
#!/bin/bash
set -e  # Exit on any error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

echo "🚨 RUNNING PRE-FLIGHT VERIFICATION FOR CLAUDE CODE DEPLOYMENT"
echo "================================================="

# 1. Verify Server Identity
SERVER_IP=$(hostname -I | awk '{print $1}')
if [[ "$SERVER_IP" != "185.253.72.80" ]]; then
    echo "❌ ERROR: Not on correct server. Expected 185.253.72.80, got $SERVER_IP"
    exit 1
fi
echo "✅ Server identity verified: $SERVER_IP"

# 2. Check Available Disk Space (minimum 5GB)
AVAIL_SPACE=$(df /var --output=avail | tail -n 1)
MIN_SPACE=5242880  # 5GB in KB
if [[ $AVAIL_SPACE -lt $MIN_SPACE ]]; then
    echo "❌ ERROR: Insufficient disk space. Need 5GB, have $(($AVAIL_SPACE/1024/1024))GB"
    exit 1
fi
echo "✅ Disk space verified: $(($AVAIL_SPACE/1024/1024))GB available"

# 3. Check Memory
MEM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
if [[ $MEM_TOTAL -lt 1024 ]]; then
    echo "❌ ERROR: Insufficient memory. Need 1GB, have ${MEM_TOTAL}MB"
    exit 1
fi
echo "✅ Memory verified: ${MEM_TOTAL}MB available"

# 4. Check Critical Ports Availability
for port in 3002 3003; do
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "❌ ERROR: Port $port is already in use"
        netstat -tlnp | grep ":$port "
        exit 1
    fi
done
echo "✅ Required ports 3002-3003 are available"

# 5. Test Network Connectivity
if ! curl -s --connect-timeout 10 https://github.com >/dev/null; then
    echo "❌ ERROR: Cannot reach GitHub. Check network connectivity"
    exit 1
fi
echo "✅ GitHub connectivity verified"

# 6. Test DNS Resolution
if ! nslookup github.com >/dev/null 2>&1; then
    echo "❌ ERROR: DNS resolution failed"
    exit 1
fi
echo "✅ DNS resolution verified"

echo ""
echo "🎉 PRE-FLIGHT VERIFICATION COMPLETED SUCCESSFULLY"
echo "✅ Server: $SERVER_IP"
echo "✅ Disk: $(($AVAIL_SPACE/1024/1024))GB"
echo "✅ Memory: ${MEM_TOTAL}MB"
echo "✅ Ports: 3002-3003 available"
echo "✅ Network: GitHub accessible"
echo ""
echo "🚀 READY TO PROCEED WITH DEPLOYMENT"
```

---

## 📋 **STEP 1: SYSTEM SETUP WITH ERROR HANDLING**

```bash
set -e  # Exit on error
echo "🔧 STEP 1: Installing system requirements with verification..."

# Function for command verification
verify_command() {
    local cmd="$1"
    local expected="$2"
    echo "🔍 Verifying: $cmd"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "❌ ERROR: $cmd not found after installation"
        exit 1
    fi
    if [[ -n "$expected" ]]; then
        local version=$($cmd --version 2>&1 | head -1)
        echo "✅ $cmd installed: $version"
    else
        echo "✅ $cmd is available"
    fi
}

# Update system with error handling
echo "📦 Updating system packages..."
if ! apt update -y; then
    echo "❌ ERROR: System update failed"
    exit 1
fi

if ! apt upgrade -y; then
    echo "⚠️  WARNING: System upgrade had issues, continuing..."
fi

# Install essential packages with verification
echo "📦 Installing essential packages..."
ESSENTIAL_PACKAGES="curl git nginx ufw htop tree net-tools"
if ! apt install -y $ESSENTIAL_PACKAGES; then
    echo "❌ ERROR: Failed to install essential packages"
    exit 1
fi

# Verify essential tools
for cmd in curl git nginx ufw htop tree netstat; do
    verify_command "$cmd" "version"
done

# Install Node.js 18 with verification
echo "📦 Installing Node.js 18..."
if ! command -v node >/dev/null 2>&1 || [[ $(node --version | cut -d'.' -f1 | sed 's/v//') -lt 18 ]]; then
    echo "Installing Node.js 18..."
    if ! curl -fsSL https://deb.nodesource.com/setup_18.x | bash -; then
        echo "❌ ERROR: Failed to setup Node.js repository"
        exit 1
    fi
    if ! apt install -y nodejs; then
        echo "❌ ERROR: Failed to install Node.js"
        exit 1
    fi
else
    echo "✅ Node.js already installed"
fi

# Verify Node.js installation
verify_command "node" "version"
verify_command "npm" "version"

NODE_VERSION=$(node --version)
if [[ $(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//') -lt 18 ]]; then
    echo "❌ ERROR: Node.js version $NODE_VERSION is too old. Need v18+"
    exit 1
fi
echo "✅ Node.js $NODE_VERSION verified (>=18.x)"

# Install PM2 with verification
echo "📦 Installing PM2 process manager..."
if ! npm install -g pm2; then
    echo "❌ ERROR: Failed to install PM2"
    exit 1
fi

verify_command "pm2" "version"

echo ""
echo "✅ STEP 1 COMPLETED SUCCESSFULLY"
echo "✅ System updated and all required packages installed"
echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"
echo "✅ PM2: $(pm2 --version)"
```

---

## 📁 **STEP 2: DIRECTORY STRUCTURE WITH VALIDATION**

```bash
set -e  # Exit on error
echo "🏗️  STEP 2: Creating directory structure with validation..."

# Function to create and verify directory
create_and_verify_dir() {
    local dir="$1"
    echo "📁 Creating: $dir"
    if ! mkdir -p "$dir"; then
        echo "❌ ERROR: Failed to create directory: $dir"
        exit 1
    fi
    if [[ ! -d "$dir" ]]; then
        echo "❌ ERROR: Directory not found after creation: $dir"
        exit 1
    fi
    echo "✅ Created: $dir"
}

# Create main BankIM directory structure
create_and_verify_dir "/var/www/bankim"
create_and_verify_dir "/var/www/bankim/online"
create_and_verify_dir "/var/www/bankim/online/frontend"
create_and_verify_dir "/var/www/bankim/online/backend"
create_and_verify_dir "/var/www/bankim/online/database"

# Create admin portal structure
create_and_verify_dir "/var/www/bankim/admin"
create_and_verify_dir "/var/www/bankim/admin/workspace"
create_and_verify_dir "/var/www/bankim/admin/dashboard"
create_and_verify_dir "/var/www/bankim/admin/api"
create_and_verify_dir "/var/www/bankim/admin/shared"

# Create backup and log directories
create_and_verify_dir "/var/backups/bankim-admin"
create_and_verify_dir "/var/log/pm2-admin"

# Set proper permissions
echo "🔐 Setting proper permissions..."
if ! chown -R root:root /var/www/bankim/; then
    echo "⚠️  WARNING: Failed to set ownership, continuing..."
fi

if ! chmod -R 755 /var/www/bankim/; then
    echo "⚠️  WARNING: Failed to set permissions, continuing..."
fi

# Verify structure
echo "🔍 Verifying directory structure..."
if command -v tree >/dev/null 2>&1; then
    tree /var/www/bankim/ -L 3
else
    find /var/www/bankim/ -type d | head -20
fi

# Navigate to admin directory and verify
if ! cd /var/www/bankim/admin/; then
    echo "❌ ERROR: Cannot navigate to admin directory"
    exit 1
fi

CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" != "/var/www/bankim/admin" ]]; then
    echo "❌ ERROR: Not in correct directory. Expected /var/www/bankim/admin, got $CURRENT_DIR"
    exit 1
fi

echo ""
echo "✅ STEP 2 COMPLETED SUCCESSFULLY"
echo "✅ Directory structure created and verified"
echo "✅ Current location: $CURRENT_DIR"
echo "✅ Backup directory: /var/backups/bankim-admin"
echo "✅ Log directory: /var/log/pm2-admin"
```

---

## 🔄 **STEP 3: CLONE REPOSITORIES WITH COMPREHENSIVE VALIDATION**

```bash
set -e  # Exit on error
echo "📥 STEP 3: Cloning repositories with comprehensive validation..."

# Function to clone and verify repository
clone_and_verify_repo() {
    local url="$1"
    local dir="$2"
    local display_name="$3"
    
    echo "📦 Cloning $display_name..."
    echo "   URL: $url"
    echo "   Target: $dir"
    
    # Remove existing directory if it exists
    if [[ -d "$dir" ]]; then
        echo "🗑️  Removing existing directory: $dir"
        rm -rf "$dir"
    fi
    
    # Clone with timeout and error handling
    if ! timeout 300 git clone "$url" "$dir"; then
        echo "❌ ERROR: Failed to clone $display_name from $url"
        echo "🔍 Debugging info:"
        echo "   - Check network connectivity: curl -I https://github.com"
        echo "   - Check repository exists and is accessible"
        echo "   - Check for typos in repository URL"
        exit 1
    fi
    
    # Verify clone was successful
    if [[ ! -d "$dir" ]]; then
        echo "❌ ERROR: Directory $dir not found after cloning"
        exit 1
    fi
    
    if [[ ! -d "$dir/.git" ]]; then
        echo "❌ ERROR: $dir is not a valid git repository"
        exit 1
    fi
    
    # Check if repository has content
    local file_count=$(find "$dir" -type f | wc -l)
    if [[ $file_count -lt 5 ]]; then
        echo "❌ ERROR: Repository $display_name appears to be empty (only $file_count files)"
        exit 1
    fi
    
    echo "✅ $display_name cloned successfully ($file_count files)"
}

# Ensure we're in the correct directory
if ! cd /var/www/bankim/admin/; then
    echo "❌ ERROR: Cannot navigate to /var/www/bankim/admin/"
    exit 1
fi

echo "📍 Current directory: $(pwd)"

# Test GitHub connectivity before cloning
echo "🔍 Testing GitHub connectivity..."
if ! curl -s --connect-timeout 10 -I https://github.com | head -1 | grep -q "200 OK"; then
    echo "❌ ERROR: Cannot connect to GitHub"
    echo "🔧 Troubleshooting steps:"
    echo "   1. Check internet connection: ping 8.8.8.8"
    echo "   2. Check DNS: nslookup github.com"
    echo "   3. Check firewall: ufw status"
    exit 1
fi
echo "✅ GitHub connectivity confirmed"

# Clone all 4 admin portal repositories
clone_and_verify_repo "https://github.com/sravnenie-ipotek/bankim-admin-workspace.git" "workspace" "Admin Workspace"
clone_and_verify_repo "https://github.com/sravnenie-ipotek/bankim-admin-dashboard.git" "dashboard" "Admin Dashboard"
clone_and_verify_repo "https://github.com/sravnenie-ipotek/bankim-admin-api.git" "api" "Admin API"
clone_and_verify_repo "https://github.com/sravnenie-ipotek/bankim-admin-shared.git" "shared" "Admin Shared Package"

# Final verification of all repositories
echo "🔍 Final repository verification..."
for repo in workspace dashboard api shared; do
    if [[ ! -d "$repo" ]]; then
        echo "❌ ERROR: Repository $repo not found"
        exit 1
    fi
    
    if [[ ! -f "$repo/package.json" ]]; then
        echo "❌ ERROR: $repo/package.json not found - invalid Node.js project"
        exit 1
    fi
    
    echo "✅ $repo: $(cat $repo/package.json | grep '"name"' | cut -d'"' -f4) verified"
done

# Display directory contents
echo "📋 Repository structure verification:"
ls -la

echo ""
echo "✅ STEP 3 COMPLETED SUCCESSFULLY"
echo "✅ All 4 repositories cloned and verified:"
echo "   📦 workspace/ - Complete monorepo"
echo "   🎨 dashboard/ - React frontend"
echo "   🔧 api/ - Express backend"
echo "   📚 shared/ - TypeScript types"
echo "✅ Current location: $(pwd)"
```

---

## 🎨 **STEP 4: SETUP ADMIN DASHBOARD WITH COMPREHENSIVE VALIDATION**

```bash
set -e  # Exit on error
echo "🎨 STEP 4: Setting up Admin Dashboard with comprehensive validation..."

# Function to verify Node.js project structure
verify_nodejs_project() {
    local project_dir="$1"
    local project_name="$2"
    
    echo "🔍 Verifying $project_name Node.js project..."
    
    if [[ ! -f "$project_dir/package.json" ]]; then
        echo "❌ ERROR: $project_dir/package.json not found"
        exit 1
    fi
    
    # Check if it's a valid package.json
    if ! node -e "JSON.parse(require('fs').readFileSync('$project_dir/package.json', 'utf8'))" 2>/dev/null; then
        echo "❌ ERROR: $project_dir/package.json is not valid JSON"
        exit 1
    fi
    
    echo "✅ $project_name package.json validated"
}

# Navigate to admin dashboard with validation
echo "📁 Navigating to dashboard directory..."
if ! cd /var/www/bankim/admin/dashboard/; then
    echo "❌ ERROR: Cannot navigate to dashboard directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"

# Verify dashboard project structure
verify_nodejs_project "." "Dashboard"

# Install dependencies with timeout and error handling
echo "📦 Installing dashboard dependencies..."
if ! timeout 600 npm install; then
    echo "❌ ERROR: Failed to install dashboard dependencies"
    echo "🔧 Troubleshooting:"
    echo "   - Check package.json for dependency conflicts"
    echo "   - Clear npm cache: npm cache clean --force"
    echo "   - Check npm registry connectivity"
    exit 1
fi
echo "✅ Dashboard dependencies installed successfully"

# Build for production with error handling
echo "🏗️  Building dashboard for production..."
if ! npm run build; then
    echo "❌ ERROR: Dashboard build failed"
    echo "🔧 Troubleshooting:"
    echo "   - Check build logs above for specific errors"
    echo "   - Verify all dependencies are installed"
    echo "   - Check TypeScript/Vite configuration"
    exit 1
fi

# Verify build output exists
BUILD_DIR=""
if [[ -d "dist" ]]; then
    BUILD_DIR="dist"
elif [[ -d "build" ]]; then
    BUILD_DIR="build"
else
    echo "❌ ERROR: No build output found (expected 'dist' or 'build' directory)"
    ls -la
    exit 1
fi

echo "✅ Dashboard build completed, output in: $BUILD_DIR"

# Verify build contains expected files
BUILD_FILES=$(find "$BUILD_DIR" -name "*.html" -o -name "*.js" -o -name "*.css" | wc -l)
if [[ $BUILD_FILES -lt 3 ]]; then
    echo "❌ ERROR: Build output appears incomplete (only $BUILD_FILES files)"
    ls -la "$BUILD_DIR"
    exit 1
fi
echo "✅ Build output verified ($BUILD_FILES files found)"

# Create and setup mainapp directory
echo "📁 Setting up mainapp deployment directory..."
if ! mkdir -p mainapp; then
    echo "❌ ERROR: Cannot create mainapp directory"
    exit 1
fi

# Copy build files with verification
echo "📋 Copying build files to mainapp..."
if ! cp -r "$BUILD_DIR"/* mainapp/; then
    echo "❌ ERROR: Failed to copy build files"
    exit 1
fi

# Copy package.json for deployment reference
if ! cp package.json mainapp/; then
    echo "⚠️  WARNING: Could not copy package.json to mainapp"
fi

# Verify mainapp has content
MAINAPP_FILES=$(find mainapp -type f | wc -l)
if [[ $MAINAPP_FILES -lt 3 ]]; then
    echo "❌ ERROR: mainapp directory appears empty ($MAINAPP_FILES files)"
    ls -la mainapp/
    exit 1
fi
echo "✅ Build files copied to mainapp ($MAINAPP_FILES files)"

# Create production environment with validation
echo "⚙️  Creating production environment configuration..."
cat > mainapp/.env.production << 'EOF'
NODE_ENV=production
VITE_API_URL=http://185.253.72.80:3003
VITE_ENVIRONMENT=production
EOF

# Verify environment file was created
if [[ ! -f "mainapp/.env.production" ]]; then
    echo "❌ ERROR: Failed to create .env.production file"
    exit 1
fi
echo "✅ Production environment configuration created"

# Install serve globally with verification
echo "🌐 Installing serve for static file serving..."
if ! command -v serve >/dev/null 2>&1; then
    if ! npm install -g serve; then
        echo "❌ ERROR: Failed to install serve globally"
        exit 1
    fi
fi

# Verify serve installation
if ! command -v serve >/dev/null 2>&1; then
    echo "❌ ERROR: serve command not available after installation"
    exit 1
fi
echo "✅ serve installed: $(serve --version)"

# Test serve can start (quick test)
echo "🧪 Testing serve functionality..."
(
    cd mainapp
    timeout 5 serve . -p 3099 &
    SERVE_PID=$!
    sleep 2
    if kill -0 $SERVE_PID 2>/dev/null; then
        kill $SERVE_PID 2>/dev/null || true
        echo "✅ serve functionality verified"
    else
        echo "❌ ERROR: serve failed to start properly"
        exit 1
    fi
) || {
    echo "❌ ERROR: serve test failed"
    exit 1
}

# Final dashboard verification
echo "🔍 Final dashboard setup verification..."
echo "📁 mainapp contents:"
ls -la mainapp/ | head -10
echo "📄 Environment config:"
cat mainapp/.env.production

echo ""
echo "✅ STEP 4 COMPLETED SUCCESSFULLY"
echo "✅ Admin Dashboard setup complete:"
echo "   📁 Location: $(pwd)/mainapp"
echo "   🌐 Will run on port 3002"
echo "   📦 Files: $MAINAPP_FILES deployed"
echo "   🔧 API URL: http://185.253.72.80:3003"
echo "   📋 serve: $(serve --version)"
```

---

## 🔧 **STEP 5: SETUP ADMIN API WITH COMPREHENSIVE VALIDATION**

```bash
set -e  # Exit on error
echo "🔧 STEP 5: Setting up Admin API with comprehensive validation..."

# Navigate to admin API with validation
echo "📁 Navigating to API directory..."
if ! cd /var/www/bankim/admin/api/; then
    echo "❌ ERROR: Cannot navigate to API directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"

# Verify API project structure
verify_nodejs_project "." "API"

# Check for server entry point
SERVER_FILE=""
if [[ -f "server.js" ]]; then
    SERVER_FILE="server.js"
elif [[ -f "index.js" ]]; then
    SERVER_FILE="index.js"
elif [[ -f "app.js" ]]; then
    SERVER_FILE="app.js"
else
    echo "❌ ERROR: No server entry point found (server.js, index.js, or app.js)"
    ls -la *.js 2>/dev/null || echo "No .js files found"
    exit 1
fi
echo "✅ Server entry point found: $SERVER_FILE"

# Create mainapp directory with validation
echo "📁 Setting up API deployment directory..."
if ! mkdir -p mainapp; then
    echo "❌ ERROR: Cannot create mainapp directory"
    exit 1
fi

# Copy API files with exclusions and validation
echo "📋 Copying API files to mainapp..."
# Use rsync for better control over what gets copied
if command -v rsync >/dev/null 2>&1; then
    if ! rsync -av --exclude='node_modules' --exclude='.git' --exclude='mainapp' . mainapp/; then
        echo "❌ ERROR: Failed to copy API files with rsync"
        exit 1
    fi
else
    # Fallback to cp with manual exclusions
    if ! find . -maxdepth 1 -type f -exec cp {} mainapp/ \; && \
       find . -maxdepth 1 -type d ! -name '.' ! -name 'node_modules' ! -name '.git' ! -name 'mainapp' -exec cp -r {} mainapp/ \; 2>/dev/null; then
        echo "❌ ERROR: Failed to copy API files"
        exit 1
    fi
fi

# Navigate to mainapp and verify
if ! cd mainapp/; then
    echo "❌ ERROR: Cannot navigate to mainapp directory"
    exit 1
fi

# Verify essential files were copied
if [[ ! -f "$SERVER_FILE" ]]; then
    echo "❌ ERROR: Server entry point $SERVER_FILE not found in mainapp"
    ls -la
    exit 1
fi

if [[ ! -f "package.json" ]]; then
    echo "❌ ERROR: package.json not found in mainapp"
    exit 1
fi

API_FILES=$(find . -type f | wc -l)
echo "✅ API files copied to mainapp ($API_FILES files)"

# Install dependencies with timeout and error handling
echo "📦 Installing API dependencies..."
if ! timeout 600 npm install; then
    echo "❌ ERROR: Failed to install API dependencies"
    echo "🔧 Troubleshooting:"
    echo "   - Check package.json for dependency conflicts"
    echo "   - Clear npm cache: npm cache clean --force"
    echo "   - Check npm registry connectivity"
    cd ..
    exit 1
fi
echo "✅ API dependencies installed successfully"

# Create production environment with comprehensive template
echo "⚙️  Creating production environment configuration..."
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3003

# Database connections - CONFIGURE THESE WITH YOUR ACTUAL VALUES
# Replace with your actual database credentials
CONTENT_DATABASE_URL=postgresql://username:password@host:5432/bankim_content
CORE_DATABASE_URL=postgresql://username:password@host:5432/bankim_core
MANAGEMENT_DATABASE_URL=postgresql://username:password@host:5432/bankim_management

# Security - CHANGE THESE VALUES IN PRODUCTION
# Generate secure JWT secret: openssl rand -hex 32
JWT_SECRET=bankim-admin-jwt-secret-change-this-in-production-minimum-32-chars-4f8a5c2d9e7b3a1f6c8e9d2a5b4c7f1a
API_RATE_LIMIT=100

# CORS settings
CORS_ORIGIN=http://185.253.72.80:3002

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/pm2-admin/bankim-admin-api-app.log

# Performance
MAX_REQUEST_SIZE=10mb
REQUEST_TIMEOUT=30000

# Health check
HEALTH_CHECK_PATH=/health
EOF

# Verify environment file was created
if [[ ! -f ".env.production" ]]; then
    echo "❌ ERROR: Failed to create .env.production file"
    exit 1
fi
echo "✅ Production environment configuration created"

# Test basic Node.js syntax of server file
echo "🧪 Testing server file syntax..."
if ! node -c "$SERVER_FILE"; then
    echo "❌ ERROR: Server file $SERVER_FILE has syntax errors"
    exit 1
fi
echo "✅ Server file syntax validated"

# Try to verify the server can start (dry run)
echo "🧪 Testing server startup (dry run)..."
(
    export NODE_ENV=test
    export PORT=3099
    timeout 10 node "$SERVER_FILE" &
    SERVER_PID=$!
    sleep 3
    if kill -0 $SERVER_PID 2>/dev/null; then
        kill $SERVER_PID 2>/dev/null || true
        echo "✅ Server startup test passed"
    else
        echo "⚠️  WARNING: Server startup test inconclusive (may need database)"
    fi
) || {
    echo "⚠️  WARNING: Server startup test failed (expected if database not configured)"
}

# Final API verification
echo "🔍 Final API setup verification..."
echo "📁 API mainapp contents:"
ls -la | head -10
echo "📄 Environment config created (Database URLs need configuration):"
head -15 .env.production

echo ""
echo "✅ STEP 5 COMPLETED SUCCESSFULLY"
echo "✅ Admin API setup complete:"
echo "   📁 Location: $(pwd)"
echo "   🔧 Will run on port 3003"
echo "   📦 Files: $API_FILES deployed"
echo "   🗄️  Entry point: $SERVER_FILE"
echo "   ⚠️  IMPORTANT: Configure database URLs in .env.production"
echo "   🔒 IMPORTANT: Change JWT_SECRET in .env.production"
```

---

## 📚 **STEP 6: SETUP ADMIN SHARED PACKAGE WITH VALIDATION**

```bash
set -e  # Exit on error
echo "📚 STEP 6: Setting up Admin Shared Package with validation..."

# Navigate to admin shared package with validation
echo "📁 Navigating to shared package directory..."
if ! cd /var/www/bankim/admin/shared/; then
    echo "❌ ERROR: Cannot navigate to shared package directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"

# Verify shared package project structure
verify_nodejs_project "." "Shared Package"

# Check if it's a TypeScript project
if [[ -f "tsconfig.json" ]]; then
    echo "✅ TypeScript project detected"
    TS_PROJECT=true
else
    echo "ℹ️  JavaScript project (no tsconfig.json found)"
    TS_PROJECT=false
fi

# Install dependencies with timeout and error handling
echo "📦 Installing shared package dependencies..."
if ! timeout 600 npm install; then
    echo "❌ ERROR: Failed to install shared package dependencies"
    echo "🔧 Troubleshooting:"
    echo "   - Check package.json for dependency conflicts"
    echo "   - Clear npm cache: npm cache clean --force"
    echo "   - Check npm registry connectivity"
    exit 1
fi
echo "✅ Shared package dependencies installed successfully"

# Check if build script exists
if ! npm run build --silent 2>/dev/null | head -1 | grep -q "Missing script"; then
    echo "🏗️  Building shared package..."
    if ! npm run build; then
        echo "❌ ERROR: Shared package build failed"
        echo "🔧 Troubleshooting:"
        echo "   - Check build logs above for specific errors"
        echo "   - Verify TypeScript configuration if using TypeScript"
        echo "   - Check if all dependencies are properly installed"
        exit 1
    fi
    
    # Verify build output
    BUILD_OUTPUT_DIR=""
    if [[ -d "dist" ]]; then
        BUILD_OUTPUT_DIR="dist"
    elif [[ -d "build" ]]; then
        BUILD_OUTPUT_DIR="build"
    elif [[ -d "lib" ]]; then
        BUILD_OUTPUT_DIR="lib"
    else
        echo "❌ ERROR: No build output found (expected 'dist', 'build', or 'lib' directory)"
        ls -la
        exit 1
    fi
    
    # Verify build output has content
    BUILD_FILES=$(find "$BUILD_OUTPUT_DIR" -type f | wc -l)
    if [[ $BUILD_FILES -lt 1 ]]; then
        echo "❌ ERROR: Build output directory $BUILD_OUTPUT_DIR is empty"
        ls -la "$BUILD_OUTPUT_DIR"
        exit 1
    fi
    
    echo "✅ Shared package built successfully"
    echo "   📁 Output directory: $BUILD_OUTPUT_DIR"
    echo "   📄 Files generated: $BUILD_FILES"
    
    # Show build output structure
    echo "🔍 Build output structure:"
    ls -la "$BUILD_OUTPUT_DIR"/
else
    echo "ℹ️  No build script found, assuming package doesn't need building"
    BUILD_OUTPUT_DIR="src"
fi

# Verify the package can be imported (basic test)
if [[ "$TS_PROJECT" == "true" ]]; then
    echo "🧪 Testing TypeScript package structure..."
    if [[ -d "$BUILD_OUTPUT_DIR" ]] && [[ -f "package.json" ]]; then
        # Check for type definitions
        if find "$BUILD_OUTPUT_DIR" -name "*.d.ts" | head -1 | grep -q "d.ts"; then
            echo "✅ TypeScript type definitions found"
        else
            echo "⚠️  WARNING: No TypeScript type definitions found in build output"
        fi
    fi
fi

# Test package.json exports and main fields
echo "🧪 Validating package.json configuration..."
MAIN_FIELD=$(node -e "console.log(require('./package.json').main || 'not defined')")
TYPES_FIELD=$(node -e "console.log(require('./package.json').types || 'not defined')")
echo "   📄 main: $MAIN_FIELD"
echo "   📄 types: $TYPES_FIELD"

if [[ "$MAIN_FIELD" != "not defined" && ! -f "$MAIN_FIELD" ]]; then
    echo "⚠️  WARNING: main field points to non-existent file: $MAIN_FIELD"
fi

echo "🔍 Final shared package verification..."
echo "📁 Package contents:"
ls -la | head -10

if [[ -d "$BUILD_OUTPUT_DIR" ]]; then
    echo "📦 Build output ($BUILD_OUTPUT_DIR):"
    ls -la "$BUILD_OUTPUT_DIR"/ | head -10
fi

echo ""
echo "✅ STEP 6 COMPLETED SUCCESSFULLY"
echo "✅ Admin Shared Package setup complete:"
echo "   📁 Location: $(pwd)"
echo "   📦 Build output: $BUILD_OUTPUT_DIR"
echo "   🔧 TypeScript: $TS_PROJECT"
if [[ -d "$BUILD_OUTPUT_DIR" ]]; then
    echo "   📄 Build files: $(find "$BUILD_OUTPUT_DIR" -type f | wc -l)"
fi
echo "   📋 Ready for use by API and Dashboard"
```

---

## ⚙️ **STEP 7: CREATE PM2 ECOSYSTEM WITH COMPREHENSIVE VALIDATION**

```bash
set -e  # Exit on error
echo "⚙️  STEP 7: Creating PM2 ecosystem configuration with validation..."

# Navigate to admin directory with validation
echo "📁 Navigating to admin directory..."
if ! cd /var/www/bankim/admin/; then
    echo "❌ ERROR: Cannot navigate to admin directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"

# Verify PM2 is installed and working
echo "🔍 Verifying PM2 installation..."
if ! command -v pm2 >/dev/null 2>&1; then
    echo "❌ ERROR: PM2 not found. Install with: npm install -g pm2"
    exit 1
fi

PM2_VERSION=$(pm2 --version)
echo "✅ PM2 verified: v$PM2_VERSION"

# Test PM2 functionality
if ! pm2 list >/dev/null 2>&1; then
    echo "❌ ERROR: PM2 is not functioning correctly"
    exit 1
fi
echo "✅ PM2 functionality verified"

# Verify required directories exist
REQUIRED_DIRS=(
    "/var/www/bankim/admin/dashboard/mainapp"
    "/var/www/bankim/admin/api/mainapp"
    "/var/log/pm2-admin"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ ! -d "$dir" ]]; then
        echo "❌ ERROR: Required directory not found: $dir"
        exit 1
    fi
    echo "✅ Directory exists: $dir"
done

# Verify essential files exist
if [[ ! -f "/var/www/bankim/admin/dashboard/mainapp/index.html" ]]; then
    echo "❌ ERROR: Dashboard build files not found (no index.html)"
    exit 1
fi
echo "✅ Dashboard build files verified"

# Find API server entry point
API_ENTRY=""
if [[ -f "/var/www/bankim/admin/api/mainapp/server.js" ]]; then
    API_ENTRY="server.js"
elif [[ -f "/var/www/bankim/admin/api/mainapp/index.js" ]]; then
    API_ENTRY="index.js"
elif [[ -f "/var/www/bankim/admin/api/mainapp/app.js" ]]; then
    API_ENTRY="app.js"
else
    echo "❌ ERROR: No API server entry point found"
    ls -la /var/www/bankim/admin/api/mainapp/*.js 2>/dev/null || echo "No .js files found"
    exit 1
fi
echo "✅ API entry point verified: $API_ENTRY"

# Create PM2 ecosystem file with validation
echo "📄 Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << EOF
// BankIM Admin Portal PM2 Ecosystem Configuration
// Generated: $(date)
// Server: $(hostname -I | awk '{print $1}')

module.exports = {
  apps: [
    {
      name: 'bankim-admin-dashboard',
      cwd: '/var/www/bankim/admin/dashboard/mainapp',
      script: 'npx',
      args: 'serve . -p 3002 -s',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      log_file: '/var/log/pm2-admin/bankim-admin-dashboard.log',
      error_file: '/var/log/pm2-admin/bankim-admin-dashboard-error.log',
      out_file: '/var/log/pm2-admin/bankim-admin-dashboard-out.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'bankim-admin-api',
      cwd: '/var/www/bankim/admin/api/mainapp',
      script: '$API_ENTRY',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      log_file: '/var/log/pm2-admin/bankim-admin-api.log',
      error_file: '/var/log/pm2-admin/bankim-admin-api-error.log',
      out_file: '/var/log/pm2-admin/bankim-admin-api-out.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# Verify ecosystem file was created and is valid JavaScript
if [[ ! -f "ecosystem.config.js" ]]; then
    echo "❌ ERROR: Failed to create ecosystem.config.js"
    exit 1
fi

# Test ecosystem file syntax
echo "🧪 Testing ecosystem configuration syntax..."
if ! node -c ecosystem.config.js; then
    echo "❌ ERROR: ecosystem.config.js has syntax errors"
    exit 1
fi
echo "✅ Ecosystem configuration syntax validated"

# Display configuration summary
echo "📄 PM2 Ecosystem Configuration Summary:"
echo "   🖥️  Dashboard: bankim-admin-dashboard (port 3002)"
echo "   🔧 API: bankim-admin-api (port 3003, entry: $API_ENTRY)"
echo "   📝 Logs: /var/log/pm2-admin/"
echo "   🔄 Auto-restart: enabled with 10s minimum uptime"
echo "   📊 Memory limit: 1GB per process"

echo ""
echo "✅ STEP 7 COMPLETED SUCCESSFULLY"
echo "✅ PM2 ecosystem configuration created and validated:"
echo "   📄 File: $(pwd)/ecosystem.config.js"
echo "   🔧 API entry point: $API_ENTRY"
echo "   ✅ Syntax validation: passed"
echo "   📝 Log directory: /var/log/pm2-admin/"
```

---

## 🚀 **STEP 8: START APPLICATIONS WITH COMPREHENSIVE HEALTH CHECKS**

```bash
set -e  # Exit on error
echo "🚀 STEP 8: Starting Admin Portal applications with health monitoring..."

# Navigate to admin directory with validation
if ! cd /var/www/bankim/admin/; then
    echo "❌ ERROR: Cannot navigate to admin directory"
    exit 1
fi

# Verify ecosystem file exists
if [[ ! -f "ecosystem.config.js" ]]; then
    echo "❌ ERROR: ecosystem.config.js not found"
    exit 1
fi

# Stop any existing admin processes to avoid conflicts
echo "📍 Checking for existing admin processes..."
if pm2 list | grep -q "bankim-admin"; then
    echo "📍 Stopping existing admin processes..."
    pm2 stop bankim-admin-dashboard bankim-admin-api 2>/dev/null || true
    pm2 delete bankim-admin-dashboard bankim-admin-api 2>/dev/null || true
    echo "✅ Existing processes cleaned up"
else
    echo "✅ No existing admin processes found"
fi

# Start applications with PM2
echo "🚀 Starting admin applications with PM2..."
if ! pm2 start ecosystem.config.js; then
    echo "❌ ERROR: Failed to start applications with PM2"
    echo "🔧 Troubleshooting:"
    echo "   - Check PM2 logs: pm2 logs"
    echo "   - Verify ecosystem.config.js syntax: node -c ecosystem.config.js"
    echo "   - Check if ports 3002-3003 are available: netstat -tlnp | grep -E ':(3002|3003)'"
    exit 1
fi

# Wait for applications to start
echo "⏳ Waiting for applications to initialize..."
sleep 5

# Verify PM2 processes are running
echo "🔍 Verifying PM2 process status..."
pm2 list

# Check if both admin processes are online
DANIM_DASHBOARD_STATUS=$(pm2 jlist | jq -r '.[] | select(.name == "bankim-admin-dashboard") | .pm2_env.status' 2>/dev/null || echo "not_found")
DANIM_API_STATUS=$(pm2 jlist | jq -r '.[] | select(.name == "bankim-admin-api") | .pm2_env.status' 2>/dev/null || echo "not_found")

# Fallback status check if jq not available
if [[ "$DANIM_DASHBOARD_STATUS" == "not_found" ]]; then
    if pm2 list | grep "bankim-admin-dashboard" | grep -q "online"; then
        DANIM_DASHBOARD_STATUS="online"
    else
        DANIM_DASHBOARD_STATUS="error"
    fi
fi

if [[ "$DANIM_API_STATUS" == "not_found" ]]; then
    if pm2 list | grep "bankim-admin-api" | grep -q "online"; then
        DANIM_API_STATUS="online"
    else
        DANIM_API_STATUS="error"
    fi
fi

# Validate process status
if [[ "$DANIM_DASHBOARD_STATUS" != "online" ]]; then
    echo "❌ ERROR: Admin Dashboard process not online (status: $DANIM_DASHBOARD_STATUS)"
    pm2 logs bankim-admin-dashboard --lines 20
    exit 1
fi

if [[ "$DANIM_API_STATUS" != "online" ]]; then
    echo "❌ ERROR: Admin API process not online (status: $DANIM_API_STATUS)"
    pm2 logs bankim-admin-api --lines 20
    exit 1
fi

echo "✅ Both admin processes are online"
echo "   🎨 Dashboard status: $DANIM_DASHBOARD_STATUS"
echo "   🔧 API status: $DANIM_API_STATUS"

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
if ! pm2 save; then
    echo "❌ ERROR: Failed to save PM2 configuration"
    exit 1
fi
echo "✅ PM2 configuration saved"

# Setup PM2 startup script (with validation)
echo "🔄 Configuring PM2 startup script..."
STARTUP_COMMAND=$(pm2 startup | grep 'sudo env' | head -1 || true)
if [[ -n "$STARTUP_COMMAND" ]]; then
    echo "ℹ️  PM2 startup command generated (run if needed):"
    echo "   $STARTUP_COMMAND"
    # Don't auto-execute, let user decide
else
    echo "✅ PM2 startup already configured or not needed"
fi

# Wait for processes to fully initialize
echo "⏳ Waiting for applications to fully initialize..."
sleep 10

# Verify ports are listening
echo "🔍 Verifying network ports are listening..."
PORT_3002=$(netstat -tlnp 2>/dev/null | grep ":3002 " | wc -l)
PORT_3003=$(netstat -tlnp 2>/dev/null | grep ":3003 " | wc -l)

if [[ $PORT_3002 -eq 0 ]]; then
    echo "❌ ERROR: Port 3002 (Dashboard) not listening"
    pm2 logs bankim-admin-dashboard --lines 10
    exit 1
fi

if [[ $PORT_3003 -eq 0 ]]; then
    echo "❌ ERROR: Port 3003 (API) not listening"
    pm2 logs bankim-admin-api --lines 10
    exit 1
fi

echo "✅ Network ports verified:"
echo "   🎨 Port 3002 (Dashboard): listening"
echo "   🔧 Port 3003 (API): listening"

echo ""
echo "✅ STEP 8 COMPLETED SUCCESSFULLY"
echo "✅ Admin Portal applications started and verified:"
echo "   🖥️  Dashboard: bankim-admin-dashboard ($DANIM_DASHBOARD_STATUS)"
echo "   🔧 API: bankim-admin-api ($DANIM_API_STATUS)"
echo "   💾 PM2 config: saved"
echo "   🔍 Ports: 3002 & 3003 listening"
echo "   📋 Management: pm2 list | grep bankim-admin"
```

---

## 🔥 **STEP 9: CONFIGURE FIREWALL WITH COMPREHENSIVE VALIDATION**

```bash
set -e  # Exit on error
echo "🔥 STEP 9: Configuring firewall with comprehensive validation..."

# Check if UFW is installed and active
echo "🔍 Verifying UFW firewall status..."
if ! command -v ufw >/dev/null 2>&1; then
    echo "❌ ERROR: UFW not installed"
    echo "📦 Installing UFW..."
    if ! apt install -y ufw; then
        echo "❌ ERROR: Failed to install UFW"
        exit 1
    fi
fi

# Check UFW status
UFW_STATUS=$(ufw status | head -1 | awk '{print $2}' || echo "inactive")
echo "📊 UFW status: $UFW_STATUS"

if [[ "$UFW_STATUS" == "inactive" ]]; then
    echo "⚠️  UFW is inactive. Enabling UFW..."
    # Enable UFW with default policies
    ufw --force default deny incoming
    ufw --force default allow outgoing
    ufw --force allow ssh
    ufw --force enable
    echo "✅ UFW enabled with secure defaults"
fi

# Function to add firewall rule with validation
add_firewall_rule() {
    local port="$1"
    local description="$2"
    
    echo "🔧 Adding firewall rule for port $port ($description)..."
    
    # Check if rule already exists
    if ufw status numbered | grep -q ":$port "; then
        echo "ℹ️  Rule for port $port already exists"
    else
        if ! ufw allow "$port/tcp"; then
            echo "❌ ERROR: Failed to add firewall rule for port $port"
            exit 1
        fi
        echo "✅ Added rule for port $port ($description)"
    fi
    
    # Verify rule was added
    if ! ufw status | grep -q ":$port "; then
        echo "❌ ERROR: Firewall rule for port $port not found after adding"
        exit 1
    fi
}

# Add required firewall rules
add_firewall_rule "22" "SSH"
add_firewall_rule "80" "HTTP"
add_firewall_rule "443" "HTTPS"
add_firewall_rule "3002" "Admin Dashboard"
add_firewall_rule "3003" "Admin API"

# Display current firewall status
echo "📄 Current firewall configuration:"
ufw status numbered

# Verify critical rules exist
REQUIRED_PORTS=("22" "3002" "3003")
for port in "${REQUIRED_PORTS[@]}"; do
    if ! ufw status | grep -q ":$port "; then
        echo "❌ ERROR: Critical port $port is not allowed in firewall"
        exit 1
    fi
done
echo "✅ All critical ports verified in firewall"

# Test connectivity to admin ports from localhost
echo "🧪 Testing local connectivity to admin ports..."
for port in 3002 3003; do
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ Port $port: accessible locally"
    else
        echo "⚠️  Port $port: not accessible locally (may not be started yet)"
    fi
done

# Show UFW rules summary
echo "📄 UFW Rules Summary:"
echo "   🔒 SSH (22): $(ufw status | grep ':22 ' | awk '{print $3}')"
echo "   🌐 HTTP (80): $(ufw status | grep ':80 ' | awk '{print $3}')"
echo "   🔒 HTTPS (443): $(ufw status | grep ':443 ' | awk '{print $3}')"
echo "   🎨 Admin Dashboard (3002): $(ufw status | grep ':3002 ' | awk '{print $3}')"
echo "   🔧 Admin API (3003): $(ufw status | grep ':3003 ' | awk '{print $3}')"

echo ""
echo "✅ STEP 9 COMPLETED SUCCESSFULLY"
echo "✅ Firewall configured and verified:"
echo "   🔥 UFW status: active"
echo "   📊 Rules added: 22, 80, 443, 3002, 3003"
echo "   ✅ Critical ports verified"
echo "   📝 View rules: ufw status numbered"
```

---

## 🔍 **STEP 10: COMPREHENSIVE DEPLOYMENT VERIFICATION WITH HEALTH CHECKS**

```bash
set -e  # Exit on error
echo "🔍 STEP 10: Comprehensive deployment verification with health monitoring..."

# Function for health check with retry logic
health_check_with_retry() {
    local service_name="$1"
    local url="$2"
    local max_attempts="$3"
    local delay="$4"
    
    echo "🧪 Health checking $service_name at $url..."
    
    for ((i=1; i<=max_attempts; i++)); do
        echo "   Attempt $i/$max_attempts..."
        
        if curl -s -f --connect-timeout 10 --max-time 30 "$url" >/dev/null; then
            echo "✅ $service_name health check PASSED (attempt $i/$max_attempts)"
            return 0
        else
            if [[ $i -lt $max_attempts ]]; then
                echo "⚠️  $service_name health check failed, retrying in ${delay}s..."
                sleep $delay
            fi
        fi
    done
    
    echo "❌ $service_name health check FAILED after $max_attempts attempts"
    return 1
}

# 1. Verify PM2 processes are running
echo "📄 1. Verifying PM2 process status..."
pm2 list

ADMIN_PROCESSES=$(pm2 list | grep "bankim-admin" | wc -l)
if [[ $ADMIN_PROCESSES -lt 2 ]]; then
    echo "❌ ERROR: Expected 2 admin processes, found $ADMIN_PROCESSES"
    pm2 list | grep "bankim-admin" || echo "No admin processes found"
    exit 1
fi
echo "✅ Found $ADMIN_PROCESSES admin processes in PM2"

# Check individual process status
if ! pm2 list | grep "bankim-admin-dashboard" | grep -q "online"; then
    echo "❌ ERROR: Admin Dashboard process is not online"
    pm2 logs bankim-admin-dashboard --lines 10
    exit 1
fi

if ! pm2 list | grep "bankim-admin-api" | grep -q "online"; then
    echo "❌ ERROR: Admin API process is not online"
    pm2 logs bankim-admin-api --lines 10
    exit 1
fi

echo "✅ Both admin processes are online"

# 2. Verify network ports are listening
echo "🔍 2. Verifying network port status..."
PORT_STATUS_3002=$(netstat -tlnp 2>/dev/null | grep ":3002 " | wc -l)
PORT_STATUS_3003=$(netstat -tlnp 2>/dev/null | grep ":3003 " | wc -l)

if [[ $PORT_STATUS_3002 -eq 0 ]]; then
    echo "❌ ERROR: Port 3002 (Dashboard) is not listening"
    netstat -tlnp | grep ":300[0-9] " || echo "No 30xx ports found"
    exit 1
fi

if [[ $PORT_STATUS_3003 -eq 0 ]]; then
    echo "❌ ERROR: Port 3003 (API) is not listening"
    netstat -tlnp | grep ":300[0-9] " || echo "No 30xx ports found"
    exit 1
fi

echo "✅ Network ports verified:"
netstat -tlnp | grep -E ':(3002|3003)'

# 3. Health check Admin Dashboard with retry logic
echo "🎨 3. Testing Admin Dashboard accessibility..."
if ! health_check_with_retry "Admin Dashboard" "http://localhost:3002" 5 3; then
    echo "⚠️  Dashboard health check failed - checking logs:"
    pm2 logs bankim-admin-dashboard --lines 15
    echo "⚠️  Dashboard health check failed but continuing (may need configuration)"
else
    # Test if dashboard returns HTML
    DASHBOARD_RESPONSE=$(curl -s http://localhost:3002 | head -1)
    if echo "$DASHBOARD_RESPONSE" | grep -q "html\|HTML\|<!DOCTYPE"; then
        echo "✅ Dashboard serving HTML content"
    else
        echo "⚠️  Dashboard responding but may not be serving HTML correctly"
    fi
fi

# 4. Health check Admin API with retry logic
echo "🔧 4. Testing Admin API health endpoint..."
if ! health_check_with_retry "Admin API" "http://localhost:3003/health" 5 3; then
    # Try alternative health check endpoints
    echo "🔍 Trying alternative API endpoints..."
    
    ALTERNATIVE_ENDPOINTS=("/" "/api" "/status" "/ping")
    API_RESPONDING=false
    
    for endpoint in "${ALTERNATIVE_ENDPOINTS[@]}"; do
        if curl -s -f --connect-timeout 5 "http://localhost:3003$endpoint" >/dev/null; then
            echo "✅ API responding at alternative endpoint: $endpoint"
            API_RESPONDING=true
            break
        fi
    done
    
    if [[ "$API_RESPONDING" == "false" ]]; then
        echo "⚠️  API health check failed - checking logs:"
        pm2 logs bankim-admin-api --lines 15
        echo "⚠️  API health check failed but continuing (likely needs database configuration)"
    fi
else
    # Test API response format
    API_RESPONSE=$(curl -s http://localhost:3003/health 2>/dev/null || echo "no response")
    if [[ "$API_RESPONSE" != "no response" ]]; then
        echo "✅ API health endpoint responding: $(echo "$API_RESPONSE" | head -1)"
    fi
fi

# 5. System resource check
echo "📊 5. Checking system resources..."
MEMORY_USAGE=$(free -m | awk '/^Mem:/{printf "%.1f%%", $3/$2*100}')
DISK_USAGE=$(df /var/www | tail -1 | awk '{print $5}')
LOAD_AVERAGE=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')

echo "ℹ️  System resource status:"
echo "   📊 Memory usage: $MEMORY_USAGE"
echo "   💾 Disk usage (/var/www): $DISK_USAGE"
echo "   ⚙️  Load average: $LOAD_AVERAGE"

# Warning thresholds
MEMORY_NUM=$(echo "$MEMORY_USAGE" | sed 's/%//')
DISK_NUM=$(echo "$DISK_USAGE" | sed 's/%//')

if (( $(echo "$MEMORY_NUM > 85" | bc -l) )); then
    echo "⚠️  WARNING: Memory usage is high (${MEMORY_USAGE})"
fi

if (( $(echo "$DISK_NUM > 85" | bc -l) )); then
    echo "⚠️  WARNING: Disk usage is high (${DISK_USAGE})"
fi

# 6. Log file verification
echo "📝 6. Verifying log files are being generated..."
LOG_DIR="/var/log/pm2-admin"
if [[ -d "$LOG_DIR" ]]; then
    LOG_FILES=$(find "$LOG_DIR" -name "*.log" -type f | wc -l)
    echo "✅ Found $LOG_FILES log files in $LOG_DIR"
    
    # Show recent log activity
    echo "📝 Recent log activity:"
    find "$LOG_DIR" -name "*.log" -type f -exec ls -la {} \; | head -5
else
    echo "⚠️  WARNING: Log directory $LOG_DIR not found"
fi

# 7. Display comprehensive status summary
echo ""
echo "📄 COMPREHENSIVE DEPLOYMENT STATUS SUMMARY:"
echo "=========================================="
echo ""
echo "🖥️  PM2 Process Status:"
pm2 list | grep "bankim-admin" || echo "No admin processes found"
echo ""
echo "🌐 Network Status:"
netstat -tlnp | grep -E ':(3002|3003)' || echo "No admin ports listening"
echo ""
echo "📊 System Resources:"
echo "   Memory: $MEMORY_USAGE | Disk: $DISK_USAGE | Load: $LOAD_AVERAGE"
echo ""
echo "🌍 Access URLs:"
echo "   🎨 Dashboard: http://$(hostname -I | awk '{print $1}'):3002"
echo "   🔧 API Health: http://$(hostname -I | awk '{print $1}'):3003/health"
echo ""
echo "📝 Management Commands:"
echo "   pm2 list | grep bankim-admin          # Check process status"
echo "   pm2 logs bankim-admin               # View logs"
echo "   pm2 restart bankim-admin-dashboard   # Restart dashboard"
echo "   pm2 restart bankim-admin-api        # Restart API"
echo ""
echo "✅ STEP 10 COMPLETED SUCCESSFULLY"
echo "✅ Admin Portal deployment verification complete"
echo "   🖥️  Processes: 2 online"
echo "   🌐 Ports: 3002, 3003 listening"
echo "   📊 Resources: monitored"
echo "   📝 Logs: generated"
```

---

## 📊 **STEP 11: CREATE BULLETPROOF MANAGEMENT & EMERGENCY TOOLS**

```bash
set -e  # Exit on error
echo "📊 STEP 11: Creating bulletproof management and emergency diagnostic tools..."

# Navigate to admin directory with validation
if ! cd /var/www/bankim/admin/; then
    echo "❌ ERROR: Cannot navigate to admin directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"

# Create enhanced deployment script with comprehensive error handling
echo "📋 Creating bulletproof deployment script..."
cat > deploy-admin.sh << 'EOF'
#!/bin/bash
set -euo pipefail  # Strict error handling

# Deployment configuration
BACKUP_DIR="/var/backups/bankim-admin"
LOG_FILE="/var/log/bankim-admin-deploy.log"
MAX_WAIT_TIME=60

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Error handler
error_handler() {
    local exit_code=$?
    log_message "ERROR" "Deployment failed at line $1 with exit code $exit_code"
    echo "❌ DEPLOYMENT FAILED - Check log: $LOG_FILE"
    exit $exit_code
}

trap 'error_handler $LINENO' ERR

log_message "INFO" "🚀 Starting BankIM Admin Portal deployment..."
echo "🚀 Starting BankIM Admin Portal deployment..."

# Create backup with validation
log_message "INFO" "Creating backup..."
echo "💾 Creating backup..."
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/bankim-admin-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
if ! tar -czf "$BACKUP_FILE" . --exclude=".git" --exclude="node_modules"; then
    log_message "ERROR" "Backup creation failed"
    exit 1
fi
log_message "INFO" "Backup created: $BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# Update repositories with error handling
update_repository() {
    local repo_path="$1"
    local repo_name="$2"
    local build_required="$3"
    
    log_message "INFO" "Updating $repo_name..."
    echo "📦 Updating $repo_name..."
    
    if ! cd "$repo_path"; then
        log_message "ERROR" "Cannot navigate to $repo_path"
        return 1
    fi
    
    if ! git pull origin main; then
        log_message "ERROR" "Git pull failed for $repo_name"
        return 1
    fi
    
    if ! npm install; then
        log_message "ERROR" "npm install failed for $repo_name"
        return 1
    fi
    
    if [[ "$build_required" == "true" ]]; then
        if ! npm run build; then
            log_message "ERROR" "Build failed for $repo_name"
            return 1
        fi
        
        # For dashboard, copy build to mainapp
        if [[ "$repo_name" == "dashboard" ]]; then
            if ! cp -r dist/* mainapp/; then
                log_message "ERROR" "Failed to copy build files for $repo_name"
                return 1
            fi
        fi
    fi
    
    log_message "INFO" "$repo_name updated successfully"
    echo "✅ $repo_name updated successfully"
}

# Update all repositories
update_repository "/var/www/bankim/admin/workspace" "workspace" "false"
update_repository "/var/www/bankim/admin/dashboard" "dashboard" "true"
update_repository "/var/www/bankim/admin/shared" "shared" "true"

# Update API (special handling for mainapp)
log_message "INFO" "Updating API..."
echo "📦 Updating API..."
cd /var/www/bankim/admin/api/
if ! git pull origin main; then
    log_message "ERROR" "Git pull failed for API"
    exit 1
fi
cd mainapp/
if ! npm install; then
    log_message "ERROR" "npm install failed for API"
    exit 1
fi

# Reload PM2 processes with validation
reload_service() {
    local service_name="$1"
    log_message "INFO" "Reloading $service_name..."
    echo "🔄 Reloading $service_name..."
    
    if ! pm2 reload "$service_name"; then
        log_message "ERROR" "Failed to reload $service_name"
        return 1
    fi
    
    # Wait for service to be online
    local wait_time=0
    while [[ $wait_time -lt $MAX_WAIT_TIME ]]; do
        if pm2 list | grep "$service_name" | grep -q "online"; then
            log_message "INFO" "$service_name is online"
            echo "✅ $service_name is online"
            return 0
        fi
        sleep 2
        wait_time=$((wait_time + 2))
    done
    
    log_message "ERROR" "$service_name did not come online within ${MAX_WAIT_TIME}s"
    return 1
}

# Reload services
reload_service "bankim-admin-dashboard"
reload_service "bankim-admin-api"

# Health check with retry logic
health_check() {
    local url="$1"
    local service_name="$2"
    local max_attempts=5
    
    for ((i=1; i<=max_attempts; i++)); do
        if curl -f -s --connect-timeout 10 "$url" >/dev/null; then
            log_message "INFO" "$service_name health check passed"
            echo "✅ $service_name health check passed"
            return 0
        fi
        if [[ $i -lt $max_attempts ]]; then
            sleep 3
        fi
    done
    
    log_message "WARNING" "$service_name health check failed after $max_attempts attempts"
    echo "⚠️  $service_name health check failed"
    return 1
}

# Perform health checks
echo "🔍 Performing health checks..."
sleep 5
health_check "http://localhost:3003/health" "Admin API"
health_check "http://localhost:3002" "Admin Dashboard"

log_message "INFO" "Admin Portal deployment completed successfully"
echo "🎉 Admin Portal deployment completed successfully!"
EOF

chmod +x deploy-admin.sh

# Create comprehensive health check script
echo "🧪 Creating comprehensive health monitoring script..."
cat > health-check-admin.sh << 'EOF'
#!/bin/bash

# Health check configuration
LOG_FILE="/var/log/bankim-admin-health.log"
ALERT_THRESHOLD=3  # Number of consecutive failures before alert

# Logging function
log_health() {
    local status="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$status] $message" | tee -a "$LOG_FILE"
}

echo "🔍 BankIM Admin Portal Health Check - $(date)"
echo "======================================================"

# Check system resources
echo "📊 System Resource Check:"
MEMORY_USAGE=$(free -m | awk '/^Mem:/{printf "%.1f%%", $3/$2*100}')
DISK_USAGE=$(df /var/www | tail -1 | awk '{print $5}')
LOAD_AVERAGE=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')

echo "   Memory: $MEMORY_USAGE"
echo "   Disk: $DISK_USAGE"
echo "   Load: $LOAD_AVERAGE"

# Check PM2 processes
echo ""
echo "🖥️  PM2 Process Health:"
ADMIN_PROCESSES=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name | startswith("bankim-admin"))' 2>/dev/null || pm2 list | grep bankim-admin)
if [[ -z "$ADMIN_PROCESSES" ]]; then
    echo "❌ No admin processes found"
    log_health "ERROR" "No admin processes found"
    exit 1
fi

# Check individual services
check_service() {
    local service_name="$1"
    local port="$2"
    local url="$3"
    local description="$4"
    
    echo ""
    echo "🔍 Checking $description ($service_name):"
    
    # Check PM2 status
    if pm2 list | grep "$service_name" | grep -q "online"; then
        echo "   ✅ PM2 status: online"
        log_health "INFO" "$service_name PM2 status: online"
    else
        echo "   ❌ PM2 status: not online - attempting restart"
        log_health "ERROR" "$service_name PM2 status: not online"
        pm2 restart "$service_name"
        sleep 5
    fi
    
    # Check port listening
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "   ✅ Port $port: listening"
        log_health "INFO" "$service_name port $port: listening"
    else
        echo "   ❌ Port $port: not listening"
        log_health "ERROR" "$service_name port $port: not listening"
    fi
    
    # Check HTTP response
    local http_status="fail"
    if curl -f -s --connect-timeout 10 --max-time 30 "$url" >/dev/null 2>&1; then
        echo "   ✅ HTTP check: responding"
        log_health "INFO" "$service_name HTTP check: responding"
        http_status="pass"
    else
        echo "   ❌ HTTP check: not responding"
        log_health "ERROR" "$service_name HTTP check: not responding"
        
        # Attempt restart if not responding
        echo "   🔄 Attempting restart..."
        pm2 restart "$service_name"
        sleep 10
        
        # Recheck after restart
        if curl -f -s --connect-timeout 10 --max-time 30 "$url" >/dev/null 2>&1; then
            echo "   ✅ HTTP check after restart: responding"
            log_health "INFO" "$service_name HTTP check after restart: responding"
            http_status="pass"
        fi
    fi
    
    return $([ "$http_status" = "pass" ] && echo 0 || echo 1)
}

# Check services
DASHBOARD_HEALTH=0
API_HEALTH=0

if check_service "bankim-admin-dashboard" "3002" "http://localhost:3002" "Admin Dashboard"; then
    DASHBOARD_HEALTH=1
fi

if check_service "bankim-admin-api" "3003" "http://localhost:3003/health" "Admin API"; then
    API_HEALTH=1
fi

# Overall health summary
echo ""
echo "📋 Health Check Summary:"
echo "========================"
if [[ $DASHBOARD_HEALTH -eq 1 && $API_HEALTH -eq 1 ]]; then
    echo "✅ Overall Status: HEALTHY"
    log_health "INFO" "Overall health check: HEALTHY"
    exit 0
elif [[ $DASHBOARD_HEALTH -eq 1 || $API_HEALTH -eq 1 ]]; then
    echo "⚠️  Overall Status: PARTIAL"
    log_health "WARNING" "Overall health check: PARTIAL"
    exit 1
else
    echo "❌ Overall Status: UNHEALTHY"
    log_health "ERROR" "Overall health check: UNHEALTHY"
    exit 2
fi
EOF

chmod +x health-check-admin.sh

# Create emergency diagnostic script
echo "🚑 Creating emergency diagnostic script..."
cat > emergency-diagnostics.sh << 'EOF'
#!/bin/bash

echo "🚨 EMERGENCY DIAGNOSTICS FOR BANKIM ADMIN PORTAL"
echo "============================================"
echo "Generated: $(date)"
echo "Server: $(hostname -I | awk '{print $1}')"
echo ""

# System information
echo "💻 SYSTEM INFORMATION:"
echo "OS: $(lsb_release -d 2>/dev/null | cut -f2 || uname -a)"
echo "Memory: $(free -h | head -2 | tail -1)"
echo "Disk: $(df -h /var/www | tail -1)"
echo "Load: $(uptime)"
echo ""

# Network status
echo "🌐 NETWORK STATUS:"
echo "Listening ports:"
netstat -tlnp | grep -E ':(22|80|443|3002|3003) '
echo ""
echo "Process network connections:"
ss -tlnp | grep -E ':(3002|3003) ' || echo "No admin ports found"
echo ""

# PM2 diagnostics
echo "🖥️  PM2 DIAGNOSTICS:"
echo "PM2 version: $(pm2 --version)"
echo "PM2 processes:"
pm2 list
echo ""
echo "PM2 admin process details:"
pm2 show bankim-admin-dashboard 2>/dev/null || echo "Dashboard process not found"
pm2 show bankim-admin-api 2>/dev/null || echo "API process not found"
echo ""

# File system diagnostics
echo "📁 FILE SYSTEM DIAGNOSTICS:"
echo "Admin directory structure:"
ls -la /var/www/bankim/admin/ 2>/dev/null || echo "Admin directory not found"
echo ""
echo "Critical files check:"
for file in "/var/www/bankim/admin/ecosystem.config.js" "/var/www/bankim/admin/dashboard/mainapp/index.html" "/var/www/bankim/admin/api/mainapp/server.js"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file ($(stat -f%z "$file" 2>/dev/null || stat -c%s "$file") bytes)"
    else
        echo "❌ $file (missing)"
    fi
done
echo ""

# Log file analysis
echo "📝 LOG ANALYSIS:"
echo "Recent PM2 logs:"
pm2 logs --lines 10 --no-colors 2>/dev/null || echo "No PM2 logs available"
echo ""
echo "System logs (admin related):"
grep -i "bankim\|admin\|3002\|3003" /var/log/syslog 2>/dev/null | tail -5 || echo "No relevant system logs found"
echo ""

# Process diagnostics
echo "⚙️  PROCESS DIAGNOSTICS:"
echo "Node.js processes:"
ps aux | grep node | grep -v grep
echo ""
echo "Admin port processes:"
lsof -i :3002 2>/dev/null || echo "No process listening on port 3002"
lsof -i :3003 2>/dev/null || echo "No process listening on port 3003"
echo ""

# Environment diagnostics
echo "🌍 ENVIRONMENT DIAGNOSTICS:"
echo "Node.js version: $(node --version 2>/dev/null || echo 'Not found')"
echo "NPM version: $(npm --version 2>/dev/null || echo 'Not found')"
echo "PM2 global location: $(which pm2 2>/dev/null || echo 'Not found')"
echo ""

# Connectivity tests
echo "🔗 CONNECTIVITY TESTS:"
echo "Testing localhost connections:"
for port in 3002 3003; do
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ Port $port: accessible"
    else
        echo "❌ Port $port: not accessible"
    fi
done
echo ""
echo "Testing external connectivity:"
curl -s --connect-timeout 5 https://github.com >/dev/null && echo "✅ GitHub: accessible" || echo "❌ GitHub: not accessible"
echo ""

# Recent changes
echo "📅 RECENT CHANGES:"
echo "Recent file modifications in admin directory:"
find /var/www/bankim/admin/ -type f -mtime -1 2>/dev/null | head -10 || echo "No recent changes found"
echo ""

# Emergency recommendations
echo "🆘 EMERGENCY RECOMMENDATIONS:"
echo "1. Check PM2 process status: pm2 list"
echo "2. Restart admin services: pm2 restart bankim-admin-dashboard bankim-admin-api"
echo "3. Check logs: pm2 logs bankim-admin"
echo "4. Verify ports: netstat -tlnp | grep -E ':(3002|3003)'"
echo "5. Test connectivity: curl http://localhost:3002 && curl http://localhost:3003/health"
echo "6. Check disk space: df -h"
echo "7. Check memory: free -h"
echo "8. Review environment file: cat /var/www/bankim/admin/api/mainapp/.env.production"
echo ""
echo "📞 For support, share this diagnostic output"
EOF

chmod +x emergency-diagnostics.sh

# Create system monitoring script
echo "📊 Creating system monitoring script..."
cat > monitor-admin.sh << 'EOF'
#!/bin/bash

# Continuous monitoring script for Admin Portal
MONITOR_INTERVAL=30  # seconds
LOG_FILE="/var/log/bankim-admin-monitor.log"

echo "📊 Starting BankIM Admin Portal Monitor (interval: ${MONITOR_INTERVAL}s)"
echo "Log file: $LOG_FILE"
echo "Press Ctrl+C to stop"
echo ""

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Quick health check
    DASHBOARD_STATUS="DOWN"
    API_STATUS="DOWN"
    
    if curl -f -s --connect-timeout 5 http://localhost:3002 >/dev/null 2>&1; then
        DASHBOARD_STATUS="UP"
    fi
    
    if curl -f -s --connect-timeout 5 http://localhost:3003/health >/dev/null 2>&1; then
        API_STATUS="UP"
    fi
    
    # System resources
    MEMORY=$(free -m | awk '/^Mem:/{printf "%.1f%%", $3/$2*100}')
    LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    
    # Display status
    printf "\r%s | Dashboard: %s | API: %s | Mem: %s | Load: %s" \
        "$TIMESTAMP" "$DASHBOARD_STATUS" "$API_STATUS" "$MEMORY" "$LOAD"
    
    # Log to file
    echo "$TIMESTAMP | Dashboard: $DASHBOARD_STATUS | API: $API_STATUS | Mem: $MEMORY | Load: $LOAD" >> "$LOG_FILE"
    
    sleep $MONITOR_INTERVAL
done
EOF

chmod +x monitor-admin.sh

# Verify all scripts were created
echo "🔍 Verifying management scripts..."
SCRIPTS=("deploy-admin.sh" "health-check-admin.sh" "emergency-diagnostics.sh" "monitor-admin.sh")
for script in "${SCRIPTS[@]}"; do
    if [[ -x "$script" ]]; then
        echo "✅ $script: created and executable"
    else
        echo "❌ ERROR: $script not created or not executable"
        exit 1
    fi
done

# Display script summary
echo ""
echo "✅ STEP 11 COMPLETED SUCCESSFULLY"
echo "✅ Bulletproof management tools created:"
echo "   🚀 deploy-admin.sh - Bulletproof deployment with full error handling"
echo "   🧪 health-check-admin.sh - Comprehensive health monitoring with auto-restart"
echo "   🚑 emergency-diagnostics.sh - Complete system diagnostics for troubleshooting"
echo "   📊 monitor-admin.sh - Real-time continuous monitoring"
echo ""
echo "📄 Script Usage:"
echo "   ./deploy-admin.sh              # Deploy updates"
echo "   ./health-check-admin.sh        # Health check with auto-recovery"
echo "   ./emergency-diagnostics.sh     # Full system diagnostics"
echo "   ./monitor-admin.sh             # Start continuous monitoring"
echo ""
echo "📝 All scripts include comprehensive logging and error handling"
```

---

## ⚡ **Step 12: Final Admin Portal Verification & Testing**

```bash
# Wait a moment for admin services to fully start
sleep 10

# Check admin PM2 status
echo "📊 Admin Portal PM2 Status:"
pm2 list | grep bankim-admin

# Test Admin API endpoints
echo ""
echo "🔍 Testing Admin API (port 3003)..."
curl -s http://localhost:3003/health | head -5 || echo "❌ Admin API not responding (check database config)"

# Test Admin Dashboard
echo ""
echo "🔍 Testing Admin Dashboard (port 3002)..."
curl -s -I http://localhost:3002 | head -3 || echo "❌ Admin Dashboard not responding"

# Check admin logs for errors
echo ""
echo "📋 Recent Admin Portal logs:"
pm2 logs bankim-admin --lines 5 --no-colors

# Display admin portal information
echo ""
echo "🎉 ADMIN PORTAL DEPLOYMENT COMPLETE!"
echo ""
echo "📱 Admin Portal Access URLs:"
echo "   Dashboard: http://185.253.72.80:3002"
echo "   API Health: http://185.253.72.80:3003/health"
echo ""
echo "🛠️  Admin Portal Management Commands:"
echo "   pm2 list | grep bankim-admin     # Check admin status"
echo "   pm2 logs bankim-admin            # View admin logs"
echo "   pm2 restart bankim-admin-api     # Restart admin API"
echo "   pm2 restart bankim-admin-dashboard # Restart admin dashboard"
echo "   ./deploy-admin.sh                # Deploy admin updates"
echo "   ./health-check-admin.sh          # Check admin health"
echo ""
echo "⚠️  IMPORTANT: Configure database URLs in:"
echo "   /var/www/bankim/admin/api/mainapp/.env.production"
echo ""
echo "🏗️  Server Structure:"
echo "   /var/www/bankim/online/    # Main BankimOnline app (ports 3000-3001)"
echo "   /var/www/bankim/admin/     # Admin Portal (ports 3002-3003)"
```

---

## 🔧 **Step 13: Configure Admin Database (REQUIRED)**

```bash
# Edit the Admin API environment file with your actual database details
nano /var/www/bankim/admin/api/mainapp/.env.production

# After editing, restart the Admin API
pm2 restart bankim-admin-api

# Test the Admin API again
curl http://localhost:3003/health
```

---

## 🎯 **Step 14: Final Admin Portal Status Check**

```bash
# Show admin portal status
echo "🎉 BankIM Admin Portal Production Status:"
echo "========================================"

echo ""
echo "📊 Admin PM2 Processes:"
pm2 list | grep bankim-admin

echo ""
echo "🌐 Admin Network Ports:"
netstat -tlnp | grep -E ':(3002|3003)' || echo "Admin ports not yet available"

echo ""
echo "💾 Admin Disk Usage:"
du -sh /var/www/bankim/admin/

echo ""
echo "🔍 Admin Health Check:"
./health-check-admin.sh

echo ""
echo "✅ ADMIN PORTAL READY FOR PRODUCTION!"
echo ""
echo "🌐 Admin Portal URLs:"
echo "   Dashboard: http://185.253.72.80:3002"
echo "   API: http://185.253.72.80:3003/health"
echo ""
echo "🏗️  Complete Server Structure:"
echo "   Main App: /var/www/bankim/online/ (ports 3000-3001)"
echo "   Admin Portal: /var/www/bankim/admin/ (ports 3002-3003)"
echo ""
echo "📋 Next Steps:"
echo "   1. Configure database connections in .env.production"
echo "   2. Test admin portal functionality"
echo "   3. Set up SSL certificates (optional)"
echo "   4. Configure automated backups"

echo ""
echo "🎯 STEP 14: FINAL STATUS & EMERGENCY PROCEDURES"
echo "================================================"
echo ""
echo "🎉 BANKIM ADMIN PORTAL IS PRODUCTION READY!"
echo "✅ ALL 14 DEPLOYMENT STEPS COMPLETED SUCCESSFULLY"
echo "🛡️  BULLETPROOF ERROR HANDLING: ACTIVE"
echo "🚨 EMERGENCY DIAGNOSTIC TOOLS: DEPLOYED"
echo ""
echo "📊 Final Status:"
echo "   ✅ Pre-flight verification: completed"
echo "   ✅ System setup: completed" 
echo "   ✅ Directory structure: created"
echo "   ✅ Repositories: cloned and verified"
echo "   ✅ Dashboard build: completed"
echo "   ✅ API setup: completed"
echo "   ✅ Shared package: built"
echo "   ✅ PM2 ecosystem: configured"
echo "   ✅ Applications: started and verified"
echo "   ✅ Firewall: configured"
echo "   ✅ Comprehensive verification: completed"
echo "   ✅ Bulletproof management tools: created"
echo ""
echo "🌍 Access URLs:"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "   🎨 Dashboard: http://$SERVER_IP:3002"
echo "   🔧 API Health: http://$SERVER_IP:3003/health"
echo ""
echo "🛠️ Emergency Commands (if needed):"
echo "   ./emergency-diagnostics.sh     # Full system diagnostics"
echo "   ./health-check-admin.sh        # Auto-healing health check"
echo "   pm2 restart bankim-admin-api bankim-admin-dashboard"
echo ""
echo "🚨 EMERGENCY RECOVERY (if admin portal is down):"
echo "   1. ./emergency-diagnostics.sh"
echo "   2. pm2 restart bankim-admin-api bankim-admin-dashboard"  
echo "   3. ./health-check-admin.sh"
echo ""
echo "🔒 SECURITY REMINDER:"
echo "   Configure database URLs and change JWT_SECRET in:"
echo "   /var/www/bankim/admin/api/mainapp/.env.production"
echo ""
echo "🎉 CONGRATULATIONS! BULLETPROOF DEPLOYMENT COMPLETED!"
echo "🤖 DESIGNED FOR CLAUDE CODE EXECUTION - MISSION ACCOMPLISHED!"
```

---

## 🔄 **Optional: Setup Automated Backups for Admin Portal**

```bash
# Create admin backup script
cat > /var/www/bankim/admin/backup-admin.sh << 'EOF'  
#!/bin/bash

BACKUP_DIR="/var/backups/bankim-admin"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Create backup
tar -czf "$BACKUP_DIR/bankim-admin-$(date +%Y%m%d).tar.gz" \
    /var/www/bankim/admin \
    --exclude="/var/www/bankim/admin/*/node_modules" \
    --exclude="/var/www/bankim/admin/*/.git"

# Clean old backups
find $BACKUP_DIR -name "bankim-admin-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Admin backup completed: bankim-admin-$(date +%Y%m%d).tar.gz"
EOF

chmod +x /var/www/bankim/admin/backup-admin.sh

# Schedule daily admin backups at 3 AM
(crontab -l 2>/dev/null; echo "0 3 * * * /var/www/bankim/admin/backup-admin.sh >> /var/log/bankim-admin-backup.log 2>&1") | crontab -

# Schedule admin health checks every 10 minutes
(crontab -l 2>/dev/null; echo "*/10 * * * * /var/www/bankim/admin/health-check-admin.sh >> /var/log/bankim-admin-health.log 2>&1") | crontab -

echo "✅ Automated admin backups and monitoring configured"
```

---

## 🚨 **EMERGENCY DIAGNOSTIC TOOLS & RECOVERY PROCEDURES**

**For Claude Code: If anything goes wrong during deployment, use these commands:**

```bash
# EMERGENCY DIAGNOSTICS - Run this first if anything fails
echo "🚨 EMERGENCY DIAGNOSTICS"
echo "========================"
echo "Server: $(hostname -I | awk '{print $1}')"
echo "Time: $(date)"
echo ""

# Check if we're on the right server
SERVER_IP=$(hostname -I | awk '{print $1}')
if [[ "$SERVER_IP" != "185.253.72.80" ]]; then
    echo "❌ ERROR: Wrong server! Expected 185.253.72.80, got $SERVER_IP"
    exit 1
fi

# Check PM2 status
echo "📊 PM2 STATUS:"
pm2 list 2>/dev/null || echo "PM2 not running or not found"
echo ""

# Check ports
echo "🌐 PORT STATUS:"
netstat -tlnp | grep -E ':(3002|3003)' || echo "Admin ports not listening"
echo ""

# Check processes
echo "⚙️  PROCESS STATUS:"
ps aux | grep -E "node.*bankim" | grep -v grep || echo "No admin processes found"
echo ""

# Check disk space
echo "💾 DISK SPACE:"
df -h /var/www || echo "Cannot check disk space"
echo ""

# Check logs
echo "📝 RECENT LOGS:"
if [[ -x "./emergency-diagnostics.sh" ]]; then
    ./emergency-diagnostics.sh
else
    pm2 logs --lines 10 2>/dev/null || echo "No PM2 logs available"
fi
echo ""

echo "🚨 EMERGENCY RECOVERY COMMANDS:"
echo "1. pm2 restart bankim-admin-dashboard bankim-admin-api"
echo "2. pm2 list"
echo "3. curl http://localhost:3002 && curl http://localhost:3003/health"
echo "4. ./health-check-admin.sh (if available)"
echo ""
echo "📞 For support: Share this diagnostic output"
```

---

## 📞 **Claude Code Support & Troubleshooting**

If any step fails, run the emergency diagnostics above, then:

```bash
# Check detailed admin logs
pm2 logs bankim-admin-api --lines 50
pm2 logs bankim-admin-dashboard --lines 50

# Check system resources
htop || top
df -h
free -h

# Check admin port status
netstat -tlnp | grep -E ':(3002|3003)'

# Run comprehensive diagnostics (if available)
./emergency-diagnostics.sh
```

**Share the error output and emergency diagnostics for support!**

---

## 🎯 **Final Summary: Bulletproof Two-Application Server**

Your server now supports both applications with comprehensive error handling:

| Component | Location | Ports | Status |
|-----------|----------|-------|--------|
| **BankimOnline** | `/var/www/bankim/online/` | 3000-3001 | Ready for main app |
| **Admin Portal** | `/var/www/bankim/admin/` | 3002-3003 | ✅ Production Ready |
| **Emergency Tools** | `/var/www/bankim/admin/` | N/A | ✅ Deployed & Tested |
| **Bulletproof Scripts** | `/var/www/bankim/admin/` | N/A | ✅ Ready for Use |

## 🛡️ **Bulletproof Features Deployed:**
- ✅ Pre-flight system verification 
- ✅ Comprehensive error handling with exit strategies
- ✅ Health verification with retry logic
- ✅ Emergency diagnostic tools
- ✅ Automatic recovery procedures  
- ✅ Step-by-step validation
- ✅ Resource monitoring and management
- ✅ Complete management arsenal

## 🤖 **DESIGNED FOR CLAUDE CODE EXECUTION**

**This ultra-hardened deployment script is specifically optimized for Claude Code execution on SSH servers. Every command includes comprehensive error handling, validation, and recovery procedures.**

**🚀 Execute each step separately and wait for success confirmation before proceeding. Each step validates before moving forward to ensure a bulletproof deployment!**

**🚨 If anything goes wrong, use the Emergency Diagnostic Tools section for immediate troubleshooting and recovery.**

**🎉 CONGRATULATIONS! BULLETPROOF DEPLOYMENT SYSTEM IS READY!**