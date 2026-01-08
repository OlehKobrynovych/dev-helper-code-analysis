window.UIRenderer = window.UIRenderer || {};

window.UIRenderer.renderAuthAnalysis = function (result) {
    const auth = result.auth;
    if (!auth || (!auth.providers.length && !auth.types.length)) {
      return '';
    }

    let html = `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#374151;">🔐 Авторизація</h3>
        <p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">Способи авторизації, що використовуються в проекті</p>
    `;

    if (auth.types.length > 0) {
      html += `
          <div style="margin-bottom: 12px;">
            <h4 style="font-size: 13px; color: #333; margin-bottom: 8px;">Тип:</h4>
            <ul style="list-style: none; padding-left: 0; margin: 0;">
              ${auth.types.map(type => `<li style="font-size: 12px; color: #555;">- ${type}</li>`).join('')}
            </ul>
          </div>
      `;
    }

    if (auth.providers.length > 0) {
      html += `
          <div>
            <h4 style="font-size: 13px; color: #333; margin-bottom: 8px;">Провайдери:</h4>
            <ul style="list-style: none; padding-left: 0; margin: 0;">
              ${auth.providers.map(provider => `<li style="font-size: 12px; color: #555;">• ${provider}</li>`).join('')}
            </ul>
          </div>
      `;
    }

    html += `
      </div>
    `;

    return html;
  };
