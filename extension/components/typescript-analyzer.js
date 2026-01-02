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
};
