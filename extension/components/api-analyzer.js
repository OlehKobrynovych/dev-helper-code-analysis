// API Routes Analyzer
window.APIAnalyzer = {
  analyzeAPIRoutes: function (jsFiles) {
    const routes = [];

    jsFiles.forEach(function (file) {
      const content = file.content;

      // 1. Next.js API Routes: export async function GET(request)
      const nextApiMatches = content.matchAll(
        /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(([^)]*)\)/gi
      );
      for (const match of nextApiMatches) {
        const args = match[2]
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);
        const method = match[1].toUpperCase();
        const path = this.extractNextJSPath(file.name);
        const lineNum = content.substring(0, match.index).split("\n").length;
        const params = this.extractRouteParamsFromContent(content, match.index);
        routes.push({
          method: method,
          path: path,
          file: file.name,
          line: lineNum,
          params: params,
          args,
        });
      }

      // 2. Express.js стиль: app.get('/api/users', ...) або router.post(...)
      const expressMatches = content.matchAll(
        /(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]+['"`]\s*,\s*\(([^)]*)\)/gi
      );
      for (const match of expressMatches) {
        const method = match[1].toUpperCase();
        const path = match[2];
        const lineNum = content.substring(0, match.index).split("\n").length;
        const params = this.extractRouteParamsFromContent(content, match.index);
        routes.push({
          method: method,
          path: path,
          file: file.name,
          line: lineNum,
          params: params,
          args: match[3]
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        });
      }

      // 3. Fetch викли: fetch('/api/users') або fetch(`/api/${id}`)
      const fetchMatches = content.matchAll(
        /\bfetch\s*\(\s*['"`]([^'"`]+)['"`]/gi
      );

      for (const match of fetchMatches) {
        const path = match[1];
        const lineNum = content.substring(0, match.index).split("\n").length;

        // Контекст після fetch
        const contextAfter = content.substring(match.index, match.index + 400);

        // HTTP метод
        const methodMatch = contextAfter.match(
          /method\s*:\s*['"`]([^'"`]+)['"`]/i
        );
        const method = methodMatch ? methodMatch[1].toUpperCase() : "GET";

        // BODY
        const bodyMatch = contextAfter.match(
          /body\s*:\s*JSON\.stringify\s*\(\s*\{([^}]+)\}/i
        );

        const bodyProps = bodyMatch
          ? bodyMatch[1].split(",").map((p) => p.trim())
          : [];

        const params = this.extractFetchParamsFromContent(content, match.index);

        routes.push({
          method,
          path,
          file: file.name,
          line: lineNum,
          params,
          type: "client",
          requestProps: {
            body: bodyProps,
          },
        });
      }

      // 4. Axios прямі методи: axios.get('/api/users') або axios.post(...)
      const axiosDirectMatches = content.matchAll(
        /\baxios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi
      );
      for (const match of axiosDirectMatches) {
        const method = match[1].toUpperCase();
        const path = match[2];
        const lineNum = content.substring(0, match.index).split("\n").length;
        const params = this.extractAxiosParamsFromContent(content, match.index);
        routes.push({
          method: method,
          path: path,
          file: file.name,
          line: lineNum,
          params: params,
          type: "client",
        });
      }

      // 5. Axios конфіг: axios({ method: 'POST', url: '/api/users' })
      const axiosConfigMatches = content.matchAll(
        /\baxios\s*\(\s*\{[^}]*?(?:method\s*:\s*['"`]([^'"`]+)['"`])[^}]*?(?:url\s*:\s*['"`]([^'"`]+)['"`])|(?:url\s*:\s*['"`]([^'"`]+)['"`])[^}]*?(?:method\s*:\s*['"`]([^'"`]+)['"`])/gis
      );
      for (const match of axiosConfigMatches) {
        const method = (match[1] || match[4] || "GET").toUpperCase();
        const path = match[2] || match[3];
        if (path) {
          const lineNum = content.substring(0, match.index).split("\n").length;
          const params = this.extractAxiosParamsFromContent(
            content,
            match.index
          );
          routes.push({
            method: method,
            path: path,
            file: file.name,
            line: lineNum,
            params: params,
            type: "client",
          });
        }
      }

      // 6. axiosInterceptor.get або інші кастомні інстанси
      const customAxiosMatches = content.matchAll(
        /\b((?:[a-zA-Z_$][a-zA-Z0-9_$]*)(?:Interceptor|Client|Api|Instance|Axios|Service)|api|http|request|client)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi
      );
      for (const match of customAxiosMatches) {
        const method = match[2].toUpperCase();
        const path = match[3];
        const lineNum = content.substring(0, match.index).split("\n").length;
        const params = this.extractAxiosParamsFromContent(content, match.index);
        routes.push({
          method: method,
          path: path,
          file: file.name,
          line: lineNum,
          params: params,
          type: "client",
        });
      }

      // 7. useSWR hooks: useSWR('/api/user', fetcher)
      const swrMatches = content.matchAll(
        /\buseSWR\s*\(\s*['"`]([^'"`]+)['"`]/gi
      );
      for (const match of swrMatches) {
        const path = match[1];
        const lineNum = content.substring(0, match.index).split("\n").length;
        routes.push({
          method: "GET",
          path: path,
          file: file.name,
          line: lineNum,
          params: null,
          type: "client",
        });
      }

      // 8. Custom Request Wrappers: fetchRequest("GET", "/api/url")
      const customWrapperMatches = content.matchAll(
        /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*["'](GET|POST|PUT|DELETE|PATCH)["']\s*,\s*[`'"]([^`'"]+)[`'"]/gi
      );
      for (const match of customWrapperMatches) {
        const method = match[2].toUpperCase();
        const path = match[3];
        const lineNum = content.substring(0, match.index).split("\n").length;

        if (path.length > 1) {
          routes.push({
            method: method,
            path: path,
            file: file.name,
            line: lineNum,
            params: null,
            type: "client",
          });
        }
      }
    }, this);

    // Групуємо роути за шляхом та методом
    const groupedRoutes = {};
    routes.forEach(function (route) {
      const key = route.method + " " + route.path;
      if (!groupedRoutes[key]) {
        groupedRoutes[key] = {
          method: route.method,
          path: route.path,
          files: [],
          params: route.params,
          type: route.type,
        };
      }

      const fileInfo = route.file + (route.line ? ":" + route.line : "");
      if (groupedRoutes[key].files.indexOf(fileInfo) === -1) {
        groupedRoutes[key].files.push(fileInfo);
      }

      // Об'єднуємо параметри з різних файлів
      if (route.params) {
        if (!groupedRoutes[key].params) {
          groupedRoutes[key].params = route.params;
        } else {
          Object.keys(route.params).forEach(function (paramType) {
            if (route.params[paramType]) {
              if (!groupedRoutes[key].params[paramType]) {
                groupedRoutes[key].params[paramType] = [];
              }
              route.params[paramType].forEach(function (param) {
                if (
                  groupedRoutes[key].params[paramType].indexOf(param) === -1
                ) {
                  groupedRoutes[key].params[paramType].push(param);
                }
              });
            }
          });
        }
      }
    });

    const result = Object.values(groupedRoutes);
    console.log("🌐 Found", result.length, "API routes");
    return result;
  },

  extractNextJSPath: function (fileName) {
    // Конвертуємо шлях файлу Next.js в API роут
    const match = fileName.match(/\/api\/(.+?)\/route\.(js|ts|jsx|tsx)$/);
    if (match) {
      return "/api/" + match[1];
    }
    const pagesMatch = fileName.match(/\/pages\/api\/(.+?)\.(js|ts|jsx|tsx)$/);
    if (pagesMatch) {
      return "/api/" + pagesMatch[1];
    }
    return fileName;
  },

  extractRouteParamsFromContent: function (content, startIndex) {
    const params = {
      body: [],
      query: [],
      headers: [],
    };

    const context = content.substring(startIndex, startIndex + 1000);

    // Body параметри
    const bodyMatches = context.matchAll(
      /(?:req\.body|request\.json\(\)|await\s+request\.json\(\))\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    );
    for (const match of bodyMatches) {
      if (params.body.indexOf(match[1]) === -1) {
        params.body.push(match[1]);
      }
    }

    // Деструктуризація body
    const destructMatches = context.matchAll(
      /const\s*\{\s*([^}]+)\}\s*=\s*(?:await\s+)?(?:req\.body|request\.json\(\)|body)/g
    );
    for (const match of destructMatches) {
      const vars = match[1].split(",");
      vars.forEach(function (v) {
        const varName = v.trim().split(":")[0].trim();
        if (varName && params.body.indexOf(varName) === -1) {
          params.body.push(varName);
        }
      });
    }

    // Query параметри
    const queryMatches = context.matchAll(
      /(?:req\.query|searchParams|params)\.(?:get\s*\(\s*['"`]([^'"`]+)['"`]\)|([a-zA-Z_$][a-zA-Z0-9_$]*))/g
    );
    for (const match of queryMatches) {
      const paramName = match[1] || match[2];
      if (paramName && params.query.indexOf(paramName) === -1) {
        params.query.push(paramName);
      }
    }

    // Headers
    const headerMatches = context.matchAll(
      /(?:req\.)?headers\.(?:get\s*\(\s*['"`]([^'"`]+)['"`]\)|([a-zA-Z_$][a-zA-Z0-9_$-]*))/g
    );
    for (const match of headerMatches) {
      const headerName = match[1] || match[2];
      if (headerName && params.headers.indexOf(headerName) === -1) {
        params.headers.push(headerName);
      }
    }

    return params;
  },

  extractFetchParamsFromContent: function (content, startIndex) {
    const params = {
      body: [],
      query: [],
      headers: [],
    };

    const context = content.substring(startIndex, startIndex + 500);

    // body: JSON.stringify({ username, password })
    const bodyStringifyMatches = context.matchAll(
      /body\s*:\s*JSON\.stringify\s*\(\s*\{([^}]+)\}/g
    );
    for (const match of bodyStringifyMatches) {
      const vars = match[1].split(",");
      vars.forEach(function (v) {
        const varName = v.trim().split(":")[0].trim();
        if (varName && params.body.indexOf(varName) === -1) {
          params.body.push(varName);
        }
      });
    }

    // body: { key: value }
    const bodyObjectMatches = context.matchAll(/body\s*:\s*\{([^}]+)\}/g);
    for (const match of bodyObjectMatches) {
      if (!match[1].includes("JSON.stringify")) {
        const vars = match[1].split(",");
        vars.forEach(function (v) {
          const varName = v.trim().split(":")[0].trim();
          if (varName && params.body.indexOf(varName) === -1) {
            params.body.push(varName);
          }
        });
      }
    }

    // headers
    const headerMatches = context.matchAll(/headers\s*:\s*\{([^}]+)\}/g);
    for (const match of headerMatches) {
      const headerLines = match[1].split(",");
      headerLines.forEach(function (line) {
        const headerMatch = line.match(/['"`]([a-zA-Z-]+)['"`]\s*:/);
        if (headerMatch && params.headers.indexOf(headerMatch[1]) === -1) {
          params.headers.push(headerMatch[1]);
        }
      });
    }

    return params;
  },

  extractAxiosParamsFromContent: function (content, startIndex) {
    const params = {
      body: [],
      query: [],
      headers: [],
    };

    const context = content.substring(startIndex, startIndex + 500);

    // data: { username, password }
    const dataMatches = context.matchAll(
      /(?:data\s*:\s*\{([^}]+)\}|\{\s*([^}]+)\s*\})/g
    );
    for (const match of dataMatches) {
      const dataContent = match[1] || match[2];
      if (dataContent) {
        const vars = dataContent.split(",");
        vars.forEach(function (v) {
          const varName = v.trim().split(":")[0].trim();
          if (
            varName &&
            varName !== "method" &&
            varName !== "url" &&
            varName !== "headers" &&
            varName !== "params" &&
            params.body.indexOf(varName) === -1
          ) {
            params.body.push(varName);
          }
        });
      }
    }

    // params: { page, limit }
    const paramsMatches = context.matchAll(/params\s*:\s*\{([^}]+)\}/g);
    for (const match of paramsMatches) {
      const vars = match[1].split(",");
      vars.forEach(function (v) {
        const varName = v.trim().split(":")[0].trim();
        if (varName && params.query.indexOf(varName) === -1) {
          params.query.push(varName);
        }
      });
    }

    // headers
    const headerMatches = context.matchAll(/headers\s*:\s*\{([^}]+)\}/g);
    for (const match of headerMatches) {
      const headerLines = match[1].split(",");
      headerLines.forEach(function (line) {
        const headerMatch = line.match(/['"`]?([a-zA-Z-]+)['"`]?\s*:/);
        if (headerMatch && params.headers.indexOf(headerMatch[1]) === -1) {
          params.headers.push(headerMatch[1]);
        }
      });
    }

    return params;
  },
};
