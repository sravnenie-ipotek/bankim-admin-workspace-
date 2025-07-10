# BankIM Management Portal

## 🎯 **Complete Separation from Main App**

This is a **totally separate application** for the **8.1 Компоненты** (8.1 Components) functionality from the Confluence documentation.

### **🔗 URLs:**
- **Main Production App**: `http://localhost:5173/` *(UNTOUCHED)*
- **Management Portal**: `http://localhost:3002/` *(THIS APP)*

### **🏗️ Architecture:**
- **Completely separate React application**
- **Different port (3002 vs 5173)**
- **No shared code or dependencies**
- **Independent deployment**
- **Isolated development**

## 📋 **Features**

### **Role-Based Management System (6 Roles):**

1. **Для Сотрудника банка** (Bank Employee)
2. **Для Менеджера по продажам** (Sales Manager)
3. **Для Администрации** (Administration)
4. **Для Брокеров** (Brokers)
5. **Для Контент-менеджера/Копирайтера** (Content Manager)
6. **Для Директора** (Director)

## 🚀 **Getting Started**

### **Installation:**
```bash
cd /Users/michaelmishayev/Projects/bankIM_management_portal
npm install
```

### **Development:**
```bash
npm run dev
# Runs on http://localhost:3002
```

### **Build:**
```bash
npm run build
```

## 🔒 **Isolation Benefits**

1. **No interference** with main production app
2. **Independent updates** and deployments
3. **Separate version control** if needed
4. **Different technology stack** possible
5. **Isolated testing** environment
6. **Clear separation of concerns**

## 📝 **Development Notes**

- This app implements the Confluence page: `https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/111214627/8.1`
- All 6 user roles have dedicated pages and routing
- Clean, modern UI with dark theme
- Responsive design for all devices
- TypeScript for type safety

## 🎨 **Tech Stack**

- **React 18** with TypeScript
- **React Router** for navigation
- **Vite** for build tooling
- **CSS3** with custom styling
- **Port 3002** for development

---

> **Important**: This application has ZERO connection to the main app at localhost:5173. They are completely independent systems. 