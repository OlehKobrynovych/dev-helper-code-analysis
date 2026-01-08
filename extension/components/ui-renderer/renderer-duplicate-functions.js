window.UIRenderer = window.UIRenderer || {};

// 14. Render Duplicate Functions
window.UIRenderer.renderDuplicateFunctions = function (result) {
    const duplicateFunctions = result.duplicateFunctions || [];
    if (duplicateFunctions.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#f59e0b;">🔄 Функції з однаковими назвами (' +
      duplicateFunctions.length +
      ")</h3>";
    html +=
      '<p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">Функції з однаковими іменами у різних файлах можуть призвести до конфліктів</p>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    duplicateFunctions.forEach((dup) => {
      const locations = Array.isArray(dup.locations) ? dup.locations : [];
      const count = dup.count || locations.length || 0;
      const isSimilar = !!dup.similar;
      const bgColor = isSimilar ? "#fef3c7" : "#fee2e2";
      const borderColor = isSimilar ? "#fbbf24" : "#ef4444";

      html +=
        '<div style="padding:12px;background:' +
        bgColor +
        ";border-left:3px solid " +
        borderColor +
        ';border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
      html +=
        '<code style="font-family:monospace;color:#92400e;font-weight:bold;font-size:13px;">' +
        dup.name +
        "()</code>";
      html += '<div style="display:flex;gap:6px;align-items:center;">';

      if (isSimilar) {
        html +=
          '<span style="background:#22c55e;color:#fff;padding:2px 6px;border-radius:8px;font-size:9px;">⚠️ Схожий код</span>';
      } else {
        html +=
          '<span style="background:#3b82f6;color:#fff;padding:2px 6px;border-radius:8px;font-size:9px;">✓ Різний код</span>';
      }

      html +=
        '<span style="background:#f59e0b;color:#fff;padding:2px 8px;border-radius:12px;font-size:10px;">' +
        count +
        " файли</span>";
      html += "</div></div>";

      if (locations.length > 0) {
        html += '<div style="color:#6b7280;font-size:10px;">';
        locations.forEach((loc) => {
          html += '<div style="margin-top:4px;">📄 ' + loc + "</div>";
        });
        html += "</div>";
      }

      html += "</div>";
    });

    html += "</div></div>";
    return html;
  };
