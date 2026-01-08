window.UIRenderer = window.UIRenderer || {};

// 6. Render Unused Functions
window.UIRenderer.renderUnusedFunctions = function (result) {
    const unusedFunctions = result.unusedFunctions || [];
    if (unusedFunctions.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#3b82f6;">⚡ Невикористані функції</span>';
    html +=
      '<span style="font-size:11px;background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:4px;">' +
      unusedFunctions.length +
      "</span>";
    html += "</h3>";
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedFunctions.forEach((fn) => {
      const name = fn.name || fn;
      const location = fn.location || "";
      html +=
        '<div style="padding:8px;background:#eff6ff;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;">';
      html +=
        '<code style="font-family:monospace;color:#1e40af;font-weight:bold;">' +
        name +
        "()</code>";
      if (location) {
        html +=
          '<span style="color:#6b7280;font-size:10px;">📄 ' +
          location +
          "</span>";
      }
      html += "</div></div>";
    });

    html += "</div></div>";
    return html;
  };
