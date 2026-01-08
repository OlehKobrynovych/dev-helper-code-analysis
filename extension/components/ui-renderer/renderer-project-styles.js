window.UIRenderer = window.UIRenderer || {};

// Рендер проектних стилів
window.UIRenderer.renderProjectStyles = function (result) {
    if (!result.projectStyles) {
      return "";
    }

    const styles = result.projectStyles;
    let html = ''
    if (
      styles.tailwind ||
      styles.bootstrap ||
      styles.mui ||
      styles.styledComponents ||
      styles.cssModules
    ) {
        html += `
      <div class="analysis-block">
        <div class="block-header">
          <h3>🎨 Стилізація проекту</h3>
          <p>Використовувані CSS фреймворки та бібліотеки</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
    `;

    if (styles.tailwind) {
      html += `
        <div style="padding: 12px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px;">
          <div style="font-weight: 500; color: #0369a1;">Tailwind CSS</div>
          <div style="font-size: 12px; color: #0c4a6e; margin-top: 4px;">Utility-first CSS</div>
        </div>
      `;
    }

    if (styles.bootstrap) {
      html += `
        <div style="padding: 12px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 6px;">
          <div style="font-weight: 500; color: #6d28d9;">Bootstrap</div>
          <div style="font-size: 12px; color: #5b21b6; margin-top: 4px;">CSS Framework</div>
        </div>
      `;
    }

    if (styles.mui) {
      html += `
        <div style="padding: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
          <div style="font-weight: 500; color: #1d4ed8;">Material-UI</div>
          <div style="font-size: 12px; color: #1e40af; margin-top: 4px;">React UI Library</div>
        </div>
      `;
    }

    if (styles.styledComponents) {
      html += `
        <div style="padding: 12px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px;">
          <div style="font-weight: 500; color: #92400e;">Styled Components</div>
          <div style="font-size: 12px; color: #78350f; margin-top: 4px;">CSS-in-JS</div>
        </div>
      `;
    }

    if (styles.cssModules) {
      html += `
        <div style="padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <div style="font-weight: 500; color: #15803d;">CSS Modules</div>
          <div style="font-size: 12px; color: #166534; margin-top: 4px;">Scoped CSS</div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
    }

    const { variables = [], fonts = [], colors = [] } = styles;

    if (variables.length === 0 && fonts.length === 0 && colors.length === 0)
      return html;

    html += `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#374151;">🎨 Стилі проекту</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:16px;">
    `;

    // CSS Variables
    if (variables.length > 0) {
      html += `
        <div>
          <h4 style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#1e40af;">CSS Змінні (${
            variables.length
          })</h4>
          <div style="max-height:200px;overflow-y:auto;background:#f9fafb;border-radius:6px;padding:8px;font-size:11px;">
            ${variables
              .map(
                (v) => `
              <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;border-bottom:1px solid #e5e7eb;">
                <code style="color:#1e40af;flex-shrink:0;">${v.name}</code>
                <code style="color:#555;word-break:break-all;text-align:right;">${v.value}</code>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    // Fonts
    if (fonts.length > 0) {
      html += `
        <div>
          <h4 style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#059669;">Шрифти (${
            fonts.length
          })</h4>
          <div style="max-height:200px;overflow-y:auto;background:#f9fafb;border-radius:6px;padding:8px;font-size:11px;">
            ${fonts
              .map(
                (f) => `
              <div style="padding:4px 0;border-bottom:1px solid #e5e7eb;">
                <code style="color:#059669;">${f}</code>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    // Colors
    if (colors.length > 0) {
      html += `
        <div>
          <h4 style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#9333ea;">Основні кольори</h4>
          <div style="max-height:200px;overflow-y:auto;background:#f9fafb;border-radius:6px;padding:8px;">
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${colors
                .map(
                  (c) => `
                <div style="display:flex;align-items:center;gap:6px;" title="Used ${c.count} times">
                  <div style="width:16px;height:16px;border-radius:4px;background-color:${c.color};border:1px solid #ddd;"></div>
                  <code style="font-size:11px;color:#555;">${c.color}</code>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  };
