// UI Renderer - рендеринг результатів аналізу
window.UIRenderer = window.UIRenderer || {};

window.UIRenderer.renderResultsHTML = function (result) {
  const {
    unusedCSS = [],
    unusedFunctions = [],
    unusedVariables = [],
    stats = {},
    projectName = "",
  } = result;

  const statsSafe = {
    cssFilesAnalyzed: stats.cssFilesAnalyzed || 0,
    jsFilesAnalyzed: stats.jsFilesAnalyzed || 0,
    totalCSSClasses: stats.totalCSSClasses || 0,
    totalFunctions: stats.totalFunctions || 0,
    totalVariables: stats.totalVariables || 0,
    totalImages: stats.totalImages || 0,
  };

  const safeProjectName = projectName
    ? window.Utils.escapeHTML(projectName)
    : "невідомий (package.json не знайдено)";

  let html =
    '<div style="border:1px solid #e9d5ff;border-radius:8px;padding:16px;background:#faf5ff;margin-bottom:16px;">';
  html +=
    '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:12px;">';
  html +=
    '<div style="font-size:14px;color:#6b21a8;font-weight:600;">📁 Назва проекту: <span style="color:#4c1d95;">' +
    safeProjectName +
    "</span></div>";
  html +=
    '<button id="reuploadBtn" class="btn btn-primary" style="font-size:12px;padding:10px 16px;flex-shrink:0;">🔁 Вибрати інший ZIP</button>';
  html += "</div>";
  html +=
    '<h3 style="margin:0 0 12px 0;font-size:16px;font-weight:bold;">📊 Результати аналізу проекту</h3>';

  html +=
    '<div style="margin-bottom:12px;padding:12px;background:#fff;border-radius:6px;font-size:11px;">';
  html +=
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">';
  html +=
    '<div><span style="color:#6b7280;">CSS файлів:</span> <strong>' +
    statsSafe.cssFilesAnalyzed +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">JS файлів:</span> <strong>' +
    statsSafe.jsFilesAnalyzed +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього класів:</span> <strong>' +
    statsSafe.totalCSSClasses +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього функцій:</span> <strong>' +
    statsSafe.totalFunctions +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього змінних:</span> <strong>' +
    statsSafe.totalVariables +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього зображень:</span> <strong>' +
    statsSafe.totalImages +
    "</strong></div>";
  html += "</div></div>";

  // Add architecture section
  html += `
    <div style="margin: 16px 0; padding: 16px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #4b5563; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">📐</span> Архітектура проекту
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
            <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Тип проекту</div>
                <div style="font-weight: 500; color: #111827;">${
                  result.architecture?.projectType || "Невідомо"
                }</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Фреймворк</div>
                <div style="font-weight: 500; color: #111827;">${
                  result.architecture?.framework || "Невідомо"
                }</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Структура</div>
                <div style="font-weight: 500; color: #111827;">${
                  result.architecture?.structure || "Невідомо"
                }</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Рівень вкладеності</div>
                <div style="font-weight: 500; color: #111827;">${
                  result.architecture?.nestingLevel || "0"
                }</div>
            </div>
        </div>
    </div>
  `;

  html +=
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">';

  const totalCSSClasses = statsSafe.totalCSSClasses;
  const totalFunctions = statsSafe.totalFunctions;
  const totalVariables = statsSafe.totalVariables;

  html +=
    '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
    (unusedCSS.length > 0 ? "#9333ea" : "#22c55e") +
    ';">';
  html +=
    '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористаний CSS</p>';
  html +=
    '<p style="margin:0;font-size:24px;font-weight:bold;color:#9333ea;">' +
    unusedCSS.length +
    "</p>";
  if (totalCSSClasses) {
    html +=
      '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
      ((unusedCSS.length / totalCSSClasses) * 100).toFixed(1) +
      "% від всіх</p>";
  }
  html += "</div>";

  html +=
    '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
    (unusedFunctions.length > 0 ? "#3b82f6" : "#22c55e") +
    ';">';
  html +=
    '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані функції</p>';
  html +=
    '<p style="margin:0;font-size:24px;font-weight:bold;color:#3b82f6;">' +
    unusedFunctions.length +
    "</p>";
  if (totalFunctions) {
    html +=
      '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
      ((unusedFunctions.length / totalFunctions) * 100).toFixed(1) +
      "% від всіх</p>";
  }
  html += "</div>";

  html +=
    '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
    (unusedVariables.length > 0 ? "#f59e0b" : "#22c55e") +
    ';">';
  html +=
    '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані змінні</p>';
  html +=
    '<p style="margin:0;font-size:24px;font-weight:bold;color:#f59e0b;">' +
    unusedVariables.length +
    "</p>";
  if (totalVariables) {
    html +=
      '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
      ((unusedVariables.length / totalVariables) * 100).toFixed(1) +
      "% від всіх</p>";
  }
  html += "</div>";

  html += "</div></div>";

  return html + window.UIRenderer.renderDetailedBlocks(result);
};

// Головна функція-оркестратор для детальних блоків
window.UIRenderer.renderDetailedBlocks = function (result) {
  return (
    window.UIRenderer.renderProjectStyles(result) +
    window.UIRenderer.renderComponentTree(result) +
    window.UIRenderer.renderComponentDependencies(result) +
    window.UIRenderer.renderFileTypes(result) +
    window.UIRenderer.renderDependencies(result) +
    window.UIRenderer.renderAuthAnalysis(result) +
    window.UIRenderer.renderStorageAnalysis(result) +
    window.UIRenderer.renderCodeHealth(result) +
    window.UIRenderer.renderDependencyAnalysis(result) +
    window.UIRenderer.renderUnusedCSS(result) +
    window.UIRenderer.renderUnusedFunctions(result) +
    window.UIRenderer.renderUnusedVariables(result) +
    window.UIRenderer.renderUnusedImages(result) +
    window.UIRenderer.renderUnusedExports(result) +
    window.UIRenderer.renderUnusedComponents(result) +
    window.UIRenderer.renderUnusedHooks(result) +
    window.UIRenderer.renderUnusedEnumsInterfaces(result) +
    window.UIRenderer.renderUnusedAPIEndpoints(result) +
    window.UIRenderer.renderDuplicateFunctions(result) +
    window.UIRenderer.renderAPIRoutes(result) +
    window.UIRenderer.renderPages(result) +
    window.UIRenderer.renderTypeScriptTypes(result) +
    window.UIRenderer.renderRecommendations(result)
  );
};
