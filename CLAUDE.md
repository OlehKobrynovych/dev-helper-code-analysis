# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository..

## Project Overview

DevHelper Code Analysis is a browser extension (Manifest V3) for analyzing unused code in web projects. It analyzes ZIP archives of projects to detect unused CSS classes, JavaScript functions, variables, images, API routes, and TypeScript types. The extension is built with vanilla JavaScript using a modular architecture without ES6 imports for browser compatibility.

## Architecture

### Module System

This project uses **global namespace pattern** instead of ES6 modules for browser extension compatibility:

- Each component creates a global namespace via `window.ComponentName = { ... }`
- Components are loaded sequentially via `<script>` tags in `extension/popup.html`
- No build step required - runs directly in browser

### Loading Order (Critical)

Files must load in this exact order (defined in `extension/popup.html`):

1. `lib/jszip.min.js` - ZIP file handling library
2. `components/utils.js` - Base utilities (`window.Utils`)
3. `components/analyzers.js` - File types analyzer (`window.Analyzers`)
4. `components/css-analyzer.js` - CSS analyzer (`window.CSSAnalyzer`)
5. `components/functions-analyzer.js` - Functions analyzer (`window.FunctionsAnalyzer`)
6. `components/variables-analyzer.js` - Variables analyzer (`window.VariablesAnalyzer`)
7. `components/images-analyzer.js` - Images analyzer (`window.ImagesAnalyzer`)
8. `components/duplicates-analyzer.js` - Duplicates analyzer (`window.DuplicatesAnalyzer`)
9. `components/typescript-analyzer.js` - TypeScript analyzer (`window.TypeScriptAnalyzer`)
10. `components/pages-analyzer.js` - Pages analyzer (`window.PagesAnalyzer`)
11. `components/unused-exports-analyzer.js` - Unused exports analyzer (`window.UnusedExportsAnalyzer`)
12. `components/unused-components-analyzer.js` - Unused components analyzer (`window.UnusedComponentsAnalyzer`)
13. `components/unused-hooks-analyzer.js` - Unused hooks analyzer (`window.UnusedHooksAnalyzer`)
14. `components/unused-types-analyzer.js` - Unused types analyzer (`window.UnusedTypesAnalyzer`)
15. `components/unused-endpoints-analyzer.js` - Unused endpoints analyzer (`window.UnusedEndpointsAnalyzer`)
16. `components/dependencies-analyzer.js` - Dependencies analyzer (`window.DependenciesAnalyzer`)
17. `components/api-analyzer.js` - API route analyzer (`window.APIAnalyzer`)
18. `components/component-tree-analyzer.js` - Component tree analyzer (`window.ComponentTreeAnalyzer`)
19. `components/zip-handler.js` - ZIP processing (`window.ZipHandler`)
20. `components/ui-renderer.js` - Result rendering (`window.UIRenderer`)
21. `popup-main.js` - Main controller with event handlers

### Key Components

**`components/utils.js`** - Utilities

- `window.Utils.escapeHTML()` - HTML escaping
- `window.Utils.calculateSimilarity()` - String comparison
- `window.Utils.generateSearchVariants()` - File search variants

**`components/analyzers.js`** - File types analyzer (~18 lines)

- `window.Analyzers.analyzeFileTypes()` - File type categorization

**Specialized Analyzers** (each in separate file for modularity):

- **`css-analyzer.js`** - `window.CSSAnalyzer.analyzeCSSClasses()` - CSS class usage analysis
- **`functions-analyzer.js`** - `window.FunctionsAnalyzer.analyzeFunctions()` - JavaScript function detection
- **`variables-analyzer.js`** - `window.VariablesAnalyzer.analyzeVariables()` - Variable usage
- **`images-analyzer.js`** - `window.ImagesAnalyzer.analyzeImages()` - Image references
- **`duplicates-analyzer.js`** - `window.DuplicatesAnalyzer.findDuplicateFunctions()` - Duplicate code detection
- **`typescript-analyzer.js`** - `window.TypeScriptAnalyzer.analyzeTypeScriptTypes()` - TypeScript type analysis
- **`pages-analyzer.js`** - `window.PagesAnalyzer.analyzePages()` - Page/route detection
- **`unused-exports-analyzer.js`** - `window.UnusedExportsAnalyzer.analyzeUnusedExports()` - Unused exports
- **`unused-components-analyzer.js`** - `window.UnusedComponentsAnalyzer.analyzeUnusedComponents()` - Unused React components
- **`unused-hooks-analyzer.js`** - `window.UnusedHooksAnalyzer.analyzeUnusedHooks()` - Unused React hooks
- **`unused-types-analyzer.js`** - `window.UnusedTypesAnalyzer.analyzeUnusedEnumsInterfaces()` - Unused TypeScript types/enums/interfaces
- **`unused-endpoints-analyzer.js`** - `window.UnusedEndpointsAnalyzer.analyzeUnusedAPIEndpoints()` - Unused API endpoints
- **`dependencies-analyzer.js`** - `window.DependenciesAnalyzer.analyzeDependencies()` - Dependency graph analysis, cyclic dependencies, god files, hub files

