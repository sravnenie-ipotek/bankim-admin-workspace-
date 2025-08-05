# 🚀 **BankIM Admin Portal Build Process**

## 📋 **Clear Naming Convention**

### **🏗️ Project Structure:**
```
/var/www/bankim/
├── bankim-admin-api/         # Admin API (this project)
│   ├── mainapp/
│   │   ├── server-db.js
│   │   ├── package.json
│   │   └── .env.production
│   └── .git/
└── bankim-admin-client/      # Admin Client (this project)
    ├── mainapp/
    │   ├── src/
    │   ├── package.json
    │   └── .env
    └── .git/
```

## 🔧 **Build Process for Admin Portal**

### **1. Connect to SSH Server**
```bash
ssh root@185.253.72.80
# Password: PZy3oNaxQLTCvf
```

### **2. Build Admin API**
```bash
# Navigate to admin API directory
cd /var/www/bankim/bankim-admin-api/

# Pull latest changes
git pull origin main

# Navigate to mainapp
cd mainapp/

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Restart admin API process
pm2 restart bankim-admin-api
```

### **3. Build Admin Client**
```bash
# Navigate to admin client directory
cd /var/www/bankim/bankim-admin-client/

# Pull latest changes
git pull origin main

# Navigate to mainapp
cd mainapp/

# Install dependencies
npm install

# Build for production
npm run build

# Restart admin client process
pm2 restart bankim-admin-client
```

## 📊 **Build Verification**

### **Check Admin Processes:**
```bash
# Check all admin processes
pm2 list

# Check admin API status
pm2 status bankim-admin-api

# Check admin client status
pm2 status bankim-admin-client

# View admin logs
pm2 logs bankim-admin-api
pm2 logs bankim-admin-client
```

## 🚨 **Troubleshooting**

### **Admin API Issues:**
```bash
# Check admin API logs
pm2 logs bankim-admin-api

# Check database connection
cd /var/www/bankim/bankim-admin-api/mainapp/
node -e "console.log(require('dotenv').config())"

# Restart admin API
pm2 restart bankim-admin-api
```

### **Admin Client Issues:**
```bash
# Check admin client logs
pm2 logs bankim-admin-client

# Check build status
cd /var/www/bankim/bankim-admin-client/mainapp/
npm run build

# Restart admin client
pm2 restart bankim-admin-client
```

## 📋 **Quick Build Script**

```bash
#!/bin/bash
echo "🚀 Building BankIM Admin Portal..."

# Admin API Build
echo "📦 Building Admin API..."
cd /var/www/bankim/bankim-admin-api/mainapp/
git pull origin main
npm install
npm run migrate
pm2 restart bankim-admin-api

# Admin Client Build
echo "🎨 Building Admin Client..."
cd /var/www/bankim/bankim-admin-client/mainapp/
git pull origin main
npm install
npm run build
pm2 restart bankim-admin-client

echo "✅ Admin Portal Build Complete!"
```

## 🔐 **Security Notes**

- **SSH Access**: `ssh root@185.253.72.80`
- **Password**: `PZy3oNaxQLTCvf`
- **Admin API Port**: 3001
- **Process Names**: `bankim-admin-api`, `bankim-admin-client`

---

**Note**: This build process is specifically for the **Admin Portal**, separate from the main BankIM Online application. 