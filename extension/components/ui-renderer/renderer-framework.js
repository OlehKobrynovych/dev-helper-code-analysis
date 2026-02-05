// UI Renderer - Framework Detection Block
window.UIRenderer = window.UIRenderer || {};

window.UIRenderer.renderFrameworkDetection = function (result) {
  if (!result.frameworkInfo) return "";

  const fw = result.frameworkInfo;
  const primaryFramework = window.FrameworkDetector.getPrimaryFramework(fw);
  const cssFrameworks = window.FrameworkDetector.getCSSFrameworks(fw);

  let html = `
    <div class="analysis-block">
      <div class="block-header">
        <h3>Визначення фреймворків</h3>
        <p>Автоматичне визначення технологій проєкту</p>
      </div>
      <div class="block-content">
  `;

  // Confidence indicator
  const confidenceClass =
    fw.confidence >= 80
      ? "high"
      : fw.confidence >= 50
      ? "medium"
      : "low";
  html += `
    <div class="confidence-indicator ${confidenceClass}">
      <span class="label">Впевненість:</span>
      <span class="value">${fw.confidence}%</span>
      <div class="bar">
        <div class="fill" style="width: ${fw.confidence}%"></div>
      </div>
    </div>
  `;



  const architecture = result.architecture || {};
  const architectureProjectType =
    architecture.projectType || fw.projectType || "Невідомо";
  const architectureFramework =
    architecture.framework || primaryFramework || "Невідомо";
  const architectureStructure = architecture.structure || "Невідомо";
  const architectureNestingLevel =
    architecture.nestingLevel !== undefined && architecture.nestingLevel !== null
      ? architecture.nestingLevel
      : "0";


  // Architecture summary
  html += `
    <div class="framework-section">
      <h4>Архітектура проєкту</h4>
      <div class="details-grid">
        <div class="detail-item">
          <span class="label">Тип проєкту:</span>
          <span class="value">${architectureProjectType}</span>
        </div>
        <div class="detail-item">
          <span class="label">Фреймворк:</span>
          <span class="value">${architectureFramework}</span>
        </div>
        <div class="detail-item">
          <span class="label">Структура:</span>
          <span class="value">${architectureStructure}</span>
        </div>
        <div class="detail-item">
          <span class="label">Рівень вкладеності:</span>
          <span class="value">${architectureNestingLevel}</span>
        </div>
      </div>
    </div>
  `;

  // Primary Framework
  html += `
    <div class="framework-section">
      <h4>Основний фреймворк</h4>
      <div class="framework-card primary">
        <span class="name">${primaryFramework}</span>
  `;

  if (fw.react.version) {
    html += `<span class="version">v${fw.react.version.raw || fw.react.version}</span>`;
  }
  if (fw.nextjs.detected && fw.nextjs.version) {
    html += `<span class="version">v${fw.nextjs.version.raw || fw.nextjs.version}</span>`;
  }
  if (fw.vue.detected && fw.vue.version) {
    html += `<span class="version">v${fw.vue.version.raw || fw.vue.version}</span>`;
  }
  if (fw.angular.detected && fw.angular.version) {
    html += `<span class="version">v${fw.angular.version.raw || fw.angular.version}</span>`;
  }

  html += `
        <span class="project-type badge">${fw.projectType}</span>
      </div>
    </div>
  `;

  // Next.js specific info
  if (fw.nextjs.detected) {
    html += `
      <div class="framework-section">
        <h4>Next.js деталі</h4>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Router:</span>
            <span class="value">${this._getRouterLabel(fw.nextjs.router)}</span>
          </div>
    `;

    if (fw.nextjs.serverComponents) {
      html += `
          <div class="detail-item">
            <span class="badge server">Server Components</span>
          </div>
      `;
    }
    if (fw.nextjs.clientComponents) {
      html += `
          <div class="detail-item">
            <span class="badge client">Client Components</span>
          </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  }

  // CSS Frameworks
  if (cssFrameworks.length > 0) {
    html += `
      <div class="framework-section">
        <h4>CSS фреймворки</h4>
        <div class="css-frameworks-list">
    `;

    cssFrameworks.forEach((cssfw) => {
      const icon = this._getCSSFrameworkIcon(cssfw);
      html += `
          <span class="css-framework-badge">
            ${icon} ${cssfw}
          </span>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  // Build Tools
  if (fw.build.tool) {
    html += `
      <div class="framework-section">
        <h4>Build інструменти</h4>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Build tool:</span>
            <span class="value">${fw.build.tool}</span>
          </div>
    `;

    if (fw.build.bundler) {
      html += `
          <div class="detail-item">
            <span class="label">Bundler:</span>
            <span class="value">${fw.build.bundler}</span>
          </div>
      `;
    }

    if (fw.build.turbopack) {
      html += `
          <div class="detail-item">
            <span class="badge turbopack">Turbopack</span>
          </div>
      `;
    }

    if (fw.build.typescript) {
      html += `
          <div class="detail-item">
            <span class="badge typescript">TypeScript</span>
          </div>
      `;
    }

    if (fw.build.monorepoTool) {
      html += `
          <div class="detail-item">
            <span class="label">Monorepo:</span>
            <span class="value">${fw.build.monorepoTool}</span>
          </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
};

window.UIRenderer.renderRouterAnalysis = function (result) {
  if (!result.routerAnalysis || !result.routerAnalysis.routes) return "";
  if (result.routerAnalysis.routes.length === 0) return "";

  const router = result.routerAnalysis;
  const stats = router.stats;

  let html = `
    <div class="analysis-block">
      <div class="block-header">
        <h3>Аналіз роутінгу</h3>
        <p>Маршрути та динамічні параметри</p>
      </div>
      <div class="block-content">
  `;

  // Stats
  html += `
    <div class="router-stats">
      <div class="stat-item">
        <span class="value">${stats.total}</span>
        <span class="label">Всього маршрутів</span>
      </div>
      <div class="stat-item">
        <span class="value">${stats.pages}</span>
        <span class="label">Сторінок</span>
      </div>
      <div class="stat-item">
        <span class="value">${stats.api}</span>
        <span class="label">API routes</span>
      </div>
      <div class="stat-item">
        <span class="value">${stats.dynamic}</span>
        <span class="label">Динамічних</span>
      </div>
    </div>
  `;

  // Router type info
  if (router.routerType) {
    html += `<div class="router-type-info">`;

    if (router.routerType.nextjs) {
      html += `<span class="badge nextjs">Next.js ${router.routerType.nextjs.appRouter ? "App Router" : ""} ${router.routerType.nextjs.pagesRouter ? "Pages Router" : ""}</span>`;
    }
    if (router.routerType.reactRouter) {
      html += `<span class="badge react-router">React Router v${router.routerType.reactRouter.version}</span>`;
    }
    if (router.routerType.remix) {
      html += `<span class="badge remix">Remix</span>`;
    }
    if (router.routerType.tanstack) {
      html += `<span class="badge tanstack">TanStack Router</span>`;
    }

    html += `</div>`;
  }

  html += `
      </div>
    </div>
  `;

  return html;
};

// Helper functions
window.UIRenderer._getRouterLabel = function (router) {
  switch (router) {
    case "app":
      return "App Router (Next.js 13+)";
    case "pages":
      return "Pages Router";
    case "hybrid":
      return "Hybrid (App + Pages)";
    default:
      return router || "Unknown";
  }
};

window.UIRenderer._getCSSFrameworkIcon = function (framework) {
  const icons = {
    "Tailwind CSS": "TW",
    Bootstrap: "BS",
    "Material-UI": "MUI",
    "Chakra UI": "CU",
    "Ant Design": "AD",
    "Styled Components": "SC",
    Emotion: "EM",
    "CSS Modules": "CM",
    "Sass/SCSS": "SS",
    Less: "LS",
  };
  return icons[framework] || "CSS";
};
