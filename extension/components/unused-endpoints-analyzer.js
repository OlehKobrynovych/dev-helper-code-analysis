// Unused API Endpoints Analyzer
window.UnusedEndpointsAnalyzer = {
  analyzeUnusedAPIEndpoints: function (jsFiles) {
    const allEndpoints = new Map();
    const usedEndpoints = new Set();

    // Збираємо всі API ендпоінти
    jsFiles.forEach((file) => {
      const content = file.content;

      // fetch('/api/endpoint')
      const fetchMatches = content.matchAll(
        /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g
      );
      for (const match of fetchMatches) {
        if (match[1].includes("/api/")) {
          allEndpoints.set(match[1], file.name);
        }
      }

      // axios.get('/api/endpoint')
      const axiosMatches = content.matchAll(
        /axios\.\w+\s*\(\s*['"`]([^'"`]+)['"`]/g
      );
      for (const match of axiosMatches) {
        if (match[1].includes("/api/")) {
          allEndpoints.set(match[1], file.name);
        }
      }

      // API route definitions (Next.js)
      if (file.name.includes("/api/")) {
        const routePath = file.name
          .replace(/.*\/api\//, "/api/")
          .replace(/\.(js|ts|jsx|tsx)$/, "");
        allEndpoints.set(routePath, file.name);
      }
    });

    // Перевіряємо використання
    jsFiles.forEach((file) => {
      const content = file.content;

      allEndpoints.forEach((location, endpoint) => {
        if (content.includes(endpoint)) {
          usedEndpoints.add(endpoint);
        }
      });
    });

    const unused = [];
    allEndpoints.forEach((location, endpoint) => {
      if (!usedEndpoints.has(endpoint)) {
        unused.push({ name: endpoint, location });
      }
    });

    console.log("🌐 Endpoints:", allEndpoints.size, "Unused:", unused.length);
    return { total: allEndpoints.size, unused };
  },
};
