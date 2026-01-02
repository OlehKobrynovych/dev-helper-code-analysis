// Unused Hooks Analyzer
window.UnusedHooksAnalyzer = {
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
};
