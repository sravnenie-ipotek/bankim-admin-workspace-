# 🏗️ **Admin Portal SSH Server Setup**

## 📋 **Create Admin Folders on SSH Server**

### **Step 1: Connect to SSH Server**
```bash
ssh root@185.253.72.80
# Password: PZy3oNaxQLTCvf
```

### **Step 2: Create Directory Structure (Secure)**
```bash
# Navigate to bankim directory
cd /var/www/bankim/

# Create admin directories
mkdir -p bankim-admin-api/mainapp
mkdir -p bankim-admin-client/mainapp

# Set SECURE permissions (owner + group only)
chmod 750 bankim-admin-api
chmod 750 bankim-admin-client

# Verify creation
ls -la
```

### **Step 3: Clone Admin Repositories**
```bash
# Clone admin API (this project)
cd /var/www/bankim/bankim-admin-api/
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin.git .

# Clone admin client
cd /var/www/bankim/bankim-admin-client/
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git .

# Verify repositories
ls -la /var/www/bankim/
```

### **Step 4: Setup Environment Files (Secure)**
```bash
# Setup admin API environment
cd /var/www/bankim/bankim-admin-api/mainapp/
cp .env.template .env.production
# Edit .env.production with production settings
chmod 600 .env.production  # Only owner can read/write

# Setup admin client environment
cd /var/www/bankim/bankim-admin-client/mainapp/
cp .env.template .env
# Edit .env with development settings
chmod 600 .env  # Only owner can read/write
```

### **Step 5: Install Dependencies**
```bash
# Install admin API dependencies
cd /var/www/bankim/bankim-admin-api/mainapp/
npm install

# Install admin client dependencies
cd /var/www/bankim/bankim-admin-client/mainapp/
npm install
```

### **Step 6: Setup PM2 Processes**
```bash
# Start admin API
cd /var/www/bankim/bankim-admin-api/mainapp/
pm2 start server-db.js --name bankim-admin-api

# Start admin client
cd /var/www/bankim/bankim-admin-client/mainapp/
pm2 start npm --name bankim-admin-client -- run dev
```

## 📊 **Verify Setup**
```bash
# Check all processes
pm2 list

# Check admin processes specifically
pm2 status bankim-admin-api
pm2 status bankim-admin-client

# Check directory structure
tree /var/www/bankim/ -L 3

# Check permissions (should show 750)
ls -la /var/www/bankim/
```

## 🚨 **Troubleshooting Setup**

### **If Git Clone Fails:**
```bash
# Check SSH key setup
ssh -T git@github.com

# If SSH key not set up, use HTTPS
git clone https://github.com/MichaelMishaev/bankimOnlineAdmin.git .
git clone https://github.com/MichaelMishaev/bankimOnlineAdmin_client.git .
```

### **If Permissions Cause Issues:**
```bash
# If web server needs access, use 755
chmod 755 /var/www/bankim/bankim-admin-api/
chmod 755 /var/www/bankim/bankim-admin-client/

# Or set proper ownership
chown -R www-data:www-data /var/www/bankim/bankim-admin-api/
chown -R www-data:www-data /var/www/bankim/bankim-admin-client/
```

### **If Environment Files Need Web Server Access:**
```bash
# Only if web server needs to read .env files
chmod 640 /var/www/bankim/bankim-admin-api/mainapp/.env.production
chmod 640 /var/www/bankim/bankim-admin-client/mainapp/.env
```

## 📋 **Final Structure (Secure)**
```
/var/www/bankim/
├── bankim-admin-api/         ← NEW ADMIN API (750 permissions)
│   ├── mainapp/
│   │   ├── server-db.js
│   │   ├── package.json
│   │   └── .env.production   ← 600 permissions
│   └── .git/
├── bankim-admin-client/      ← NEW ADMIN CLIENT (750 permissions)
│   ├── mainapp/
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env              ← 600 permissions
│   └── .git/
└── [existing BankIM Online folders...]
```

## 🔐 **Security Benefits:**
- **750**: Only owner and group can access (not others)
- **600**: Only owner can read/write sensitive files
- **Protects**: Source code, environment variables, secrets
- **Maintains**: Functionality for web server

---

**Note**: This creates secure admin folders that protect sensitive information while maintaining functionality. 