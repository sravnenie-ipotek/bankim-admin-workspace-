# 🔍 **Checking BankIM Online Application on SSH Server**

## 📋 **What We Need to Verify**

### **1. Connect to SSH Server**
```bash
ssh root@185.253.72.80
# Password: PZy3oNaxQLTCvf
```

### **2. Check What's Actually on the Server**
```bash
# Navigate to the application directory
cd /var/www/bankim/

# List all directories
ls -la

# Check if there are separate repositories
ls -la */

# Check git repositories
find . -name ".git" -type d
```

### **3. Identify the Correct Application**
```bash
# Check for different application directories
ls -la /var/www/bankim/

# Look for:
# - bankimonlineapi/ (API server)
# - client/ (Frontend)
# - bankim-online/ (Main application)
# - bankim/ (Main application)
```

## 🚀 **Correct Build Process for BankIM Online**

### **If BankIM Online is in `/var/www/bankim/`:**
```bash
# Navigate to main application
cd /var/www/bankim/

# Check what's there
ls -la

# If it's a single application:
npm install
npm run build
pm2 restart bankim-online

# If it's separate client/server:
# Server
cd server/
npm install
pm2 restart server

# Client
cd client/
npm install
npm run build
pm2 restart client
```

### **If BankIM Online is in a different location:**
```bash
# Search for BankIM applications
find /var/www -name "*bankim*" -type d

# Check common locations
ls -la /var/www/
ls -la /home/
ls -la /opt/
```

## 📊 **PM2 Process Check**
```bash
# Check all running processes
pm2 list

# Look for:
# - bankim-online
# - bankim-client
# - bankim-server
# - bankim-api
```

## 🔧 **Environment Check**
```bash
# Check environment files
find /var/www -name ".env*" -type f

# Check package.json files
find /var/www -name "package.json" -type f
```

## 📋 **Common BankIM Online Locations**
```bash
# Possible locations:
/var/www/bankim/
/var/www/bankim-online/
/var/www/bankimonline/
/home/bankim/
/opt/bankim/
```

## 🚨 **If BankIM Online is Not Found**
```bash
# Check if it needs to be cloned
cd /var/www/
git clone [BANKIM_ONLINE_REPOSITORY_URL]

# Or check if it's in a different location
find / -name "*bankim*" -type d 2>/dev/null
```

---

**Note**: This guide helps identify and build the actual BankIM Online application, not the admin portal. 