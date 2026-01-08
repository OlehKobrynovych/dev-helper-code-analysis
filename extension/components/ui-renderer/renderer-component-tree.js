window.UIRenderer = window.UIRenderer || {};

// Render component tree visualization
window.UIRenderer.renderComponentTree = function (result) {
    if (!result.componentTree) {
      return "";
    }

    const pages = result.componentTree.pages || [];
    const allComponents = result.componentTree.allComponents || [];

    if (pages.length === 0 && allComponents.length === 0) {
      return `
        <div class="analysis-block">
          <div class="block-header">
            <h3>🌳 Візуалізація компонентів</h3>
            <p>Не знайдено React/JS компонентів у проекті</p>
          </div>
          <div style="padding: 16px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; color: #92400e;">
            💡 Переконайтесь, що ваш проект містить .js, .jsx, .ts або .tsx файли
          </div>
        </div>
      `;
    }

    if (pages.length === 0) {
      return `
        <div class="analysis-block">
          <div class="block-header">
            <h3>🌳 Візуалізація компонентів</h3>
            <p>Всього компонентів: ${allComponents.length}</p>
          </div>
          <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; color: #1e40af;">
            💡 Не знайдено точок входу (pages/screens/routes). Показано ${allComponents.length} ${this.getWordForm(allComponents.length, ["компонент", "компоненти", "компонентів"])}.
          </div>
        </div>
      `;
    }

    let html = `
      <div class="analysis-block">
        <div class="block-header">
          <h3>📂 Структура проекту</h3>
          <p>Файлове дерево вашого проекту (${pages.length} ${this.getWordForm(pages.length, ["папка", "папки", "папок"])}, всього файлів: ${allComponents.length})</p>
        </div>
        <div class="component-tree-container" id="componentTreeContainer">
          <div class="component-tree-controls">
            <button class="btn btn-sm" id="expandAllComponents">📖 Розгорнути всі</button>
            <button class="btn btn-sm" id="collapseAllComponents">📕 Згорнути всі</button>
          </div>
          <div id="componentTree"></div>
        </div>
      </div>
    `;

    // Add event listeners after the DOM is updated
    setTimeout(() => {
      if (
        window.ComponentTreeAnalyzer &&
        window.ComponentTreeAnalyzer.renderComponentTree
      ) {
        window.ComponentTreeAnalyzer.renderComponentTree(
          "componentTree",
          result.componentTree.pages
        );

        // Add event listeners for expand/collapse buttons
        const expandAllBtn = document.getElementById("expandAllComponents");
        const collapseAllBtn = document.getElementById("collapseAllComponents");

        if (expandAllBtn) {
          expandAllBtn.addEventListener("click", () => {
            document.querySelectorAll(".component-children").forEach((el) => {
              el.style.display = "block";
            });
            document.querySelectorAll(".toggle-children").forEach((toggle) => {
              toggle.textContent = "▼";
            });
          });
        }

        if (collapseAllBtn) {
          collapseAllBtn.addEventListener("click", () => {
            document.querySelectorAll(".component-children").forEach((el) => {
              el.style.display = "none";
            });
            document.querySelectorAll(".toggle-children").forEach((toggle) => {
              toggle.textContent = "▶";
            });
          });
        }
      }
    }, 100);

    return html;
  };
