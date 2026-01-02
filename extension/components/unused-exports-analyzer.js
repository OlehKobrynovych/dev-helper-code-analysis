// Unused Exports Analyzer
window.UnusedExportsAnalyzer = {
  analyzeUnusedExports: function (jsFiles) {
    const allExports = new Map();
    const usedExports = new Set();

    // Збираємо всі експорти
    jsFiles.forEach((file) => {
      const content = file.content;

      // export function/const/let/var
      const namedExports = content.matchAll(
        /export\s+(?:const|let|var|function|class|interface|type|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
      );
      for (const match of namedExports) {
        allExports.set(match[1], file.name);
      }

      // export { name1, name2 }
      const exportBlocks = content.matchAll(/export\s*\{([^}]+)\}/g);
      for (const match of exportBlocks) {
        const names = match[1].split(",");
        names.forEach((name) => {
          const cleanName = name
            .trim()
            .split(/\s+as\s+/)[0]
            .trim();
          if (cleanName) allExports.set(cleanName, file.name);
        });
      }
    });

    // Перевіряємо використання
    jsFiles.forEach((file) => {
      const content = file.content;

      allExports.forEach((location, exportName) => {
        // import { exportName }
        if (new RegExp(`import\\s*\\{[^}]*\\b${exportName}\\b`).test(content)) {
          usedExports.add(exportName);
        }
        // import exportName
        else if (new RegExp(`import\\s+${exportName}\\b`).test(content)) {
          usedExports.add(exportName);
        }
        // Використання в коді
        else if (new RegExp(`\\b${exportName}\\b`).test(content)) {
          usedExports.add(exportName);
        }
      });
    });

    const unused = [];
    allExports.forEach((location, exportName) => {
      if (!usedExports.has(exportName)) {
        unused.push({ name: exportName, location });
      }
    });

    console.log("📤 Exports:", allExports.size, "Unused:", unused.length);
    return { total: allExports.size, unused };
  },
};
