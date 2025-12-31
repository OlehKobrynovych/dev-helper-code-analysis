# Швидкий довідник API

## 🛠️ Утиліти (utils.js)

```javascript
// Екранування HTML
const safe = window.Utils.escapeHTML("<script>alert('xss')</script>");

// Порівняння рядків (0-1, де 1 = ідентичні)
const similarity = window.Utils.calculateSimilarity("hello", "hallo"); // 0.8

// Генерація варіантів шляхів для пошуку
const variants = window.Utils.generateSearchVariants(
  "icon.png",
  "assets/images/icon.png"
);
// ["icon.png", "icon", "assets/images/icon.png", "./assets/images/icon.png", ...]
```

## 🔍 Аналізатори (analyzers.js)

```javascript
// Аналіз CSS класів
const cssResult = window.Analyzers.analyzeCSSClasses(cssFiles, jsFiles);
// { total: 150, unused: [{name: ".unused-class", location: "styles.css"}] }

// Аналіз функцій
const funcResult = window.Analyzers.analyzeFunctions(jsFiles);
// { total: 50, unused: [{name: "unusedFunc", location: "utils.js"}] }

// Аналіз змінних
const varResult = window.Analyzers.analyzeVariables(jsFiles);
// { total: 100, unused: [{name: "unusedVar", location: "app.js:15", type: "const"}] }

// Аналіз зображень
const imgResult = window.Analyzers.analyzeImages(imageFiles, jsFiles, cssFiles);
// { total: 20, unused: [...], used: 15 }

// Пошук дублікатів функцій
const duplicates = window.Analyzers.findDuplicateFunctions(jsFiles);
// [{name: "handleClick", count: 3, locations: [...], similar: true}]

// Аналіз типів файлів
const fileTypes = window.Analyzers.analyzeFileTypes(files);
// { js: 50, css: 10, png: 5, ... }

// Аналіз TypeScript типів
const types = window.Analyzers.analyzeTypeScriptTypes(files);
// { allTypes: [...], byFile: {...}, stats: {...} }

// Аналіз сторінок
const pages = window.Analyzers.analyzePages(files);
// [{path: "src/pages/Home.tsx", type: "React Page"}]
```

## 🌐 API Аналізатор (api-analyzer.js)

```javascript
// Знаходження всіх API роутів
const routes = window.APIAnalyzer.analyzeAPIRoutes(jsFiles);
// [{
//   method: "GET",
//   path: "/api/users",
//   file: "api/users/route.ts",
//   params: { body: [], query: ["page"], headers: ["Authorization"] }
// }]

// Витягування Next.js шляху
const path = window.APIAnalyzer.extractNextJSPath("app/api/users/route.ts");
// "/api/users"

// Витягування параметрів з контексту
const params = window.APIAnalyzer.extractRouteParamsFromContent(
  content,
  startIndex
);
// { body: ["username", "password"], query: ["page"], headers: ["Authorization"] }
```

## 📦 ZIP Handler (zip-handler.js)

```javascript
// Розпакування ZIP файлу
const files = await window.ZipHandler.extractZipFiles(dataView);
// [{name: "src/App.js", content: "..."}, ...]

// Повний аналіз проекту
const result = await window.ZipHandler.analyzeZipProject(dataView);
// {
//   architecture: { projectType: "SPA", framework: "React", ... },
//   unusedCSS: [...],
//   unusedFunctions: [...],
//   stats: { cssFilesAnalyzed: 10, ... },
//   projectName: "my-app",
//   packageJson: {...},
//   files: [...]
// }
```

## 🎨 UI Renderer (ui-renderer.js)

```javascript
// Рендеринг основних результатів
const html = window.UIRenderer.renderResultsHTML(result);
// "<div>...</div>"

// Рендеринг детальних блоків
const detailsHtml = window.UIRenderer.renderDetailedBlocks(result);
// "<div>...</div>"
```

## 📚 Типи даних

### File Object

```javascript
{
  name: "src/App.js",
  content: "import React from 'react'..."
}
```

### Analysis Result

```javascript
{
  architecture: {
    projectType: "SPA" | "SSR/SSG" | "Unknown",
    framework: "React" | "Vue.js" | "Next.js" | ...,
    structure: "Feature-based" | "Layer-based" | "Unknown",
    nestingLevel: 5
  },
  unusedCSS: [{name: ".class", location: "file.css"}],
  unusedFunctions: [{name: "func", location: "file.js"}],
  unusedVariables: [{name: "var", location: "file.js:10", type: "const"}],
  unusedImages: [{name: "img.png", path: "assets/img.png"}],
  duplicateFunctions: [{name: "func", count: 2, locations: [...], similar: true}],
  apiRoutes: [{method: "GET", path: "/api/...", ...}],
  fileTypes: {js: 50, css: 10},
  pages: [{path: "...", type: "React Page"}],
  typesAnalysis: {allTypes: [...], byFile: {...}, stats: {...}},
  stats: {
    cssFilesAnalyzed: 10,
    jsFilesAnalyzed: 50,
    totalCSSClasses: 150,
    totalFunctions: 100,
    totalVariables: 200,
    totalImages: 20,
    totalFiles: 500
  },
  projectName: "my-app",
  packageJson: {...},
  files: [...]
}
```

## 💡 Приклади використання

### Додати новий аналізатор

```javascript
// В components/analyzers.js
window.Analyzers.myNewAnalyzer = function (files) {
  // твоя логіка
  return result;
};

// Використання
const result = window.Analyzers.myNewAnalyzer(files);
```

### Додати нову утиліту

```javascript
// В components/utils.js
window.Utils.myUtility = function (input) {
  // твоя логіка
  return output;
};

// Використання
const output = window.Utils.myUtility(input);
```

### Розширити UI рендерер

```javascript
// В components/ui-renderer.js
window.UIRenderer.renderMyBlock = function (data) {
  return "<div>" + data + "</div>";
};

// Використання
const html = window.UIRenderer.renderMyBlock(myData);
```