**`components/api-analyzer.js`** - API routes analysis

- `window.APIAnalyzer.analyzeAPIRoutes()` - Finds API routes (Next.js, Express, fetch, axios)
- `window.APIAnalyzer.extractNextJSPath()` - Next.js route extraction
- Supports route parameter detection from content

**`components/component-tree-analyzer.js`** - Component tree visualization

- `window.ComponentTreeAnalyzer.analyze()` - Аналізує структуру компонентів та їх залежності
- `window.ComponentTreeAnalyzer.renderComponentTree()` - Графічне відображення дерева компонентів
- Підтримує default та named імпорти
- Розумне визначення точок входу (entry points):
  - **Next.js**: `pages/`, `app/` (App Router), виключаючи `_app`, `_document`, `api/`
  - **React Router**: `screens/`, `routes/`, `views/`
  - **CRA/Vite**: `src/App.js`, `containers/`
  - **Gatsby**: `src/pages/`
- **Fallback логіка**: якщо точки входу не знайдено, визначає кореневі компоненти автоматично
- Показує ієрархію компонентів з можливістю розгортання/згортання

**`components/zip-handler.js`** - ZIP processing

- `window.ZipHandler.extractZipFiles()` - Extract ZIP to file array
- `window.ZipHandler.analyzeZipProject()` - **Main analysis orchestrator** - calls all analyzers

**`components/ui-renderer.js`** - UI rendering

- `window.UIRenderer.renderResultsHTML()` - Renders analysis results to HTML

**`popup-main.js`** - Main controller (~60 lines)

- Event listeners for file upload
- Calls `window.ZipHandler.analyzeZipProject(dataView)`
- Displays results via `window.UIRenderer.renderResultsHTML()`
- Clean controller pattern - all rendering logic in ui-renderer.js

### Data Flow

```
User uploads ZIP → popup-main.js reads as ArrayBuffer →
window.ZipHandler.analyzeZipProject() →
  ├─ extractZipFiles()
  ├─ window.CSSAnalyzer.analyzeCSSClasses()
  ├─ window.FunctionsAnalyzer.analyzeFunctions()
  ├─ window.VariablesAnalyzer.analyzeVariables()
  ├─ window.ImagesAnalyzer.analyzeImages()
  ├─ window.DuplicatesAnalyzer.findDuplicateFunctions()
  ├─ window.APIAnalyzer.analyzeAPIRoutes()
  ├─ window.Analyzers.analyzeFileTypes()
  ├─ window.PagesAnalyzer.analyzePages()
  ├─ window.TypeScriptAnalyzer.analyzeTypeScriptTypes()
  ├─ window.UnusedExportsAnalyzer.analyzeUnusedExports()
  ├─ window.UnusedComponentsAnalyzer.analyzeUnusedComponents()
  ├─ window.UnusedHooksAnalyzer.analyzeUnusedHooks()
  ├─ window.UnusedTypesAnalyzer.analyzeUnusedEnumsInterfaces()
  ├─ window.UnusedEndpointsAnalyzer.analyzeUnusedAPIEndpoints()
  ├─ window.ComponentTreeAnalyzer.analyze()
  └─ window.DependenciesAnalyzer.analyzeDependencies()
→ Returns result object →
window.UIRenderer.renderResultsHTML(result) →
  ├─ renderComponentTree() - графічна візуалізація дерева компонентів
  └─ HTML inserted into DOM
```

## Development Commands

### Testing the Extension

**Chrome/Edge/Brave:**

```bash
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extension/ folder
```

**Firefox:**

```bash
# 1. Open about:debugging#/runtime/this-firefox
# 2. Click "Load Temporary Add-on"
# 3. Select extension/manifest.json
```

### Reloading After Changes

After editing code:

1. Go to browser extensions page
2. Click reload/refresh button for the extension
3. Reopen extension popup to test changes

### No Build Required

This project runs directly in the browser without any build step. Do not add webpack, rollup, or any bundler.

## Code Patterns

### Adding a New Analyzer

