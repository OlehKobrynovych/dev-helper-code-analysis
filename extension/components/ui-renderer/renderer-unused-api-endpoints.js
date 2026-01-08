window.UIRenderer = window.UIRenderer || {};

// 13. Render Unused API Endpoints
window.UIRenderer.renderUnusedAPIEndpoints = function (result) {
    const unusedAPIEndpoints = result.unusedAPIEndpoints || [];
    if (unusedAPIEndpoints.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html +=
      '<span style="color:#ef4444;">🌐 Невикористані API ендпоінти</span>';
    html +=
      '<span style="font-size:11px;background:#fee2e2;color:#991b1b;padding:4px 8px;border-radius:4px;">' +
      unusedAPIEndpoints.length +
      "</span>";
    html += "</h3>";
    html +=
      '<p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">API роути, які не використовуються в коді</p>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedAPIEndpoints.forEach((item) => {
      const location = item.location || "невідомо";
      html +=
        '<div style="padding:8px;background:#fef2f2;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="font-weight:bold;color:#991b1b;margin-bottom:4px;">' +
        item.name +
        "</div>";
      html +=
        '<div style="color:#6b7280;font-size:10px;">📄 ' + location + "</div>";
      html += "</div>";
    });

    html += "</div></div>";
    return html;
  };
