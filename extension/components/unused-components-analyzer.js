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
      const isLayoutFile =
        file.name.includes("/layout.") || file.name.includes("\\layout.");

      // Перевіряємо чи файл містить 'use client' або 'use server' директиви
      const isClientComponent = /['"]use client['"]/.test(content);
      const isServerComponent = /['"]use server['"]/.test(content);

      // function Component() або const Component = () => або const Component = function()
      const componentMatches = content.matchAll(
        /(?:export\s+)?(?:const|function|class)\s+([A-Z][a-zA-Z0-9_$]*)\s*[=\(<:{]/g
      );

      for (const match of componentMatches) {
        const componentName = match[1];
        const matchIndex = match.index;

        // Отримуємо контекст навколо оголошення (300 символів після для кращого аналізу)
        const contextAfter = content.substring(matchIndex, matchIndex + 300);

        // Перевіряємо чи це React компонент:
        // 1. Функція з return JSX: return <div> або return (<div>
        // 2. Arrow function з JSX: = () => <div> або = () => (<div>
        // 3. Функція з React.createElement
        // 4. Класовий компонент
        // 5. memo() wrapped component
        // 6. forwardRef() wrapped component
        // 7. lazy() wrapped component
        // 8. dynamic() wrapped component (Next.js)
        const isComponent =
          /=\s*\([^)]*\)\s*=>\s*[<(]?\s*[<{]/.test(contextAfter) || // Arrow function з JSX
          /function[^{]*\{[^}]*return\s*[<(]/.test(contextAfter) || // Function з return JSX
          /class\s+\w+\s+extends\s+\w*Component\s*\{/.test(contextAfter) || // Class component
          /React\.createElement/.test(contextAfter) || // React.createElement
          /jsx\(/.test(contextAfter) || // jsx() runtime
          /export\s+default\s+function/.test(contextAfter) || // Default export function
          /export\s+default\s+[A-Z]/.test(contextAfter) || // Default export component
          /=\s*(?:React\.)?memo\s*\(/.test(contextAfter) || // memo(Component)
          /=\s*(?:React\.)?forwardRef\s*\(/.test(contextAfter) || // forwardRef((props, ref) => ...)
          /=\s*(?:React\.)?lazy\s*\(/.test(contextAfter) || // lazy(() => import(...))
          /=\s*dynamic\s*\(/.test(contextAfter); // Next.js dynamic(() => import(...))

        // Виключаємо константи (всі літери великі + підкреслення)
        const isConstant = /^[A-Z][A-Z0-9_]*$/.test(componentName);

        // Виключаємо константи які присвоюються примітивним значенням або об'єктам
        const isPrimitiveAssignment =
          /=\s*['"`]/.test(contextAfter) || // Рядок
          /=\s*\d/.test(contextAfter) || // Число
          /=\s*\{[^}]*:/.test(contextAfter) || // Об'єкт з властивостями
          /=\s*\[/.test(contextAfter) || // Масив
          /=\s*(?:true|false|null|undefined)\b/.test(contextAfter); // Boolean/null/undefined

        // Не додаємо компоненти з файлів сторінок/layouts до списку невикористаних
        if (
          isComponent &&
          !isConstant &&
          !isPrimitiveAssignment &&
          !isPageFile &&
          !isLayoutFile
        ) {
          allComponents.set(componentName, {
            location: file.name,
            isClientComponent: isClientComponent,
            isServerComponent: isServerComponent,
            isMemo: /=\s*(?:React\.)?memo\s*\(/.test(contextAfter),
            isForwardRef: /=\s*(?:React\.)?forwardRef\s*\(/.test(contextAfter),
            isLazy: /=\s*(?:React\.)?lazy\s*\(/.test(contextAfter),
            isDynamic: /=\s*dynamic\s*\(/.test(contextAfter),
          });
        }
      }

      // Додатково шукаємо компоненти через memo/forwardRef/lazy на верхньому рівні
      // const MemoComponent = memo(function() { ... })
      // const LazyComponent = lazy(() => import('./Component'))
      // const DynamicComponent = dynamic(() => import('./Component'))
      this._findWrappedComponents(content, file.name, allComponents);
    });

    // Перевіряємо використання компонентів через lazy/dynamic imports
    this._findLazyDynamicUsage(jsFiles, usedComponents);

    // Перевіряємо використання компонентів
    this._checkComponentUsage(jsFiles, allComponents, usedComponents);

    const unused = [];
    allComponents.forEach((data, componentName) => {
      if (!usedComponents.has(componentName)) {
        unused.push({
          name: componentName,
          location: data.location,
          isClientComponent: data.isClientComponent,
          isServerComponent: data.isServerComponent,
          isMemo: data.isMemo,
          isForwardRef: data.isForwardRef,
          isLazy: data.isLazy,
          isDynamic: data.isDynamic,
        });
      }
    });

    console.log("⚛️ Components:", allComponents.size, "Unused:", unused.length);
    console.log("Skipped page/layout components from being marked as unused");
    return { total: allComponents.size, unused };
  },

  // Знаходить компоненти, обгорнуті в memo/forwardRef/lazy
  _findWrappedComponents: function (content, fileName, allComponents) {
    // const MemoComponent = memo(SomeComponent)
    const memoMatches = content.matchAll(
      /(?:export\s+)?const\s+([A-Z][a-zA-Z0-9_$]*)\s*=\s*(?:React\.)?memo\s*\(\s*([A-Z][a-zA-Z0-9_$]*|function|\()/g
    );
    for (const match of memoMatches) {
      const componentName = match[1];
      if (!allComponents.has(componentName)) {
        allComponents.set(componentName, {
          location: fileName,
          isMemo: true,
        });
      }
    }

    // const ForwardRefComponent = forwardRef((props, ref) => ...)
    const forwardRefMatches = content.matchAll(
      /(?:export\s+)?const\s+([A-Z][a-zA-Z0-9_$]*)\s*=\s*(?:React\.)?forwardRef\s*\(/g
    );
    for (const match of forwardRefMatches) {
      const componentName = match[1];
      if (!allComponents.has(componentName)) {
        allComponents.set(componentName, {
          location: fileName,
          isForwardRef: true,
        });
      }
    }

    // const LazyComponent = lazy(() => import('./Component'))
    const lazyMatches = content.matchAll(
      /(?:export\s+)?const\s+([A-Z][a-zA-Z0-9_$]*)\s*=\s*(?:React\.)?lazy\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    );
    for (const match of lazyMatches) {
      const componentName = match[1];
      if (!allComponents.has(componentName)) {
        allComponents.set(componentName, {
          location: fileName,
          isLazy: true,
          importPath: match[2],
        });
      }
    }

    // const DynamicComponent = dynamic(() => import('./Component'))
    const dynamicMatches = content.matchAll(
      /(?:export\s+)?const\s+([A-Z][a-zA-Z0-9_$]*)\s*=\s*dynamic\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    );
    for (const match of dynamicMatches) {
      const componentName = match[1];
      if (!allComponents.has(componentName)) {
        allComponents.set(componentName, {
          location: fileName,
          isDynamic: true,
          importPath: match[2],
        });
      }
    }
  },

  // Перевіряє використання lazy/dynamic imports
  _findLazyDynamicUsage: function (jsFiles, usedComponents) {
    jsFiles.forEach((file) => {
      const content = file.content;

      // lazy(() => import('./ComponentName'))
      const lazyImports = content.matchAll(
        /(?:React\.)?lazy\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"`]\.?\.?\/([^/'"`)]+?)(?:\.(?:js|jsx|ts|tsx))?['"`]\s*\)/g
      );
      for (const match of lazyImports) {
        const importedName = match[1].split('/').pop();
        // Перетворюємо kebab-case або snake_case на PascalCase
        const componentName = importedName
          .split(/[-_]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
        usedComponents.add(componentName);
      }

      // dynamic(() => import('./ComponentName'))
      const dynamicImports = content.matchAll(
        /dynamic\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"`]\.?\.?\/([^/'"`)]+?)(?:\.(?:js|jsx|ts|tsx))?['"`]\s*\)/g
      );
      for (const match of dynamicImports) {
        const importedName = match[1].split('/').pop();
        const componentName = importedName
          .split(/[-_]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
        usedComponents.add(componentName);
      }
    });
  },

  // Перевіряє стандартне використання компонентів
  _checkComponentUsage: function (jsFiles, allComponents, usedComponents) {
    jsFiles.forEach((file) => {
      const content = file.content;

      allComponents.forEach((data, componentName) => {
        // Пропускаємо перевірку для поточного файлу
        const location = typeof data === 'string' ? data : data.location;
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
          new RegExp(`import\\s+${componentName}\\s+from\\s+['"]`).test(content)
        ) {
          usedComponents.add(componentName);
        }
        // Використання як компонент: component={ComponentName}
        else if (
          new RegExp(`component\\s*=\\s*\\{?\\s*${componentName}\\s*\\}?`).test(
            content
          )
        ) {
          usedComponents.add(componentName);
        }
        // Використання в масивах/об'єктах: [ComponentName] або { comp: ComponentName }
        else if (
          new RegExp(`[\\[{,]\\s*${componentName}\\s*[,\\]}]`).test(content)
        ) {
          usedComponents.add(componentName);
        }
        // render prop: render={() => <ComponentName />} або children={<ComponentName />}
        else if (
          new RegExp(`=\\s*\\{?\\s*<${componentName}`).test(content)
        ) {
          usedComponents.add(componentName);
        }
      });
    });
  },
};
