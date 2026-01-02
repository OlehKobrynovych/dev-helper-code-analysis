// Duplicates Analyzer
window.DuplicatesAnalyzer = {
  findDuplicateFunctions: function (jsFiles) {
    const functionData = {};

    jsFiles.forEach(function (file) {
      const content = file.content;
      const lines = content.split("\n");

      // Знаходимо функції з їх тілом
      lines.forEach(function (line, index) {
        // Пропускаємо змінні з new (const cookies = new Cookies())
        if (line.match(/(?:const|let|var)\s+\w+\s*=\s*new\s+/)) {
          return;
        }

        // Пропускаємо виклики методів (cookies.get())
        if (line.match(/(?:const|let|var)\s+\w+\s*=\s*\w+\.\w+\(/)) {
          return;
        }

        // Знаходимо оголошення функцій
        const funcMatch = line.match(
          /(?:function\s+|export\s+function\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/
        );
        const arrowMatch = line.match(
          /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/
        );

        const funcName = funcMatch
          ? funcMatch[1]
          : arrowMatch
          ? arrowMatch[1]
          : null;

        if (funcName) {
          // Витягуємо тіло функції (наступні 5 рядків для порівняння)
          const bodyLines = lines.slice(index + 1, index + 6).join("\n");
          const normalizedBody = bodyLines
            .replace(/\s+/g, " ")
            .replace(/\/\/.*/g, "")
            .trim()
            .substring(0, 100);

          if (!functionData[funcName]) {
            functionData[funcName] = [];
          }

          functionData[funcName].push({
            file: file.name,
            body: normalizedBody,
          });
        }
      });
    });

    const duplicates = [];

    Object.keys(functionData).forEach(function (funcName) {
      const occurrences = functionData[funcName];

      if (occurrences.length > 1) {
        const uniqueFiles = {};

        occurrences.forEach(function (occ) {
          if (!uniqueFiles[occ.file]) {
            uniqueFiles[occ.file] = occ.body;
          }
        });

        const fileNames = Object.keys(uniqueFiles);

        if (fileNames.length > 1) {
          // Перевіряємо чи тіла функцій схожі
          const bodies = Object.values(uniqueFiles);
          const firstBody = bodies[0];
          let allSimilar = true;

          for (let i = 1; i < bodies.length; i++) {
            const similarity = window.Utils.calculateSimilarity(
              firstBody,
              bodies[i]
            );
            if (similarity < 0.7) {
              allSimilar = false;
              break;
            }
          }

          duplicates.push({
            name: funcName,
            count: fileNames.length,
            locations: fileNames,
            similar: allSimilar,
          });
        }
      }
    });

    console.log("🔄 Found", duplicates.length, "duplicate function names");
    return duplicates;
  },
};
