# Швидкий старт

## 🚀 За 5 хвилин

### 1. Перевір структуру

Переконайся що у тебе є:

```
extension/
├── components/
│   ├── utils.js
│   ├── analyzers.js
│   ├── api-analyzer.js
│   ├── zip-handler.js
│   ├── ui-renderer.js
│   └── ui-renderer-details.js
├── lib/
│   ├── jszip.min.js
│   └── zip-analyzer.js
├── popup.html
└── popup-main.js
```

### 2. Відкрий popup.html

Перевір що скрипти завантажуються в правильному порядку:

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

### 3. Завантаж екстеншен

1. Відкрий Chrome/Edge
2. Перейди в `chrome://extensions/`
3. Увімкни "Режим розробника"
4. Натисни "Завантажити розпаковане розширення"
5. Вибери папку `extension/`

### 4. Тестуй

1. Натисни на іконку екстеншена
2. Вибери ZIP файл проекту
3. Дочекайся результатів
4. Перевір що все працює

## 📖 Використання компонентів

### Базовий приклад

```javascript
// В popup-main.js або будь-якому іншому файлі після завантаження компонентів

// 1. Аналіз ZIP
const dataView = new DataView(arrayBuffer);
const result = await window.ZipHandler.analyzeZipProject(dataView);

// 2. Рендеринг результатів
const html = window.UIRenderer.renderResultsHTML(result);
document.getElementById("results").innerHTML = html;
```

### Використання окремих аналізаторів

```javascript
// Аналіз CSS
const cssResult = window.Analyzers.analyzeCSSClasses(cssFiles, jsFiles);
console.log("Unused CSS:", cssResult.unused);

// Аналіз функцій
const funcResult = window.Analyzers.analyzeFunctions(jsFiles);
console.log("Unused functions:", funcResult.unused);

// Аналіз API
const apiRoutes = window.APIAnalyzer.analyzeAPIRoutes(jsFiles);
console.log("API routes:", apiRoutes);
```

### Використання утиліт

```javascript
// Екранування HTML
const safe = window.Utils.escapeHTML('<script>alert("xss")</script>');

// Порівняння рядків
const similarity = window.Utils.calculateSimilarity("hello", "hallo");
console.log("Similarity:", similarity); // 0.8
```

## 🎯 Типові завдання

### Додати новий аналізатор

```javascript
// В components/analyzers.js
window.Analyzers.myNewAnalyzer = function(files) {
  const results = [];

  files.forEach(file => {
    // твоя логіка
    if (/* умова */) {
      results.push({
        name: file.name,
        issue: 'опис проблеми'
      });
    }
  });

  return results;
};

// Використання
const myResults = window.Analyzers.myNewAnalyzer(files);
```

### Додати новий UI блок

```javascript
// В components/ui-renderer.js або popup-main.js
function renderMyBlock(data) {
  let html = '<div style="border:1px solid #ccc;padding:16px;">';
  html += "<h3>Мій блок</h3>";

  data.forEach((item) => {
    html += "<div>" + window.Utils.escapeHTML(item.name) + "</div>";
  });

  html += "</div>";
  return html;
}

// Використання
const html = renderMyBlock(myData);
```

### Розширити аналіз ZIP

```javascript
// В components/zip-handler.js, в функції analyzeZipProject
// Додай після інших аналізаторів:

const myAnalysis = window.Analyzers.myNewAnalyzer(files);

// Додай в результат:
resolve({
  // ... інші поля
  myAnalysis: myAnalysis,
});
```

## 🔍 Дебаг

### Перевірка завантаження компонентів

Відкрий консоль браузера (F12) і введи:

```javascript
console.log("Utils:", typeof window.Utils);
console.log("Analyzers:", typeof window.Analyzers);
console.log("APIAnalyzer:", typeof window.APIAnalyzer);
console.log("ZipHandler:", typeof window.ZipHandler);
console.log("UIRenderer:", typeof window.UIRenderer);
```

Всі мають повернути `'object'`.

### Перевірка функцій

```javascript
console.log("analyzeCSSClasses:", typeof window.Analyzers.analyzeCSSClasses);
// Має повернути 'function'
```

### Типові помилки

#### "window.Analyzers is undefined"

**Причина**: Файл `components/analyzers.js` не завантажився  
**Рішення**: Перевір що він є в `popup.html` і шлях правильний

#### "Cannot read property 'analyzeCSSClasses' of undefined"

**Причина**: Неправильний порядок завантаження скриптів  
**Рішення**: Перевір порядок `<script>` тегів в `popup.html`

#### "analyzeZipProject is not a function"

**Причина**: `zip-handler.js` не завантажився  
**Рішення**: Перевір консоль на помилки завантаження

## 📚 Що далі?

### Для початківців:

1. Читай `QUICK_REFERENCE.md` - приклади використання
2. Дивись `popup-main.js` - як все працює разом
3. Експериментуй з компонентами в консолі

### Для досвідчених:

1. Читай `ARCHITECTURE.md` - розумій архітектуру
2. Читай `COMPONENT_STRUCTURE.md` - детальна структура
3. Додавай свої аналізатори і функції

### Для міграції:

1. Читай `MIGRATION_GUIDE.md` - інструкція з міграції
2. Поступово переноси код на нові компоненти
3. Тестуй після кожної зміни

## 💡 Поради

### 1. Використовуй namespace

Завжди викликай функції через `window.*`:

```javascript
// ✅ Правильно
window.Analyzers.analyzeCSSClasses(cssFiles, jsFiles);

// ❌ Неправильно (не працюватиме)
analyzeCSSClasses(cssFiles, jsFiles);
```

### 2. Перевіряй існування

Перед викликом перевір що функція існує:

```javascript
if (
  window.Analyzers &&
  typeof window.Analyzers.analyzeCSSClasses === "function"
) {
  const result = window.Analyzers.analyzeCSSClasses(cssFiles, jsFiles);
}
```

### 3. Логуй результати

Використовуй `console.log` для дебагу:

```javascript
const result = window.Analyzers.analyzeCSSClasses(cssFiles, jsFiles);
console.log("CSS Analysis:", result);
```

### 4. Читай документацію

Всі функції задокументовані в `QUICK_REFERENCE.md`.

## 🎉 Готово!

Тепер ти знаєш:

- ✅ Як перевірити структуру
- ✅ Як завантажити екстеншен
- ✅ Як використовувати компоненти
- ✅ Як додавати нові функції
- ✅ Як дебажити проблеми

**Успіхів у розробці! 🚀**

---

**Потрібна допомога?**

- Читай `QUICK_REFERENCE.md` для прикладів
- Читай `MIGRATION_GUIDE.md` для міграції
- Читай `ARCHITECTURE.md` для розуміння архітектури
