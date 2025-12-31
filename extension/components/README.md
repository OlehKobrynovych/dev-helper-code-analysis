# Компоненти екстеншена

Ця папка містить модульні компоненти для аналізу коду проектів.

## 📂 Файли

### `utils.js`

Базові утиліти:

- `escapeHTML()` - екранування HTML
- `calculateSimilarity()` - порівняння рядків
- `generateSearchVariants()` - генерація варіантів пошуку

### `analyzers.js`

Основні аналізатори:

- `analyzeCSSClasses()` - CSS класи
- `analyzeFunctions()` - JavaScript функції
- `analyzeVariables()` - змінні
- `analyzeImages()` - зображення
- `findDuplicateFunctions()` - дублікати функцій
- `analyzeFileTypes()` - типи файлів
- `analyzeTypeScriptTypes()` - TypeScript типи
- `analyzePages()` - сторінки

### `api-analyzer.js`

Аналіз API роутів:

- `analyzeAPIRoutes()` - знаходження всіх API роутів
- `extractNextJSPath()` - Next.js шляхи
- `extractRouteParamsFromContent()` - параметри роутів
- `extractFetchParamsFromContent()` - параметри fetch
- `extractAxiosParamsFromContent()` - параметри axios

### `zip-handler.js`

Робота з ZIP файлами:

- `extractZipFiles()` - розпакування ZIP
- `analyzeZipProject()` - головна функція аналізу

### `ui-renderer.js`

Рендеринг результатів:

- `renderResultsHTML()` - основні метрики
- `renderDetailedBlocks()` - викликає функцію з popup-main.js

## 🔗 Залежності

Компоненти завантажуються в такому порядку:

1. `utils.js` (базові утиліти)
2. `analyzers.js` (використовує utils)
3. `api-analyzer.js` (незалежний)
4. `zip-handler.js` (використовує analyzers + api-analyzer)
5. `ui-renderer.js` (рендеринг результатів)

## 🚀 Використання

Всі компоненти доступні через глобальний об'єкт `window`:

```javascript
// Аналіз CSS
const result = window.Analyzers.analyzeCSSClasses(cssFiles, jsFiles);

// Аналіз ZIP
const project = await window.ZipHandler.analyzeZipProject(dataView);

// Рендеринг UI
const html = window.UIRenderer.renderResultsHTML(result);
```

## ✨ Особливості

- ✅ Без ES6 імпортів (сумісність з браузерними екстеншенами)
- ✅ Модульна структура
- ✅ Глобальні namespace для доступу
- ✅ Послідовне завантаження через `<script>` теги
- ✅ Легко розширювати

## 📖 Документація

Детальніше дивись:

- [COMPONENT_STRUCTURE.md](../COMPONENT_STRUCTURE.md) - структура компонентів
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - швидкий довідник API
- [ARCHITECTURE.md](../ARCHITECTURE.md) - архітектура проекту
