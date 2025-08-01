# BankIM Management Portal

## 🔒 Security Setup (IMPORTANT)

### Environment Variables
1. **Copy the template**: `cp env.template .env`
2. **Edit `.env`** with your real database credentials
3. **NEVER commit `.env`** - it's protected by `.gitignore`
4. **Only share `env.template`** - it contains placeholder values only

### Database Credentials
- Real credentials are in `.env` (local only, not committed)
- Template with placeholders is in `env.template` (safe to commit)
- Production: Use environment variables or Railway's secret management

---

Портал управления BankIM - современная веб-платформа для управления банковскими операциями и клиентским сервисом.

## 📋 Описание проекта

BankIM Management Portal - это комплексная система управления для банковских сотрудников, директоров и администраторов. Платформа предоставляет удобный интерфейс для управления клиентами, заявками, документами и банковскими услугами.

## ⚠️ Known Issues & Current Status

### 🚨 Critical Dropdown System Issues

The dropdown content management system has several critical bugs that are currently being addressed:

**Primary Issue**: Dropdown edit pages show no options due to query logic errors in the backend.

**Affected Endpoints**:
- `http://localhost:3002/content/mortgage/dropdown-edit/{id}` - Shows no options
- `http://localhost:3002/content/mortgage-refi/dropdown-edit/{id}` - Shows no options
- `http://localhost:3002/content/credit/dropdown-edit/{id}` - Shows no options

**Root Cause**: The dropdown options query in `backend/server.js` has fundamental logic errors:
1. **Hardcoded screen_location** - Should use the same screen_location as the main dropdown field
2. **Overly broad pattern matching** - `_%` matches placeholders and labels
3. **Wrong component type filtering** - Accepts 'text' when should only be 'option'

**Status**: 
- ✅ **Bug Analysis Complete** - See `devHelp/bugs/dropDownbugs.md` for detailed analysis
- 🔄 **Fix Implementation** - In progress
- ⏳ **Testing** - Pending

### 📊 Content Management Status

**Working Features**:
- ✅ Content drill-down pages display correctly
- ✅ Content editing for text fields works
- ✅ Navigation between content pages works
- ✅ ID column now shows content_key for better identification

**Known Issues**:
- ❌ Dropdown options not loading in edit pages
- ❌ Some navigation routes may not match database conventions
- ❌ Component type inconsistencies in database

### 🔧 Development Focus

Current development priorities:
1. **Fix dropdown options query logic** (Critical)
2. **Standardize component type naming** (High)
3. **Improve error handling for empty options** (Medium)
4. **Update documentation to match implementation** (Medium)

For detailed bug analysis, see: `devHelp/bugs/dropDownbugs.md`

---

## ✅ Recent Improvements & Fixes

### 🎯 Latest Updates (August 2025)

**Content Management Enhancements**:
- ✅ **ID Column Enhancement** - All drill-down pages now show `content_key` instead of `screen_location` in ID column
- ✅ **Duplicate Content Identification** - Can now distinguish between duplicate entries with same translations
- ✅ **Yellow Line Removal** - Removed yellow underline from section titles for cleaner UI
- ✅ **Comprehensive Bug Documentation** - Complete analysis of dropdown system issues documented

**Files Updated**:
- `src/pages/MenuDrill/MenuDrill.tsx` - ID column shows content_key
- `src/pages/MainDrill/MainDrill.tsx` - ID column shows content_key  
- `src/pages/MortgageDrill/MortgageDrill.tsx` - ID column shows content_key
- `src/pages/MortgageRefiDrill/MortgageRefiDrill.tsx` - ID column shows content_key
- `src/pages/CalculatorFormula.css` - Removed yellow underline
- `devHelp/bugs/dropDownbugs.md` - Complete bug analysis added

**Example Improvement**:
Before: ID column showed "sidebar" for all sidebar items
After: ID column shows "sidebar_company_2", "sidebar_menu_about_us", etc.

---

## ✨ Основные возможности

### 🏛️ Сотрудник банка
- **Управление клиентами** - просмотр и редактирование информации о клиентах
- **Обработка заявок** - управление статусами заявок на кредиты и ипотеку
- **Работа с документами** - отслеживание статуса документов
- **Фильтрация и поиск** - мощные инструменты поиска по клиентам
- **Пагинация** - удобная навигация по большим спискам

### 🎛️ Общие компоненты
- **SharedHeader** - единый заголовок с навигацией и языковым переключателем
- **SharedMenu** - боковое меню с ролевой навигацией
- **Адаптивный дизайн** - поддержка мобильных устройств
- **Современный UI** - темная тема с яркими акцентами

