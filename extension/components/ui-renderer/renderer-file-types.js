window.UIRenderer = window.UIRenderer || {};

// 1. Render File Types
window.UIRenderer.renderFileTypes = function (result) {
    const fileTypes = result.fileTypes || {};
    const fileTypeEntries = Object.entries(fileTypes);

    if (fileTypeEntries.length === 0) return "";

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#374151;">📄 Типи файлів</h3>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';

    const fileTypeIcons = {
      js: "🟨",
      jsx: "⚛️",
      ts: "🔷",
      tsx: "⚛️",
      vue: "💚",
      css: "🎨",
      scss: "🎨",
      json: "📋",
      md: "📝",
      html: "🌐",
      png: "🖼️",
      jpg: "🖼️",
      svg: "🎨",
    };

    fileTypeEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([ext, count]) => {
        const icon = fileTypeIcons[ext] || "📄";
        html +=
          '<div style="background:#f3f4f6;padding:8px 12px;border-radius:6px;font-size:11px;">';
        html +=
          "<span>" +
          icon +
          " ." +
          ext +
          '</span> <strong style="color:#3b82f6;">' +
          count +
          "</strong>";
        html += "</div>";
      });

    html += "</div></div>";
    return html;
  };
