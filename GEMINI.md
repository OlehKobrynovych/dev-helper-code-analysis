# GEMINI.md

## Project Overview

This project is a browser extension called "DevHelper Code Analysis". Its primary purpose is to analyze web development projects to find unused code, including CSS classes, JavaScript functions, and variables. The extension works by having the user upload a `.zip` file of their project. It then analyzes the code within the zip file and presents a report of its findings.

The extension is built with HTML, CSS, and vanilla JavaScript. It uses a modular architecture without ES6 imports for browser compatibility. Instead, it uses a global namespace pattern where each component is attached to the `window` object.

## Building and Running

This project runs directly in the browser without any build step.

### 1. Create Icons

1.  Open `extension/create-icons.html` in a browser.
2.  Click "Створити іконки" (Create Icons).
3.  Download `icon16.png`, `icon48.png`, and `icon128.png`.
4.  Place them in the `extension/icons/` directory.

### 2. Install the Extension

**Chrome / Edge / Brave:**

1.  Open `chrome://extensions/`.
2.  Enable "Developer mode".
3.  Click "Load unpacked".
4.  Select the `extension` directory.

**Firefox:**

1.  Open `about:debugging#/runtime/this-firefox`.
2.  Click "Load Temporary Add-on...".
3.  Select `extension/manifest.json`.

### 3. Usage

1.  Click on the extension icon 🔍.
2.  Click "Вибрати ZIP файл" (Select ZIP file).
3.  Upload a `.zip` archive of your project.
4.  Wait for the analysis to complete.
5.  View the results and export the report.

## Development Conventions

### Architecture

The codebase is structured in a modular way. The core logic for the analysis is located in the `extension/components/` directory, with each file responsible for a specific analysis task.

- **Module System:** The project uses a global namespace pattern (e.g., `window.ComponentName = { ... }`). ES6 modules are not used.
- **Script Loading Order:** The order of `<script>` tags in `extension/popup.html` is critical for the extension to function correctly. Dependencies must be loaded before the components that use them.
- **UI:** The user interface is defined in `extension/popup.html` and styled with `extension/styles.css`.
- **Main Logic:** `extension/popup-main.js` is the entry point for the UI and orchestrates the analysis process.
- **Background Script:** `extension/background.js` manages the extension's popup window.
- **ZIP Handling:** `extension/components/zip-handler.js` is responsible for extracting and processing the uploaded `.zip` file and calling the various analyzers.
- **Analyzers:** The `extension/components/` directory contains various analyzers for CSS, JavaScript, images, etc. Each analyzer is in its own file and exposes its functionality through the `window` object.
  - **`auth-analyzer.js`**: Analyzes the project to detect authentication and authorization methods.
  - **`storage-analyzer.js`**: Analyzes the project to detect the usage of browser storage (LocalStorage, SessionStorage, Cookies, IndexedDB).
- **UI Rendering:** `extension/components/ui-renderer.js` is responsible for rendering the analysis results.

### Data Flow

1.  User uploads a ZIP file.
2.  `popup-main.js` reads the file as an `ArrayBuffer`.
3.  `window.ZipHandler.analyzeZipProject()` is called.
    - The ZIP file is extracted.
    - A series of analyzers from `window.CSSAnalyzer`, `window.FunctionsAnalyzer`, etc., are called.
4.  The results are returned as an object.
5.  `window.UIRenderer.renderResultsHTML()` renders the results into HTML.
6.  The HTML is inserted into the DOM.

### Adding a New Analyzer

1.  Create a new file in `extension/components/`, for example, `my-analyzer.js`.
2.  In the new file, create a global object: `window.MyAnalyzer = { myNewAnalyzer: function(files) { /* ... */ } };`.
3.  Add a `<script>` tag for the new file in `extension/popup.html` before `zip-handler.js`.
4.  Call the new analyzer function from `window.ZipHandler.analyzeZipProject()`.

## AI Assistant Guidelines

### Code Quality

- **No hallucinations**: If uncertain, explicitly state "I don't know" rather than guessing
- **Simplicity first**: This is a small project - prefer simple solutions over complex architectures
- **Avoid over-engineering**: No enterprise patterns, unnecessary abstractions, or premature optimization

### Documentation

- Update GEMINI.md only when making significant architectural changes
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
