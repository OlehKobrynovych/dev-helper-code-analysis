window.UIRenderer = window.UIRenderer || {};

// 12. Render Unused Enums/Interfaces
window.UIRenderer.renderUnusedEnumsInterfaces = function (result) {
    const unusedEnumsInterfaces = result.unusedEnumsInterfaces || [];
    if (unusedEnumsInterfaces.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html +=
      '<span style="color:#a855f7;">🔷 Невикористані enum / interface / type</span>';
    html +=
      '<span style="font-size:11px;background:#f3e8ff;color:#7e22ce;padding:4px 8px;border-radius:4px;">' +
      unusedEnumsInterfaces.length +
      "</span>";
    html += "</h3>";
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedEnumsInterfaces.forEach((item) => {
      const location = item.location || "невідомо";
      const typeLabel = item.type || "type";
      html +=
        '<div style="padding:8px;background:#faf5ff;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html +=
        '<code style="font-family:monospace;color:#7e22ce;font-weight:bold;">' +
        item.name +
        "</code>";
      html +=
        '<span style="font-size:9px;background:#a855f7;color:#fff;padding:2px 6px;border-radius:3px;">' +
        typeLabel +
        "</span>";
      html += "</div>";
      html +=
        '<span style="color:#6b7280;font-size:10px;">📄 ' +
        location +
        "</span>";
      html += "</div>";
    });

    html += "</div></div>";
    return html;
  };
