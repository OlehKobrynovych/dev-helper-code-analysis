// Візуалізатор залежностей компонентів (treemap)
(function () {
  window.ComponentDependenciesVisualizer = {
    analyze: function (files) {
      var componentMap = new Map();

      // Допоміжна функція для отримання імені компонента
      function getComponentName(path) {
        var parts = path.split("/");
        var filename = parts[parts.length - 1];
        return filename.replace(/\.(js|jsx|tsx|ts)$/, "");
      }

      // Path aliases для резолву
      var PATH_ALIASES = {
        "@/": "", // @ вказує на корінь проекту
      };

      // Резолв відносних імпортів до реальних файлів з підтримкою aliases
      function resolveImport(importPath, fromFile, fileIndex) {
        // Пропускаємо npm пакети (але не path aliases)
        if (
          !importPath.startsWith(".") &&
          !importPath.startsWith("/") &&
          !importPath.startsWith("@")
        ) {
          return null;
        }

        var normalized = importPath;

        // Обробка path aliases (@/ → корінь проекту)
        if (importPath.startsWith("@/")) {
          normalized = importPath.replace("@/", PATH_ALIASES["@/"]);
        }

        var base = fromFile.substring(0, fromFile.lastIndexOf("/"));

        // Резолвимо відносні шляхи
        if (normalized.startsWith(".")) {
          var parts = base.split("/");
          var importParts = normalized.split("/");

          for (var i = 0; i < importParts.length; i++) {
            if (importParts[i] === "..") {
              parts.pop();
            } else if (importParts[i] !== ".") {
              parts.push(importParts[i]);
            }
          }

          normalized = parts.join("/");
        }

        // Шукаємо файл серед можливих розширень
        var candidates = [
          normalized,
          normalized + ".tsx",
          normalized + ".ts",
          normalized + ".jsx",
          normalized + ".js",
          normalized + "/index.tsx",
          normalized + "/index.ts",
          normalized + "/index.jsx",
          normalized + "/index.js",
        ];

        for (var j = 0; j < candidates.length; j++) {
          if (fileIndex.has(candidates[j])) {
            // Debug успішного резолву
            if (importPath.startsWith("@/")) {
              console.log("✅ Resolved alias:", importPath, "→", candidates[j]);
            }
            return candidates[j];
          }
        }

        // Debug: не знайдено жодного кандидата
        if (importPath.startsWith("@/")) {
          console.warn(
            "🔍 Alias candidates checked:",
            importPath,
            "→",
            candidates.slice(0, 3)
          );
        }

        return null;
      }

      // Перевірка чи це barrel-файл (index.ts)
      function isBarrelFile(path) {
        return path.match(/\/index\.(js|jsx|ts|tsx)$/);
      }

      // Перевірка чи компонент використовується як JSX
      function isUsedAsJSX(content, componentName) {
        // Шукаємо <ComponentName або < ComponentName (з пробілом)
        var jsxRegex = new RegExp("<\\s*" + componentName + "(\\s|>|/)", "m");
        return jsxRegex.test(content);
      }

      // Перевірка чи файл є React компонентом
      function isReactComponent(fileContent, filePath) {
        if (!fileContent) return false;

        // 1. JSX синтаксис (теги з великої літери)
        if (/<[A-Z][A-Za-z0-9]*[\s>\/]/.test(fileContent)) return true;

        // 2. React.FC або FC типізація
        if (/React\.FC|FC\s*</.test(fileContent)) return true;

        // 3. Next.js page/layout файли
        if (filePath.match(/\/(page|layout)\.(tsx|jsx)$/)) return true;

        // 4. JSX розширення завжди компоненти
        if (filePath.match(/\.(jsx|tsx)$/)) return true;

        // 5. Hooks теж вважаємо частиною component tree
        if (filePath.match(/\/use[A-Z].*\.(ts|js)$/)) return true;

        // 6. Store файли
        if (filePath.match(/\/store\//i) || filePath.match(/Store\.(ts|js)$/))
          return true;

        return false;
      }

      // Парсинг імпортів з підтримкою dynamic import
      function getImports(content, filePath, fileIndex) {
        var imports = [];

        // Static imports: import Component from '...'
        var defaultImportRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
        var match;

        while ((match = defaultImportRegex.exec(content)) !== null) {
          var componentName = match[1];
          var importPath = match[2];

          var isExternalLib = [
            "react",
            "react-dom",
            "prop-types",
            "next",
            "@mui",
            "styled-components",
            "antd",
            "lodash",
            "axios",
            "classnames",
          ].some(function (lib) {
            return (
              importPath.startsWith(lib) || importPath.startsWith("@" + lib)
            );
          });

          var isStyleImport =
            importPath.endsWith(".css") ||
            importPath.endsWith(".scss") ||
            importPath.endsWith(".sass") ||
            importPath.endsWith(".less");

          var isUtility = componentName === "cn" || componentName === "clsx";

          // Визначаємо тип імпорту
          var isHook = componentName.startsWith("use");
          var isStore =
            importPath.includes("/store/") || importPath.includes("Store");

          if (!isExternalLib && !isStyleImport && !isUtility && componentName) {
            imports.push({
              source: importPath,
              localName: componentName,
              type: isHook ? "hook" : isStore ? "store" : "component",
            });
          }
        }

        // Named imports: import { Component1, Component2 } from '...'
        var namedImportRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;

        while ((match = namedImportRegex.exec(content)) !== null) {
          var namedImports = match[1];
          var importPath = match[2];

          var isExternalLib = [
            "react",
            "react-dom",
            "prop-types",
            "next",
            "@mui",
            "styled-components",
            "antd",
            "lodash",
            "axios",
            "classnames",
          ].some(function (lib) {
            return (
              importPath.startsWith(lib) || importPath.startsWith("@" + lib)
            );
          });

          var isStyleImport =
            importPath.endsWith(".css") ||
            importPath.endsWith(".scss") ||
            importPath.endsWith(".sass") ||
            importPath.endsWith(".less");

          if (!isExternalLib && !isStyleImport) {
            var components = namedImports.split(",").map(function (name) {
              return name
                .trim()
                .split(/\s+as\s+/)[0]
                .trim();
            });

            components.forEach(function (comp) {
              var isUtility = comp === "cn" || comp === "clsx";
              if (!comp || isUtility) return;

              // Визначаємо тип імпорту
              var isHook = comp.startsWith("use");
              var isStore =
                importPath.includes("/store/") || importPath.includes("Store");

              imports.push({
                source: importPath,
                localName: comp,
                type: isHook ? "hook" : isStore ? "store" : "component",
              });
            });
          }
        }

        // Dynamic imports: import('...')
        var dynamicImportRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

        while ((match = dynamicImportRegex.exec(content)) !== null) {
          var importPath = match[1];

          var isExternalLib = [
            "react",
            "react-dom",
            "prop-types",
            "next",
            "@mui",
            "styled-components",
            "antd",
            "lodash",
            "axios",
            "classnames",
          ].some(function (lib) {
            return (
              importPath.startsWith(lib) || importPath.startsWith("@" + lib)
            );
          });

          if (!isExternalLib) {
            var resolved = resolveImport(importPath, filePath, fileIndex);
            if (resolved) {
              var name = getComponentName(resolved);
              var isHook = name.startsWith("use");
              var isStore =
                importPath.includes("/store/") || importPath.includes("Store");

              imports.push({
                source: importPath,
                localName: name,
                type: isHook ? "hook" : isStore ? "store" : "component",
              });
            }
          }
        }

        return imports;
      }

      // 1. Будуємо індекс файлів ОДИН РАЗ
      var fileIndex = new Set();
      files.forEach(function (file) {
        if (file.name.match(/\.(js|jsx|tsx|ts)$/)) {
          fileIndex.add(file.name);
        }
      });

      console.log("📦 File index built:", fileIndex.size, "files");

      // Debug: показуємо приклади шляхів у fileIndex
      var samplePaths = Array.from(fileIndex).slice(0, 10);
      console.log("📂 Sample file paths:", samplePaths);

      // 2. Збираємо компоненти з ключем = шлях (без розширення)
      files.forEach(function (file) {
        var path = file.name;
        if (
          path.match(/\.(js|jsx|tsx|ts)$/) &&
          isReactComponent(file.content || "", path)
        ) {
          var componentKey = path.replace(/\.(js|jsx|ts|tsx)$/, "");
          componentMap.set(componentKey, {
            name: getComponentName(path),
            path: path,
            imports: [],
            size: file.content ? file.content.length : 0,
          });
        }
      });

      console.log("📦 Total components found:", componentMap.size);

      // 3. Аналізуємо імпорти з резолвом шляхів
      files.forEach(function (file) {
        var path = file.name;
        if (!path.match(/\.(js|jsx|tsx|ts)$/)) return;

        var componentKey = path.replace(/\.(js|jsx|ts|tsx)$/, "");
        var currentComponent = componentMap.get(componentKey);
        if (!currentComponent) return;

        var content = file.content;
        var imports = getImports(content, path, fileIndex);

        imports.forEach(function (imp) {
          var resolved = resolveImport(imp.source, path, fileIndex);

          if (resolved) {
            var resolvedKey = resolved.replace(/\.(js|jsx|ts|tsx)$/, "");
            var importedComponent = componentMap.get(resolvedKey);

            if (importedComponent && importedComponent !== currentComponent) {
              var alreadyAdded = currentComponent.imports.some(function (
                existing
              ) {
                return existing.path === resolved;
              });

              if (!alreadyAdded) {
                // Якщо це barrel-файл (index.ts), показуємо його як єдиний вузол
                var displayName = isBarrelFile(resolved)
                  ? importedComponent.name + " (barrel)"
                  : importedComponent.name;

                currentComponent.imports.push({
                  name: displayName,
                  path: resolved,
                  isBarrel: isBarrelFile(resolved),
                  type: imp.type || "component", // Зберігаємо тип (hook/store/component)
                });
              }
            } else if (!importedComponent) {
              // Debug: компонент не знайдено
              console.warn(
                "❌ Not found:",
                imp.source,
                "→",
                resolved,
                "from",
                path
              );
            }
          } else {
            // Debug: імпорт не розрезолвився
            console.warn("⚠️ Failed to resolve:", imp.source, "from", path);
          }
        });
      });

      // 4. Рекурсивно будуємо вкладеність
      function buildNestedStructure(component, visited) {
        visited = visited || new Set();

        // Запобігаємо циклічним залежностям (за шляхом, не за іменем!)
        if (visited.has(component.path)) {
          return null;
        }

        visited.add(component.path);

        var result = {
          name: component.name,
          path: component.path,
          size: component.size,
          type: component.type || "component", // Зберігаємо тип
          children: [],
        };

        component.imports.forEach(function (imp) {
          // КРИТИЧНИЙ ФІКС: використовуємо imp.path, а не imp.name
          var childKey = imp.path.replace(/\.(js|jsx|ts|tsx)$/, "");
          var childComponent = componentMap.get(childKey);

          if (childComponent) {
            var nested = buildNestedStructure(childComponent, new Set(visited));
            if (nested) {
              // Передаємо тип від імпорту
              nested.type = imp.type || nested.type || "component";
              result.children.push(nested);
            }
          }
        });

        return result;
      }

      // 4. Беремо ВСІ компоненти які мають залежності (імпорти)
      var allComponents = Array.from(componentMap.values());

      // Фільтруємо: тільки ті що імпортують інші компоненти
      var componentsWithImports = allComponents.filter(function (comp) {
        return comp.imports.length > 0;
      });

      console.log("🔗 Components with imports:", componentsWithImports.length);
      console.log(
        "📋 Sample components:",
        componentsWithImports.slice(0, 5).map(function (c) {
          return { name: c.name, imports: c.imports.length };
        })
      );

      // Сортуємо за кількістю залежностей (більше = важливіші)
      componentsWithImports.sort(function (a, b) {
        return b.imports.length - a.imports.length;
      });

      // Будуємо вкладену структуру для кожного компонента
      var result = componentsWithImports
        .map(function (comp) {
          var structure = buildNestedStructure(comp);

          // Додаємо навіть якщо children порожній, але є imports
          // (компонент імпортує щось, що не знайдено в проекті)
          if (
            structure &&
            structure.children.length === 0 &&
            comp.imports.length > 0
          ) {
            // Додаємо імпорти як children навіть якщо вони не знайдені
            comp.imports.forEach(function (imp) {
              structure.children.push({
                name: imp.name,
                path: imp.path,
                size: 0,
                children: [],
              });
            });
          }

          return structure;
        })
        .filter(function (comp) {
          return comp !== null;
        });

      console.log("📊 Component dependencies found:", result.length);

      return result;
    },

    // Генерація кольору на основі хешу рядка з підтримкою типів
    getColorForComponent: function (name, type) {
      // Сірий для hooks та stores
      if (type === "hook") {
        return "hsl(220, 10%, 85%)"; // Світло-сірий з синім відтінком
      }
      if (type === "store") {
        return "hsl(40, 15%, 82%)"; // Світло-сірий з бежевим відтінком
      }

      // Кольоровий для компонентів
      var hash = 0;
      for (var i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }

      var hue = Math.abs(hash % 360);
      var saturation = 65 + (Math.abs(hash) % 20);
      var lightness = 75 + (Math.abs(hash >> 8) % 15);

      return "hsl(" + hue + ", " + saturation + "%, " + lightness + "%)";
    },

    // Рендеринг treemap візуалізації
    renderTreemap: function (containerId, components) {
      var container = document.getElementById(containerId);
      if (!container || !components || !components.length) return;

      container.innerHTML = "";

      var _this = this;

      function createElement(tag, className) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        return el;
      }

      // Рекурсивний рендеринг компонента
      function renderComponent(component, level) {
        level = level || 0;

        var wrapper = createElement("div", "treemap-component");
        wrapper.style.cssText =
          "margin-bottom: " +
          (level === 0 ? "16px" : "8px") +
          "; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: white;";

        var mainColor = _this.getColorForComponent(
          component.name,
          component.type
        );

        // Заголовок компонента
        var header = createElement("div", "treemap-header");
        header.style.cssText =
          "padding: " +
          (level === 0 ? "12px 16px" : "10px 12px") +
          "; background: " +
          mainColor +
          "; border-bottom: 2px solid #d1d5db; cursor: pointer;";

        var title = createElement("div");
        var childrenCount = component.children ? component.children.length : 0;

        title.innerHTML =
          '<strong style="font-size: ' +
          (level === 0 ? "14px" : "13px") +
          '; color: #1f2937;">' +
          component.name +
          '</strong><div style="font-size: ' +
          (level === 0 ? "11px" : "10px") +
          '; color: #4b5563; margin-top: 2px;">' +
          component.path +
          "</div>" +
          (childrenCount > 0
            ? '<div style="font-size: 10px; color: #6b7280; margin-top: 4px;">Використовує ' +
              childrenCount +
              " " +
              (childrenCount === 1
                ? "компонент"
                : childrenCount < 5
                ? "компоненти"
                : "компонентів") +
              "</div>"
            : "");

        header.appendChild(title);

        // Контейнер для вкладених компонентів
        var body = createElement("div", "treemap-body");
        body.style.cssText = "padding: 12px; display: none;";

        if (component.children && component.children.length > 0) {
          // Treemap grid для вкладених компонентів
          var grid = createElement("div");
          grid.style.cssText =
            "display: grid; grid-template-columns: repeat(auto-fill, minmax(" +
            (level === 0 ? "250px" : "200px") +
            ", 1fr)); gap: 8px;";

          component.children.forEach(function (child) {
            // Рекурсивно рендеримо дочірній компонент
            var childEl = renderNestedBox(child, level + 1);
            grid.appendChild(childEl);
          });

          body.appendChild(grid);

          // Toggle functionality
          var isExpanded = false;
          header.addEventListener("click", function () {
            isExpanded = !isExpanded;
            body.style.display = isExpanded ? "block" : "none";
            header.style.borderBottom = isExpanded
              ? "2px solid #d1d5db"
              : "none";
          });
        } else {
          // Немає дочірніх - прибираємо курсор
          header.style.cursor = "default";
        }

        wrapper.appendChild(header);
        if (component.children && component.children.length > 0) {
          wrapper.appendChild(body);
        }

        return wrapper;
      }

      // Рендеринг вкладеного боксу (може містити інші бокси)
      function renderNestedBox(component, level) {
        var color = _this.getColorForComponent(component.name, component.type);
        var hasChildren = component.children && component.children.length > 0;

        var box = createElement("div");
        box.style.cssText =
          "padding: 12px; background: " +
          color +
          "; border: 2px solid rgba(0,0,0,0.1); border-radius: 6px; min-height: 100px; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;";

        box.addEventListener("mouseenter", function () {
          box.style.transform = "scale(1.02)";
          box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        });

        box.addEventListener("mouseleave", function () {
          box.style.transform = "scale(1)";
          box.style.boxShadow = "none";
        });

        // Інформація про компонент
        var info = createElement("div");
        info.style.cssText = "margin-bottom: " + (hasChildren ? "8px" : "0");

        var name = createElement("div");
        name.style.cssText =
          "font-weight: 600; font-size: 13px; color: #111827; margin-bottom: 4px;";

        // Додаємо бейдж типу
        var typeLabel = "";
        if (component.type === "hook") {
          typeLabel =
            " <span style='font-size: 10px; padding: 2px 6px; background: #64748b; color: white; border-radius: 4px; margin-left: 6px;'>hook</span>";
        } else if (component.type === "store") {
          typeLabel =
            " <span style='font-size: 10px; padding: 2px 6px; background: #92400e; color: white; border-radius: 4px; margin-left: 6px;'>store</span>";
        }

        name.innerHTML = component.name + typeLabel;

        var path = createElement("div");
        path.style.cssText =
          "font-size: 10px; color: #4b5563; word-break: break-all;";
        path.textContent = component.path;

        info.appendChild(name);
        info.appendChild(path);
        box.appendChild(info);

        // Якщо є дочірні компоненти - відображаємо їх
        if (hasChildren) {
          var childrenContainer = createElement("div");
          childrenContainer.style.cssText =
            "display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; margin-top: 8px;";

          component.children.forEach(function (child) {
            var childBox = renderNestedBox(child, level + 1);
            childrenContainer.appendChild(childBox);
          });

          box.appendChild(childrenContainer);
        }

        return box;
      }

      components.forEach(function (component) {
        container.appendChild(renderComponent(component));
      });
    },
  };
})();
