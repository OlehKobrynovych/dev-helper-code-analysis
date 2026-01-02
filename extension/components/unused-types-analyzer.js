// Unused Types Analyzer
window.UnusedTypesAnalyzer = {
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
};
