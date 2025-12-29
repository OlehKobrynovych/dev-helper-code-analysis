// Main popup controller
const zipInput = document.getElementById("zipInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadProgress = document.getElementById("uploadProgress");
const uploadResults = document.getElementById("uploadResults");
const uploadSection = document.getElementById("uploadSection");

uploadBtn.addEventListener("click", () => zipInput.click());

zipInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  uploadProgress.style.display = "block";
  uploadResults.style.display = "none";
  uploadSection.style.display = "none";

  const reader = new FileReader();

  reader.onload = async (event) => {
    try {
      const arrayBuffer = event.target.result;
      console.log("ArrayBuffer loaded:", arrayBuffer instanceof ArrayBuffer);

      const dataView = new DataView(arrayBuffer);
      const result = await analyzeZipProject(dataView);
      console.log("result", result);
      displayResults(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Помилка аналізу: " + error.message);
      uploadSection.style.display = "block";
    } finally {
      uploadProgress.style.display = "none";
      zipInput.value = "";
    }
  };

  reader.onerror = () => {
    alert("Помилка читання файлу");
    uploadProgress.style.display = "none";
    uploadSection.style.display = "block";
  };

  reader.readAsArrayBuffer(file);
});

function displayResults(result) {
  console.log("Results:", result);

  let html = renderResultsHTML(result);
  uploadResults.innerHTML = html;
  uploadResults.style.display = "block";

  const reuploadBtn = document.getElementById("reuploadBtn");
  if (reuploadBtn) {
    reuploadBtn.addEventListener("click", () => zipInput.click());
  }
}

function renderResultsHTML(result) {
  const {
    unusedCSS = [],
    unusedFunctions = [],
    unusedVariables = [],
    stats = {},
    projectName = "",
  } = result;

  const statsSafe = {
    cssFilesAnalyzed: stats.cssFilesAnalyzed || 0,
    jsFilesAnalyzed: stats.jsFilesAnalyzed || 0,
    totalCSSClasses: stats.totalCSSClasses || 0,
    totalFunctions: stats.totalFunctions || 0,
    totalVariables: stats.totalVariables || 0,
    totalImages: stats.totalImages || 0,
  };

  const safeProjectName = projectName
    ? escapeHTML(projectName)
    : "невідомий (package.json не знайдено)";

  let html =
    '<div style="border:1px solid #e9d5ff;border-radius:8px;padding:16px;background:#faf5ff;margin-bottom:16px;">';
  html +=
    '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:12px;">';
  html +=
    '<div style="font-size:14px;color:#6b21a8;font-weight:600;">📁 Назва проекту: <span style="color:#4c1d95;">' +
    safeProjectName +
    "</span></div>";
  html +=
    '<button id="reuploadBtn" class="btn btn-primary" style="font-size:12px;padding:10px 16px;flex-shrink:0;">🔁 Вибрати інший ZIP</button>';
  html += "</div>";
  html +=
    '<h3 style="margin:0 0 12px 0;font-size:16px;font-weight:bold;">📊 Результати аналізу проекту</h3>';

  html +=
    '<div style="margin-bottom:12px;padding:12px;background:#fff;border-radius:6px;font-size:11px;">';
  html +=
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">';
  html +=
    '<div><span style="color:#6b7280;">CSS файлів:</span> <strong>' +
    statsSafe.cssFilesAnalyzed +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">JS файлів:</span> <strong>' +
    statsSafe.jsFilesAnalyzed +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього класів:</span> <strong>' +
    statsSafe.totalCSSClasses +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього функцій:</span> <strong>' +
    statsSafe.totalFunctions +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього змінних:</span> <strong>' +
    statsSafe.totalVariables +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього зображень:</span> <strong>' +
    statsSafe.totalImages +
    "</strong></div>";
  html += "</div></div>";

  html +=
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">';

  const totalCSSClasses = statsSafe.totalCSSClasses;
  const totalFunctions = statsSafe.totalFunctions;
  const totalVariables = statsSafe.totalVariables;

  html +=
    '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
    (unusedCSS.length > 0 ? "#9333ea" : "#22c55e") +
    ';">';
  html +=
    '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористаний CSS</p>';
  html +=
    '<p style="margin:0;font-size:24px;font-weight:bold;color:#9333ea;">' +
    unusedCSS.length +
    "</p>";
  if (totalCSSClasses) {
    html +=
      '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
      ((unusedCSS.length / totalCSSClasses) * 100).toFixed(1) +
      "% від всіх</p>";
  }
  html += "</div>";

  html +=
    '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
    (unusedFunctions.length > 0 ? "#3b82f6" : "#22c55e") +
    ';">';
  html +=
    '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані функції</p>';
  html +=
    '<p style="margin:0;font-size:24px;font-weight:bold;color:#3b82f6;">' +
    unusedFunctions.length +
    "</p>";
  if (totalFunctions) {
    html +=
      '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
      ((unusedFunctions.length / totalFunctions) * 100).toFixed(1) +
      "% від всіх</p>";
  }
  html += "</div>";

  html +=
    '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
    (unusedVariables.length > 0 ? "#f59e0b" : "#22c55e") +
    ';">';
  html +=
    '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані змінні</p>';
  html +=
    '<p style="margin:0;font-size:24px;font-weight:bold;color:#f59e0b;">' +
    unusedVariables.length +
    "</p>";
  if (totalVariables) {
    html +=
      '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
      ((unusedVariables.length / totalVariables) * 100).toFixed(1) +
      "% від всіх</p>";
  }
  html += "</div>";

  html += "</div></div>";

  return html + renderDetailedBlocks(result);
}

