window.UIRenderer = window.UIRenderer || {};

// 18. Render Recommendations
window.UIRenderer.renderRecommendations = function (result) {
    const {
      unusedCSS = [],
      unusedFunctions = [],
      unusedVariables = [],
      unusedImages = [],
      unusedExports = [],
      unusedComponents = [],
      unusedHooks = [],
      unusedEnumsInterfaces = [],
      unusedAPIEndpoints = [],
      duplicateFunctions = [],
    } = result;

    const nothingFound =
      unusedCSS.length === 0 &&
      unusedFunctions.length === 0 &&
      unusedVariables.length === 0 &&
      unusedImages.length === 0 &&
      unusedExports.length === 0 &&
      unusedComponents.length === 0 &&
      unusedHooks.length === 0 &&
      unusedEnumsInterfaces.length === 0 &&
      unusedAPIEndpoints.length === 0 &&
      duplicateFunctions.length === 0;

    let html = "";

    if (nothingFound) {
      html +=
        '<div style="border:1px solid #bbf7d0;border-radius:8px;padding:24px;text-align:center;background:#f0fdf4;">';
      html += '<p style="margin:0;font-size:48px;">🎉</p>';
      html +=
        '<p style="margin:8px 0 0;color:#15803d;font-size:16px;font-weight:bold;">Чудово! Не знайдено невикористаного коду</p>';
      html +=
        '<p style="margin:4px 0 0;color:#6b7280;font-size:12px;">Ваш проект оптимізований</p>';
      html += "</div>";
    } else {
      html +=
        '<div style="border:1px solid #fcd34d;border-radius:8px;padding:16px;background:#fef3c7;margin-top:16px;">';
      html +=
        '<h3 style="margin:0 0 8px 0;font-size:14px;font-weight:bold;color:#92400e;">💡 Рекомендації</h3>';
      html +=
        '<ul style="margin:0;padding-left:20px;font-size:11px;color:#92400e;">';

      if (unusedCSS.length > 0) {
        html +=
          "<li>Видаліть невикористані CSS класи або використайте PurgeCSS/Tailwind JIT</li>";
      }
      if (unusedFunctions.length > 0) {
        html += "<li>Видаліть невикористані функції або експорти</li>";
      }
      if (unusedVariables.length > 0) {
        html += "<li>Видаліть невикористані змінні та константи</li>";
      }
      if (unusedExports.length > 0) {
        html +=
          "<li>Видаліть невикористані експорти для зменшення розміру бандлу</li>";
      }
      if (unusedComponents.length > 0) {
        html += "<li>Видаліть невикористані React компоненти</li>";
      }
      if (unusedHooks.length > 0) {
        html +=
          "<li>Видаліть невикористані хуки або перемістіть їх у бібліотеку</li>";
      }
      if (unusedEnumsInterfaces.length > 0) {
        html += "<li>Видаліть невикористані типи, інтерфейси та енуми</li>";
      }
      if (unusedAPIEndpoints.length > 0) {
        html +=
          "<li>Видаліть або задокументуйте невикористані API ендпоінти</li>";
      }

      html += '<li>Використовуйте ESLint з правилом "no-unused-vars"</li>';
      html +=
        "<li>Налаштуйте tree-shaking для автоматичного видалення dead code</li>";
      html += "</ul></div>";
    }

    return html;
  };
