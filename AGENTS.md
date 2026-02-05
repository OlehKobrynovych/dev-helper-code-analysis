# Repository Guidelines

## Project Structure & Module Organization
This repo contains a browser extension with a simple, file-based layout:
- `extension/` holds the extension source. Key entry points are `popup.html`, `popup-main.js`, `background.js`, and `styles.css`.
- `extension/components/` contains modular analyzer and UI renderer logic.
- `extension/lib/` contains third-party libraries (for example `jszip.min.js`).
- `extension/icons/` stores the extension icons (generate via `extension/create-icons.html`).
- `README.md` and `extension/README.md` describe installation and usage.

## Build, Test, and Development Commands
There is no build pipeline or package manager in this repo.
- Load the extension unpacked in your browser:
  - Chrome/Edge/Brave: `chrome://extensions/` → Developer mode → Load unpacked → `extension/`
  - Firefox: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `extension/manifest.json`
- Update flow: after edits, reload the extension from the browser extensions page.

## Coding Style & Naming Conventions
- Language: Vanilla JavaScript + plain HTML/CSS.
- Indentation: 2 spaces.
- Strings: double quotes are the dominant style.
- Naming: camelCase for variables/functions; file names are kebab-case where applicable (`popup-main.js`).

## Testing Guidelines
There are no automated tests in the repository.
- Manual test path: load the unpacked extension, upload a sample ZIP, and verify the analysis output and UI updates.

## Commit & Pull Request Guidelines
Git history shows short, lowercase, imperative summaries (examples: `fix title`, `update`). Follow this pattern unless a change needs more detail.
For pull requests:
- Include a brief summary, steps to verify, and screenshots for UI changes.
- Link related issues or tasks if applicable.

## Security & Configuration Tips
- Icon assets are required for installation; keep `icon16.png`, `icon48.png`, and `icon128.png` in `extension/icons/`.
- If configuration is introduced, document it in `README.md` and keep secrets out of the repo.
