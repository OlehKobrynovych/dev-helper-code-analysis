// TypeScript Types Analyzer
window.TypeScriptAnalyzer = {
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
          // This regex will try to find words that start with an uppercase letter,
          // possibly followed by a generic part.
          // It captures the main type name in group 1, and the generic content in group 2.
          const typeRefs = fullMatch.match(
            /\b([A-Z][a-zA-Z0-9_$]*)(?:<([^>]+)>)?/g
          ) || [];

          typeRefs.forEach((ref) => {
            const matchGeneric = ref.match(/^([A-Z][a-zA-Z0-9_$]*)(?:<([^>]+)>)?$/);
            if (matchGeneric) {
              const mainTypeName = matchGeneric[1];
              const genericContent = matchGeneric[2];

              // Add the main type if it's not a primitive and not the type being defined
              if (
                mainTypeName &&
                mainTypeName !== typeName &&
                ![
                  "string", "number", "boolean", "any", "void", "null", "undefined",
                  "never", "unknown", "Array", "Partial", "Readonly", "Promise",
                  "Record" // Add common utility types that wrap other types
                ].includes(mainTypeName)
              ) {
                dependencies.add(mainTypeName);
              }

              // If it's a generic, extract the types within the angle brackets
              if (genericContent) {
                // Split by common type separators like commas, spaces, or pipes (|)
                // Also handle nested generics by recursively calling this logic if needed.
                // For simplicity here, I'll just split by comma and trim.
                const innerTypes = genericContent.split(/,|\s*\|\s*/).map(s => s.trim());
                innerTypes.forEach(innerType => {
                  // Recursively process inner types if they are also generics or compound types
                  // For now, a simple extraction of the base type name
                  const baseInnerTypeMatch = innerType.match(/\b([A-Z][a-zA-Z0-9_$]*)/);
                  if (baseInnerTypeMatch) {
                    const baseInnerTypeName = baseInnerTypeMatch[1];
                     if (
                      baseInnerTypeName &&
                      baseInnerTypeName !== typeName &&
                      ![
                        "string", "number", "boolean", "any", "void", "null", "undefined",
                        "never", "unknown", "Array", "Partial", "Readonly", "Promise",
                        "Record"
                      ].includes(baseInnerTypeName)
                    ) {
                      dependencies.add(baseInnerTypeName);
                    }
                  }
                });
              }
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
};