### 📊 Функциональность
- **Поиск в реальном времени** - мгновенный поиск по имени, телефону, паспорту
- **Множественные фильтры** - фильтрация по услугам, статусам, датам
- **Управление состояниями** - отслеживание статусов заявок и документов
- **Интерактивные элементы** - кнопки действий для каждого клиента

## 🛠️ Технологический стек

- **Frontend Framework:** React 18 + TypeScript
- **Сборщик:** Vite
- **Маршрутизация:** React Router DOM
- **Стилизация:** CSS3 с CSS Variables
- **База данных:** PostgreSQL (только удаленные)
- **Развертывание:** Railway
- **Языки интерфейса:** Русский, Английский, Иврит
- **Иконки:** Эмодзи и Unicode символы

## 📦 Установка

### Предварительные требования
- Node.js 16+ 
- npm или yarn

### Инструкции по установке

1. **Клонируйте репозиторий:**
```bash
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin.git
cd bankimOnlineAdmin
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Запустите сервер разработки:**
```bash
npm run dev
```

4. **Откройте браузер:**
```
http://localhost:3004
```

## 🗄️ База данных

**Важно:** Проект работает только с PostgreSQL базами данных на удаленных серверах (Railway).

### 🏗️ Архитектура баз данных:
- **Content Database (`bankim_content`):** Для управления контентом, страницами, статьями
- **Management Database (`bankim_management`):** Для основных банковских операций, пользователей, счетов
- **Local SQLite:** Для локальной разработки и тестирования

### ⚙️ Конфигурация:
Все конфигурации баз данных организованы в отдельных файлах:

```bash
server/config/
├── database-content.js      # Конфигурация bankim_content
├── database-management.js   # Конфигурация bankim_management
├── database-config.js       # Мастер-файл конфигурации
└── database-local.js        # Локальная SQLite конфигурация
```

### 🔧 Переменные окружения:
```bash
# Content Database
CONTENT_DATABASE_URL=postgresql://postgres:***@shortline.proxy.rlwy.net:33452/railway

# Management Database  
MANAGEMENT_DATABASE_URL=postgresql://postgres:***@yamanote.proxy.rlwy.net:53119/railway

# Development
USE_LOCAL_DB=false
NODE_ENV=development
```

### 📊 Статус баз данных:
- **bankim_content** (✅ активна): `test_content` с id = 1
- **bankim_management** (✅ активна): `test_management` с id = 1

### ⚙️ Система конфигурации:
Проект использует модульную систему конфигурации для управления базами данных:

```javascript
// Файлы конфигурации
server/config/
├── database-config.js        # Главная конфигурация
├── database-content.js       # Конфигурация bankim_content
├── database-management.js    # Конфигурация bankim_management
└── database-local.js         # Локальная SQLite конфигурация
```

**Использование:**
```javascript
import { databaseConfig, initializeAllDatabases } from './config/database-config.js';

// Инициализация всех баз данных
await initializeAllDatabases();

// Получение конфигурации конкретной базы данных
const contentDb = databaseConfig.content;
const managementDb = databaseConfig.management;
```

### 🚀 Локальная разработка:
```bash
# Запуск локального SQLite сервера для тестирования
npm run test:server
```

## 📝 Logging & Audit Requirements

**КРИТИЧЕСКИ ВАЖНО:** Все операции с базой данных и аутентификация должны логироваться для обеспечения безопасности и соблюдения требований.

### 🛡️ Обязательное логирование:

#### **📊 Database Operations (Обязательно):**
- **INSERT** - Все вставки новых записей
- **DELETE** - Все удаления записей  
- **CREATE** - Создание новых таблиц/структур
- **UPDATE** - Изменения существующих записей

#### **🔐 Authentication Events (Обязательно):**
- **LOGIN** - Успешные и неудачные попытки входа
- **LOGOUT** - Завершение сессий
- **SESSION_TIMEOUT** - Автоматическое завершение сессий
- **PASSWORD_CHANGE** - Изменения паролей

### 🗄️ Audit Tables Structure:

```sql
-- Content audit logging
content_audit_log:
- user_id, user_email, user_name, user_role
- content_item_id, content_key, screen_location
- action_type: CREATE|UPDATE|DELETE
- old_value, new_value
- source_page, ip_address, user_agent
- timestamp

-- Login audit logging  
login_audit_log:
- email, user_id, session_id
- success: true|false
- failure_reason
- ip_address, user_agent
- timestamp
```

### 📍 Log Locations:

```bash
# Backend server logs
backend/server.log          # Main application logs
backend/backend.log         # Development logs with nodemon

# Database audit logs
PostgreSQL tables:
- content_audit_log         # All content changes
- login_audit_log          # Authentication events

