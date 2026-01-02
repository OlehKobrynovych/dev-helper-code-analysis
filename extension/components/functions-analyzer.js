// Functions Analyzer
window.FunctionsAnalyzer = {
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
};
