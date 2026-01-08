window.UIRenderer = window.UIRenderer || {};

// 9. Render Unused Exports
window.UIRenderer.renderUnusedExports = function (result) {
    const unusedExports = result.unusedExports || [];
    if (unusedExports.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#8b5cf6;">📤 Невикористані експорти</span>';
    html +=
      '<span style="font-size:11px;background:#ede9fe;color:#6b21a8;padding:4px 8px;border-radius:4px;">' +
      unusedExports.length +
      "</span>";
    html += "</h3>";
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedExports.forEach((item) => {
      const location = item.location || "невідомо";
      html +=
        '<div style="padding:8px;background:#f5f3ff;border-radius:4px;margin-bottom:8px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">';
      html +=
        '<code style="font-family:monospace;color:#6b21a8;font-weight:bold;">' +
        item.name +
        "</code>";
      html +=
        '<span style="color:#6b7280;font-size:10px;">📄 ' +
        location +
        "</span>";
      html += "</div>";
    });

    html += "</div></div>";
    return html;
  };
