// Dependencies Analyzer
window.DependenciesAnalyzer = {
  analyzeDependencies: function (jsFiles) {
    // Об'єкт для зберігання графа залежностей
    const dependencyGraph = {};
    // Лічильник імпортів для кожного файлу
    const importCounts = {};
    // Лічильник використань компонентів
    const componentUsage = {};
    // Масив для зберігання шляхів до файлів компонентів
    const componentFiles = {};
    // Регулярний вираз для пошуку імпортів
    const importRegex =
      /(?:import|export)\s+(?:{[^}]+}\s+from\s+)?['"`]([^'"`]+)['"`]|(?:require\s*\(\s*['"`]([^'"`]+)['"`])/g;
    // Регулярний вираз для пошуку використань компонентів
    const componentUsageRegex = /<([A-Z][a-zA-Z0-9]*)(?:\s|>|\/|$)/g;

    // Ініціалізація графа залежностей
    jsFiles.forEach((file) => {
      const fileName = file.name;
      dependencyGraph[fileName] = {
        imports: [],
        importedBy: [],
        isVisited: false,
        isInPath: false,
      };
      importCounts[fileName] = 0;
    });

    // Побудова графа залежностей
    jsFiles.forEach((file) => {
      const fileName = file.name;
      const content = file.content;

      // Знаходимо всі імпорти в файлі
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[2];
        if (!importPath) continue;

        // Пропускаємо зовнішні залежності
        if (importPath.startsWith(".") || importPath.startsWith("/")) {
          // Знаходимо повний шлях до імпортованого файлу
          const importedFile = this.resolveImportPath(
            importPath,
            fileName,
            jsFiles
          );
          if (importedFile) {
            // Додаємо залежність у граф
            if (!dependencyGraph[fileName].imports.includes(importedFile)) {
              dependencyGraph[fileName].imports.push(importedFile);
              importCounts[importedFile] =
                (importCounts[importedFile] || 0) + 1;

              // Додаємо зворотне посилання
              if (dependencyGraph[importedFile]) {
                dependencyGraph[importedFile].importedBy.push(fileName);
              }
            }
          }
        }
      }

      // Шукаємо використання компонентів
      const componentMatches = [];
      let componentMatch;

      // Скидаємо lastIndex для глобального регулярного виразу
      componentUsageRegex.lastIndex = 0;

      // Спочатку збираємо всі збіги, щоб уникнути дублювання
      while ((componentMatch = componentUsageRegex.exec(content)) !== null) {
        const componentName = componentMatch[1];
        componentMatches.push(componentName);
      }

      // Рахуємо унікальні використання компонентів у файлі
      const uniqueComponentsInFile = new Set(componentMatches);

      // Оновлюємо загальний лічильник
      uniqueComponentsInFile.forEach((componentName) => {
        // Оновлюємо лічильник використань
        componentUsage[componentName] =
          (componentUsage[componentName] || 0) + 1;

        // Зберігаємо шлях до файлу, де знаходиться компонент
        if (!componentFiles[componentName]) {
          componentFiles[componentName] = new Set();
        }
        // Зберігаємо лише шлях до файлу як рядок
        componentFiles[componentName].add(file.name);
      });

      // Додатковий дебаг для компонента Button
      if (uniqueComponentsInFile.has("Button")) {
        console.log(
          `Found Button component in ${file.name}, total matches: ${
            componentMatches.filter((name) => name === "Button").length
          }, unique: ${
            Array.from(uniqueComponentsInFile).filter(
              (name) => name === "Button"
            ).length
          }`
        );
      }
    });

    // Пошук циклічних залежностей
    const cycles = [];
    const visited = new Set();

    function findCycles(node, path = []) {
      if (path.includes(node)) {
        // Знайдено цикл
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart);
        // Перевіряємо, чи не знаходимо ми цей самий цикл, але в іншому порядку
        const cycleKey = [...cycle].sort().join("→");
        if (!visited.has(cycleKey)) {
          visited.add(cycleKey);
          cycles.push([...cycle, node]);
        }
        return;
      }

      if (dependencyGraph[node].isVisited) return;

      dependencyGraph[node].isVisited = true;
      dependencyGraph[node].isInPath = true;

      for (const neighbor of dependencyGraph[node].imports) {
        if (dependencyGraph[neighbor]) {
          findCycles(neighbor, [...path, node]);
        }
      }

      dependencyGraph[node].isInPath = false;
    }

    // Запускаємо пошук циклів для всіх вузлів
    Object.keys(dependencyGraph).forEach((node) => {
      if (!dependencyGraph[node].isVisited) {
        findCycles(node);
      }
    });

    // Знаходимо потенційні "god files" (файли з найбільшою кількістю імпортів)
    const godFiles = Object.entries(importCounts)
      .filter(([file, count]) => count > 5) // Файли з більш ніж 5 імпортами
      .sort((a, b) => b[1] - a[1])
      .map(([file, count]) => ({
        file: file.split("/").pop(),
        fullPath: file,
        imports: count,
      }));

    // Додатковий дебаг для компонента Button
    console.log("Button component usage:", componentUsage["Button"] || 0);
    console.log(
      "Button component files:",
      componentFiles["Button"] ? Array.from(componentFiles["Button"]) : "none"
    );

    // Знаходимо найбільш використовувані компоненти
    const mostUsedComponents = Object.entries(componentUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Топ-20 найбільш використовуваних компонентів
      .map(([name, count]) => {
        // Беремо перший зі знайдених шляхів до компонента (або null, якщо не знайдено)
        const filePath = componentFiles[name]
          ? Array.from(componentFiles[name])[0]
          : null;

        // Додатковий дебаг для компонента Button
        if (name === "Button") {
          console.log(`Button component: count=${count}, file=${filePath}`);
        }

        return {
          name,
          count,
          file: filePath,
        };
      });

    // Форматуємо цикли для виводу
    const formattedCycles = cycles.map((cycle) => {
      return cycle.map((file) => file.split("/").pop());
    });

    console.log("🔍 Found cycles:", formattedCycles.length);
    console.log("🏛️ Potential god files:", godFiles.length);
    console.log("🏆 Most used components:", mostUsedComponents.length);

    return {
      cyclicDependencies: formattedCycles,
      godFiles: godFiles.slice(0, 20), // Обмежуємо кількість для відображення
      mostUsedComponents: mostUsedComponents.slice(0, 20), // Обмежуємо кількість для відображення
    };
  },

  // Допоміжна функція для розв'язання шляху імпорту
  resolveImportPath: function (importPath, importer, files) {
    // Спрощений приклад - у реальному застосунку потрібно реалізувати повну логіку розв'язання шляхів
    const dirname = importer.substring(0, importer.lastIndexOf("/") + 1);

    // Спрощений варіант - шукаємо точний збіг
    const possiblePaths = [
      importPath,
      `${importPath}.js`,
      `${importPath}.jsx`,
      `${importPath}.ts`,
      `${importPath}.tsx`,
      `${importPath}/index.js`,
      `${importPath}/index.jsx`,
      `${importPath}/index.ts`,
      `${importPath}/index.tsx`,
      `${dirname}${importPath}`,
      `${dirname}${importPath}.js`,
      `${dirname}${importPath}.jsx`,
      `${dirname}${importPath}.ts`,
      `${dirname}${importPath}.tsx`,
      `${dirname}${importPath}/index.js`,
      `${dirname}${importPath}/index.jsx`,
      `${dirname}${importPath}/index.ts`,
      `${dirname}${importPath}/index.tsx`,
    ];

    // Шукаємо перший існуючий файл
    for (const path of possiblePaths) {
      if (files.some((f) => f.name === path)) {
        return path;
      }
    }

    return null;
  },
};
