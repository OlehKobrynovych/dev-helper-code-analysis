window.UIRenderer = window.UIRenderer || {};

// 16. Render Pages
window.UIRenderer.renderPages = function (result) {
  return window.UIRenderer.renderPagesList(result);
};

window.UIRenderer.renderPagesList = function (result) {
  const pages = result.pages || [];
  const routes = (result.routerAnalysis && result.routerAnalysis.routes) || [];
  const nonApiRoutes = routes.filter((route) => route.type !== "api");
  const maxDisplay = 100;

  if (pages.length === 0 && nonApiRoutes.length === 0) return "";

  const escape = (value) =>
    window.Utils && window.Utils.escapeHTML
      ? window.Utils.escapeHTML(value || "")
      : String(value || "");

  const sortedRoutes = nonApiRoutes
    .slice()
    .sort((a, b) => (a.path || "").localeCompare(b.path || ""));
  const sortedPages = pages
    .slice()
    .sort((a, b) => (a.path || "").localeCompare(b.path || ""));

  let html =
    '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
  html +=
    '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#10b981;">Сторінки та маршрути</h3>';

  if (sortedRoutes.length > 0) {
    const visibleRoutes = sortedRoutes.slice(0, maxDisplay);
    html +=
      '<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:600;color:#111827;margin-bottom:6px;">Маршрути (' +
      sortedRoutes.length +
      ")</div>";
    html += '<div style="max-height:300px;overflow-y:auto;">';

    visibleRoutes.forEach((route) => {
      const shortFile = route.file
        ? route.file.split("/").slice(-2).join("/")
        : "невідомо";
      html +=
        '<div style="padding:8px;background:#eef2ff;border-radius:4px;margin-bottom:6px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">';
      html +=
        '<div style="font-weight:bold;color:#4f46e5;font-family:\'Courier New\', monospace;">' +
        escape(route.path || "невідомо") +
        "</div>";
      html +=
        '<span style="background:#6366f1;color:#fff;padding:2px 6px;border-radius:10px;font-size:9px;">' +
        escape(route.type || "page") +
        "</span>";
      html += "</div>";
      html +=
        '<div style="color:#6b7280;font-size:10px;">Файл: ' +
        escape(shortFile) +
        "</div>";
      html += "</div>";
    });

    html += "</div>";
    if (sortedRoutes.length > maxDisplay) {
      html +=
        '<div style="margin-top:6px;font-size:10px;color:#6b7280;">Показано ' +
        maxDisplay +
        " з " +
        sortedRoutes.length +
        " маршрутів</div>";
    }
    html += "</div>";
  }

  if (sortedPages.length > 0) {
    const visiblePages = sortedPages.slice(0, maxDisplay);
    html +=
      '<div style="font-size:12px;font-weight:600;color:#111827;margin-bottom:6px;">Файли сторінок (' +
      sortedPages.length +
      ")</div>";
    html += '<div style="max-height:300px;overflow-y:auto;">';

    visiblePages.forEach((page) => {
      const fileName = page.path ? page.path.split("/").pop() : "невідомо";
      const path =
        page.path && page.path.includes("/")
          ? page.path.substring(0, page.path.lastIndexOf("/"))
          : page.path || "";

      html +=
        '<div style="padding:8px;background:#ecfdf5;border-radius:4px;margin-bottom:6px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">';
      html +=
        '<div style="font-weight:bold;color:#059669;">' +
        escape(fileName) +
        "</div>";
      html +=
        '<span style="background:#10b981;color:#fff;padding:2px 6px;border-radius:10px;font-size:9px;">' +
        escape(page.type || "page") +
        "</span>";
      html += "</div>";
      if (path) {
        html +=
          '<div style="color:#6b7280;font-size:10px;">Папка: ' +
          escape(path) +
          "</div>";
      }
      html += "</div>";
    });

    html += "</div>";
    if (sortedPages.length > maxDisplay) {
      html +=
        '<div style="margin-top:6px;font-size:10px;color:#6b7280;">Показано ' +
        maxDisplay +
        " з " +
        sortedPages.length +
        " файлів сторінок</div>";
    }
  }

  html += "</div>";
  return html;
};
