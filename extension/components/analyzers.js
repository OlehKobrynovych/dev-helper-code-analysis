// Analyzers - всі функції аналізу коду
window.Analyzers = {
  analyzeCSSClasses: function (cssFiles, jsFiles) {
    const allClasses = new Set();
    const classLocations = {};

    cssFiles.forEach(function (file) {
      // 1. Звичайні CSS класи: .className {
      const matches = file.content.matchAll(
        /\.([a-zA-Z_][a-zA-Z0-9_-]*)\s*\{/g
      );
      for (const match of matches) {
        const className = "." + match[1];
        allClasses.add(className);
        if (!classLocations[className]) classLocations[className] = [];
        classLocations[className].push(file.name);
      }

      // 2. SCSS вкладені класи: &.className {
      const nestedMatches = file.content.matchAll(
        /&\.([a-zA-Z_][a-zA-Z0-9_-]*)\s*\{/g
      );
      for (const match of nestedMatches) {
        const className = "." + match[1];
        allClasses.add(className);
        if (!classLocations[className]) classLocations[className] = [];
        classLocations[className].push(file.name);
      }

      // Логування для дебагу
      if (
        file.name.includes("test") ||
        file.content.includes("header-test") ||
        file.content.includes("minimal")
      ) {
        console.log("🔍 CSS file:", file.name);
        if (file.content.includes("minimal")) {
          console.log("🔍 Contains 'minimal' class");
        }
      }
    });

    const usedClasses = new Set();
    jsFiles.forEach(function (file) {
      const content = file.content;

      // 1. Звичайні класи: className="header"
      const classNameMatches = content.matchAll(
        /className\s*=\s*["']([^"']+)["']/g
      );
      for (const match of classNameMatches) {
        match[1].split(/\s+/).forEach((cls) => {
          if (cls) {
            usedClasses.add("." + cls);
            if (cls.includes("test")) {
              console.log("🔍 Found used class:", cls, "in", file.name);
            }
          }
        });
      }

      // 2. HTML класи: class="header"
      const classMatches = content.matchAll(/class\s*=\s*["']([^"']+)["']/g);
      for (const match of classMatches) {
        match[1].split(/\s+/).forEach((cls) => {
          if (cls) {
            usedClasses.add("." + cls);
            if (cls.includes("test")) {
              console.log("🔍 Found used class (HTML):", cls, "in", file.name);
            }
          }
        });
      }

      // 3. CSS Modules: styles.header або className={styles.header}
      const cssModuleMatches = content.matchAll(
        /(?:styles|css|classes)\.([a-zA-Z_][a-zA-Z0-9_-]*)/g
      );
      for (const match of cssModuleMatches) {
        usedClasses.add("." + match[1]);
        if (match[1].includes("test")) {
          console.log("🔍 Found CSS Module class:", match[1], "in", file.name);
        }
      }

      // 4. Рядкові літерали в коді: "minimal", 'compact' (можуть бути назви класів)
      // Шукаємо в об'єктах типу baseStyles = { minimal: "...", compact: "..." }
      const stringLiteralMatches = content.matchAll(
        /["']([a-zA-Z_][a-zA-Z0-9_-]*)["']\s*:/g
      );
      for (const match of stringLiteralMatches) {
        usedClasses.add("." + match[1]);
        if (match[1] === "minimal" || match[1].includes("test")) {
          console.log(
            "🔍 Found string literal class:",
            match[1],
            "in",
            file.name
          );
        }
      }

      // 5. Динамічні класи через змінні: baseStyles[variant]
      // Якщо є об'єкт з ключами, всі ключі вважаємо використаними
      if (
        content.includes("baseStyles") ||
        content.includes("disclaimerTexts")
      ) {
        const objectKeyMatches = content.matchAll(
          /\{\s*([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/g
        );
        for (const match of objectKeyMatches) {
          usedClasses.add("." + match[1]);
          if (match[1] === "minimal" || match[1].includes("test")) {
            console.log(
              "🔍 Found object key class:",
              match[1],
              "in",
              file.name
            );
          }
        }
      }
    });

    const unused = [];
    allClasses.forEach(function (className) {
      if (!usedClasses.has(className)) {
        // Логування для дебагу
        if (className === ".minimal") {
          console.log("❌ .minimal marked as UNUSED");
          console.log(
            "All used classes:",
            Array.from(usedClasses).filter((c) => c.includes("minimal"))
          );
        }
        unused.push({
          name: className,
          location: classLocations[className][0],
        });
      }
    });

    console.log(
      "🎨 CSS: Total",
      allClasses.size,
      "Used",
      usedClasses.size,
      "Unused",
      unused.length
    );
    return { total: allClasses.size, unused: unused };
  },

  analyzeFunctions: function (jsFiles) {
    const allFunctions = new Map();
    const usedFunctions = new Set();

    jsFiles.forEach(function (file) {
      const content = file.content;

      const funcMatches = content.matchAll(
        /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
      );
      for (const match of funcMatches) {
        allFunctions.set(match[1], file.name);
      }

      const constFuncMatches = content.matchAll(
        /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/g
      );
      for (const match of constFuncMatches) {
        allFunctions.set(match[1], file.name);
      }

      const exportFuncMatches = content.matchAll(
        /export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
      );
      for (const match of exportFuncMatches) {
        allFunctions.set(match[1], file.name);
      }
    });

    console.log("⚡ Found", allFunctions.size, "functions");

    jsFiles.forEach(function (file) {
      const content = file.content;

      allFunctions.forEach(function (location, funcName) {
        // Пропускаємо Next.js сторінки (page.js/tsx) та default експорти
        const isNextPage = location.match(/\/page\.(js|jsx|ts|tsx)$/);
        const isDefaultExport = new RegExp(
          "export\\s+default\\s+" + funcName
        ).test(content);

        if (isNextPage || isDefaultExport) {
          usedFunctions.add(funcName);
          return;
        }

        // Перевірка JSX компонента: <ComponentName або <ComponentName/>
        if (new RegExp("<" + funcName + "(?:\\s|/|>)").test(content)) {
          usedFunctions.add(funcName);
        }
        // Виклик функції: funcName(
        else if (new RegExp("\\b" + funcName + "\\s*\\(").test(content)) {
          usedFunctions.add(funcName);
        }
        // Передача як пропс: ={funcName}
        else if (new RegExp("=\\{\\s*" + funcName + "\\s*\\}").test(content)) {
          usedFunctions.add(funcName);
        }
        // В хуках: useEffect(() => funcName
        else if (
          new RegExp(
            "use(?:Effect|Callback|Memo)[^}]*\\b" + funcName + "\\b"
          ).test(content)
        ) {
          usedFunctions.add(funcName);
        }
        // Імпорт: import { funcName }
        else if (
          new RegExp("import\\s*\\{[^}]*\\b" + funcName + "\\b").test(content)
        ) {
          usedFunctions.add(funcName);
        }
        // Експорт: export { funcName }
        else if (
          new RegExp("export\\s*\\{[^}]*\\b" + funcName + "\\b").test(content)
        ) {
          usedFunctions.add(funcName);
        }
      });
    });

    console.log("⚡ Used", usedFunctions.size, "functions");

    const unused = [];

    // Список популярних бібліотечних функцій для фільтрації
    const libraryFunctions = new Set([
      "$",
      "jQuery",
      "after",
      "before",
      "append",
      "prepend",
      "remove",
      "hide",
      "show",
      "$t",
      "$i18n",
      "$router",
      "$store",
      "$emit",
      "$on",
      "$off",
      "require",
      "define",
      "module",
      "exports",
      "$d",
      "$f",
      "$s",
      "$c",
      "$v",
      "$e",
      "$a",
      "$b",
      "$g",
      "$h",
      "$j",
      "$k",
      "$l",
      "$m",
      "$n",
      "$o",
      "$p",
      "$q",
      "$r",
      "$u",
      "$w",
      "$x",
      "$y",
      "$z",
    ]);

    allFunctions.forEach(function (location, funcName) {
      // Фільтруємо бібліотечні функції
      if (libraryFunctions.has(funcName)) {
        return;
      }

      // Фільтруємо функції з 1-2 символів (часто це бібліотеки)
      if (funcName.length <= 2) {
        return;
      }

      // Фільтруємо функції з node_modules
      if (location.includes("node_modules")) {
        return;
      }

      if (!usedFunctions.has(funcName)) {
        unused.push({ name: funcName, location: location });
      }
    });

    console.log("⚡ Unused", unused.length, "functions");
    return { total: allFunctions.size, unused: unused };
  },

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

  analyzeImages: function (imageFiles, jsFiles, cssFiles, htmlFiles = []) {
    const allImages = [];
    const usedImages = new Set();

    // Збираємо всі зображення з різними варіантами шляхів
    imageFiles.forEach(function (file) {
      const fileName = file.name.split("/").pop();
      const relativePath = file.name;

      allImages.push({
        name: fileName,
        path: relativePath,
        // Додаткові варіанти для пошуку
        searchVariants: window.Utils.generateSearchVariants(
          fileName,
          relativePath
        ),
      });
    });

    console.log("🖼️ Found", allImages.length, "images");

    // Об'єднуємо контент з усіх файлів
    const allFiles = [...jsFiles, ...cssFiles, ...htmlFiles];
    const allContent = allFiles.map((f) => f.content || "").join(" ");

    // Покращений пошук використання зображень
    allImages.forEach(function (img) {
      // Перевіряємо всі можливі варіанти посилання на зображення
      const isUsed = img.searchVariants.some((variant) => {
        // Перевірка з урахуванням можливих кавичок, дужок тощо
        const patterns = [
          variant, // exact match
          `"${variant}"`, // в подвійних лапках
          `'${variant}'`, // в одинарних лапках
          `\`${variant}\``, // в бектіках
          `(${variant})`, // в дужках (CSS url)
          `/${variant}`, // з слешем
          variant.replace(/\\/g, "/"), // заміна бекслешів
        ];

        return patterns.some((pattern) => allContent.includes(pattern));
      });

      if (isUsed) {
        usedImages.add(img.name);
      }
    });

    console.log("🖼️ Used", usedImages.size, "images");

    const unused = allImages.filter((img) => !usedImages.has(img.name));
    console.log("🖼️ Unused", unused.length, "images");

    return {
      total: allImages.length,
      unused: unused,
      used: usedImages.size,
      unusedDetails: unused.map((img) => ({ name: img.name, path: img.path })),
    };
  },

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

  analyzeFileTypes: function (files) {
    const fileTypes = {};

    files.forEach(function (file) {
      if (file.name.includes("node_modules/")) return;
      if (file.name.includes(".git/")) return;

      const ext = file.name.split(".").pop();
      if (ext && ext.length < 10) {
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }
    });

    return fileTypes;
  },

  analyzeTypeScriptTypes: function (files) {
    const typeDefinitions = [];
    const typeDependencies = {};

    // Simple regex-based type parser that works in browser
    files.forEach((file) => {
      if (!file.name.match(/\.(ts|tsx|js|jsx|mjs|cjs)$/i)) return;

      const content = file.content;
      const lines = content.split("\n");
      let currentIndex = 0;

      // Match both exported and non-exported interfaces and types
      const typePatterns = [
        // Interface pattern
        /(?:export\s+)?(?:declare\s+)?interface\s+([a-zA-Z_$][\w$]*)\s*(?:<[^>]*>)?\s*{([\s\S]*?)^\s*}(?=\n|$)/gm,
        // Type pattern
        /(?:export\s+)?(?:declare\s+)?type\s+([a-zA-Z_$][\w$]*)\s*(?:<[^>]*>)?\s*=\s*([^;{]+?(?:\s*{[^}]*})?);/gms,
      ];

      typePatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const [fullMatch, typeName, typeBody] = match;
          const isInterface = fullMatch.includes("interface");
          const lineNumber =
            (content.substring(0, match.index).match(/\n/g) || []).length + 1;

          // Extract dependencies
          const dependencies = new Set();
          const typeRefs =
            fullMatch.match(
              /[{\s]([A-Z][a-zA-Z0-9_$]*)(?:<[^>]*>)?(?:\[\])?[,\s;:})]/g
            ) || [];

          typeRefs.forEach((ref) => {
            const depName = ref.replace(/[^a-zA-Z0-9_$]/g, "");
            if (
              depName &&
              depName !== typeName &&
              ![
                "string",
                "number",
                "boolean",
                "any",
                "void",
                "null",
                "undefined",
                "never",
                "unknown",
              ].includes(depName)
            ) {
              dependencies.add(depName);
            }
          });

          typeDefinitions.push({
            name: typeName,
            file: file.name,
            line: lineNumber,
            type: isInterface ? "interface" : "type",
            content: fullMatch.trim(),
            dependencies: Array.from(dependencies).map((name) => ({
              name,
              file: file.name,
            })),
          });
        }
      });
    });

    // Group by file for better organization
    const byFile = {};
    typeDefinitions.forEach((typeDef) => {
      if (!byFile[typeDef.file]) {
        byFile[typeDef.file] = [];
      }
      byFile[typeDef.file].push(typeDef);
    });

    return {
      allTypes: typeDefinitions,
      byFile,
      stats: {
        totalTypes: typeDefinitions.length,
        totalInterfaces: typeDefinitions.filter((t) => t.type === "interface")
          .length,
        totalTypeAliases: typeDefinitions.filter((t) => t.type === "type")
          .length,
        filesWithTypes: Object.keys(byFile).length,
      },
    };
  },

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

  // Аналіз невикористаних експортів
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

  // Аналіз невикористаних React компонентів
  analyzeUnusedComponents: function (jsFiles) {
    const allComponents = new Map();
    const usedComponents = new Set();

    // Збираємо всі компоненти (починаються з великої літери)
    jsFiles.forEach((file) => {
      const content = file.content;
      const isPageFile =
        file.name.includes("/page.") || file.name.includes("\\page.");

      // function Component() або const Component = () => або const Component = function()
      const componentMatches = content.matchAll(
        /(?:export\s+)?(?:const|function|class)\s+([A-Z][a-zA-Z0-9_$]*)\s*[=\(<:{]/g
      );

      for (const match of componentMatches) {
        const componentName = match[1];
        const matchIndex = match.index;

        // Отримуємо контекст навколо оголошення (100 символів після)
        const contextAfter = content.substring(matchIndex, matchIndex + 200);

        // Перевіряємо чи це React компонент:
        // 1. Функція з return JSX: return <div> або return (<div>
        // 2. Arrow function з JSX: = () => <div> або = () => (<div>
        // 3. Функція з React.createElement
        // 4. Класовий компонент
        const isComponent =
          /=\s*\([^)]*\)\s*=>\s*[<(]?\s*[<{]/.test(contextAfter) || // Arrow function з JSX
          /function[^{]*\{[^}]*return\s*[<(]/.test(contextAfter) || // Function з return JSX
          /class\s+\w+\s+extends\s+\w*Component\s*\{/.test(contextAfter) || // Class component
          /React\.createElement/.test(contextAfter) || // React.createElement
          /jsx\(/.test(contextAfter) || // jsx() runtime
          /export\s+default\s+function/.test(contextAfter) || // Default export function
          /export\s+default\s+[A-Z]/.test(contextAfter); // Default export component

        // Виключаємо константи (всі літери великі + підкреслення)
        const isConstant = /^[A-Z][A-Z0-9_]*$/.test(componentName);

        // Виключаємо константи які присвоюються примітивним значенням або об'єктам
        const isPrimitiveAssignment =
          /=\s*['"`]/.test(contextAfter) || // Рядок
          /=\s*\d/.test(contextAfter) || // Число
          /=\s*\{[^}]*:/.test(contextAfter) || // Об'єкт з властивостями
          /=\s*\[/.test(contextAfter) || // Масив
          /=\s*(?:true|false|null|undefined)\b/.test(contextAfter); // Boolean/null/undefined

        // Не додаємо компоненти з файлів сторінок до списку невикористаних
        if (
          isComponent &&
          !isConstant &&
          !isPrimitiveAssignment &&
          !isPageFile
        ) {
          allComponents.set(componentName, file.name);
        }
      }
    });

    // Перевіряємо використання компонентів
    jsFiles.forEach((file) => {
      const content = file.content;

      allComponents.forEach((location, componentName) => {
        // Пропускаємо перевірку для поточного файлу, щоб уникнути фальшивих спрацьовувань
        if (location === file.name) return;

        // <ComponentName або <ComponentName/>
        if (new RegExp(`<${componentName}(?:\\s|/|>)`).test(content)) {
          usedComponents.add(componentName);
        }
        // import { ComponentName }
        else if (
          new RegExp(`import\\s*\\{[^}]*\\b${componentName}\\b`).test(content)
        ) {
          usedComponents.add(componentName);
        }
        // import ComponentName from './ComponentName'
        else if (
          new RegExp(`import\\s+${componentName}\\s+from\s+['"]`).test(content)
        ) {
          usedComponents.add(componentName);
        }
        // Використання як компонент: component={ComponentName}
        else if (
          new RegExp(`component\s*=\s*\{?\s*${componentName}\s*\}?`).test(
            content
          )
        ) {
          usedComponents.add(componentName);
        }
      });
    });

    const unused = [];
    allComponents.forEach((location, componentName) => {
      if (!usedComponents.has(componentName)) {
        unused.push({ name: componentName, location });
      }
    });

    console.log("⚛️ Components:", allComponents.size, "Unused:", unused.length);
    console.log("Skipped page components from being marked as unused");
    return { total: allComponents.size, unused };
  },

  // Аналіз невикористаних хуків
  analyzeUnusedHooks: function (jsFiles) {
    const allHooks = new Map();
    const usedHooks = new Set();

    // Збираємо всі хуки (починаються з use)
    jsFiles.forEach((file) => {
      const content = file.content;

      // const useHook = () => або function useHook()
      const hookMatches = content.matchAll(
        /(?:export\s+)?(?:const|function)\s+(use[A-Z][a-zA-Z0-9_$]*)\s*[=\(]/g
      );
      for (const match of hookMatches) {
        allHooks.set(match[1], file.name);
      }
    });

    // Перевіряємо використання
    jsFiles.forEach((file) => {
      const content = file.content;

      allHooks.forEach((location, hookName) => {
        // const data = useHook()
        if (new RegExp(`\\b${hookName}\\s*\\(`).test(content)) {
          usedHooks.add(hookName);
        }
        // import { useHook }
        else if (
          new RegExp(`import\\s*\\{[^}]*\\b${hookName}\\b`).test(content)
        ) {
          usedHooks.add(hookName);
        }
      });
    });

    const unused = [];
    allHooks.forEach((location, hookName) => {
      if (!usedHooks.has(hookName)) {
        unused.push({ name: hookName, location });
      }
    });

    console.log("🪝 Hooks:", allHooks.size, "Unused:", unused.length);
    return { total: allHooks.size, unused };
  },

  // Аналіз невикористаних енумів та інтерфейсів
  analyzeUnusedEnumsInterfaces: function (jsFiles) {
    const allTypes = new Map();
    const usedTypes = new Set();
    const typeDefinitions = new Map(); // Зберігаємо повні визначення типів

    // Збираємо всі enum та interface з їх визначеннями
    jsFiles.forEach((file) => {
      const content = file.content;

      // enum Name
      const enumMatches = content.matchAll(
        /(?:export\s+)?enum\s+([A-Z][a-zA-Z0-9_$]*)/g
      );
      for (const match of enumMatches) {
        allTypes.set(match[1], { location: file.name, type: "enum" });
      }

      // interface Name
      const interfaceMatches = content.matchAll(
        /(?:export\s+)?interface\s+([A-Z][a-zA-Z0-9_$]*)/g
      );
      for (const match of interfaceMatches) {
        allTypes.set(match[1], { location: file.name, type: "interface" });
      }

      // type Name = ... (зберігаємо визначення)
      const typeMatches = content.matchAll(
        /(?:export\s+)?type\s+([A-Z][a-zA-Z0-9_$]*)\s*=\s*([^;]+);/g
      );
      for (const match of typeMatches) {
        const typeName = match[1];
        const typeDefinition = match[2];
        allTypes.set(typeName, { location: file.name, type: "type" });
        typeDefinitions.set(typeName, typeDefinition);
      }
    });

    // Перевіряємо використання в коді
    jsFiles.forEach((file) => {
      const content = file.content;

      allTypes.forEach((info, typeName) => {
        // Використання в типах: : TypeName або <TypeName>
        if (new RegExp(`[:<]\\s*${typeName}\\b`).test(content)) {
          usedTypes.add(typeName);
        }
        // Використання в дженериках: TypeName<...> або Array<TypeName>
        else if (new RegExp(`\\b${typeName}\\s*<`).test(content)) {
          usedTypes.add(typeName);
        }
        // Використання в масивах: TypeName[]
        else if (new RegExp(`\\b${typeName}\\s*\\[`).test(content)) {
          usedTypes.add(typeName);
        }
        // import { TypeName }
        else if (
          new RegExp(`import\\s*\\{[^}]*\\b${typeName}\\b`).test(content)
        ) {
          usedTypes.add(typeName);
        }
        // Використання в union/intersection: Type1 | Type2 або Type1 & Type2
        else if (
          new RegExp(`[|&]\\s*${typeName}\\b`).test(content) ||
          new RegExp(`\\b${typeName}\\s*[|&]`).test(content)
        ) {
          usedTypes.add(typeName);
        }
        // Використання як значення (для enum)
        else if (
          info.type === "enum" &&
          new RegExp(`\\b${typeName}\\.`).test(content)
        ) {
          usedTypes.add(typeName);
        }
      });
    });

    // Перевіряємо залежності між типами (type User = TUser | TAdmin)
    typeDefinitions.forEach((definition, typeName) => {
      // Якщо цей тип використовується, позначаємо всі типи в його визначенні як використані
      if (usedTypes.has(typeName)) {
        allTypes.forEach((info, otherTypeName) => {
          // Шукаємо інші типи в визначенні
          if (new RegExp(`\\b${otherTypeName}\\b`).test(definition)) {
            usedTypes.add(otherTypeName);
          }
        });
      }
    });

    // Повторюємо перевірку залежностей (для ланцюжків залежностей)
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 10) {
      changed = false;
      iterations++;

      typeDefinitions.forEach((definition, typeName) => {
        if (usedTypes.has(typeName)) {
          allTypes.forEach((info, otherTypeName) => {
            if (
              !usedTypes.has(otherTypeName) &&
              new RegExp(`\\b${otherTypeName}\\b`).test(definition)
            ) {
              usedTypes.add(otherTypeName);
              changed = true;
            }
          });
        }
      });
    }

    const unused = [];
    allTypes.forEach((info, typeName) => {
      if (!usedTypes.has(typeName)) {
        unused.push({
          name: typeName,
          location: info.location,
          type: info.type,
        });
      }
    });

    console.log("🔷 Types:", allTypes.size, "Unused:", unused.length);
    return { total: allTypes.size, unused };
  },

  // Аналіз невикористаних API ендпоінтів
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
