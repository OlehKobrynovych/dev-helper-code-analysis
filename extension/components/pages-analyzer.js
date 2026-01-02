// Pages Analyzer
window.PagesAnalyzer = {
  analyzePages: function (files) {
    const pages = [];

    // 🔧 нормалізація шляхів
    const allFiles = files.map((f) => ({
      ...f,
      path: "/" + f.name.replace(/\\/g, "/"),
    }));

    // ❌ директорії які НІКОЛИ не сторінки
    const EXCLUDED_DIRS = [
      "/node_modules/",
      "/.git/",
      "/dist/",
      "/build/",
      "/public/",
      "/assets/",
      "/static/",
      "/styles/",
      "/css/",
      "/scss/",
      "/icons/",
      "/images/",
      "/img/",
      "/components/",
      "/ui/",
      "/common/",
      "/shared/",
      "/hooks/",
      "/utils/",
      "/helpers/",
      "/services/",
      "/types/",
      "/models/",
      "/interfaces/",
    ];

    function isExcluded(path) {
      return EXCLUDED_DIRS.some((dir) => path.includes(dir));
    }

    // 🔍 визначення типу проекту
    const hasNextApp = allFiles.some(
      (f) => f.path.includes("/app/") && f.path.includes("page.")
    );
    const hasNextPages = allFiles.some(
      (f) => f.path.includes("/pages/") && f.path.match(/\.(jsx?|tsx?)$/)
    );
    const hasVue = allFiles.some((f) => f.path.endsWith(".vue"));
    const hasAngular = allFiles.some((f) => f.path.endsWith(".component.ts"));
    const hasReact = allFiles.some(
      (f) => f.path.endsWith(".jsx") || f.path.endsWith(".tsx")
    );

    // 🧭 1. Next.js App Router
    if (hasNextApp) {
      allFiles.forEach((file) => {
        if (isExcluded(file.path)) return;
        if (file.path.match(/\/app\/.*\/page\.(jsx?|tsx?)$/i)) {
          pages.push({
            path: file.path,
            framework: "Next.js",
            router: "App Router",
          });
        }
      });
      return pages;
    }

    // 🧭 2. Next.js Pages Router
    if (hasNextPages && !hasNextApp) {
      allFiles.forEach((file) => {
        if (isExcluded(file.path)) return;
        if (
          file.path.match(/\/pages\/.*\.(jsx?|tsx?)$/i) &&
          !file.path.match(/\/(_app|_document|_error)\.(jsx?|tsx?)$/i) &&
          !file.path.includes("/pages/api/")
        ) {
          pages.push({
            path: file.path,
            framework: "Next.js",
            router: "Pages Router",
          });
        }
      });
      return pages;
    }

    // 🧭 3. Nuxt / Vue
    if (hasVue) {
      allFiles.forEach((file) => {
        if (isExcluded(file.path)) return;

        if (
          file.path.match(/\/pages\/.*\.vue$/i) ||
          file.path.match(/\/views\/.*\.vue$/i)
        ) {
          pages.push({
            path: file.path,
            framework: "Vue / Nuxt",
          });
        }
      });
      return pages;
    }

    // 🧭 4. Angular
    if (hasAngular) {
      allFiles.forEach((file) => {
        if (isExcluded(file.path)) return;

        if (file.path.match(/\.component\.ts$/i)) {
          pages.push({
            path: file.path,
            framework: "Angular",
            note: "Component-based routing",
          });
        }
      });
      return pages;
    }

    // 🧭 5. React SPA (react-router)
    if (hasReact) {
      allFiles.forEach((file) => {
        if (isExcluded(file.path)) return;

        if (
          file.path.match(
            /\/src\/(pages|views|screens|routes)\/.*\.(jsx?|tsx?)$/i
          )
        ) {
          pages.push({
            path: file.path,
            framework: "React",
            router: "SPA",
          });
        }
      });
      return pages;
    }

    return pages;
  },
};