function renderDetailedBlocks(result) {
  const {
    unusedCSS = [],
    unusedFunctions = [],
    unusedVariables = [],
    unusedImages = [],
    duplicateFunctions = [],
    apiRoutes = [],
    pages = [],
    fileTypes = {},
    typesAnalysis = { allTypes: [], byFile: {}, stats: {} },
  } = result;

  let html = "";

  // Display TypeScript Types Section
  if (typesAnalysis.stats.totalTypes > 0) {
    html += `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
      <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">
        <span style="color:#10b981;">📊 TypeScript Types & Interfaces</span>
        <span style="font-size:11px;background:#d1fae5;color:#065f46;padding:4px 8px;border-radius:4px;">
          ${typesAnalysis.stats.totalTypes} total (${typesAnalysis.stats.totalInterfaces} interfaces, ${typesAnalysis.stats.totalTypeAliases} types)
        </span>
      </h3>
      <div style="max-height: 500px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background: #fefefe;">
        <div style="display: flex; flex-direction: column; gap: 12px;">
  `;

    typesAnalysis.allTypes.forEach((type) => {
      const typeIcon = type.type === "interface" ? "🟣" : "🔷";
      html += `
      <div style="background: #f9fafb; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb;">
          <div>
            <span style="font-weight: 600; color: #111827;">${typeIcon} ${escapeHTML(
        type.name
      )}</span>
            <span style="color: #6b7280; font-size: 11px; margin-left: 6px;">${
              type.type
            }</span>
          </div>
          <div style="font-size: 11px; color: #6b7280;">
            ${escapeHTML(type.file.split("/").pop())}:${type.line}
          </div>
        </div>

        <div style="margin-bottom: 8px;">
          <pre style="font-size: 12px; color: #4b5563; font-family: 'Courier New', monospace;
                      background: #fff; padding: 8px; border-radius: 4px; border: 1px solid #e5e7eb;
                      max-height: 300px; overflow: auto; white-space: pre-wrap; word-break: break-word;">
${escapeHTML(type.content)}
          </pre>
        </div>

        ${
          type.dependencies && type.dependencies.length > 0
            ? `
          <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
            <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">Dependencies:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${type.dependencies
                .map(
                  (dep) =>
                    `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; 
                             border-radius: 4px; font-size: 10px; white-space: nowrap;">
                  ${escapeHTML(dep.name)}
                </span>`
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
    });

    html += `
        </div>
      </div>
    </div>
  `;
  }

  if (unusedCSS.length > 0) {
    html +=
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
  }

  if (unusedFunctions.length > 0) {
    html +=
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
  }

  if (unusedVariables.length > 0) {
    html +=
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
  }

  if (unusedImages.length > 0) {
    html +=
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
  }

  if (duplicateFunctions.length > 0) {
    html +=
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
  }

  if (apiRoutes.length > 0) {
    const methodColors = {
      GET: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
      POST: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
      PUT: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
      DELETE: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
      PATCH: { bg: "#e9d5ff", border: "#a855f7", text: "#6b21a8" },
    };
    const sortedRoutes = [...apiRoutes].sort((routeA, routeB) => {
      const methodA = (routeA.method || "").toUpperCase();
      const methodB = (routeB.method || "").toUpperCase();
      const priorityMap = { GET: 0, POST: 1 };
      const priorityA = priorityMap[methodA] ?? 2;
      const priorityB = priorityMap[methodB] ?? 2;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      if (priorityA === 2 && methodA !== methodB) {
        return methodA.localeCompare(methodB);
      }
      const pathA = routeA.path || "";
      const pathB = routeB.path || "";
      return pathA.localeCompare(pathB);
    });
    html +=
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#8b5cf6;">🌐 API Роути (' +
      apiRoutes.length +
      ")</h3>";
    html +=
      '<p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">Знайдені API ендпоінти та їх параметри</p>';
    html += '<div style="max-height:400px;overflow-y:auto;">';
    for (const route of sortedRoutes) {
      const method = (route.method || "GET").toUpperCase();
      const colors = methodColors[method] || methodColors.GET;
      html +=
        '<div style="padding:12px;background:' +
        colors.bg +
        ";border-left:3px solid " +
        colors.border +
        ';border-radius:4px;margin-bottom:12px;">';
      html +=
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
      html +=
        '<span style="background:' +
        colors.border +
        ';color:#fff;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:bold;">' +
        method +
        "</span>";
      html +=
        '<code style="font-family:monospace;color:' +
        colors.text +
        ';font-weight:bold;font-size:12px;">' +
        route.path +
        "</code>";
      if (route.type === "client") {
        html +=
          '<span style="background:#6b7280;color:#fff;padding:2px 6px;border-radius:3px;font-size:9px;">CLIENT</span>';
      }
      html += "</div>";

      const params = route.params || {};
      const args = route.args || [];
      const requestProps = route.requestProps || {};

      const hasParams =
        (params.body && params.body.length) ||
        (params.query && params.query.length) ||
        (params.headers && params.headers.length) ||
        (params.path && params.path.length) ||
        args.length ||
        (requestProps.body && requestProps.body.length);

      if (hasParams) {
        html +=
          '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">';

        // 🔧 Handler arguments (server)
        if (args.length) {
          html +=
            '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">⚙️ Handler args:</span> ';
          html +=
            '<span style="font-size:10px;color:' +
            colors.text +
            ';">' +
            args.join(", ") +
            "</span></div>";
        }

        // 🧩 Path params
        if (params.path && params.path.length) {
          html +=
            '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">🧩 Path:</span> ';
          html +=
            '<span style="font-size:10px;color:' +
            colors.text +
            ';">' +
            params.path.join(", ") +
            "</span></div>";
        }

        // 📦 Body params
        if (params.body && params.body.length) {
          html +=
            '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">📦 Body:</span> ';
          html +=
            '<span style="font-size:10px;color:' +
            colors.text +
            ';">' +
            params.body.join(", ") +
            "</span></div>";
        }

        // 🔍 Query params
        if (params.query && params.query.length) {
          html +=
            '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">🔍 Query:</span> ';
          html +=
            '<span style="font-size:10px;color:' +
            colors.text +
            ';">' +
            params.query.join(", ") +
            "</span></div>";
        }

        // 📋 Headers
        if (params.headers && params.headers.length) {
          html +=
            '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">📋 Headers:</span> ';
          html +=
            '<span style="font-size:10px;color:' +
            colors.text +
            ';">' +
            params.headers.join(", ") +
            "</span></div>";
        }

        // 🚀 Client request props (fetch / axios)
        if (requestProps.body && requestProps.body.length) {
          html +=
            '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">🚀 Request body:</span> ';
          html +=
            '<span style="font-size:10px;color:' +
            colors.text +
            ';">' +
            requestProps.body.join(", ") +
            "</span></div>";
        }
        if (args.length) {
          html +=
            '<span style="background:#0ea5e9;color:#fff;padding:2px 6px;border-radius:3px;font-size:9px;">SERVER</span>';
        }

        html += "</div>";
      }

      // if (hasParams) {
      //   html +=
      //     '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">';
      //   if (params.body && params.body.length) {
      //     html +=
      //       '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">📦 Body:</span> ';
      //     html +=
      //       '<span style="font-size:10px;color:' +
      //       colors.text +
      //       ';">' +
      //       params.body.join(", ") +
      //       "</span></div>";
      //   }
      //   if (params.query && params.query.length) {
      //     html +=
      //       '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">🔍 Query:</span> ';
      //     html +=
      //       '<span style="font-size:10px;color:' +
      //       colors.text +
      //       ';">' +
      //       params.query.join(", ") +
      //       "</span></div>";
      //   }
      //   if (params.headers && params.headers.length) {
      //     html +=
      //       '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">📋 Headers:</span> ';
      //     html +=
      //       '<span style="font-size:10px;color:' +
      //       colors.text +
      //       ';">' +
      //       params.headers.join(", ") +
      //       "</span></div>";
      //   }
      //   html += "</div>";
      // }

      if (route.files && route.files.length > 0) {
        html += '<div style="margin-top:8px;font-size:10px;color:#6b7280;">';
        const filesList = route.files.slice(0, 3).join(", ");
        html += "📄 Файли: " + filesList;
        if (route.files.length > 3) {
          html += " та ще " + (route.files.length - 3);
        }
        html += "</div>";
      }

      html += "</div>";
    }
    html += "</div></div>";
  }

  const fileTypeEntries = Object.entries(fileTypes || {});
  if (fileTypeEntries.length > 0) {
    html +=
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
  }

  if (pages.length > 0) {
    html +=
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
  }

  const nothingFound =
    unusedCSS.length === 0 &&
    unusedFunctions.length === 0 &&
    unusedVariables.length === 0 &&
    unusedImages.length === 0 &&
    duplicateFunctions.length === 0;

  if (nothingFound) {
    html +=
      '<div style="border:1px solid #bbf7d0;border-radius:8px;padding:24px;text-align:center;background:#f0fdf4;">';
    html += '<p style="margin:0;font-size:48px;">🎉</p>';
    html +=
      '<p style="margin:8px 0 0;color:#15803d;font-size:16px;font-weight:bold;">Чудово! Не знайдено невикористаного коду</p>';
    html +=
      '<p style="margin:4px 0 0;color:#6b7280;font-size:12px;">Ваш проект оптимізований</p>';
    html += "</div>";
  } else {
    html +=
      '<div style="border:1px solid #fcd34d;border-radius:8px;padding:16px;background:#fef3c7;margin-top:16px;">';
    html +=
      '<h3 style="margin:0 0 8px 0;font-size:14px;font-weight:bold;color:#92400e;">💡 Рекомендації</h3>';
    html +=
      '<ul style="margin:0;padding-left:20px;font-size:11px;color:#92400e;">';
    if (unusedCSS.length > 0) {
      html +=
        "<li>Видаліть невикористані CSS класи або використайте PurgeCSS/Tailwind JIT</li>";
    }
    if (unusedFunctions.length > 0) {
      html += "<li>Видаліть невикористані функції або експорти</li>";
    }
    if (unusedVariables.length > 0) {
      html += "<li>Видаліть невикористані змінні та константи</li>";
    }
    html += '<li>Використовуйте ESLint з правилом "no-unused-vars"</li>';
    html +=
      "<li>Налаштуйте tree-shaking для автоматичного видалення dead code</li>";
    html += "</ul></div>";
  }

  return html;
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, function (match) {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return match;
    }
  });
}
