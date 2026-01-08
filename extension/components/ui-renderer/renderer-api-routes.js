window.UIRenderer = window.UIRenderer || {};

// 15. Render API Routes
window.UIRenderer.renderAPIRoutes = function (result) {
    const apiRoutes = result.apiRoutes || [];
    if (apiRoutes.length === 0) return "";

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

      if (priorityA !== priorityB) return priorityA - priorityB;
      if (priorityA === 2 && methodA !== methodB)
        return methodA.localeCompare(methodB);

      const pathA = routeA.path || "";
      const pathB = routeB.path || "";
      return pathA.localeCompare(pathB);
    });

    let html =
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#8b5cf6;">🌐 API Роути (' +
      apiRoutes.length +
      ")</h3>";
    html +=
      '<p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">Знайдені API ендпоінти та їх параметри</p>';
    html += '<div style="max-height:400px;overflow-y:auto;">';

    sortedRoutes.forEach((route) => {
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

        // Handler arguments (server)
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

        // Path params
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

        // Body params
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

        // Query params
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

        // Headers
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

        // Client request props (fetch / axios)
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
    });

    html += "</div></div>";
    return html;
  };
