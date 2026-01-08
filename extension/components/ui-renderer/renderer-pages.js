window.UIRenderer = window.UIRenderer || {};

// 16. Render Pages
window.UIRenderer.renderPages = function (result) {
    const pages = result.pages || [];
    if (pages.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#10b981;">📄 Сторінки (' +
      pages.length +
      ")</h3>";
    html += '<div style="max-height:300px;overflow-y:auto;">';

    pages.forEach((page) => {
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
        '<div style="font-weight:bold;color:#059669;">' + fileName + "</div>";
      html +=
        '<span style="background:#10b981;color:#fff;padding:2px 6px;border-radius:10px;font-size:9px;">' +
        (page.type || "page") +
        "</span>";
      html += "</div>";
      if (path) {
        html +=
          '<div style="color:#6b7280;font-size:10px;">📁 ' + path + "</div>";
      }
      html += "</div>";
    });

    html += "</div></div>";
    return html;
  };
