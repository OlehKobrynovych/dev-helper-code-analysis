# Структура компонентів екстеншена

## 📁 Організація файлів

Проект розбитий на модульні компоненти без використання ES6 імпортів (для сумісності з браузерними екстеншенами).

### Компоненти (`/components`)

#### 1. **utils.js** - Утиліти

- `window.Utils.escapeHTML()` - екранування HTML
- `window.Utils.calculateSimilarity()` - порівняння рядків
- `window.Utils.generateSearchVariants()` - генерація варіантів пошуку файлів

#### 2. **analyzers.js** - Аналізатори коду

- `window.Analyzers.analyzeCSSClasses()` - аналіз CSS класів
- `window.Analyzers.analyzeFunctions()` - аналіз функцій
- `window.Analyzers.analyzeVariables()` - аналіз змінних
- `window.Analyzers.analyzeImages()` - аналіз зображень
- `window.Analyzers.findDuplicateFunctions()` - пошук дублікатів
- `window.Analyzers.analyzeFileTypes()` - аналіз типів файлів
- `window.Analyzers.analyzeTypeScriptTypes()` - аналіз TypeScript типів
- `window.Analyzers.analyzePages()` - аналіз сторінок

#### 3. **api-analyzer.js** - Аналізатор API

- `window.APIAnalyzer.analyzeAPIRoutes()` - знаходження API роутів
- `window.APIAnalyzer.extractNextJSPath()` - витягування Next.js шляхів
- `window.APIAnalyzer.extractRouteParamsFromContent()` - параметри роутів
- `window.APIAnalyzer.extractFetchParamsFromContent()` - параметри fetch
- `window.APIAnalyzer.extractAxiosParamsFromContent()` - параметри axios

#### 4. **zip-handler.js** - Обробка ZIP

- `window.ZipHandler.extractZipFiles()` - розпакування ZIP
- `window.ZipHandler.analyzeZipProject()` - головна функція аналізу

#### 5. **ui-renderer.js** - Рендеринг UI

- `window.UIRenderer.renderResultsHTML()` - рендеринг основних результатів
- `window.UIRenderer.renderDetailedBlocks()` - рендеринг деталей

#### 6. **ui-renderer-details.js** - Деталі UI

- `window.UIRendererDetails.commonLibs` - список бібліотек з описами
- `window.UIRendererDetails.renderDetailedBlocks()` - детальні блоки

### Головні файли

#### **popup-main.js**

Головний контролер:

- Event listeners для завантаження файлів
- Виклик аналізу через `window.ZipHandler`
- Відображення результатів через `window.UIRenderer`

#### **popup.html**

Порядок завантаження скриптів:

```html
<script src="lib/jszip.min.js"></script>
<script src="components/utils.js"></script>
<script src="components/analyzers.js"></script>
<script src="components/api-analyzer.js"></script>
<script src="components/zip-handler.js"></script>
<script src="components/ui-renderer-details.js"></script>
<script src="components/ui-renderer.js"></script>
<script src="lib/zip-analyzer.js"></script>
<script src="popup-main.js"></script>
```

## 🔄 Як це працює

### 1. Глобальні об'єкти як "модулі"

Кожен компонент створює свій namespace у `window`:

```javascript
// components/utils.js
window.Utils = {
  escapeHTML: function(str) { ... }
};

// components/analyzers.js
window.Analyzers = {
  analyzeCSSClasses: function(cssFiles, jsFiles) { ... }
};
```

### 2. Використання в інших файлах

```javascript
// popup-main.js
const result = await window.ZipHandler.analyzeZipProject(dataView);
const html = window.UIRenderer.renderResultsHTML(result);
```

### 3. Послідовне завантаження

Файли завантажуються в правильному порядку через `<script>` теги в HTML.

## ✅ Переваги

1. **Модульність** - код розбитий на логічні частини
2. **Читабельність** - легше знайти потрібну функцію
3. **Підтримка** - зміни в одному модулі не впливають на інші
4. **Сумісність** - працює в браузерних екстеншенах без збірки
5. **Без залежностей** - не потрібен webpack/rollup

## 🔧 Як додати новий компонент

1. Створи файл `components/my-component.js`
2. Додай namespace:

```javascript
window.MyComponent = {
  myFunction: function () {
    // твій код
  },
};
```

3. Додай `<script>` в `popup.html` перед `popup-main.js`
4. Використовуй: `window.MyComponent.myFunction()`

## 📝 Примітки

- Всі функції доступні глобально через `window`
- Порядок завантаження скриптів важливий
- Старий `zip-analyzer.js` залишений для сумісності
- `popup-main.js` містить велику функцію `renderDetailedBlocks` (1000+ рядків)
