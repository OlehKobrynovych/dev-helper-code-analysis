window.UIRenderer = window.UIRenderer || {};

window.UIRenderer.renderStorageAnalysis = function (result) {
    const storage = result.storage;
    if (!storage || (!storage.localStorage.length && !storage.sessionStorage.length && !storage.cookies.length && !storage.indexedDB)) {
      return '';
    }

    let html = `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#374151;">💾 Storage</h3>
        <p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">Використання локального сховища в проекті</p>
    `;

    if (storage.localStorage.length > 0) {
      html += `
          <div style="margin-bottom: 12px;">
            <h4 style="font-size: 13px; color: #333; margin-bottom: 8px;">LocalStorage:</h4>
            <ul style="list-style: none; padding-left: 0; margin: 0;">
              ${storage.localStorage.map(key => `<li style="font-size: 12px; color: #555;">• ${key}</li>`).join('')}
            </ul>
          </div>
      `;
    }

    if (storage.sessionStorage.length > 0) {
      html += `
          <div style="margin-bottom: 12px;">
            <h4 style="font-size: 13px; color: #333; margin-bottom: 8px;">SessionStorage:</h4>
            <ul style="list-style: none; padding-left: 0; margin: 0;">
              ${storage.sessionStorage.map(key => `<li style="font-size: 12px; color: #555;">• ${key}</li>`).join('')}
            </ul>
          </div>
      `;
    }

    if (storage.cookies.length > 0) {
      html += `
          <div style="margin-bottom: 12px;">
            <h4 style="font-size: 13px; color: #333; margin-bottom: 8px;">Cookies:</h4>
            <ul style="list-style: none; padding-left: 0; margin: 0;">
              ${storage.cookies.map(key => `<li style="font-size: 12px; color: #555;">• ${key}</li>`).join('')}
            </ul>
          </div>
      `;
    }
    
    if (storage.indexedDB) {
      html += `
          <div>
            <h4 style="font-size: 13px; color: #333; margin-bottom: 8px;">IndexedDB:</h4>
            <p style="font-size: 12px; color: #555; margin: 0;">Проект використовує IndexedDB.</p>
          </div>
      `;
    }

    html += `
      </div>
    `;

    return html;
  };
