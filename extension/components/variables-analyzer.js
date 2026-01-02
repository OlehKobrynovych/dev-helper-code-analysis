// Variables Analyzer
window.VariablesAnalyzer = {
  analyzeVariables: function (jsFiles) {
    const allVariables = new Map();
    const usedVariables = new Set();

    jsFiles.forEach(function (file) {
      const content = file.content;
      const lines = content.split("\n");

      lines.forEach(function (line, lineIndex) {
        // 1. Прості змінні: const test1 = []
        if (
          !line.includes("useState") &&
          !line.includes("function") &&
          !line.includes("=>")
        ) {
          const simpleMatches = line.matchAll(
            /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g
          );
          for (const match of simpleMatches) {
            if (!line.includes("[") || line.includes("= [")) {
              allVariables.set(match[1], {
                location: file.name + ":" + (lineIndex + 1),
                type: "змінна",
              });
            }
          }
        }

        // 3. export const
        const exportMatches = line.matchAll(
          /export\s+const\s+([A-Z_][A-Z0-9_]*)\s*=/g
        );
        for (const match of exportMatches) {
          allVariables.set(match[1], {
            location: file.name + ":" + (lineIndex + 1),
            type: "export const",
          });
        }
      });

      // 2. useState - шукаємо в усьому файлі (може бути багаторядковим)
      const stateRegex =
        /const\s*\[\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\]\s*=\s*useState/gs;
      const stateMatches = [...content.matchAll(stateRegex)];

      stateMatches.forEach(function (match) {
        // Знаходимо номер рядка де це оголошення
        const beforeMatch = content.substring(0, match.index);
        const lineNum = beforeMatch.split("\n").length;

        allVariables.set(match[1], {
          location: file.name + ":" + lineNum,
          type: "useState",
        });
        allVariables.set(match[2], {
          location: file.name + ":" + lineNum,
          type: "setState",
        });
      });
    });

    console.log("📦 Found", allVariables.size, "variables");

    jsFiles.forEach(function (file) {
      const content = file.content;

      allVariables.forEach(function (_info, varName) {
        // Перевіряємо використання в усьому файлі, а не по рядках
        const lines = content.split("\n");

        lines.forEach(function (line) {
          // Пропускаємо рядок де змінна оголошена
          const isDeclaration =
            line.includes("const " + varName) ||
            line.includes("let " + varName) ||
            line.includes("var " + varName) ||
            line.includes("const [" + varName);

          // Якщо це не оголошення і змінна згадується - вона використовується
          if (
            !isDeclaration &&
            new RegExp("\\b" + varName + "\\b").test(line)
          ) {
            usedVariables.add(varName);
          }
        });
      });
    });

    console.log("📦 Used", usedVariables.size, "variables");

    const unused = [];
    allVariables.forEach(function (varInfo, varName) {
      if (!usedVariables.has(varName)) {
        unused.push({
          name: varName,
          location: varInfo.location,
          type: varInfo.type,
        });
      }
    });

    console.log("📦 Unused", unused.length, "variables");
    return { total: allVariables.size, unused: unused };
  },
};
