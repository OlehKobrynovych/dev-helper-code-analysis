window.UIRenderer = window.UIRenderer || {};

// 17. Render TypeScript Types
window.UIRenderer.renderTypeScriptTypes = function (result) {
    const typesAnalysis = result.typesAnalysis || {
      allTypes: [],
      byFile: {},
      stats: {},
    };
    if (typesAnalysis.stats.totalTypes === 0) return "";

    let html = `
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
              <span style="font-weight: 600; color: #111827;">${typeIcon} ${window.Utils.escapeHTML(
        type.name
      )}</span>
              <span style="color: #6b7280; font-size: 11px; margin-left: 6px;">${
                type.type
              }</span>
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              ${window.Utils.escapeHTML(type.file.split("/").pop())}:${
        type.line
      }
            </div>
          </div>

          <div style="margin-bottom: 8px;">
            <pre style="font-size: 12px; color: #4b5563; font-family: 'Courier New', monospace;
                        background: #fff; padding: 8px; border-radius: 4px; border: 1px solid #e5e7eb;
                        max-height: 300px; overflow: auto; white-space: pre-wrap; word-break: break-word;">
${window.Utils.escapeHTML(type.content)}
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
                    (dep) => `
                  <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px;
                               border-radius: 4px; font-size: 10px; white-space: nowrap;">
                    ${window.Utils.escapeHTML(dep.name)}
                  </span>
                `
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

    return html;
  };