**Analyzers are now modular - each analyzer has its own file for better maintainability.**

1. Create new file `components/my-analyzer.js`:

```javascript
// My Analyzer
window.MyAnalyzer = {
  myNewAnalyzer: function (files) {
    // Analysis logic
    return { used: [], unused: [] };
  },
};
```

2. Add script tag to `extension/popup.html` (maintain loading order - add before `zip-handler.js`):

```html
<script src="components/my-analyzer.js"></script>
```

3. Call it in `components/zip-handler.js` inside `analyzeZipProject()`:

```javascript
const myResult = window.MyAnalyzer.myNewAnalyzer(allFiles);
```

4. Include in return object:

```javascript
resolve({
  // ... existing properties
  myResult: myResult,
});
```

### Adding a UI Block

1. Add render function to `components/ui-renderer.js`:

```javascript
window.UIRenderer.renderMyBlock = function (data) {
  return '<div class="result-card">' + data + "</div>";
};
```

2. Call from `ui-renderer.js` in `renderDetailedBlocks()`:

````javascript
renderDetailedBlocks: function(result) {
  return this.renderMyBlock(result.myData) + /* other blocks */;
}

### File Filtering Patterns

The analyzers automatically exclude:

- `node_modules/`
- `.next/`, `.nuxt/`, `dist/`, `build/`
- `package.json`, `package-lock.json`
- Common lock files and configs

When adding new analyzers, follow this pattern from existing code:

```javascript
const filteredFiles = files.filter(
  (f) => !f.name.includes("node_modules/") && !f.name.includes(".next/")
);
````

### Supported File Types

- **JavaScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **CSS**: `.css`, `.scss`, `.sass`, `.less`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`
- **Frameworks**: React, Next.js, Vue, Nuxt, Angular, Svelte

## Key Constraints

1. **No ES6 Modules** - Use global `window.*` namespaces only
2. **Script Loading Order** - Maintain strict sequence in `popup.html`
3. **No Build Tools** - Code must run directly in browser
4. **Manifest V3** - Follow Chrome Extension Manifest V3 requirements
5. **Legacy Support** - `lib/zip-analyzer.js` exists for backward compatibility, do not remove

## Documentation Files

- `extension/ARCHITECTURE.md` - Detailed architecture diagrams
- `extension/COMPONENT_STRUCTURE.md` - Component breakdown
- `extension/QUICK_REFERENCE.md` - API usage examples
- `extension/GETTING_STARTED.md` - Quick start guide
- `extension/components/README.md` - Component documentation

## Common Issues

**Icon Creation**: Icons must be created manually using `extension/create-icons.html` before installation.

**Script Order**: If components show as undefined, check script loading order in `popup.html`.

**JSZip Dependency**: The extension depends on `lib/jszip.min.js` for ZIP file processing. Do not remove or update without testing.

**Tailwind Auto-filtering**: CSS analyzer automatically filters out Tailwind utility classes. This logic is in `analyzers.js` `analyzeCSSClasses()`.

## AI Assistant Guidelines

### Code Quality

- **No hallucinations**: If uncertain, explicitly state "I don't know" rather than guessing
- **Simplicity first**: This is a small project - prefer simple solutions over complex architectures
- **Avoid over-engineering**: No enterprise patterns, unnecessary abstractions, or premature optimization

### Documentation

- Update CLAUDE.md only when making significant architectural changes
- Keep documentation changes minimal and focused

### Token Management

- Provide warning when approaching token limits
- Prefer concise solutions to minimize token usage

### Communication Style

- Be concise - avoid verbose explanations unless explicitly requested
- Show code first, explain only when necessary
- Skip confirmations like "Sure, I'll help you..." - just do the task
- Avoid repeating what the user already said

### File Operations

- Read files only when necessary for the current task
- Avoid re-reading files you've already seen in the conversation
- Use targeted line ranges (offset/limit) for large files
- Trust existing code - don't read files just to verify they exist

### Tool Usage

- Combine related changes in single Edit call when possible
- Use parallel tool calls for independent operations
- Avoid redundant tool calls (e.g., reading same file twice)

### Response Format

- Use Ukrainian language as requested
- Minimal commentary during task execution
- Report results briefly - user can see the changes in git diff
- Skip phrases like "Ось що я зробив:", "Як бачите:" - just state facts

### Communication Style

- Be concise - avoid verbose explanations unless explicitly requested
- Show code first, explain only when necessary
- Skip confirmations and pleasantries - execute tasks directly
- Avoid repeating information the user already provided
- Use Ukrainian language
