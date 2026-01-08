window.UIRenderer = window.UIRenderer || {};

// 8. Render Unused Images
window.UIRenderer.renderUnusedImages = function (result) {
    const unusedImages = result.unusedImages || [];
    if (unusedImages.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#ec4899;">🖼️ Невикористані зображення (' +
      unusedImages.length +
      ")</h3>";
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedImages.forEach((image) => {
      const path = image.path || "невідомо";
      html +=
        '<div style="padding:8px;background:#fce7f3;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="font-weight:bold;color:#9f1239;margin-bottom:4px;">' +
        image.name +
        "</div>";
      html +=
        '<div style="color:#6b7280;font-size:10px;">📄 ' + path + "</div>";
      html += "</div>";
    });

    html += "</div></div>";
    return html;
  };
