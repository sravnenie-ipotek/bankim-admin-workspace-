# Система управления контентом (Контент сайта) - Полная документация

## 📋 Обзор системы

Система управления контентом BankIM - это комплексная мультиязычная платформа для управления контентом финансовых калькуляторов (ипотека, кредит, рефинансирование) с поддержкой сложных пошаговых процессов и разделением по контекстам приложения.

## 🗄️ Архитектура базы данных

### Основные таблицы

#### 1. **content_items** - Основная таблица контента
```sql
CREATE TABLE content_items (
    id BIGSERIAL PRIMARY KEY,
    content_key VARCHAR(255) UNIQUE NOT NULL,  -- Уникальный ключ контента
    component_type VARCHAR(50),                -- text|dropdown|option|step|link
    category VARCHAR(100),                     -- Категория контента
    screen_location VARCHAR(100),              -- Локация на экране
    is_active BOOLEAN DEFAULT TRUE,            -- Активность записи
    page_number DECIMAL(3,1),                  -- Номер страницы (для Confluence)
    app_context_id INTEGER,                    -- ID контекста приложения
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **content_translations** - Переводы контента
```sql
CREATE TABLE content_translations (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT REFERENCES content_items(id),
    language_code VARCHAR(10),                 -- ru|he|en
    content_value TEXT,                        -- Значение перевода
    status VARCHAR(20),                        -- draft|review|approved|archived
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **application_contexts** - Контексты приложения
```sql
CREATE TABLE application_contexts (
    id SERIAL PRIMARY KEY,
    context_code VARCHAR(50) UNIQUE,           -- public|user_portal|cms|bank_ops
    context_name_ru VARCHAR(255),
    context_name_he VARCHAR(255),
    context_name_en VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
```

## 🆕 ВАЖНОЕ ОБНОВЛЕНИЕ: Миграция на JSONB для выпадающих списков

### ⚠️ Критическое изменение архитектуры (Январь 2025)

Система полностью мигрировала с традиционной нормализованной структуры БД на **JSONB-архитектуру** для всех выпадающих списков (dropdowns). Это изменение обеспечивает:
- **87% улучшение производительности** загрузки выпадающих списков
- **Единый источник данных** вместо сложной двухсистемной архитектуры
- **Унифицированную мультиязычную поддержку** в одном запросе

### Новая таблица для выпадающих списков

#### 4. **dropdown_configs** - JSONB конфигурация выпадающих списков
```sql
CREATE TABLE dropdown_configs (
    id SERIAL PRIMARY KEY,
    business_path VARCHAR(50),      -- Тип сервиса (mortgage, credit и т.д.)
    screen_id VARCHAR(100),          -- Идентификатор экрана (step1, step2 и т.д.)
    field_name VARCHAR(100),         -- Идентификатор поля  
    dropdown_key VARCHAR(255),       -- Уникальный ключ (формат screen_field)
    dropdown_data JSONB,             -- Полные мультиязычные данные
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX idx_dropdown_configs_screen ON dropdown_configs(screen_id);
CREATE INDEX idx_dropdown_configs_key ON dropdown_configs(dropdown_key);
CREATE INDEX idx_dropdown_configs_jsonb ON dropdown_configs USING gin(dropdown_data);
```

### Структура JSONB данных

```json
{
  "label": {
    "en": "Property Ownership",
    "he": "בעלות על נכס",
    "ru": "Владение недвижимостью"
  },
  "placeholder": {
    "en": "Select property status",
    "he": "בחר סטטוס נכס",
    "ru": "Выберите статус недвижимости"
  },
  "options": [
    {
      "value": "no_property",
      "text": {
        "en": "I don't own any property",
        "he": "אין בבעלותי נכס",
        "ru": "У меня нет недвижимости"
      }
    },
    {
      "value": "has_property",
      "text": {
        "en": "I own a property",
        "he": "יש בבעלותי נכס",
        "ru": "У меня есть недвижимость"
      }
    }
  ]
}
```

### Сравнение старой и новой системы

| Аспект | Старая система (content_items) | Новая система (JSONB) |
|--------|--------------------------------|----------------------|
| **Структура** | Нормализованные таблицы с JOIN | Единая JSONB колонка |
| **Запросы** | 3-5 запросов на dropdown | 1 запрос на экран |
| **Производительность** | ~450мс среднее время | ~56мс (87% улучшение) |
| **Языки** | Отдельные записи | Все в одном JSONB |
| **Кеширование** | 30% эффективность | 85% эффективность |
| **Обновления** | Сложная синхронизация | Атомарные обновления |

### Статус миграции

⚠️ **ВАЖНО**: Таблицы `content_items` и `content_translations` **БОЛЬШЕ НЕ ИСПОЛЬЗУЮТСЯ** для выпадающих списков. Они остаются только для других типов контента (text, link, step).

### Контексты приложения

Система поддерживает **4 различных контекста**:

| Контекст | Код | Описание |
|----------|-----|----------|
| **Публичный сайт** | `public` | Контент для незарегистрированных пользователей |
| **Личный кабинет** | `user_portal` | Контент для авторизованных пользователей |
| **CMS панель** | `cms` | Контент для администраторов контента |
| **Банковские операции** | `bank_ops` | Контент для банковских сотрудников |

### Типы компонентов

| Тип | Описание | Пример использования |
|-----|----------|---------------------|
| `text` | Текстовый контент | Заголовки, описания |
| `dropdown` | Выпадающий список | Выбор типа недвижимости |
| `option` | Опция в списке | Элемент dropdown |
| `step` | Шаг в процессе | Шаг калькулятора |
| `link` | Ссылка | Навигационные элементы |

## 🔄 Процесс получения данных

### 1. Запрос с фронтенда

```typescript
// packages/client/src/services/api.ts
const apiService = {
  async getContent(screenLocation: string, languageCode: string) {
    // Проверка кеша
    const cacheKey = `content_${screenLocation}_${languageCode}`;
    const cached = this.contentCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CONTENT_CACHE_TTL) {
      return cached.data;
    }
    
    // HTTP запрос к серверу
    const response = await fetch(`/api/content/${screenLocation}/${languageCode}`);
    const data = await response.json();
    
    // Обновление кеша с ETag
    this.contentCache.set(cacheKey, {
      data,
      etag: response.headers.get('etag'),
      timestamp: Date.now()
    });
    
    return data;
  }
}
```

### 2. Обработка на сервере

```javascript
// packages/server/server.js
app.get('/api/content/:screenLocation/:languageCode', async (req, res) => {
  const { screenLocation, languageCode } = req.params;
  
  // SQL запрос с группировкой по языкам
  const query = `
    SELECT 
      ci.id,
      ci.content_key,
      ci.component_type,
      ci.category,
      MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
      MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
      MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
    FROM content_items ci
    LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = $1 
      AND ci.is_active = TRUE
    GROUP BY ci.id, ci.content_key, ci.component_type, ci.category
    ORDER BY ci.page_number, ci.id
  `;
  
  const result = await pool.query(query, [screenLocation]);
  res.json(result.rows);
});
```

### 3. Специализированные эндпоинты

#### Эндпоинты для drill-down навигации:

```javascript
// Ипотечный калькулятор
app.get('/api/content/mortgage/drill/:screenLocation', async (req, res) => {
  // Получение контента для конкретного шага ипотеки
});

// Кредитный калькулятор  
app.get('/api/content/credit/drill/:screenLocation', async (req, res) => {
  // Получение контента для конкретного шага кредита
});

// Рефинансирование ипотеки
app.get('/api/content/mortgage-refi/drill/:stepId', async (req, res) => {
  // Сложная логика с поиском шагов по разным паттернам
});
```

#### Эндпоинты для dropdown опций:

```javascript
// Получение опций для выпадающего списка
app.get('/api/content/:service/:contentKey/options', async (req, res) => {
  const query = `
    SELECT 
      content_key,
      MAX(CASE WHEN language_code = 'ru' THEN content_value END) as text_ru,
      MAX(CASE WHEN language_code = 'he' THEN content_value END) as text_he,
      MAX(CASE WHEN language_code = 'en' THEN content_value END) as text_en
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.content_key LIKE $1
      AND ci.component_type = 'option'
    GROUP BY ci.content_key
    ORDER BY ci.id
  `;
});
```

## ✏️ Процесс редактирования контента

### 1. Открытие модального окна редактирования

```typescript
// packages/client/src/components/ContentEditModals/TextEditModal.tsx
const TextEditModal: React.FC<TextEditModalProps> = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    text: {
      ru: item.text_ru || '',
      he: item.text_he || '',
      en: item.text_en || ''
    },
    style: {
      font: item.font || 'Arial',
      size: item.size || 14,
      color: item.color || '#000000',
      weight: item.weight || 'normal'
    }
  });
  
  // Вкладки для переключения языков
  const [activeTab, setActiveTab] = useState<'ru' | 'he' | 'en'>('ru');
  
  const handleSave = async () => {
    // Валидация данных
    if (!formData.text.ru || !formData.text.he || !formData.text.en) {
      alert('Все языковые версии должны быть заполнены');
      return;
    }
    
    // Отправка на сервер
    await apiService.updateContent(item.id, formData);
    
    // Очистка кеша
    apiService.clearContentCache();
    
    onSave(formData);
  };
};
```

### 2. Отправка изменений на сервер

```typescript
// packages/client/src/services/api.ts
async updateContent(contentId: number, data: ContentUpdateData) {
  const response = await fetch(`/api/content/${contentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update content');
  }
  
  // Очистка кеша после успешного обновления
  this.clearContentCache();
  
  return response.json();
}
```

### 3. Обновление в базе данных

```javascript
// packages/server/server.js (предполагаемая реализация)
app.put('/api/content/:contentId', async (req, res) => {
  const { contentId } = req.params;
  const { text, style } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Обновление переводов для каждого языка
    for (const [lang, value] of Object.entries(text)) {
      await client.query(`
        UPDATE content_translations 
        SET content_value = $1, updated_at = NOW()
        WHERE content_item_id = $2 AND language_code = $3
      `, [value, contentId, lang]);
    }
    
    // Обновление стилей (если применимо)
    if (style) {
      await client.query(`
        UPDATE content_items 
        SET updated_at = NOW()
        WHERE id = $1
      `, [contentId]);
    }
    
    await client.query('COMMIT');
    res.json({ success: true });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
```

## 🔄 Новая система JSONB для выпадающих списков

### API эндпоинты для JSONB dropdowns

#### Получение данных dropdown (новый формат)
```http
GET /api/dropdowns/{screen}/{language}
```

**Пример запроса:**
```bash
GET /api/dropdowns/mortgage_step1/he
```

**Формат ответа:**
```json
{
  "status": "success",
  "screen_location": "mortgage_step1",
  "language_code": "he",
  "jsonb_source": true,  // Подтверждает использование JSONB
  "dropdowns": [
    {
      "key": "mortgage_step1_property_ownership",
      "label": "בעלות על נכס"
    }
  ],
  "options": {
    "mortgage_step1_property_ownership": [
      {
        "value": "no_property",
        "text": "אין בבעלותי נכס"
      },
      {
        "value": "has_property",
        "text": "יש בבעלותי נכס"
      }
    ]
  },
  "performance": {
    "query_count": 1,
    "source": "jsonb",
    "total_items": 5
  }
}
```

### Необходимые изменения в админ-панели

#### 1. Обновление сервиса API
```typescript
// packages/client/src/services/api.ts - Новые методы для JSONB
const apiService = {
  // Получить конфигурацию dropdown
  async getDropdownConfig(dropdownKey: string) {
    const response = await fetch(`/api/admin/dropdown-configs/${dropdownKey}`);
    return response.json();
  },
  
  // Обновить JSONB конфигурацию
  async updateDropdownConfig(dropdownKey: string, jsonbData: any) {
    const response = await fetch(`/api/admin/dropdown-configs/${dropdownKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dropdown_data: jsonbData })
    });
    
    // Очистка кеша после обновления
    this.clearContentCache();
    return response.json();
  },
  
  // Создать новый dropdown
  async createDropdownConfig(screenLocation: string, fieldName: string, data: any) {
    const dropdownKey = `${screenLocation}_${fieldName}`;
    const response = await fetch('/api/admin/dropdown-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        screen_id: screenLocation,
        field_name: fieldName,
        dropdown_key: dropdownKey,
        dropdown_data: data
      })
    });
    return response.json();
  }
};
```

#### 2. Обновление компонента редактирования
```typescript
// DropdownEditModal для JSONB
interface JsonbDropdownData {
  label: { en: string; he: string; ru: string; };
  placeholder: { en: string; he: string; ru: string; };
  options: Array<{
    value: string;
    text: { en: string; he: string; ru: string; };
  }>;
}

const JsonbDropdownEditModal: React.FC<{ dropdownKey: string }> = ({ dropdownKey }) => {
  const [data, setData] = useState<JsonbDropdownData>();
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'he' | 'ru'>('ru');
  
  // Загрузка JSONB данных
  useEffect(() => {
    apiService.getDropdownConfig(dropdownKey).then(setData);
  }, [dropdownKey]);
  
  const handleSave = async () => {
    await apiService.updateDropdownConfig(dropdownKey, data);
    // Обновление UI после сохранения
  };
  
  return (
    <Modal>
      {/* Вкладки для языков */}
      <LanguageTabs 
        active={activeLanguage}
        onChange={setActiveLanguage}
      />
      
      {/* Редактор для label и placeholder */}
      <TextField
        value={data?.label[activeLanguage]}
        onChange={(val) => setData({
          ...data,
          label: { ...data.label, [activeLanguage]: val }
        })}
      />
      
      {/* Редактор опций */}
      {data?.options.map((option, idx) => (
        <OptionEditor
          key={idx}
          value={option.text[activeLanguage]}
          onChange={(val) => updateOption(idx, activeLanguage, val)}
        />
      ))}
    </Modal>
  );
};
```

#### 3. Серверные эндпоинты для админ-панели
```javascript
// packages/server/server.js - Административные JSONB эндпоинты

// Получить все dropdowns для экрана
app.get('/api/admin/dropdown-configs/:screen', async (req, res) => {
  const { screen } = req.params;
  
  const result = await pool.query(`
    SELECT * FROM dropdown_configs
    WHERE screen_id = $1 AND is_active = true
    ORDER BY field_name
  `, [screen]);
  
  res.json({
    screen,
    dropdowns: result.rows,
    jsonb_source: true
  });
});

// Обновить JSONB конфигурацию
app.put('/api/admin/dropdown-configs/:key', async (req, res) => {
  const { key } = req.params;
  const { dropdown_data } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Обновление JSONB данных
    await client.query(`
      UPDATE dropdown_configs
      SET dropdown_data = $1, 
          updated_at = NOW()
      WHERE dropdown_key = $2
    `, [JSON.stringify(dropdown_data), key]);
    
    await client.query('COMMIT');
    
    // Очистка кеша
    contentCache.delete(`dropdowns_${key}`);
    
    res.json({ success: true, key });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Создать новый dropdown
app.post('/api/admin/dropdown-configs', async (req, res) => {
  const { screen_id, field_name, dropdown_key, dropdown_data } = req.body;
  
  await pool.query(`
    INSERT INTO dropdown_configs 
    (screen_id, field_name, dropdown_key, dropdown_data, is_active)
    VALUES ($1, $2, $3, $4, true)
    ON CONFLICT (dropdown_key) 
    DO UPDATE SET dropdown_data = $4, updated_at = NOW()
  `, [screen_id, field_name, dropdown_key, JSON.stringify(dropdown_data)]);
  
  res.json({ success: true, dropdown_key });
});
```

### Скрипт миграции существующих данных

```sql
-- Миграция dropdown данных из старой структуры в JSONB
WITH dropdown_migration AS (
  SELECT 
    ci.screen_location as screen_id,
    ci.category as field_name,
    CONCAT(ci.screen_location, '_', ci.category) as dropdown_key,
    jsonb_build_object(
      'label', jsonb_build_object(
        'ru', MAX(CASE WHEN ct.language_code = 'ru' AND ci.component_type = 'dropdown' 
                       THEN ct.content_value END),
        'he', MAX(CASE WHEN ct.language_code = 'he' AND ci.component_type = 'dropdown' 
                       THEN ct.content_value END),
        'en', MAX(CASE WHEN ct.language_code = 'en' AND ci.component_type = 'dropdown' 
                       THEN ct.content_value END)
      ),
      'placeholder', jsonb_build_object(
        'ru', 'Выберите опцию',
        'he', 'בחר אפשרות',
        'en', 'Select option'
      ),
      'options', jsonb_agg(
        jsonb_build_object(
          'value', REPLACE(ci.content_key, CONCAT(ci.screen_location, '_', ci.category, '_'), ''),
          'text', jsonb_build_object(
            'ru', MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END),
            'he', MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END),
            'en', MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END)
          )
        ) ORDER BY ci.id
      ) FILTER (WHERE ci.component_type = 'option')
    ) as dropdown_data
  FROM content_items ci
  LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
  WHERE ci.component_type IN ('dropdown', 'option')
    AND ci.is_active = true
  GROUP BY ci.screen_location, ci.category
)
INSERT INTO dropdown_configs (screen_id, field_name, dropdown_key, dropdown_data, is_active, created_at, updated_at)
SELECT 
  screen_id,
  field_name,
  dropdown_key,
  dropdown_data,
  true,
  NOW(),
  NOW()
FROM dropdown_migration
ON CONFLICT (dropdown_key) DO NOTHING;
```

## 🚀 Оптимизация и кеширование

### Frontend кеширование

1. **ETag-based HTTP кеширование**
   - Сервер отправляет ETag заголовок с каждым ответом
   - Клиент проверяет актуальность кеша по ETag

2. **TTL-based кеширование**
   - По умолчанию: 5 минут (300000мс)
   - Настраивается через `VITE_CONTENT_CACHE_TTL`

3. **Дедупликация запросов**
   - Предотвращение дублирующих API вызовов
   - Группировка связанных запросов

### Backend оптимизация

1. **Индексы базы данных**
```sql
CREATE INDEX idx_content_items_screen_location ON content_items(screen_location);
CREATE INDEX idx_content_items_category ON content_items(category);
CREATE INDEX idx_content_items_component_type ON content_items(component_type);
CREATE INDEX idx_content_translations_content_item_id ON content_translations(content_item_id);
CREATE INDEX idx_content_translations_language_code ON content_translations(language_code);
```

2. **Connection pooling**
```javascript
const pool = new Pool({
  max: 20,                    // Максимум соединений
  idleTimeoutMillis: 30000,   // Таймаут простоя
  connectionTimeoutMillis: 2000
});
```

## 📊 Поток данных

### Получение контента
```
Пользователь открывает страницу
          ↓
React компонент запрашивает данные
          ↓
API Service проверяет кеш
          ↓ (если кеш устарел)
HTTP запрос к серверу
          ↓
Сервер формирует SQL запрос
          ↓
PostgreSQL выполняет запрос
          ↓
Трансформация данных (группировка по языкам)
          ↓
JSON ответ с ETag заголовком
          ↓
Обновление frontend кеша
          ↓
Рендеринг компонента
```

### Редактирование контента
```
Клик на кнопку редактирования
          ↓
Открытие модального окна
          ↓
Загрузка текущих значений
          ↓
Редактирование по языкам
          ↓
Валидация данных
          ↓
PUT запрос к API
          ↓
Транзакция в БД
          ↓
Обновление translations
          ↓
Commit транзакции
          ↓
Очистка кешей
          ↓
Обновление UI
```

## 🔧 Специфические особенности

### Drill-down навигация

Система поддерживает глубокую навигацию для калькуляторов:

1. **Ипотечный калькулятор**: до 32 шагов
2. **Кредитный калькулятор**: до 20 шагов  
3. **Рефинансирование ипотеки**: до 4 шагов
4. **Рефинансирование кредита**: до 6 шагов

### Fallback механизмы

При отсутствии контента система:
1. Ищет по альтернативным паттернам имён
2. Создаёт placeholder контент
3. Возвращает мультиязычные заглушки

### Мультиязычность

- **3 языка**: Русский (ru), Иврит (he), Английский (en)
- **RTL поддержка**: Автоматическая для иврита
- **Fallback**: Если перевод отсутствует, используется русская версия

## ⚠️ Известные ограничения и текущий статус

### Общие ограничения системы
1. **Отсутствие PUT/POST эндпоинтов** для обновления контента в текущей реализации server.js
2. **Гибридная схема БД** между документированной и реальной структурой
3. **Неполная реализация** контекстов приложения (табы есть в UI, но функциональность не завершена)
4. **Ограниченная обработка ошибок** на фронтенде

### Статус миграции JSONB для dropdowns
1. **Основное приложение**: Уже мигрировало на JSONB (производительность улучшена на 87%)
2. **Админ-панель**: Всё ещё использует старую нормализованную структуру
3. **Необходима синхронизация**: Админ-панель должна быть обновлена для работы с JSONB
4. **Критичность**: ВЫСОКАЯ - старая система больше не поддерживается для dropdowns

## 📈 Рекомендации по улучшению

### 🚨 КРИТИЧЕСКИЕ изменения (требуется немедленно)
1. **Миграция на JSONB для dropdowns** - основное приложение уже мигрировало
   - Создать таблицу `dropdown_configs` с JSONB структурой
   - Мигрировать существующие dropdown данные
   - Обновить API эндпоинты для работы с JSONB
   - Модифицировать React компоненты для JSONB редактирования
   - См. файл `JSONB_MIGRATION_QUESTIONS.md` для критических вопросов

### Немедленные улучшения
1. Реализовать недостающие эндпоинты для редактирования контента
2. Стандартизировать API паттерны между старой и новой системой
3. Завершить реализацию контекстов приложения
4. Добавить серверное кеширование (Redis)

### Долгосрочные улучшения
1. WebSocket для real-time обновлений
2. Версионирование контента
3. Полнотекстовый поиск
4. Мониторинг производительности
5. Аудит изменений контента