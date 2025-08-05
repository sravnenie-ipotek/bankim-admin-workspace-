# 🚀 Quick Deployment Card - BankIM Client

## ⚡ **Essential Commands**

### **1. Initial Setup**
```bash
ssh root@your-server-ip
cd /var/www/bankim
mkdir bankim-admin-client && cd bankim-admin-client
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin_client.git .
npm install
npm run build
```

### **2. PM2 Setup**
```bash
npm install -g pm2
pm2 start npm --name "bankim-admin-client" -- run preview
pm2 save && pm2 startup
```

### **3. Nginx Setup**
```bash
sudo apt install nginx
sudo ln -s /etc/nginx/sites-available/bankim-admin-client /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## 🔄 **Daily Operations**

### **Update Application**
```bash
cd /var/www/bankim/bankim-admin-client
git pull origin main
npm install && npm run build
pm2 restart bankim-admin-client
```

### **Check Status**
```bash
pm2 status
pm2 logs bankim-admin-client
sudo systemctl status nginx
```

## 🚨 **Emergency Commands**

```bash
# Restart services
pm2 restart bankim-admin-client
sudo systemctl restart nginx

# Check logs
pm2 logs bankim-admin-client
sudo tail -f /var/log/nginx/error.log
```

## 📍 **Important Paths**

- **App**: `/var/www/bankim/bankim-admin-client/`
- **Build**: `/var/www/bankim/bankim-admin-client/dist/`
- **PM2**: `bankim-admin-client`
- **Nginx**: `/etc/nginx/sites-available/bankim-admin-client`

## 🌐 **Access URLs**

- **Internal**: `http://localhost:3000`
- **External**: `http://your-domain.com`
- **API**: `http://your-server-ip:8003/api` 