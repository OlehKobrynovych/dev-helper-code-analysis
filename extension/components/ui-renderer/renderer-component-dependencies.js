window.UIRenderer = window.UIRenderer || {};

// Render component dependencies treemap
window.UIRenderer.renderComponentDependencies = function (result) {
    if (!result.componentDependencies || result.componentDependencies.length === 0) {
      return "";
    }

    const components = result.componentDependencies;

    let html = `
      <div class="analysis-block">
        <div class="block-header">
          <h3>🔗 Залежності компонентів</h3>
          <p>Візуалізація використання компонентів один в одному (${components.length} ${this.getWordForm(components.length, ["компонент", "компоненти", "компонентів"])})</p>
        </div>
        <div id="componentDependenciesTreemap" style="max-height: 800px; overflow-y: auto; padding: 16px;"></div>
      </div>
    `;

    // Render treemap after DOM update
    setTimeout(() => {
      if (
        window.ComponentDependenciesVisualizer &&
        window.ComponentDependenciesVisualizer.renderTreemap
      ) {
        window.ComponentDependenciesVisualizer.renderTreemap(
          "componentDependenciesTreemap",
          components
        );
      }
    }, 100);

    return html;
  };