# Frontend logs
Browser Console             # Component interactions
```

### 🔍 Log Monitoring:

```bash
# Real-time backend monitoring
tail -f backend/server.log

# Database audit queries
SELECT * FROM content_audit_log WHERE action_type = 'DELETE' ORDER BY timestamp DESC;
SELECT * FROM login_audit_log WHERE success = false ORDER BY timestamp DESC;

# Development logs
tail -f backend/backend.log
```

### ⚡ Implementation Status:
- ✅ **Audit table structure** - Database tables created
- ✅ **Authentication middleware** - Login/logout logging ready
- ✅ **Content change tracking** - CRUD operations logging framework
- 🚧 **Active logging** - Integration in progress
- 📋 **Log analysis tools** - Planned for next phase

### 🚨 Compliance Requirements:
- **Retention**: Logs retained for minimum 12 months
- **Immutability**: Audit logs cannot be modified after creation
- **Completeness**: All user actions must be traceable
- **Performance**: Logging must not impact application performance
- **Security**: Log access restricted to administrators only

## 🏗️ Database Architecture & Migrations

### 📊 Application Contexts Migration (Latest)

**Критическое обновление:** Система была расширена поддержкой контекстов приложений для лучшей организации контента.

#### **🆕 Новая структура базы данных:**

##### **1. Таблица `application_contexts`:**
```sql
CREATE TABLE application_contexts (
    id SERIAL PRIMARY KEY,
    context_code VARCHAR(50) UNIQUE NOT NULL,
    context_name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### **2. Расширение таблицы `content_items`:**
```sql
-- Добавлен новый столбец
ALTER TABLE content_items 
ADD COLUMN app_context_id INTEGER NOT NULL DEFAULT 1 
REFERENCES application_contexts(id);

-- Создан индекс для производительности
CREATE INDEX idx_content_items_app_context ON content_items(app_context_id);
```

#### **🎯 4 Контекста приложений:**

| ID | Context Code | Context Name | Описание |
|----|--------------|--------------|----------|
| 1 | `public` | До регистрации | Публичный сайт для неавторизованных пользователей |
| 2 | `user_portal` | Личный кабинет | Пользовательский интерфейс после авторизации |
| 3 | `cms` | Админ панель для сайтов | Управление контентом и CMS функциональность |
| 4 | `bank_ops` | Админ панель для банков | Банковские операции и внутренние процессы |

#### **🔗 Связи в базе данных:**
- **Foreign Key:** `content_items.app_context_id → application_contexts.id`
- **Cascade Rules:** RESTRICT (предотвращает удаление используемых контекстов)
- **Default Value:** Все новые записи получают `app_context_id = 1` (public)

#### **📈 Результаты миграции:**
- ✅ **210 существующих записей** автоматически назначены к контексту `public`
- ✅ **Обратная совместимость** - все текущие функции работают без изменений
- ✅ **Новый UI элемент** - добавлена табовая навигация: `div.tab-navigation`
- ✅ **Готовность к масштабированию** - система готова к разделению контента по контекстам

#### **🎨 UI Изменения:**
```css
/* Новый элемент интерфейса */
#root > div > div > div.admin-main-content > main > div > div > div.main-content-frame > div.tab-navigation {
    /* Табовая навигация для переключения между контекстами */
}
```

#### **⚡ Производительность:**
- **Индексированный поиск** по контекстам приложений
- **Оптимизированные запросы** с фильтрацией по `app_context_id`
- **Быстрое переключение** между различными интерфейсами

#### **�� Миграция данных:**
```sql
-- Все существующие записи автоматически получили контекст 'public'
UPDATE content_items SET app_context_id = 1 WHERE app_context_id IS NULL;

-- Проверка результатов миграции
SELECT 
    ac.context_name,
    COUNT(ci.id) as content_count
FROM application_contexts ac
LEFT JOIN content_items ci ON ac.id = ci.app_context_id
GROUP BY ac.id, ac.context_name
ORDER BY ac.display_order;
```

#### **📋 Следующие шаги:**
- 🔧 **Фильтрация контента** - реализация фильтров по контекстам в админ панели
- 🎛️ **Управление контекстами** - интерфейс для переназначения контента
- 📊 **Аналитика** - отчеты по распределению контента между контекстами
- 🚀 **Новые контексты** - возможность добавления дополнительных контекстов

## 🚀 Доступные скрипты

```bash
# Запуск сервера разработки
npm run dev

# Сборка для продакшена
npm run build

# Предварительный просмотр продакшен сборки
npm run preview

# Линтинг кода
npm run lint

# Локальное тестирование базы данных (SQLite)
npm run test:server

# Тестирование конфигурационной системы баз данных
npm run test:config
```

### База данных скрипты:
```bash
# Создание тестовой таблицы PostgreSQL
node server/create-test-table.sql

# Быстрый тест подключения к bankim_content
node server/quick-content-test.js

# Быстрый тест подключения к bankim_management
node server/quick-management-test.js

# Комплексный тест обеих баз данных
node server/test-both-databases.js

# Тест новой системы конфигурации (РЕКОМЕНДУЕТСЯ)
node server/test-config-system.js
```

## 📁 Структура проекта

```
bankIM_management_portal/
├── src/
│   ├── components/           # Переиспользуемые компоненты
│   │   ├── SharedHeader/     # Компонент заголовка
│   │   ├── SharedMenu/       # Компонент меню
│   │   ├── AdminLayout/      # Лейаут для админки
│   │   └── QAShowcase/       # Компонент демонстрации
│   ├── pages/               # Страницы приложения
│   │   ├── BankEmployee.tsx  # Страница сотрудника банка
│   │   └── BankEmployee.css  # Стили страницы
│   ├── App.tsx              # Главный компонент
│   ├── main.tsx             # Точка входа
│   └── index.css            # Глобальные стили
├── server/                  # Серверные компоненты
│   ├── config/              # Конфигурации баз данных
│   │   ├── database-content.js      # Конфигурация bankim_content
│   │   ├── database-management.js   # Конфигурация bankim_management
│   │   └── database-config.js       # Мастер-файл конфигурации
│   ├── database-railway.js  # PostgreSQL конфигурация (Railway)
│   ├── database-local.js    # Локальная SQLite конфигурация
│   ├── server-railway.js    # Сервер для Railway
│   ├── server-local.js      # Локальный тестовый сервер
│   ├── create-test-table.sql # SQL скрипт для создания тестовой таблицы
│   ├── quick-content-test.js # Быстрый тест bankim_content
│   ├── quick-management-test.js # Быстрый тест bankim_management
│   ├── test-both-databases.js # Комплексный тест обеих БД
│   └── test-config-system.js # Тест системы конфигурации
├── public/                  # Статические файлы
├── package.json             # Зависимости и скрипты
├── tsconfig.json           # Конфигурация TypeScript
├── vite.config.ts          # Конфигурация Vite
└── README.md               # Этот файл
```

## 🎨 Компоненты

### SharedHeader
Универсальный заголовок с функциями:
- Логотип с навигацией
- Заголовок страницы
- Языковой переключатель (EN/RU/HE)
- Подтверждение навигации

### SharedMenu
Боковое меню навигации:
- Ролевая навигация
- Сворачиваемые секции
- Активные состояния
- Мобильная адаптация

### BankEmployee
Основная страница для сотрудников банка:
- Таблица клиентов
- Поиск и фильтрация
- Пагинация
- Управление статусами

## 🔧 Разработка

### Добавление новых страниц

1. Создайте компонент в `src/pages/`
2. Добавьте маршрут в `App.tsx`
3. Обновите меню в `SharedMenu.tsx`

### Стилизация

Проект использует:
- CSS Variables для темизации
- Мобильные медиа-запросы
- Flexbox и Grid для лейаутов
- Hover и focus состояния

### Типизация

Все компоненты типизированы с TypeScript:
- Интерфейсы для пропсов
- Типы для данных
- Строгая типизация событий

## 📱 Адаптивность

Приложение поддерживает:
- **Desktop** (1200px+) - полный функционал
- **Tablet** (768px-1199px) - адаптированное меню
- **Mobile** (до 767px) - мобильная навигация

## 🌐 Многоязычность

Поддерживаемые языки:
- **Русский** (основной)
- **Английский** 
- **Иврит**

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/AmazingFeature`)
3. Коммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Пушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📋 Планы развития

- [ ] Авторизация и аутентификация
- [ ] API интеграция
- [ ] Уведомления в реальном времени
- [ ] Экспорт данных
- [ ] Аналитика и отчеты
- [ ] Мобильное приложение

## 🐛 Сообщение об ошибках

Если вы нашли баг, пожалуйста:
1. Проверьте, что баг еще не был зарепорчен
2. Создайте issue с подробным описанием
3. Укажите шаги для воспроизведения
4. Приложите скриншоты если возможно

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👨‍💻 Автор

**Michael Mishayev**
- GitHub: [@MichaelMishaev](https://github.com/MichaelMishaev)
- Email: michaelmishayev@example.com

## 🙏 Благодарности

- React команде за отличный фреймворк
- Vite за быструю сборку
- Всем участникам open source сообщества

---

**BankIM Management Portal** - Делаем банковское управление простым и эффективным! 🚀 