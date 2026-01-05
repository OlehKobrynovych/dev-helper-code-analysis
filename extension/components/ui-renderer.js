// UI Renderer - рендеринг результатів аналізу
window.UIRenderer = {
  renderResultsHTML: function (result) {
    const {
      unusedCSS = [],
      unusedFunctions = [],
      unusedVariables = [],
      stats = {},
      projectName = "",
    } = result;

    const statsSafe = {
      cssFilesAnalyzed: stats.cssFilesAnalyzed || 0,
      jsFilesAnalyzed: stats.jsFilesAnalyzed || 0,
      totalCSSClasses: stats.totalCSSClasses || 0,
      totalFunctions: stats.totalFunctions || 0,
      totalVariables: stats.totalVariables || 0,
      totalImages: stats.totalImages || 0,
    };

    const safeProjectName = projectName
      ? window.Utils.escapeHTML(projectName)
      : "невідомий (package.json не знайдено)";

    let html =
      '<div style="border:1px solid #e9d5ff;border-radius:8px;padding:16px;background:#faf5ff;margin-bottom:16px;">';
    html +=
      '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html +=
      '<div style="font-size:14px;color:#6b21a8;font-weight:600;">📁 Назва проекту: <span style="color:#4c1d95;">' +
      safeProjectName +
      "</span></div>";
    html +=
      '<button id="reuploadBtn" class="btn btn-primary" style="font-size:12px;padding:10px 16px;flex-shrink:0;">🔁 Вибрати інший ZIP</button>';
    html += "</div>";
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:16px;font-weight:bold;">📊 Результати аналізу проекту</h3>';

    html +=
      '<div style="margin-bottom:12px;padding:12px;background:#fff;border-radius:6px;font-size:11px;">';
    html +=
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">';
    html +=
      '<div><span style="color:#6b7280;">CSS файлів:</span> <strong>' +
      statsSafe.cssFilesAnalyzed +
      "</strong></div>";
    html +=
      '<div><span style="color:#6b7280;">JS файлів:</span> <strong>' +
      statsSafe.jsFilesAnalyzed +
      "</strong></div>";
    html +=
      '<div><span style="color:#6b7280;">Всього класів:</span> <strong>' +
      statsSafe.totalCSSClasses +
      "</strong></div>";
    html +=
      '<div><span style="color:#6b7280;">Всього функцій:</span> <strong>' +
      statsSafe.totalFunctions +
      "</strong></div>";
    html +=
      '<div><span style="color:#6b7280;">Всього змінних:</span> <strong>' +
      statsSafe.totalVariables +
      "</strong></div>";
    html +=
      '<div><span style="color:#6b7280;">Всього зображень:</span> <strong>' +
      statsSafe.totalImages +
      "</strong></div>";
    html += "</div></div>";

    // Add architecture section
    html += `
      <div style="margin: 16px 0; padding: 16px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #4b5563; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">📐</span> Архітектура проекту
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
              <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Тип проекту</div>
                  <div style="font-weight: 500; color: #111827;">${
                    result.architecture?.projectType || "Невідомо"
                  }</div>
              </div>
              <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Фреймворк</div>
                  <div style="font-weight: 500; color: #111827;">${
                    result.architecture?.framework || "Невідомо"
                  }</div>
              </div>
              <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Структура</div>
                  <div style="font-weight: 500; color: #111827;">${
                    result.architecture?.structure || "Невідомо"
                  }</div>
              </div>
              <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Рівень вкладеності</div>
                  <div style="font-weight: 500; color: #111827;">${
                    result.architecture?.nestingLevel || "0"
                  }</div>
              </div>
          </div>
      </div>
    `;

    html +=
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">';

    const totalCSSClasses = statsSafe.totalCSSClasses;
    const totalFunctions = statsSafe.totalFunctions;
    const totalVariables = statsSafe.totalVariables;

    html +=
      '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
      (unusedCSS.length > 0 ? "#9333ea" : "#22c55e") +
      ';">';
    html +=
      '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористаний CSS</p>';
    html +=
      '<p style="margin:0;font-size:24px;font-weight:bold;color:#9333ea;">' +
      unusedCSS.length +
      "</p>";
    if (totalCSSClasses) {
      html +=
        '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
        ((unusedCSS.length / totalCSSClasses) * 100).toFixed(1) +
        "% від всіх</p>";
    }
    html += "</div>";

    html +=
      '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
      (unusedFunctions.length > 0 ? "#3b82f6" : "#22c55e") +
      ';">';
    html +=
      '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані функції</p>';
    html +=
      '<p style="margin:0;font-size:24px;font-weight:bold;color:#3b82f6;">' +
      unusedFunctions.length +
      "</p>";
    if (totalFunctions) {
      html +=
        '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
        ((unusedFunctions.length / totalFunctions) * 100).toFixed(1) +
        "% від всіх</p>";
    }
    html += "</div>";

    html +=
      '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
      (unusedVariables.length > 0 ? "#f59e0b" : "#22c55e") +
      ';">';
    html +=
      '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані змінні</p>';
    html +=
      '<p style="margin:0;font-size:24px;font-weight:bold;color:#f59e0b;">' +
      unusedVariables.length +
      "</p>";
    if (totalVariables) {
      html +=
        '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
        ((unusedVariables.length / totalVariables) * 100).toFixed(1) +
        "% від всіх</p>";
    }
    html += "</div>";

    html += "</div></div>";

    return html + this.renderDetailedBlocks(result);
  },

  // Головна функція-оркестратор для детальних блоків
  renderDetailedBlocks: function (result) {
    return (
      this.renderProjectStyles(result) +
      this.renderFileTypes(result) +
      this.renderDependencies(result) +
      this.renderCodeHealth(result) +
      this.renderDependencyAnalysis(result) +
      this.renderUnusedCSS(result) +
      this.renderUnusedFunctions(result) +
      this.renderUnusedVariables(result) +
      this.renderUnusedImages(result) +
      this.renderUnusedExports(result) +
      this.renderUnusedComponents(result) +
      this.renderUnusedHooks(result) +
      this.renderUnusedEnumsInterfaces(result) +
      this.renderUnusedAPIEndpoints(result) +
      this.renderDuplicateFunctions(result) +
      this.renderAPIRoutes(result) +
      this.renderPages(result) +
      this.renderTypeScriptTypes(result) +
      this.renderRecommendations(result)
    );
  },

  // Utility function for word forms
  getWordForm: function (n, textForms) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return textForms[2];
    if (n1 > 1 && n1 < 5) return textForms[1];
    if (n1 === 1) return textForms[0];
    return textForms[2];
  },

  renderProjectStyles: function (result) {
    const projectStyles = result.projectStyles || {};
    const { variables = [], fonts = [], colors = [] } = projectStyles;

    if (variables.length === 0 && fonts.length === 0 && colors.length === 0) return "";

    let html = `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#374151;">🎨 Стилі проекту</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:16px;">
    `;

    // CSS Variables
    if (variables.length > 0) {
      html += `
        <div>
          <h4 style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#1e40af;">CSS Змінні (${variables.length})</h4>
          <div style="max-height:200px;overflow-y:auto;background:#f9fafb;border-radius:6px;padding:8px;font-size:11px;">
            ${variables.map(v => `
              <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;border-bottom:1px solid #e5e7eb;">
                <code style="color:#1e40af;flex-shrink:0;">${v.name}</code>
                <code style="color:#555;word-break:break-all;text-align:right;">${v.value}</code>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Fonts
    if (fonts.length > 0) {
      html += `
        <div>
          <h4 style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#059669;">Шрифти (${fonts.length})</h4>
          <div style="max-height:200px;overflow-y:auto;background:#f9fafb;border-radius:6px;padding:8px;font-size:11px;">
            ${fonts.map(f => `
              <div style="padding:4px 0;border-bottom:1px solid #e5e7eb;">
                <code style="color:#059669;">${f}</code>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Colors
    if (colors.length > 0) {
      html += `
        <div>
          <h4 style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#9333ea;">Основні кольори</h4>
          <div style="max-height:200px;overflow-y:auto;background:#f9fafb;border-radius:6px;padding:8px;">
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${colors.map(c => `
                <div style="display:flex;align-items:center;gap:6px;" title="Used ${c.count} times">
                  <div style="width:16px;height:16px;border-radius:4px;background-color:${c.color};border:1px solid #ddd;"></div>
                  <code style="font-size:11px;color:#555;">${c.color}</code>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  },

  // Common libraries database (moved from popup-main.js)
  getCommonLibraries: function () {
    return {
      react: "Бібліотека для побудови користувацьких інтерфейсів від Facebook",
      "react-dom": "Рендер React у веб-додатках",
      "react-scripts": "Скрипти та конфігурація для Create React App",
      next: "React-фреймворк для продакшену (SSR, SSG, ISR)",
      gatsby: "Генератор статичних сайтів на React",
      vue: "Прогресивний JavaScript-фреймворк",
      nuxt: "Універсальний додаток на Vue.js",
      angular: "Платформа для веб-додатків",
      svelte: "Компілятор для реактивних інтерфейсів",
      redux: "Контейнер стану для JavaScript додатків",
      "react-redux": "Офіційний біндінг React для Redux",
      "@reduxjs/toolkit": "Офіційний набір інструментів для Redux",
      zustand: "Мінімалістичне сховище стану для React",
      mobx: "Бібліотека керування станом",
      recoil: "Бібліотека керування станом від Facebook",
      jotai: "Примітиви стану для React",
      valtio: "Просте керування станом з проксі",
      "@mui/material": "Бібліотека компонентів Material-UI",
      "@mui/icons-material": "Іконки Material Design",
      "@mui/lab": "Лабораторні компоненти Material-UI",
      "@mui/x-charts": "Графіки для MUI",
      "@mui/x-date-pickers": "Вибір дат для MUI",
      antd: "UI бібліотека Ant Design",
      "chakra-ui": "Простий, модульний та доступний UI-компонент",
      tailwindcss: "Утилітарний CSS фреймворк",
      bootstrap: "Популярний CSS фреймворк",
      "slick-carousel": "Адаптивний карусель слайдів",
      "react-slick": "React-компонент для каруселі slick",
      "react-hook-form": "Валідація форм з мінімальним рендерингом",
      formik: "Побудова форм у React",
      yup: "Схема валідації об'єктів",
      zod: "Схема валідації TypeScript-first",
      "@hookform/resolvers": "Інтеграція react-hook-form з валідаторами",
      axios: "HTTP клієнт для браузера та Node.js",
      "@apollo/client": "Клієнт для роботи з GraphQL",
      graphql: "Мова запитів для API",
      ky: "Мінімалістичний HTTP клієнт на основі Fetch",
      "react-query": "Керування серверним станом у React",
      "@tanstack/react-query": "Бібліотека для керування кешем даних",
      swr: "React Hooks для віддалених даних",
      dayjs: "Маленька альтернатива Moment.js",
      "date-fns": "Сучасна бібліотека для роботи з датами",
      luxon: "Бібліотека для роботи з датами та часом",
      moment: "Бібліотека для роботи з датами (застаріла)",
      i18next: "Фреймворк інтернаціоналізації",
      "react-i18next": "Інтеграція i18next з React",
      "react-intl": "Форматування дат, чисел та рядків",
      jest: "JavaScript-фреймворк для тестування",
      "@testing-library/react": "Інструменти тестування React-компонентів",
      cypress: "Фреймворк для e2e тестування",
      "react-testing-library": "Легковісні утиліти для тестування React",
      typescript: "Надбудова над JavaScript з типізацією",
      webpack: "Збірка модулів JavaScript",
      vite: "Швидка збірка для сучасного вебу",
      eslint: "Лінтер для JavaScript/TypeScript",
      prettier: "Форматувальник коду",
      lodash: "Утиліти для роботи з даними",
      clsx: "Утиліта для об'єднання класів",
      classnames: "Просте об'єднання класів",
      immer: "Незмінні структури даних",
      ramda: "Функційна бібліотека для JavaScript",
      "react-helmet": "Керування head документа",
      "react-dropzone": "Завантаження файлів з перетягуванням",
      "react-virtualized": "Ефективний рендеринг списків",
      "react-window": "Ефективний рендеринг списків (новіша версія)",
      recharts: "Бібліотека графіків на основі D3",
      apexcharts: "Сучасні інтерактивні графіки",
      d3: "Бібліотека для візуалізації даних",
      "auth0-js": "Аутентифікація з Auth0",
      firebase: "Платформа для веб-додатків від Google",
      "jwt-decode": "Декодування JWT токенів",
      stripe: "Інтеграція з платіжною системою Stripe",
      braintree: "Платіжний шлюз Braintree",
      leaflet: "Бібліотека інтерактивних карт",
      "google-maps-react": "Інтеграція Google Maps з React",
      "framer-motion": "Бібліотека анімацій для React",
      "react-spring": "Фізично реалістичні анімації",
      gsap: "Потужна бібліотека анімацій",
      storybook: "Інструмент для розробки UI компонентів",
      docusaurus: "Генератор документації",
      "redux-persist": "Збереження стану Redux у сховищі",
      localforage: "Покращений localStorage",
      "draft-js": "Фреймворк для створення текстових редакторів",
      "react-quill": "Потужний текстовий редактор",
      slate: "Повністю налаштовуваний фреймворк для текстових редакторів",
      "react-phone-number-input": "Введення номеру телефону з підтримкою країн",
      "libphonenumber-js": "Бібліотека для роботи з номерами телефонів",
      "react-country-flag": "Відображення прапорів країн",
      qrcode: "Генерація QR-кодів",
      "react-qr-code": "Компонент React для генерації QR-кодів",
      notistack: "Повідомлення та сповіщення",
      "react-toastify": "Тостери для сповіщень",
      "react-hot-toast": "Легкі гарячі сповіщення",
      "@tanstack/react-table": "Потужні таблиці з сортуванням та пагінацією",
      "react-data-table-component": "Гнучкий компонент таблиць даних",
      "material-table": "Таблиці даних для Material-UI",
      "file-saver": "Збереження файлів у браузері",
      xlsx: "Робота з Excel файлами",
      "pdf-lib": "Створення та редагування PDF",
      "@chakra-ui/react": "Простий, модульний та доступний компонентний набір",
      "shadcn/ui": "Компоненти UI, створені з використанням Radix UI та Tailwind CSS",
      daisyui: "Безкоштовна бібліотека компонентів для Tailwind CSS",
      headlessui: "Повністю нестилізовані, повністю доступні компоненти UI",
      "radix-ui": "Низькорівневі, нестилізовані компоненти для створення дизайн-систем",
      mantine: "Повноцінна бібліотека React-компонентів",
      xstate: "Бібліотека керування станом та автоматів станів",
      effector: "Ефективне керування станом",
      "mobx-state-tree": "Розширене керування станом з MobX",
      concent: "Прогресивне керування станом для React",
      rematch: "Фреймворк для Redux без шаблонного коду",
      formidable: "Валідація та обробка форм",
      "react-jsonschema-form": "Генерація форм з JSON Schema",
      uniforms: "React-бібліотека для створення форм з будь-якої схеми даних",
      "react-use-gesture": "Сучасні жести для React",
      "react-intersection-observer": "Відстеження видимості елементів",
      victory: "Компоненти для візуалізації даних для React",
      nivo: "Багатобічна бібліотека графіків на основі D3",
      visx: "Візуальні компоненти від Airbnb",
      echarts: "Потужна бібліотека для створення інтерактивних графіків",
      "react-leaflet": "React-компоненти для Leaflet",
      "google-map-react": "Інтеграція Google Maps з React",
      "deck.gl": "Візуалізація великих геопросторових даних",
      "mapbox-gl": "Інтерактивні карти з підтримкою векторних таліць",
      vitest: "Швидкий нативний тестовий фреймворк для Vite",
      playwright: "Надійне тестування для сучасних веб-додатків",
      msw: "API-мокінг для браузера та Node.js",
      "testing-library": "Сучасні API для тестування UI",
      esbuild: "Надшвидкий JavaScript бандлер",
      swc: "Швидкий компілятор JavaScript/TypeScript",
      rollup: "Модульний бандлер для JavaScript",
      parcel: "Нульова конфігурація веб-додатку",
      "react-native": "Фреймворк для створення нативних мобільних додатків",
      expo: "Набір інструментів для розробки React Native додатків",
      "react-native-web": "Запуск React Native компонентів у вебі",
      "react-native-paper": "Material Design для React Native",
      electron: "Побудова крос-платформових десктопних додатків",
      tauri: "Менші, швидкі настільні програми з веб-технологіями",
      "electron-builder": "Повний набір для пакування Electron-додатків",
      "wasm-pack": "Створення та публікація WebAssembly з Rust",
      emscripten: "Компіляція C/C++ у WebAssembly",
      assemblyscript: "TypeScript-подібна мова для WebAssembly",
      ethers: "Повна реалізація Ethereum Wallet",
      "web3.js": "Бібліотека для взаємодії з блокчейном Ethereum",
      wagmi: "React Hooks для Ethereum",
      viem: "Типобезпечний інтерфейс для Ethereum",
      "@clerk/clerk-react": "Сервіс аутентифікації та керування користувачами для React",
      "@react-oauth/google": "OAuth-авторизація через Google для React",
      "@emotion/react": "CSS-in-JS бібліотека для стилізації компонентів",
      "@emotion/styled": "Styled API для Emotion (CSS-in-JS)",
      "@eslint/js": "Офіційні базові правила ESLint",
      "eslint-plugin-react-hooks": "Правила ESLint для React Hooks",
      "eslint-plugin-react-refresh": "Підтримка Fast Refresh у React",
      "@tanstack/eslint-plugin-query": "ESLint правила для TanStack Query",
      "typescript-eslint": "ESLint інструменти для TypeScript",
      knip: "Аналіз невикористаних файлів, залежностей та експорту",
      globals: "Список глобальних змінних середовищ JavaScript",
      "@radix-ui/react-alert-dialog": "Модальне вікно попередження (Radix UI)",
      "@radix-ui/react-avatar": "Компонент аватара користувача",
      "@radix-ui/react-checkbox": "Доступний checkbox компонент",
      "@radix-ui/react-collapsible": "Компонент зі згортанням/розгортанням",
      "@radix-ui/react-dialog": "Доступний діалог (modal)",
      "@radix-ui/react-direction": "Утиліти напрямку LTR/RTL",
      "@radix-ui/react-dropdown-menu": "Dropdown меню",
      "@radix-ui/react-icons": "Іконки Radix UI",
      "@radix-ui/react-label": "Label для формових елементів",
      "@radix-ui/react-popover": "Popover компонент",
      "@radix-ui/react-radio-group": "Група радіо-кнопок",
      "@radix-ui/react-scroll-area": "Кастомний scrollbar",
      "@radix-ui/react-select": "Select компонент",
      "@radix-ui/react-separator": "Візуальний роздільник",
      "@radix-ui/react-slider": "Slider компонент",
      "@radix-ui/react-slot": "Композиція компонентів",
      "@radix-ui/react-switch": "Toggle switch",
      "@radix-ui/react-tabs": "Tabs компонент",
      "@radix-ui/react-tooltip": "Tooltip компонент",
      "@tanstack/react-query-devtools": "DevTools для TanStack Query",
      "@tanstack/react-router": "Типобезпечний роутер для React",
      "@tanstack/react-router-devtools": "DevTools для TanStack Router",
      "@tanstack/router-plugin": "Vite/Build плагін для TanStack Router",
      "@vitejs/plugin-react-swc": "SWC-плагін для швидкої збірки React у Vite",
      "@tailwindcss/vite": "Офіційний Tailwind CSS плагін для Vite",
      "@trivago/prettier-plugin-sort-imports": "Автоматичне сортування імпортів",
      "prettier-plugin-tailwindcss": "Сортування Tailwind-класів",
      "@types/node": "TypeScript типи для Node.js",
      "@types/react": "TypeScript типи для React",
      "@types/react-dom": "TypeScript типи для React DOM",
      "class-variance-authority": "Управління варіантами CSS-класів",
      cmdk: "Командна палітра (Command Menu) для React",
      "lucide-react": "Легка бібліотека SVG-іконок",
      sonner: "Toast-нотифікації від shadcn/ui",
      "tailwind-merge": "Обʼєднання Tailwind-класів без конфліктів",
      "tw-animate-css": "Готові анімації для Tailwind",
      "input-otp": "Ввід одноразових кодів (OTP)",
      "react-day-picker": "Календар та вибір дат для React",
      "react-google-charts": "Інтеграція Google Charts у React",
      "react-quill-new": "Оновлена версія Quill редактора для React",
      "react-top-loading-bar": "Індикатор завантаження зверху сторінки",
      "@faker-js/faker": "Генерація фейкових даних для тестування",
      "web-vitals": "Вимірювання продуктивності веб-додатку",
      sentry: "Моніторинг помилок у продакшені",
      dompurify: "Очищення HTML від XSS",
      bcryptjs: "Хешування паролів",
      "socket.io-client": "WebSocket клієнт для real-time додатків",
      "browser-image-compression": "Стиснення зображень у браузері",
      "react-player": "Вбудовування відео з YouTube, Vimeo тощо",
      nanoid: "Генерація коротких унікальних ID",
      "ts-pattern": "Pattern matching для TypeScript",
      "react-cookie": "Зручна робота з cookies у React",
      cookie: "Низькорівнева бібліотека для парсингу та серіалізації cookies",
      sass: "CSS препроцесор (SCSS/SASS)",
      postcss: "Інструмент для трансформації CSS за допомогою плагінів",
      "@tailwindcss/line-clamp": "Tailwind плагін для обмеження кількості рядків тексту",
      "react-icons": "Популярні іконки (FontAwesome, Material, etc.)",
      "@react-icons/all-files": "Оптимізовані іконки з tree-shaking",
      "hamburger-react": "Анімована hamburger-кнопка",
      "react-burgers": "Набір burger-кнопок для меню",
      "react-select": "Потужний select з пошуком та мультивибором",
      "react-range-slider-input": "Range slider компонент",
      "react-loader-spinner": "Готові спінери та лоадери",
      striptags: "Видалення HTML-тегів з рядків",
      "@types/react-slick": "Типи для react-slick",
    };
  },

  // 1. Render File Types
  renderFileTypes: function (result) {
    const fileTypes = result.fileTypes || {};
    const fileTypeEntries = Object.entries(fileTypes);

    if (fileTypeEntries.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#374151;">📄 Типи файлів</h3>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';

    const fileTypeIcons = {
      js: "🟨", jsx: "⚛️", ts: "🔷", tsx: "⚛️",
      vue: "💚", css: "🎨", scss: "🎨", json: "📋",
      md: "📝", html: "🌐", png: "🖼️", jpg: "🖼️", svg: "🎨",
    };

    fileTypeEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([ext, count]) => {
        const icon = fileTypeIcons[ext] || "📄";
        html += '<div style="background:#f3f4f6;padding:8px 12px;border-radius:6px;font-size:11px;">';
        html += '<span>' + icon + ' .' + ext + '</span> <strong style="color:#3b82f6;">' + count + '</strong>';
        html += '</div>';
      });

    html += '</div></div>';
    return html;
  },

  // 2. Render Dependencies
  renderDependencies: function (result) {
    if (!result.packageJson) return "";

    const dependencies = result.packageJson.dependencies || {};
    const devDependencies = result.packageJson.devDependencies || {};
    const commonLibs = this.getCommonLibraries();

    let html = "";

    // Regular dependencies
    const regularDeps = Object.entries(dependencies).map(([name, version]) => ({
      name,
      version,
      description: commonLibs[name] || "Немає опису",
      isDev: false,
    }));

    // Dev dependencies
    const devDeps = Object.entries(devDependencies).map(([name, version]) => ({
      name,
      version,
      description: commonLibs[name] || "Немає опису",
      isDev: true,
    }));

    // Generate HTML for regular dependencies
    if (regularDeps.length > 0) {
      html += `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
          <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">
            <span>📦 Залежності</span>
            <span style="font-size:11px;background:#f3f4f6;color:#4b5563;padding:2px 8px;border-radius:4px;">
              ${regularDeps.length} бібліотек
            </span>
          </h3>
          <div style="max-height:300px;overflow-y:auto;margin-top:12px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Бібліотека</th>
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Версія</th>
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Опис</th>
                </tr>
              </thead>
              <tbody>
                ${regularDeps.map(dep => `
                  <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:8px 12px;font-family:monospace;color:#111827;">${dep.name}</td>
                    <td style="padding:8px 12px;color:#4b5563;font-family:monospace;">${dep.version}</td>
                    <td style="padding:8px 12px;color:#4b5563;">${dep.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Generate HTML for devDependencies
    if (devDeps.length > 0) {
      html += `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
          <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">
            <span>🔧 Залежності для розробки</span>
            <span style="font-size:11px;background:#f0fdf4;color:#166534;padding:2px 8px;border-radius:4px;">
              ${devDeps.length} бібліотек
            </span>
          </h3>
          <div style="max-height:300px;overflow-y:auto;margin-top:12px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Бібліотека</th>
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Версія</th>
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Опис</th>
                </tr>
              </thead>
              <tbody>
                ${devDeps.map(dep => `
                  <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:8px 12px;font-family:monospace;color:#111827;">
                      ${dep.name}
                      <span style="margin-left:6px;font-size:10px;background:#dcfce7;color:#166534;padding:2px 6px;border-radius:4px;font-weight:500;">dev</span>
                    </td>
                    <td style="padding:8px 12px;color:#4b5563;font-family:monospace;">${dep.version}</td>
                    <td style="padding:8px 12px;color:#4b5563;">${dep.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Add message if no dependencies found
    if (regularDeps.length === 0 && devDeps.length === 0) {
      html += `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;background-color:#f9fafb;">
          <p style="margin:0;color:#6b7280;font-size:13px;display:flex;align-items:center;gap:6px;">
            <span>ℹ️</span>
            <span>Не знайдено жодних залежностей у package.json</span>
          </p>
        </div>
      `;
    }

    return html;
  },

  // 3. Render Code Health Analysis
  renderCodeHealth: function (result) {
    const files = result.files || [];
    const codeHealthIssues = [];
    const largeFiles = [];

    // File patterns to analyze (source files only)
    const sourceFilePatterns = [
      /\.(js|jsx|ts|tsx|vue|svelte)$/,
      /^[^.]*$/,
    ];

    // Patterns to ignore
    const ignoredPatterns = [
      /node_modules/,
      /\.(test|spec|stories|mock)\.[jt]sx?$/,
      /\.d\.ts$/,
      /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i,
      /package-lock\.json$/,
      /routeTree\.gen\.ts$/,
    ];

    // Analyze files for code health issues
    files.forEach((file) => {
      if (!file.content) return;

      const fileName = file.name.split("/").pop();
      const fileExt = fileName.split(".").pop().toLowerCase();

      // Skip non-source files and ignored patterns
      const isSourceFile = sourceFilePatterns.some((pattern) => file.name.match(pattern));
      const isIgnored = ignoredPatterns.some((pattern) => file.name.match(pattern));

      if (!isSourceFile || isIgnored) return;

      const lines = file.content.split("\n");
      const lineCount = lines.length;
      const isLargeFile = lineCount > 500;

      // Only track source files for large files
      if (isLargeFile && fileExt.match(/^(js|jsx|ts|tsx|vue|svelte)$/)) {
        largeFiles.push({
          name: fileName,
          path: file.name,
          lines: lineCount,
        });
      }

      // Skip complexity analysis for non-code files
      if (!fileExt.match(/^(js|jsx|ts|tsx|vue|svelte)$/)) return;

      // Advanced complexity analysis
      let ifElseCount = 0;
      let loopCount = 0;
      let nestingLevel = 0;
      let currentNesting = 0;
      let functionNesting = 0;
      let maxFunctionNesting = 0;

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith("//") || trimmedLine.startsWith("*")) {
          return;
        }

        // Count if/else statements
        if (trimmedLine.match(/\b(if|else if|else)\s*\(/)) {
          ifElseCount++;
        }

        // Count loops
        if (trimmedLine.match(/\b(for|while|do|forEach|map|filter|reduce)\s*\(/)) {
          loopCount++;
        }

        // Track function declarations
        if (trimmedLine.match(/\b(function|const|let|var|class|interface|type|enum)\s+\w+\s*[=:(]/)) {
          functionNesting = currentNesting + 1;
          maxFunctionNesting = Math.max(maxFunctionNesting, functionNesting);
        }

        // Track nesting level
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        currentNesting += openBraces - closeBraces;
        nestingLevel = Math.max(nestingLevel, currentNesting);

        if (closeBraces > 0) {
          functionNesting = Math.max(0, functionNesting - closeBraces);
        }
      });

      // Calculate complexity score
      const complexity = ifElseCount * 2 + loopCount * 2 + maxFunctionNesting * 3;

      // Only show files with significant complexity or deep nesting
      const isComplex =
        complexity > 30 ||
        ifElseCount > 10 ||
        loopCount > 5 ||
        maxFunctionNesting > 4 ||
        nestingLevel > 5;

      if (isComplex) {
        codeHealthIssues.push({
          name: fileName,
          path: file.name,
          complexity,
          ifElseCount,
          loopCount,
          nestingLevel,
          functionNesting: maxFunctionNesting,
          lines: lineCount,
          isLargeFile: isLargeFile,
        });
      }
    });

    // Sort by complexity (descending)
    codeHealthIssues.sort((a, b) => b.complexity - a.complexity);
    largeFiles.sort((a, b) => b.lines - a.lines);

    // Display code health section if there are any issues
    if (codeHealthIssues.length === 0 && largeFiles.length === 0) return "";

    let html = `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">
          <span style="color:#3b82f6;">📊 Аналіз якості коду</span>
        </h3>
        <div style="max-height: 400px; overflow-y: auto; padding-right: 8px;">
    `;

    if (largeFiles.length > 0) {
      html += `
        <div style="margin-bottom:${codeHealthIssues.length > 0 ? "16px" : "0"};">
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Великі файли (>500 рядків):</div>
          <div style="background:#f9fafb;border-radius:6px;padding:8px;font-size:12px;">
            ${largeFiles.map(file => `
              <div style="padding:6px 8px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
                <div style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${file.path}">
                  ${file.name}
                  <span style="color:#9ca3af;font-size:11px;margin-left:8px;">${file.path.replace(file.name, "")}</span>
                </div>
                <span style="color:#dc2626;font-weight:500;margin-left:12px;">${file.lines} рядків</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    if (codeHealthIssues.length > 0) {
      html += `
        <div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Потенційні проблеми складності:</div>
          <div style="background:#f9fafb;border-radius:6px;padding:8px;font-size:12px;">
            ${codeHealthIssues.map(file => {
              const issues = [];
              if (file.complexity > 50) issues.push(`дуже висока складність (${file.complexity} балів)`);
              else if (file.complexity > 30) issues.push(`висока складність (${file.complexity} балів)`);

              if (file.functionNesting > 4) issues.push(`функції з глибоким вкладенням (до ${file.functionNesting} рівнів)`);
              if (file.nestingLevel > 5) issues.push(`глибоке вкладення (${file.nestingLevel} рівнів)`);
              if (file.ifElseCount > 10) issues.push(`багато умов (${file.ifElseCount})`);
              if (file.loopCount > 5) issues.push(`багато циклів (${file.loopCount})`);
              if (file.isLargeFile) issues.push(`великий файл (${file.lines} рядків)`);

              // Calculate severity score
              const severityScore = Math.min(100, Math.floor(
                file.complexity * 0.4 +
                file.functionNesting * 10 +
                file.ifElseCount * 0.5 +
                file.loopCount * 1 +
                file.nestingLevel * 2
              ));

              // Determine severity color
              let severityColor = "#10b981";
              if (severityScore > 70) severityColor = "#ef4444";
              else if (severityScore > 50) severityColor = "#f59e0b";
              else if (severityScore > 30) severityColor = "#3b82f6";

              return `
                <div style="padding:10px;border-bottom:1px solid #e5e7eb;position:relative;">
                  <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${severityColor};border-radius:2px 0 0 2px;"></div>
                  <div style="margin-left:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
                      <div style="font-weight:500;flex:1;min-width:0;">
                        <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${file.path}">
                          ${file.name}
                        </div>
                        <div style="font-size:11px;color:#6b7280;margin-top:2px;">
                          ${file.path.replace(file.name, "")}
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:8px;margin-left:8px;">
                        <span style="font-size:11px;color:#6b7280;">
                          <span style="color:#374151;font-weight:500;">${file.complexity}</span> балів
                        </span>
                      </div>
                    </div>
                    ${issues.length > 0 ? `
                      <div style="font-size:11px;color:#4b5563;margin-top:4px;">
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px;">
                          ${issues.map(issue => `
                            <span style="display:inline-flex;align-items:center;background:${severityColor}10;color:${severityColor};padding:2px 6px;border-radius:4px;font-size:10px;font-weight:500;border:1px solid ${severityColor}20;">
                              ${issue}
                            </span>
                          `).join("")}
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;font-size:10px;color:#6b7280;margin-top:4px;">
                          <span>${file.lines} рядків</span>
                          <span>•</span>
                          <span>${file.ifElseCount} умов</span>
                          <span>•</span>
                          <span>${file.loopCount} циклів</span>
                          <span>•</span>
                          <span>вкладеність до ${file.nestingLevel} рівнів</span>
                        </div>
                      </div>
                    ` : ""}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  },

  // 4. Render Dependency Analysis
  renderDependencyAnalysis: function (result) {
    if (!result.dependencyAnalysis) return "";

    const {
      cyclicDependencies = [],
      godFiles = [],
      hubFiles = [],
      mostUsedComponents = [],
    } = result.dependencyAnalysis;

    let html = `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#3b82f6;">
          🔄 Аналіз залежностей
        </h3>
        <div>
          <!-- Cyclic Dependencies -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1e40af;">
              🔄 Циклічні залежності (${cyclicDependencies.length})
            </h4>
            ${cyclicDependencies.length > 0 ? `
              <div style="background:#eff6ff;border-radius:6px;padding:12px;border:1px solid #dbeafe;">
                ${cyclicDependencies.map((cycle, index) => `
                  <div style="margin-bottom: ${index < cyclicDependencies.length - 1 ? "12px" : "0"};">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                      <span style="font-size:11px;color:#3b82f6;">Цикл #${index + 1}</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:11px;color:#1e40af;">
                      ${cycle.map((file, i, arr) => `<span>${file.split("/").pop()}${i < arr.length - 1 ? " → " : ""}</span>`).join("")}
                    </div>
                  </div>
                `).join("")}
              </div>
            ` : '<div style="color:#6b7280;font-size:12px;padding:8px 0;">Циклічних залежностей не знайдено</div>'}
          </div>

          <!-- God Files -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1e40af;">
              🏛️ "God Files" - файли з багатьма імпортами
            </h4>
            <p style="font-size:10px;color:#6b7280;margin:0 0 8px 0;">
              Файли, які імпортують багато інших файлів (високі вихідні залежності)
            </p>
            ${godFiles.length > 0 ? `
              <div style="background:#f0f9ff;border-radius:6px;border:1px solid #e0f2fe;overflow:hidden;max-height:300px;overflow-y:auto;">
                <div style="display:grid;grid-template-columns:1fr 120px;font-size:11px;background:#e0f2fe;padding:6px 10px;font-weight:600;color:#0369a1;position:sticky;top:0;z-index:1;">
                  <div>Файл</div>
                  <div style="text-align:right;">Імпортує</div>
                </div>
                ${godFiles.map(file => `
                  <div style="display:grid;grid-template-columns:1fr 120px;padding:6px 10px;border-bottom:1px solid #e0f2fe;font-size:11px;">
                    <div>
                      <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${file.fullPath}">
                        ${file.file}
                      </div>
                      <div style="font-size:9px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${file.fullPath}">
                        ${file.fullPath}
                      </div>
                    </div>
                    <div style="text-align:right;color:#0c4a6e;font-weight:500;">
                      ${file.imports} ${this.getWordForm(file.imports, ['файл', 'файли', 'файлів'])}
                    </div>
                  </div>
                `).join("")}
              </div>
            ` : '<div style="color:#6b7280;font-size:12px;padding:8px 0;">Не знайдено</div>'}
          </div>

          <!-- Hub Files -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1e40af;">
              🌟 "Hub Files" - популярні файли
            </h4>
            <p style="font-size:10px;color:#6b7280;margin:0 0 8px 0;">
              Файли, які імпортуються багатьма іншими (високі вхідні залежності)
            </p>
            ${hubFiles.length > 0 ? `
              <div style="background:#fef3ff;border-radius:6px;border:1px solid #fae8ff;overflow:hidden;max-height:300px;overflow-y:auto;">
                <div style="display:grid;grid-template-columns:1fr 140px;font-size:11px;background:#fae8ff;padding:6px 10px;font-weight:600;color:#86198f;position:sticky;top:0;z-index:1;">
                  <div>Файл</div>
                  <div style="text-align:right;">Імпортується</div>
                </div>
                ${hubFiles.map(file => `
                  <div style="display:grid;grid-template-columns:1fr 140px;padding:6px 10px;border-bottom:1px solid #fae8ff;font-size:11px;">
                    <div>
                      <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${file.fullPath}">
                        ${file.file}
                      </div>
                      <div style="font-size:9px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${file.fullPath}">
                        ${file.fullPath}
                      </div>
                    </div>
                    <div style="text-align:right;color:#86198f;font-weight:500;">
                      ${file.importedBy} ${this.getWordForm(file.importedBy, ['файлом', 'файлами', 'файлами'])}
                    </div>
                  </div>
                `).join("")}
              </div>
            ` : '<div style="color:#6b7280;font-size:12px;padding:8px 0;">Не знайдено</div>'}
          </div>

          <!-- Most Used Components -->
          <div>
            <h4 style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1e40af;">
              🏆 Найчастіше використовувані компоненти
            </h4>
            ${mostUsedComponents.length > 0 ? `
              <div style="background:#f5f3ff;border-radius:6px;border:1px solid #ede9fe;overflow:hidden;max-height:300px;overflow-y:auto;">
                <div style="display:grid;grid-template-columns:1fr 120px;font-size:11px;background:#ede9fe;padding:6px 10px;font-weight:600;color:#5b21b6;position:sticky;top:0;z-index:1;">
                  <div>Компонент</div>
                  <div style="text-align:right;">Використань</div>
                </div>
                ${mostUsedComponents.map(comp => `
                  <div style="display:grid;grid-template-columns:1fr 120px;padding:6px 10px;border-bottom:1px solid #ede9fe;font-size:11px;">
                    <div>
                      <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${comp.name}">
                        ${comp.name}
                      </div>
                      ${comp.file ? `
                        <div style="font-size:9px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${comp.file}">
                          ${comp.file}
                        </div>
                      ` : ''}
                    </div>
                    <div style="text-align:right;color:#5b21b6;font-weight:500;">
                      ${comp.totalCount || comp.count} разів
                      ${comp.fileCount ? `<div style="font-size:9px;color:#6b7280;">у ${comp.fileCount} ${this.getWordForm(comp.fileCount, ['файлі', 'файлах', 'файлах'])}</div>` : ''}
                    </div>
                  </div>
                `).join("")}
              </div>
            ` : '<div style="color:#6b7280;font-size:12px;padding:8px 0;">Не знайдено</div>'}
          </div>
        </div>
      </div>
    `;

    return html;
  },

  // 5. Render Unused CSS
  renderUnusedCSS: function (result) {
    const unusedCSS = result.unusedCSS || [];
    if (unusedCSS.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#9333ea;">🎨 Невикористані CSS класи</span>';
    html += '<span style="font-size:11px;background:#f3e8ff;color:#7c3aed;padding:4px 8px;border-radius:4px;">' + unusedCSS.length + '</span>';
    html += '</h3>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedCSS.forEach((item) => {
      const location = item.location || "невідомо";
      html += '<div style="padding:8px;background:#faf5ff;border-radius:4px;margin-bottom:8px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">';
      html += '<code style="font-family:monospace;color:#7c3aed;font-weight:bold;">' + item.name + '</code>';
      html += '<span style="color:#6b7280;font-size:10px;">📄 ' + location + '</span>';
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 6. Render Unused Functions
  renderUnusedFunctions: function (result) {
    const unusedFunctions = result.unusedFunctions || [];
    if (unusedFunctions.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#3b82f6;">⚡ Невикористані функції</span>';
    html += '<span style="font-size:11px;background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:4px;">' + unusedFunctions.length + '</span>';
    html += '</h3>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedFunctions.forEach((fn) => {
      const name = fn.name || fn;
      const location = fn.location || "";
      html += '<div style="padding:8px;background:#eff6ff;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
      html += '<code style="font-family:monospace;color:#1e40af;font-weight:bold;">' + name + '()</code>';
      if (location) {
        html += '<span style="color:#6b7280;font-size:10px;">📄 ' + location + '</span>';
      }
      html += '</div></div>';
    });

    html += '</div></div>';
    return html;
  },

  // 7. Render Unused Variables
  renderUnusedVariables: function (result) {
    const unusedVariables = result.unusedVariables || [];
    if (unusedVariables.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#f59e0b;">📦 Невикористані змінні</span>';
    html += '<span style="font-size:11px;background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;">' + unusedVariables.length + '</span>';
    html += '</h3>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    const typeLabels = {
      simple: "змінна",
      useState: "state",
      "useState-setter": "setState",
      "array-destruct": "деструктуризація []",
      "object-destruct": "деструктуризація {}",
      "export-const": "export const",
    };

    unusedVariables.forEach((variable) => {
      const location = variable.location || "";
      const typeLabel = typeLabels[variable.type] || variable.type || "змінна";
      html += '<div style="padding:8px;background:#fef3c7;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html += '<code style="font-family:monospace;color:#92400e;font-weight:bold;">' + variable.name + '</code>';
      html += '<span style="font-size:9px;background:#fbbf24;color:#78350f;padding:2px 6px;border-radius:3px;">' + typeLabel + '</span>';
      html += '</div>';
      if (location) {
        html += '<span style="color:#6b7280;font-size:10px;">📄 ' + location + '</span>';
      }
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 8. Render Unused Images
  renderUnusedImages: function (result) {
    const unusedImages = result.unusedImages || [];
    if (unusedImages.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#ec4899;">🖼️ Невикористані зображення (' + unusedImages.length + ')</h3>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedImages.forEach((image) => {
      const path = image.path || "невідомо";
      html += '<div style="padding:8px;background:#fce7f3;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html += '<div style="font-weight:bold;color:#9f1239;margin-bottom:4px;">' + image.name + '</div>';
      html += '<div style="color:#6b7280;font-size:10px;">📄 ' + path + '</div>';
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 9. Render Unused Exports
  renderUnusedExports: function (result) {
    const unusedExports = result.unusedExports || [];
    if (unusedExports.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#8b5cf6;">📤 Невикористані експорти</span>';
    html += '<span style="font-size:11px;background:#ede9fe;color:#6b21a8;padding:4px 8px;border-radius:4px;">' + unusedExports.length + '</span>';
    html += '</h3>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedExports.forEach((item) => {
      const location = item.location || "невідомо";
      html += '<div style="padding:8px;background:#f5f3ff;border-radius:4px;margin-bottom:8px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">';
      html += '<code style="font-family:monospace;color:#6b21a8;font-weight:bold;">' + item.name + '</code>';
      html += '<span style="color:#6b7280;font-size:10px;">📄 ' + location + '</span>';
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 10. Render Unused Components
  renderUnusedComponents: function (result) {
    const unusedComponents = result.unusedComponents || [];
    if (unusedComponents.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#06b6d4;">⚛️ Невикористані React компоненти</span>';
    html += '<span style="font-size:11px;background:#cffafe;color:#0e7490;padding:4px 8px;border-radius:4px;">' + unusedComponents.length + '</span>';
    html += '</h3>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedComponents.forEach((item) => {
      const location = item.location || "невідомо";
      html += '<div style="padding:8px;background:#ecfeff;border-radius:4px;margin-bottom:8px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">';
      html += '<code style="font-family:monospace;color:#0e7490;font-weight:bold;">' + item.name + '</code>';
      html += '<span style="color:#6b7280;font-size:10px;">📄 ' + location + '</span>';
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 11. Render Unused Hooks
  renderUnusedHooks: function (result) {
    const unusedHooks = result.unusedHooks || [];
    if (unusedHooks.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#14b8a6;">🪝 Невикористані хуки</span>';
    html += '<span style="font-size:11px;background:#ccfbf1;color:#0f766e;padding:4px 8px;border-radius:4px;">' + unusedHooks.length + '</span>';
    html += '</h3>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedHooks.forEach((item) => {
      const location = item.location || "невідомо";
      html += '<div style="padding:8px;background:#f0fdfa;border-radius:4px;margin-bottom:8px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">';
      html += '<code style="font-family:monospace;color:#0f766e;font-weight:bold;">' + item.name + '</code>';
      html += '<span style="color:#6b7280;font-size:10px;">📄 ' + location + '</span>';
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 12. Render Unused Enums/Interfaces
  renderUnusedEnumsInterfaces: function (result) {
    const unusedEnumsInterfaces = result.unusedEnumsInterfaces || [];
    if (unusedEnumsInterfaces.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#a855f7;">🔷 Невикористані enum / interface / type</span>';
    html += '<span style="font-size:11px;background:#f3e8ff;color:#7e22ce;padding:4px 8px;border-radius:4px;">' + unusedEnumsInterfaces.length + '</span>';
    html += '</h3>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedEnumsInterfaces.forEach((item) => {
      const location = item.location || "невідомо";
      const typeLabel = item.type || "type";
      html += '<div style="padding:8px;background:#faf5ff;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html += '<code style="font-family:monospace;color:#7e22ce;font-weight:bold;">' + item.name + '</code>';
      html += '<span style="font-size:9px;background:#a855f7;color:#fff;padding:2px 6px;border-radius:3px;">' + typeLabel + '</span>';
      html += '</div>';
      html += '<span style="color:#6b7280;font-size:10px;">📄 ' + location + '</span>';
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 13. Render Unused API Endpoints
  renderUnusedAPIEndpoints: function (result) {
    const unusedAPIEndpoints = result.unusedAPIEndpoints || [];
    if (unusedAPIEndpoints.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#ef4444;">🌐 Невикористані API ендпоінти</span>';
    html += '<span style="font-size:11px;background:#fee2e2;color:#991b1b;padding:4px 8px;border-radius:4px;">' + unusedAPIEndpoints.length + '</span>';
    html += '</h3>';
    html += '<p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">API роути, які не використовуються в коді</p>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedAPIEndpoints.forEach((item) => {
      const location = item.location || "невідомо";
      html += '<div style="padding:8px;background:#fef2f2;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html += '<div style="font-weight:bold;color:#991b1b;margin-bottom:4px;">' + item.name + '</div>';
      html += '<div style="color:#6b7280;font-size:10px;">📄 ' + location + '</div>';
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 14. Render Duplicate Functions
  renderDuplicateFunctions: function (result) {
    const duplicateFunctions = result.duplicateFunctions || [];
    if (duplicateFunctions.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#f59e0b;">🔄 Функції з однаковими назвами (' + duplicateFunctions.length + ')</h3>';
    html += '<p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">Функції з однаковими іменами у різних файлах можуть призвести до конфліктів</p>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    duplicateFunctions.forEach((dup) => {
      const locations = Array.isArray(dup.locations) ? dup.locations : [];
      const count = dup.count || locations.length || 0;
      const isSimilar = !!dup.similar;
      const bgColor = isSimilar ? "#fef3c7" : "#fee2e2";
      const borderColor = isSimilar ? "#fbbf24" : "#ef4444";

      html += '<div style="padding:12px;background:' + bgColor + ';border-left:3px solid ' + borderColor + ';border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
      html += '<code style="font-family:monospace;color:#92400e;font-weight:bold;font-size:13px;">' + dup.name + '()</code>';
      html += '<div style="display:flex;gap:6px;align-items:center;">';

      if (isSimilar) {
        html += '<span style="background:#22c55e;color:#fff;padding:2px 6px;border-radius:8px;font-size:9px;">⚠️ Схожий код</span>';
      } else {
        html += '<span style="background:#3b82f6;color:#fff;padding:2px 6px;border-radius:8px;font-size:9px;">✓ Різний код</span>';
      }

      html += '<span style="background:#f59e0b;color:#fff;padding:2px 8px;border-radius:12px;font-size:10px;">' + count + ' файли</span>';
      html += '</div></div>';

      if (locations.length > 0) {
        html += '<div style="color:#6b7280;font-size:10px;">';
        locations.forEach((loc) => {
          html += '<div style="margin-top:4px;">📄 ' + loc + '</div>';
        });
        html += '</div>';
      }

      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 15. Render API Routes
  renderAPIRoutes: function (result) {
    const apiRoutes = result.apiRoutes || [];
    if (apiRoutes.length === 0) return "";

    const methodColors = {
      GET: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
      POST: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
      PUT: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
      DELETE: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
      PATCH: { bg: "#e9d5ff", border: "#a855f7", text: "#6b21a8" },
    };

    const sortedRoutes = [...apiRoutes].sort((routeA, routeB) => {
      const methodA = (routeA.method || "").toUpperCase();
      const methodB = (routeB.method || "").toUpperCase();
      const priorityMap = { GET: 0, POST: 1 };
      const priorityA = priorityMap[methodA] ?? 2;
      const priorityB = priorityMap[methodB] ?? 2;

      if (priorityA !== priorityB) return priorityA - priorityB;
      if (priorityA === 2 && methodA !== methodB) return methodA.localeCompare(methodB);

      const pathA = routeA.path || "";
      const pathB = routeB.path || "";
      return pathA.localeCompare(pathB);
    });

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#8b5cf6;">🌐 API Роути (' + apiRoutes.length + ')</h3>';
    html += '<p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">Знайдені API ендпоінти та їх параметри</p>';
    html += '<div style="max-height:400px;overflow-y:auto;">';

    sortedRoutes.forEach((route) => {
      const method = (route.method || "GET").toUpperCase();
      const colors = methodColors[method] || methodColors.GET;

      html += '<div style="padding:12px;background:' + colors.bg + ';border-left:3px solid ' + colors.border + ';border-radius:4px;margin-bottom:12px;">';
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
      html += '<span style="background:' + colors.border + ';color:#fff;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:bold;">' + method + '</span>';
      html += '<code style="font-family:monospace;color:' + colors.text + ';font-weight:bold;font-size:12px;">' + route.path + '</code>';

      if (route.type === "client") {
        html += '<span style="background:#6b7280;color:#fff;padding:2px 6px;border-radius:3px;font-size:9px;">CLIENT</span>';
      }

      html += '</div>';

      const params = route.params || {};
      const args = route.args || [];
      const requestProps = route.requestProps || {};

      const hasParams =
        (params.body && params.body.length) ||
        (params.query && params.query.length) ||
        (params.headers && params.headers.length) ||
        (params.path && params.path.length) ||
        args.length ||
        (requestProps.body && requestProps.body.length);

      if (hasParams) {
        html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">';

        // Handler arguments (server)
        if (args.length) {
          html += '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">⚙️ Handler args:</span> ';
          html += '<span style="font-size:10px;color:' + colors.text + ';">' + args.join(", ") + '</span></div>';
        }

        // Path params
        if (params.path && params.path.length) {
          html += '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">🧩 Path:</span> ';
          html += '<span style="font-size:10px;color:' + colors.text + ';">' + params.path.join(", ") + '</span></div>';
        }

        // Body params
        if (params.body && params.body.length) {
          html += '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">📦 Body:</span> ';
          html += '<span style="font-size:10px;color:' + colors.text + ';">' + params.body.join(", ") + '</span></div>';
        }

        // Query params
        if (params.query && params.query.length) {
          html += '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">🔍 Query:</span> ';
          html += '<span style="font-size:10px;color:' + colors.text + ';">' + params.query.join(", ") + '</span></div>';
        }

        // Headers
        if (params.headers && params.headers.length) {
          html += '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">📋 Headers:</span> ';
          html += '<span style="font-size:10px;color:' + colors.text + ';">' + params.headers.join(", ") + '</span></div>';
        }

        // Client request props (fetch / axios)
        if (requestProps.body && requestProps.body.length) {
          html += '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">🚀 Request body:</span> ';
          html += '<span style="font-size:10px;color:' + colors.text + ';">' + requestProps.body.join(", ") + '</span></div>';
        }

        if (args.length) {
          html += '<span style="background:#0ea5e9;color:#fff;padding:2px 6px;border-radius:3px;font-size:9px;">SERVER</span>';
        }

        html += '</div>';
      }

      if (route.files && route.files.length > 0) {
        html += '<div style="margin-top:8px;font-size:10px;color:#6b7280;">';
        const filesList = route.files.slice(0, 3).join(", ");
        html += '📄 Файли: ' + filesList;
        if (route.files.length > 3) {
          html += ' та ще ' + (route.files.length - 3);
        }
        html += '</div>';
      }

      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 16. Render Pages
  renderPages: function (result) {
    const pages = result.pages || [];
    if (pages.length === 0) return "";

    let html = '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#10b981;">📄 Сторінки (' + pages.length + ')</h3>';
    html += '<div style="max-height:300px;overflow-y:auto;">';

    pages.forEach((page) => {
      const fileName = page.path ? page.path.split("/").pop() : "невідомо";
      const path = page.path && page.path.includes("/")
        ? page.path.substring(0, page.path.lastIndexOf("/"))
        : page.path || "";

      html += '<div style="padding:8px;background:#ecfdf5;border-radius:4px;margin-bottom:6px;font-size:11px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">';
      html += '<div style="font-weight:bold;color:#059669;">' + fileName + '</div>';
      html += '<span style="background:#10b981;color:#fff;padding:2px 6px;border-radius:10px;font-size:9px;">' + (page.type || "page") + '</span>';
      html += '</div>';
      if (path) {
        html += '<div style="color:#6b7280;font-size:10px;">📁 ' + path + '</div>';
      }
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // 17. Render TypeScript Types
  renderTypeScriptTypes: function (result) {
    const typesAnalysis = result.typesAnalysis || { allTypes: [], byFile: {}, stats: {} };
    if (typesAnalysis.stats.totalTypes === 0) return "";

    let html = `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">
          <span style="color:#10b981;">📊 TypeScript Types & Interfaces</span>
          <span style="font-size:11px;background:#d1fae5;color:#065f46;padding:4px 8px;border-radius:4px;">
            ${typesAnalysis.stats.totalTypes} total (${typesAnalysis.stats.totalInterfaces} interfaces, ${typesAnalysis.stats.totalTypeAliases} types)
          </span>
        </h3>
        <div style="max-height: 500px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background: #fefefe;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
    `;

    typesAnalysis.allTypes.forEach((type) => {
      const typeIcon = type.type === "interface" ? "🟣" : "🔷";
      html += `
        <div style="background: #f9fafb; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb; width: 100%; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb;">
            <div>
              <span style="font-weight: 600; color: #111827;">${typeIcon} ${window.Utils.escapeHTML(type.name)}</span>
              <span style="color: #6b7280; font-size: 11px; margin-left: 6px;">${type.type}</span>
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              ${window.Utils.escapeHTML(type.file.split("/").pop())}:${type.line}
            </div>
          </div>

          <div style="margin-bottom: 8px;">
            <pre style="font-size: 12px; color: #4b5563; font-family: 'Courier New', monospace;
                        background: #fff; padding: 8px; border-radius: 4px; border: 1px solid #e5e7eb;
                        max-height: 300px; overflow: auto; white-space: pre-wrap; word-break: break-word;">
${window.Utils.escapeHTML(type.content)}
            </pre>
          </div>

          ${type.dependencies && type.dependencies.length > 0 ? `
            <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
              <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">Dependencies:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${type.dependencies.map(dep => `
                  <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px;
                               border-radius: 4px; font-size: 10px; white-space: nowrap;">
                    ${window.Utils.escapeHTML(dep.name)}
                  </span>
                `).join("")}
              </div>
            </div>
          ` : ""}
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    return html;
  },

  // 18. Render Recommendations
  renderRecommendations: function (result) {
    const {
      unusedCSS = [],
      unusedFunctions = [],
      unusedVariables = [],
      unusedImages = [],
      unusedExports = [],
      unusedComponents = [],
      unusedHooks = [],
      unusedEnumsInterfaces = [],
      unusedAPIEndpoints = [],
      duplicateFunctions = [],
    } = result;

    const nothingFound =
      unusedCSS.length === 0 &&
      unusedFunctions.length === 0 &&
      unusedVariables.length === 0 &&
      unusedImages.length === 0 &&
      unusedExports.length === 0 &&
      unusedComponents.length === 0 &&
      unusedHooks.length === 0 &&
      unusedEnumsInterfaces.length === 0 &&
      unusedAPIEndpoints.length === 0 &&
      duplicateFunctions.length === 0;

    let html = "";

    if (nothingFound) {
      html += '<div style="border:1px solid #bbf7d0;border-radius:8px;padding:24px;text-align:center;background:#f0fdf4;">';
      html += '<p style="margin:0;font-size:48px;">🎉</p>';
      html += '<p style="margin:8px 0 0;color:#15803d;font-size:16px;font-weight:bold;">Чудово! Не знайдено невикористаного коду</p>';
      html += '<p style="margin:4px 0 0;color:#6b7280;font-size:12px;">Ваш проект оптимізований</p>';
      html += '</div>';
    } else {
      html += '<div style="border:1px solid #fcd34d;border-radius:8px;padding:16px;background:#fef3c7;margin-top:16px;">';
      html += '<h3 style="margin:0 0 8px 0;font-size:14px;font-weight:bold;color:#92400e;">💡 Рекомендації</h3>';
      html += '<ul style="margin:0;padding-left:20px;font-size:11px;color:#92400e;">';

      if (unusedCSS.length > 0) {
        html += '<li>Видаліть невикористані CSS класи або використайте PurgeCSS/Tailwind JIT</li>';
      }
      if (unusedFunctions.length > 0) {
        html += '<li>Видаліть невикористані функції або експорти</li>';
      }
      if (unusedVariables.length > 0) {
        html += '<li>Видаліть невикористані змінні та константи</li>';
      }
      if (unusedExports.length > 0) {
        html += '<li>Видаліть невикористані експорти для зменшення розміру бандлу</li>';
      }
      if (unusedComponents.length > 0) {
        html += '<li>Видаліть невикористані React компоненти</li>';
      }
      if (unusedHooks.length > 0) {
        html += '<li>Видаліть невикористані хуки або перемістіть їх у бібліотеку</li>';
      }
      if (unusedEnumsInterfaces.length > 0) {
        html += '<li>Видаліть невикористані типи, інтерфейси та енуми</li>';
      }
      if (unusedAPIEndpoints.length > 0) {
        html += '<li>Видаліть або задокументуйте невикористані API ендпоінти</li>';
      }

      html += '<li>Використовуйте ESLint з правилом "no-unused-vars"</li>';
      html += '<li>Налаштуйте tree-shaking для автоматичного видалення dead code</li>';
      html += '</ul></div>';
    }

    return html;
  },
};
