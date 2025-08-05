# 🏗️ **Admin Portal SSH Server Setup**

## 📋 **Create Admin Folders on SSH Server**

### **Step 1: Connect to SSH Server**
```bash
ssh root@185.253.72.80
# Password: PZy3oNaxQLTCvf
```

### **Step 2: Create Directory Structure**
```bash
# Navigate to bankim directory
cd /var/www/bankim/

# Create admin directories
mkdir -p bankim-admin-api/mainapp
mkdir -p bankim-admin-client/mainapp

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

### **Step 4: Setup Environment Files**
```bash
# Setup admin API environment
cd /var/www/bankim/bankim-admin-api/mainapp/
cp .env.template .env.production
# Edit .env.production with production settings

# Setup admin client environment
cd /var/www/bankim/bankim-admin-client/mainapp/
cp .env.template .env
# Edit .env with development settings
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

## 📋 **Final Structure**
```
/var/www/bankim/
├── bankim-admin-api/         ← NEW ADMIN API
│   ├── mainapp/
│   │   ├── server-db.js
│   │   ├── package.json
│   │   └── .env.production
│   └── .git/
├── bankim-admin-client/      ← NEW ADMIN CLIENT
│   ├── mainapp/
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env
│   └── .git/
└── [existing BankIM Online folders...]
```

---

**Note**: This creates separate admin folders that won't conflict with existing BankIM Online application. 