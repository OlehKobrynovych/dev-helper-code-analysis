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

  analyzeProjectStyles: function (cssFiles) {
    const cssVariables = new Map();
    const fonts = new Map();
    const colors = new Map();

    const colorProperties = [
      "color",
      "background-color",
      "border-color",
      "border",
      "background",
      "fill",
      "stroke",
      "box-shadow",
      "text-shadow",
    ];
    const colorRegex = /(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\))/g;
    const variableRegex = /(--[\w-]+)\s*:\s*(.+?);/g;
    const fontFaceRegex = /@font-face\s*{[^}]+}/g;
    const fontFamilyPropertyRegex =
      /font-family\s*:\s*([^;]+?)(?:\s*!important)?\s*;/g; // Refined regex
    const propertyRegex = /([\w-]+)\s*:\s*([^;]+);/g;

    const libraryFilePatterns = [
      "bootstrap",
      "material",
      "font-awesome",
      "tailwind",
      "normalize",
      "reset",
      "reboot",
      "min.css",
      "bundle.css",
      "vendor",
    ];
    const genericFontFamilies = [
      "serif",
      "sans-serif",
      "monospace",
      "cursive",
      "fantasy",
      "system-ui",
      "initial",
      "inherit",
      "unset",
      "revert",
      "ui-sans-serif",
      "ui-monospace",
      "ui-rounded",
      "ui-serif",
      "emoji",
      "math",
      "fangsong",
      "system",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      "Arial",
      "Tahoma",
      "Verdana",
      "Times New Roman",
      "Georgia",
      "Courier New",
      "Lucida Console",
      "monospace",
      "sans",
      "sans-serif",
      "serif",
      "cursive",
      "fantasy",
      "monospace",
      "system-ui",
      "inherit",
      "initial",
      "unset",
      "revert",
      "ui-sans-serif",
      "ui-monospace",
      "ui-rounded",
      "ui-serif",
      "emoji",
      "math",
      "fangsong",
      "system",
    ];

    // Helper function to clean font names
    const cleanFontName = (name) => {
      // Remove quotes, extra spaces, and trim
      return name.replace(/^['"]|['"]$/g, "").trim();
    };

    // Helper function to check if a font is a system or generic font
    const isSystemOrGenericFont = (fontName) => {
      if (!fontName) return true;
      const cleanName = cleanFontName(fontName).toLowerCase();
      return (
        genericFontFamilies.includes(cleanName) ||
        cleanName.startsWith("var(") ||
        cleanName.startsWith("--") ||
        cleanName.includes("!important") ||
        cleanName === ""
      );
    };

    // Extract custom fonts from CSS content
    const extractFontsFromContent = (content) => {
        const fonts = new Set();

        // 1. Extract from @font-face declarations
        const fontFaceRegex = /@font-face\s*{([^}]+)}/gi;
        let fontFaceMatch;
        while ((fontFaceMatch = fontFaceRegex.exec(content)) !== null) {
            const fontFaceBlock = fontFaceMatch[1];
            const familyMatch = fontFaceBlock.match(/font-family\s*:\s*['"]([^'"]+)['"]/i);
            if (familyMatch) {
                const fontName = familyMatch[1].trim();
                if (fontName && !isSystemOrGenericFont(fontName)) {
                    fonts.add(fontName);
                }
            }
        }

        // 2. Extract from font-family properties (only first font in stack)
        const fontFamilyRegex = /font-family\s*:\s*([^;}]+)/gi;
        let fontFamilyMatch;
        while ((fontFamilyMatch = fontFamilyRegex.exec(content)) !== null) {
            const fontValue = fontFamilyMatch[1];

            // Split by comma and take only first font (primary font)
            const primaryFont = fontValue.split(',')[0]
                .trim()
                .replace(/^['"]|['"]$/g, '')
                .replace(/\s*!important$/, '')
                .trim();

            if (primaryFont && !isSystemOrGenericFont(primaryFont)) {
                fonts.add(primaryFont);
            }
        }

        return Array.from(fonts);
    };

    const isLibraryFile = (fileName) =>
      libraryFilePatterns.some((pattern) => fileName.includes(pattern));

    // Process all CSS files to extract fonts
    const allFonts = new Set();
    cssFiles.forEach(file => {
        const extractedFonts = extractFontsFromContent(file.content);
        extractedFonts.forEach(font => allFonts.add(font));
    });

    cssFiles.forEach((file) => {
      const content = file.content;
      const fromLibrary = isLibraryFile(file.name);

      // Extract CSS Variables (only from non-library files)
      if (!fromLibrary) {
        let varMatch;
        while ((varMatch = variableRegex.exec(content)) !== null) {
          const name = varMatch[1].trim();
          const value = varMatch[2].trim();
          if (!cssVariables.has(name)) {
            cssVariables.set(name, { value, files: new Set() });
          }
          cssVariables.get(name).files.add(file.name);
        }
      }

      // Extract Colors from specific properties
      let propMatch;
      while ((propMatch = propertyRegex.exec(content)) !== null) {
        const prop = propMatch[1].trim();
        const value = propMatch[2];

        if (colorProperties.includes(prop)) {
          let colorMatch;
          // Reset regex lastIndex for consistent matching from the start of the 'value' string
          colorRegex.lastIndex = 0;
          while ((colorMatch = colorRegex.exec(value)) !== null) {
            const color = colorMatch[0].toLowerCase();
            if (
              color !== "transparent" &&
              color !== "inherit" &&
              color !== "initial" &&
              color !== "currentcolor"
            ) {
              colors.set(color, (colors.get(color) || 0) + 1);
            }
          }
        }
      }
    });

    // Sort colors by frequency
    const sortedColors = Array.from(colors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map((entry) => ({ color: entry[0], count: entry[1] }));

    // Detect CSS frameworks from CSS content
    const frameworks = this._detectCSSFrameworksFromContent(cssFiles);

    return {
      variables: Array.from(cssVariables.entries()).map(([name, data]) => ({
        name,
        value: data.value,
        files: Array.from(data.files),
      })),
      fonts: Array.from(allFonts).sort((a, b) => a.localeCompare(b)),
      colors: sortedColors,
      frameworks: frameworks,
    };
  },

  _detectCSSFrameworksFromContent: function (cssFiles) {
    const result = {
      tailwind: false,
      bootstrap: false,
      bulma: false,
      foundation: false,
      cssModules: false,
      sass: false,
      less: false,
      styledComponents: false,
      cssInJs: false,
    };

    // Check for CSS Modules (by file naming pattern)
    result.cssModules = cssFiles.some((f) =>
      f.name.match(/\.module\.(css|scss|sass)$/)
    );

    // Check for Sass/SCSS
    result.sass = cssFiles.some((f) => f.name.match(/\.(scss|sass)$/));

    // Check for Less
    result.less = cssFiles.some((f) => f.name.match(/\.less$/));

    cssFiles.forEach((file) => {
      const content = file.content;
      const fileName = file.name.toLowerCase();

      // Tailwind CSS detection
      if (
        content.includes('@tailwind') ||
        content.includes('@apply') ||
        fileName.includes('tailwind')
      ) {
        result.tailwind = true;
      }

      // Bootstrap detection
      if (
        fileName.includes('bootstrap') ||
        content.includes('.container-fluid') ||
        content.includes('.row') && content.includes('.col-') ||
        content.includes('Bootstrap')
      ) {
        result.bootstrap = true;
      }

      // Bulma detection
      if (
        fileName.includes('bulma') ||
        content.includes('.is-') && content.includes('.has-') ||
        content.includes('Bulma')
      ) {
        result.bulma = true;
      }

      // Foundation detection
      if (
        fileName.includes('foundation') ||
        content.includes('.small-') && content.includes('.large-') ||
        content.includes('Foundation')
      ) {
        result.foundation = true;
      }
    });

    return result;
  },
};
