window.UIRenderer = window.UIRenderer || {};

// 5. Render Unused CSS
window.UIRenderer.renderUnusedCSS = function (result) {
    const unusedCSS = result.unusedCSS || [];
    if (unusedCSS.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#9333ea;">🎨 Невикористані CSS класи</span>';
    html +=
      '<span style="font-size:11px;background:#f3e8ff;color:#7c3aed;padding:4px 8px;border-radius:4px;">' +
      unusedCSS.length +
      "</span>";
    html += "</h3>";
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedCSS.forEach((item) => {
      const location = item.location || "невідомо";
      html +=
        '<div style="padding:8px;background:#faf5ff;border-radius:4px;margin-bottom:8px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">';
      html +=
        '<code style="font-family:monospace;color:#7c3aed;font-weight:bold;">' +
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
