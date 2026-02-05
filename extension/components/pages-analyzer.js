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

    // Визначення Server/Client компонента
    function getComponentType(content) {
      if (!content) return null;
      if (content.includes("'use client'") || content.includes('"use client"')) {
        return 'client';
      }
      if (content.includes("'use server'") || content.includes('"use server"')) {
        return 'server';
      }
      return null; // Server by default in App Router
    }

    // Витягування динамічних параметрів з шляху
    function extractParams(path) {
      const params = [];

      // [id] -> dynamic
      const dynamicMatches = path.matchAll(/\[([^\]\.]+)\]/g);
      for (const match of dynamicMatches) {
        params.push({ name: match[1], type: 'dynamic' });
      }

      // [...slug] -> catch-all
      const catchAllMatches = path.matchAll(/\[\.\.\.([^\]]+)\]/g);
      for (const match of catchAllMatches) {
        params.push({ name: match[1], type: 'catch-all' });
      }

      // [[...slug]] -> optional catch-all
      const optionalCatchAllMatches = path.matchAll(/\[\[\.\.\.([^\]]+)\]\]/g);
      for (const match of optionalCatchAllMatches) {
        params.push({ name: match[1], type: 'optional-catch-all' });
      }

      return params;
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
      // Знаходимо всі page, layout, loading, error, not-found файли
      allFiles.forEach((file) => {
        if (isExcluded(file.path)) return;

        const isPage = file.path.match(/\/app\/.*\/page\.(jsx?|tsx?)$/i);
        const isLayout = file.path.match(/\/app\/.*\/layout\.(jsx?|tsx?)$/i);
        const isLoading = file.path.match(/\/app\/.*\/loading\.(jsx?|tsx?)$/i);
        const isError = file.path.match(/\/app\/.*\/error\.(jsx?|tsx?)$/i);
        const isNotFound = file.path.match(/\/app\/.*\/not-found\.(jsx?|tsx?)$/i);
        const isRoute = file.path.match(/\/app\/.*\/route\.(jsx?|tsx?)$/i);

        if (isPage) {
          const componentType = getComponentType(file.content);
          const params = extractParams(file.path);

          pages.push({
            path: file.path,
            framework: "Next.js",
            router: "App Router",
            type: "page",
            componentType: componentType,
            isClientComponent: componentType === 'client',
            isServerComponent: componentType === 'server' || componentType === null,
            params: params,
            hasDynamicParams: params.length > 0,
          });
        } else if (isLayout) {
          const componentType = getComponentType(file.content);
          pages.push({
            path: file.path,
            framework: "Next.js",
            router: "App Router",
            type: "layout",
            componentType: componentType,
            isClientComponent: componentType === 'client',
            isServerComponent: componentType === 'server' || componentType === null,
          });
        } else if (isLoading) {
          pages.push({
            path: file.path,
            framework: "Next.js",
            router: "App Router",
            type: "loading",
          });
        } else if (isError) {
          const componentType = getComponentType(file.content);
          pages.push({
            path: file.path,
            framework: "Next.js",
            router: "App Router",
            type: "error",
            componentType: componentType,
            // Error components must be client components
            isClientComponent: true,
          });
        } else if (isNotFound) {
          pages.push({
            path: file.path,
            framework: "Next.js",
            router: "App Router",
            type: "not-found",
          });
        } else if (isRoute) {
          pages.push({
            path: file.path,
            framework: "Next.js",
            router: "App Router",
            type: "api",
            params: extractParams(file.path),
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
