window.UIRenderer = window.UIRenderer || {};

// 2. Render Dependencies
window.UIRenderer.renderDependencies = function (result) {
    if (!result.packageJson) return "";

    const dependencies = result.packageJson.dependencies || {};
    const devDependencies = result.packageJson.devDependencies || {};
    const commonLibs = this.getCommonLibraries();

    let html = "";

    // Regular dependencies
    const regularDeps = Object.entries(dependencies).map(([name, version]) => ({
      name,
      version,
      description: commonLibs[name] || "Немає опису",
      isDev: false,
    }));

    // Dev dependencies
    const devDeps = Object.entries(devDependencies).map(([name, version]) => ({
      name,
      version,
      description: commonLibs[name] || "Немає опису",
      isDev: true,
    }));

    // Generate HTML for regular dependencies
    if (regularDeps.length > 0) {
      html += `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
          <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">
            <span>📦 Залежності</span>
            <span style="font-size:11px;background:#f3f4f6;color:#4b5563;padding:2px 8px;border-radius:4px;">
              ${regularDeps.length} бібліотек
            </span>
          </h3>
          <div style="max-height:300px;overflow-y:auto;margin-top:12px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Бібліотека</th>
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Версія</th>
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Опис</th>
                </tr>
              </thead>
              <tbody>
                ${regularDeps
                  .map(
                    (dep) => `
                  <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:8px 12px;font-family:monospace;color:#111827;">${dep.name}</td>
                    <td style="padding:8px 12px;color:#4b5563;font-family:monospace;">${dep.version}</td>
                    <td style="padding:8px 12px;color:#4b5563;">${dep.description}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Generate HTML for devDependencies
    if (devDeps.length > 0) {
      html += `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
          <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">
            <span>🔧 Залежності для розробки</span>
            <span style="font-size:11px;background:#f0fdf4;color:#166534;padding:2px 8px;border-radius:4px;">
              ${devDeps.length} бібліотек
            </span>
          </h3>
          <div style="max-height:300px;overflow-y:auto;margin-top:12px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Бібліотека</th>
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Версія</th>
                  <th style="padding:8px 12px;text-align:left;font-weight:500;">Опис</th>
                </tr>
              </thead>
              <tbody>
                ${devDeps
                  .map(
                    (dep) => `
                  <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:8px 12px;font-family:monospace;color:#111827;">
                      ${dep.name}
                      <span style="margin-left:6px;font-size:10px;background:#dcfce7;color:#166534;padding:2px 6px;border-radius:4px;font-weight:500;">dev</span>
                    </td>
                    <td style="padding:8px 12px;color:#4b5563;font-family:monospace;">${dep.version}</td>
                    <td style="padding:8px 12px;color:#4b5563;">${dep.description}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Add message if no dependencies found
    if (regularDeps.length === 0 && devDeps.length === 0) {
      html += `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;background-color:#f9fafb;">
          <p style="margin:0;color:#6b7280;font-size:13px;display:flex;align-items:center;gap:6px;">
            <span>ℹ️</span>
            <span>Не знайдено жодних залежностей у package.json</span>
          </p>
        </div>
      `;
    }

    return html;
  };
