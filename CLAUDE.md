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
3. `components/analyzers.js` - Code analyzers (`window.Analyzers`)
4. `components/api-analyzer.js` - API route analyzer (`window.APIAnalyzer`)
5. `components/zip-handler.js` - ZIP processing (`window.ZipHandler`)
6. `components/ui-renderer.js` - Result rendering (`window.UIRenderer`)
7. `popup-main.js` - Main controller with event handlers

### Key Components

**`components/utils.js`** - Utilities

- `window.Utils.escapeHTML()` - HTML escaping
- `window.Utils.calculateSimilarity()` - String comparison
- `window.Utils.generateSearchVariants()` - File search variants

**`components/analyzers.js`** - Core analyzers (~1500 lines)

- `window.Analyzers.analyzeCSSClasses()` - CSS class usage analysis
- `window.Analyzers.analyzeFunctions()` - JavaScript function detection
- `window.Analyzers.analyzeVariables()` - Variable usage
- `window.Analyzers.analyzeImages()` - Image references
- `window.Analyzers.findDuplicateFunctions()` - Duplicate code detection
- `window.Analyzers.analyzeFileTypes()` - File type categorization
- `window.Analyzers.analyzeTypeScriptTypes()` - TypeScript type analysis
- `window.Analyzers.analyzePages()` - Page/route detection

**`components/api-analyzer.js`** - API analysis

- `window.APIAnalyzer.analyzeAPIRoutes()` - Finds API routes (Next.js, Express, fetch, axios)
- `window.APIAnalyzer.extractNextJSPath()` - Next.js route extraction
- Supports route parameter detection from content

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
  ├─ window.Analyzers.analyzeCSSClasses()
  ├─ window.Analyzers.analyzeFunctions()
  ├─ window.Analyzers.analyzeVariables()
  ├─ window.Analyzers.analyzeImages()
  ├─ window.Analyzers.findDuplicateFunctions()
  ├─ window.APIAnalyzer.analyzeAPIRoutes()
  ├─ window.Analyzers.analyzeFileTypes()
  ├─ window.Analyzers.analyzePages()
  └─ window.Analyzers.analyzeTypeScriptTypes()
→ Returns result object →
window.UIRenderer.renderResultsHTML(result) →
HTML inserted into DOM
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

1. Add function to `components/analyzers.js`:

```javascript
window.Analyzers.myNewAnalyzer = function (files) {
  // Analysis logic
  return { used: [], unused: [] };
};
```

2. Call it in `components/zip-handler.js` inside `analyzeZipProject()`:

```javascript
const myResult = window.Analyzers.myNewAnalyzer(allFiles);
```

3. Include in return object:

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
