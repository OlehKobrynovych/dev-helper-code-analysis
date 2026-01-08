window.UIRenderer = window.UIRenderer || {};

// 7. Render Unused Variables
window.UIRenderer.renderUnusedVariables = function (result) {
    const unusedVariables = result.unusedVariables || [];
    if (unusedVariables.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#f59e0b;">📦 Невикористані змінні</span>';
    html +=
      '<span style="font-size:11px;background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;">' +
      unusedVariables.length +
      "</span>";
    html += "</h3>";
    html += '<div style="max-height:200px;overflow-y:auto;">';

    const typeLabels = {
      simple: "змінна",
      useState: "state",
      "useState-setter": "setState",
      "array-destruct": "деструктуризація []",
      "object-destruct": "деструктуризація {}",
      "export-const": "export const",
    };

    unusedVariables.forEach((variable) => {
      const location = variable.location || "";
      const typeLabel = typeLabels[variable.type] || variable.type || "змінна";
      html +=
        '<div style="padding:8px;background:#fef3c7;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html +=
        '<code style="font-family:monospace;color:#92400e;font-weight:bold;">' +
        variable.name +
        "</code>";
      html +=
        '<span style="font-size:9px;background:#fbbf24;color:#78350f;padding:2px 6px;border-radius:3px;">' +
        typeLabel +
        "</span>";
      html += "</div>";
      if (location) {
        html +=
          '<span style="color:#6b7280;font-size:10px;">📄 ' +
          location +
          "</span>";
      }
      html += "</div>";
    });

    html += "</div></div>";
    return html;
  };
