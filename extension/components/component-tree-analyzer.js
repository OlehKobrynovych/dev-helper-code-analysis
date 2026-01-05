// Компонент для аналізу дерева файлів проекту
(function () {
  window.ComponentTreeAnalyzer = {
    analyze: function (files) {
      var _this = this;

      // Фільтруємо файли (виключаємо node_modules, .next, dist тощо)
      var filteredFiles = files.filter(function (file) {
        return (
          !file.name.includes("node_modules/") &&
          !file.name.includes("/.next/") &&
          !file.name.includes("/dist/") &&
          !file.name.includes("/build/") &&
          !file.name.includes("/.git/") &&
          !file.name.includes("/coverage/")
        );
      });

      // Будуємо дерево файлової структури
      var fileTree = this.buildFileTree(filteredFiles);

      return {
        pages: fileTree,
        allComponents: filteredFiles.filter(function (f) {
          return f.name.match(/\.(js|jsx|tsx|ts)$/);
        }),
      };
    },

    // Побудова дерева файлів
    buildFileTree: function (files) {
      var root = { name: "root", path: "", children: [], isFolder: true };

      files.forEach(function (file) {
        var pathParts = file.name.split("/").filter(function (p) {
          return p.length > 0;
        });

        var currentLevel = root;

        pathParts.forEach(function (part, index) {
          var isLastPart = index === pathParts.length - 1;

          // Шукаємо чи вже є така папка/файл
          var existing = currentLevel.children.find(function (child) {
            return child.name === part;
          });

          if (existing) {
            currentLevel = existing;
          } else {
            var newNode = {
              name: part,
              path: pathParts.slice(0, index + 1).join("/"),
              children: [],
              isFolder: !isLastPart,
            };

            // Додаємо розмір файлу якщо це файл
            if (isLastPart) {
              newNode.size = file.content ? file.content.length : 0;
              newNode.fileType = part.split(".").pop();
            }

            currentLevel.children.push(newNode);
            currentLevel = newNode;
          }
        });
      });

      // Сортуємо: папки спочатку, потім файли
      function sortChildren(node) {
        if (node.children && node.children.length > 0) {
          node.children.sort(function (a, b) {
            if (a.isFolder && !b.isFolder) return -1;
            if (!a.isFolder && b.isFolder) return 1;
            return a.name.localeCompare(b.name);
          });

          node.children.forEach(sortChildren);
        }
      }

      sortChildren(root);

      // Знаходимо головні папки (src, pages, app тощо)
      var mainFolders = root.children.filter(function (child) {
        return (
          child.isFolder &&
          (child.name === "src" ||
            child.name === "pages" ||
            child.name === "app" ||
            child.name === "components" ||
            child.name === "public")
        );
      });

      // Якщо є головні папки - повертаємо їх, інакше всі діти root
      return mainFolders.length > 0 ? mainFolders : root.children.slice(0, 20);
    },

    // Функція для візуалізації дерева файлів
    renderComponentTree: function (containerId, pages) {
      var container = document.getElementById(containerId);
      if (!container || !pages || !pages.length) return;

      container.innerHTML = "";

      function createElement(tag, className) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        return el;
      }

      function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
      }

      function getFileIcon(node) {
        if (node.isFolder) return "📁";

        var ext = node.fileType;
        if (!ext) return "📄";

        var icons = {
          js: "📜",
          jsx: "⚛️",
          ts: "📘",
          tsx: "⚛️",
          css: "🎨",
          scss: "🎨",
          html: "🌐",
          json: "📋",
          md: "📝",
          png: "🖼️",
          jpg: "🖼️",
          svg: "🎭",
          gif: "🖼️",
        };

        return icons[ext] || "📄";
      }

      function renderNode(node, level) {
        level = level || 0;

        var nodeEl = createElement("div", "component-node");
        nodeEl.style.marginLeft = level * 20 + "px";

        var nodeName = createElement("div", "component-name");

        // Додаємо toggle button якщо це папка з дітьми
        if (node.isFolder && node.children && node.children.length > 0) {
          var toggleBtn = createElement("span", "toggle-children");
          toggleBtn.textContent = "▶";
          nodeName.appendChild(toggleBtn);

          toggleBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            var childrenContainer = nodeEl.querySelector(".component-children");
            if (childrenContainer) {
              var isCollapsed = childrenContainer.style.display === "none";
              childrenContainer.style.display = isCollapsed ? "block" : "none";
              toggleBtn.textContent = isCollapsed ? "▼" : "▶";
            }
          });
        }

        // Іконка
        var icon = createElement("span");
        icon.textContent = getFileIcon(node) + " ";
        icon.style.marginRight = "6px";
        nodeName.appendChild(icon);

        // Ім'я файлу/папки
        var nameSpan = createElement("span");
        nameSpan.textContent = node.name;
        nameSpan.style.fontWeight = node.isFolder ? "600" : "400";
        nameSpan.style.color = node.isFolder ? "#374151" : "#6b7280";
        nodeName.appendChild(nameSpan);

        // Badge з кількістю файлів у папці
        if (node.isFolder && node.children && node.children.length > 0) {
          var badge = createElement("span");
          badge.textContent = node.children.length;
          badge.style.cssText =
            "margin-left: 8px; padding: 2px 6px; background: #dbeafe; color: #1e40af; border-radius: 10px; font-size: 10px; font-weight: 500;";
          nodeName.appendChild(badge);
        }

        // Розмір файлу
        if (!node.isFolder && node.size) {
          var sizeSpan = createElement("span");
          sizeSpan.textContent = " (" + formatFileSize(node.size) + ")";
          sizeSpan.style.cssText = "font-size: 11px; color: #9ca3af; margin-left: 8px;";
          nodeName.appendChild(sizeSpan);
        }

        // Шлях
        if (node.path) {
          nodeName.title = node.path;

          var pathEl = createElement("div", "component-path");
          pathEl.textContent = node.path;
          nodeName.appendChild(pathEl);
        }

        nodeEl.appendChild(nodeName);

        // Додаємо дочірні елементи
        if (node.isFolder && node.children && node.children.length > 0) {
          var childrenContainer = createElement("div", "component-children");
          childrenContainer.style.display = "none";

          node.children.forEach(function (child) {
            childrenContainer.appendChild(renderNode(child, level + 1));
          });

          nodeEl.appendChild(childrenContainer);
        }

        return nodeEl;
      }

      var treeContainer = createElement("div", "component-tree");

      pages.forEach(function (page) {
        treeContainer.appendChild(renderNode(page));
      });

      container.appendChild(treeContainer);
    },
  };
})();
