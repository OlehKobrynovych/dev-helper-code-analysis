// CSS Classes Analyzer
window.CSSAnalyzer = {
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
};
