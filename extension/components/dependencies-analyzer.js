// Dependencies Analyzer
window.DependenciesAnalyzer = {
  analyzeDependencies: function (jsFiles) {
    // Об'єкт для зберігання графа залежностей
    const dependencyGraph = {};
    // Лічильник вихідних імпортів (скільки файлів імпортує ЦЕЙ файл) - для god files
    const outboundImports = {};
    // Лічильник вхідних імпортів (скільки файлів імпортують ЦЕЙ файл) - для hub files
    const inboundImports = {};
    // Лічильник використань компонентів (загальна кількість)
    const componentUsage = {};
    // Лічильник файлів де використовується компонент
    const componentFileCount = {};
    // Масив для зберігання шляхів до файлів компонентів
    const componentFiles = {};
    // Покращений регулярний вираз для пошуку імпортів (підтримує namespace, type imports, dynamic imports)
    const importRegex =
      /(?:import|export)(?:\s+type)?\s+(?:(?:{[^}]*}|[\w*]+(?:\s+as\s+\w+)?|\*\s+as\s+\w+)\s+from\s+)?['"`]([^'"`]+)['"`]|(?:require|import)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
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
      outboundImports[fileName] = 0;
      inboundImports[fileName] = 0;
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

        // Обробляємо як відносні шляхи, так і аліаси
        const importedFile = this.resolveImportPath(
          importPath,
          fileName,
          jsFiles
        );

        if (importedFile) {
          // Додаємо залежність у граф
          if (!dependencyGraph[fileName].imports.includes(importedFile)) {
            dependencyGraph[fileName].imports.push(importedFile);

            // Збільшуємо вихідний лічильник для файлу що імпортує
            outboundImports[fileName]++;

            // Збільшуємо вхідний лічильник для імпортованого файлу
            inboundImports[importedFile] = (inboundImports[importedFile] || 0) + 1;

            // Додаємо зворотне посилання
            if (dependencyGraph[importedFile]) {
              dependencyGraph[importedFile].importedBy.push(fileName);
            }
          }
        }
      }

      // Шукаємо використання компонентів
      const componentMatches = [];
      let componentMatch;

      // Скидаємо lastIndex для глобального регулярного виразу
      componentUsageRegex.lastIndex = 0;

      // Збираємо всі збіги
      while ((componentMatch = componentUsageRegex.exec(content)) !== null) {
        const componentName = componentMatch[1];
        componentMatches.push(componentName);

        // Рахуємо КОЖНЕ використання компонента
        componentUsage[componentName] = (componentUsage[componentName] || 0) + 1;

        // Зберігаємо шлях до файлу, де знаходиться компонент
        if (!componentFiles[componentName]) {
          componentFiles[componentName] = new Set();
        }
        componentFiles[componentName].add(file.name);
      }

      // Рахуємо унікальні компоненти в цьому файлі для fileCount
      const uniqueComponentsInFile = new Set(componentMatches);
      uniqueComponentsInFile.forEach((componentName) => {
        componentFileCount[componentName] = (componentFileCount[componentName] || 0) + 1;
      });
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

    // Знаходимо "god files" (файли які імпортують багато інших файлів)
    const godFiles = Object.entries(outboundImports)
      .filter(([file, count]) => count > 5) // Файли які імпортують більше 5 інших файлів
      .sort((a, b) => b[1] - a[1])
      .map(([file, count]) => ({
        file: file.split("/").pop(),
        fullPath: file,
        imports: count,
      }));

    // Знаходимо "hub files" (файли які часто імпортуються іншими)
    const hubFiles = Object.entries(inboundImports)
      .filter(([file, count]) => count > 5) // Файли які імпортуються більше 5 разів
      .sort((a, b) => b[1] - a[1])
      .map(([file, count]) => ({
        file: file.split("/").pop(),
        fullPath: file,
        importedBy: count,
      }));

    // Знаходимо найбільш використовувані компоненти
    const mostUsedComponents = Object.entries(componentUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Топ-20 найбільш використовуваних компонентів
      .map(([name, totalCount]) => {
        // Беремо перший зі знайдених шляхів до компонента (або null, якщо не знайдено)
        const filePath = componentFiles[name]
          ? Array.from(componentFiles[name])[0]
          : null;

        return {
          name,
          totalCount,                                // Загальна кількість використань
          fileCount: componentFileCount[name] || 0,  // Кількість файлів де використовується
          file: filePath,
        };
      });

    // Форматуємо цикли для виводу
    const formattedCycles = cycles.map((cycle) => {
      return cycle.map((file) => file.split("/").pop());
    });

    console.log("🔍 Found cycles:", formattedCycles.length);
    console.log("🏛️ God files (high outbound imports):", godFiles.length);
    console.log("🌟 Hub files (high inbound imports):", hubFiles.length);
    console.log("🏆 Most used components:", mostUsedComponents.length);

    return {
      cyclicDependencies: formattedCycles,
      godFiles: godFiles.slice(0, 20), // Обмежуємо кількість для відображення
      hubFiles: hubFiles.slice(0, 20), // Обмежуємо кількість для відображення
      mostUsedComponents: mostUsedComponents, // Вже обмежено до 20
    };
  },

  // Допоміжна функція для розв'язання шляху імпорту
  resolveImportPath: function (importPath, importer, files) {
    let resolvedPath = importPath;

    // 1. ОБРОБКА PATH ALIASES
    const aliases = {
      '@/': '',           // @/lib/utils → lib/utils
      '~/': '',           // ~/components → components
      '@components/': 'components/',
      '@lib/': 'lib/',
      '@utils/': 'utils/',
      '@src/': 'src/',
      '@/src/': 'src/',
    };

    // Перевіряємо чи використовується аліас
    for (const [alias, replacement] of Object.entries(aliases)) {
      if (importPath.startsWith(alias)) {
        resolvedPath = importPath.replace(alias, replacement);
        break;
      }
    }

    // 2. ПОШУК З КОРЕНЯ ПРОЕКТУ для аліасів
    if (importPath !== resolvedPath) {
      const possibleAliasedPaths = [
        resolvedPath,
        `${resolvedPath}.js`,
        `${resolvedPath}.jsx`,
        `${resolvedPath}.ts`,
        `${resolvedPath}.tsx`,
        `${resolvedPath}/index.js`,
        `${resolvedPath}/index.jsx`,
        `${resolvedPath}/index.ts`,
        `${resolvedPath}/index.tsx`,
      ];

      for (const path of possibleAliasedPaths) {
        const found = files.find(f => f.name === path || f.name.endsWith('/' + path));
        if (found) return found.name;
      }
    }

    // 3. ОБРОБКА ВІДНОСНИХ ШЛЯХІВ (існуюча логіка)
    // Пропускаємо зовнішні залежності (node_modules)
    if (!importPath.startsWith(".") && !importPath.startsWith("/") && importPath === resolvedPath) {
      return null; // Зовнішня залежність
    }

    const dirname = importer.substring(0, importer.lastIndexOf("/") + 1);

    // Шукаємо точний збіг для відносних шляхів
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
