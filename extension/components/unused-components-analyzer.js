// Unused Components Analyzer
window.UnusedComponentsAnalyzer = {
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
};
