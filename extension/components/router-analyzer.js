// Router Analyzer - React Router v5/v6, Next.js App/Pages Router
window.RouterAnalyzer = {
  analyze: function (files, jsFiles, frameworkInfo) {
    const routes = [];

    // Визначаємо тип роутера
    const routerType = this._detectRouterType(files, jsFiles, frameworkInfo);

    // Аналізуємо роути залежно від типу
    // Middleware analysis
    let middleware = null;

    if (routerType.nextjs) {
      if (routerType.nextjs.appRouter) {
        this._analyzeNextAppRouter(files, routes);
        this._analyzeParallelRoutes(files, routes);
      }
      if (routerType.nextjs.pagesRouter) {
        this._analyzeNextPagesRouter(files, routes);
      }
      // Analyze middleware
      middleware = this._analyzeMiddleware(files);
    }

    if (routerType.reactRouter) {
      this._analyzeReactRouter(jsFiles, routes, routerType.reactRouter.version);
    }

    // Аналізуємо конфігураційний роутінг
    this._analyzeConfigRouting(jsFiles, routes);

    // Сортуємо роути за шляхом
    routes.sort((a, b) => a.path.localeCompare(b.path));

    return {
      routerType: routerType,
      routes: routes,
      middleware: middleware,
      stats: {
        total: routes.length,
        dynamic: routes.filter((r) => r.params && r.params.length > 0).length,
        api: routes.filter((r) => r.type === 'api').length,
        pages: routes.filter((r) => r.type === 'page').length,
        parallel: routes.filter((r) => r.isParallel).length,
      },
    };
  },

  _detectRouterType: function (files, jsFiles, frameworkInfo) {
    const result = {
      nextjs: null,
      reactRouter: null,
      remix: false,
      tanstack: false,
    };

    // Next.js detection
    const hasAppDir = files.some(
      (f) =>
        f.name.match(/\/app\//) &&
        f.name.match(/\/(page|layout|route)\.(js|jsx|ts|tsx)$/)
    );
    const hasPagesDir = files.some(
      (f) =>
        f.name.match(/\/pages\//) &&
        !f.name.includes('/api/') &&
        f.name.match(/\.(js|jsx|ts|tsx)$/)
    );

    if (hasAppDir || hasPagesDir) {
      result.nextjs = {
        appRouter: hasAppDir,
        pagesRouter: hasPagesDir,
        hybrid: hasAppDir && hasPagesDir,
      };
    }

    // React Router detection
    const hasReactRouter = jsFiles.some(
      (f) =>
        f.content.includes('react-router-dom') ||
        f.content.includes('react-router')
    );

    if (hasReactRouter) {
      // Detect version by syntax
      const hasV6Syntax = jsFiles.some(
        (f) =>
          f.content.includes('<Routes>') ||
          f.content.includes('element={') ||
          f.content.includes('createBrowserRouter')
      );
      const hasV5Syntax = jsFiles.some(
        (f) =>
          f.content.includes('<Switch>') ||
          (f.content.includes('<Route') && f.content.includes('component={'))
      );

      result.reactRouter = {
        detected: true,
        version: hasV6Syntax ? 6 : hasV5Syntax ? 5 : 'unknown',
      };
    }

    // Remix detection
    result.remix = jsFiles.some(
      (f) =>
        f.content.includes('@remix-run') || f.content.includes('remix-run')
    );

    // TanStack Router detection
    result.tanstack = jsFiles.some(
      (f) =>
        f.content.includes('@tanstack/router') ||
        f.content.includes('@tanstack/react-router')
    );

    return result;
  },

  // === NEXT.JS APP ROUTER ===
  _analyzeNextAppRouter: function (files, routes) {
    // Знаходимо всі page.tsx/jsx файли
    const pageFiles = files.filter((f) =>
      f.name.match(/\/app\/.*\/page\.(js|jsx|ts|tsx)$/)
    );

    // Знаходимо всі route.tsx/jsx файли (API routes)
    const routeFiles = files.filter((f) =>
      f.name.match(/\/app\/.*\/route\.(js|jsx|ts|tsx)$/)
    );

    // Аналізуємо page файли
    pageFiles.forEach((file) => {
      const route = this._parseNextAppRoute(file.name, 'page');
      if (route) {
        route.hasClientDirective =
          file.content && file.content.includes("'use client'");
        route.hasServerDirective =
          file.content && file.content.includes("'use server'");
        routes.push(route);
      }
    });

    // Аналізуємо route файли (API)
    routeFiles.forEach((file) => {
      const route = this._parseNextAppRoute(file.name, 'api');
      if (route && file.content) {
        // Витягуємо HTTP методи
        route.methods = this._extractHttpMethods(file.content);
      }
      if (route) {
        routes.push(route);
      }
    });
  },

  _parseNextAppRoute: function (filePath, type) {
    // Витягуємо шлях з app/
    const appMatch = filePath.match(/\/app\/(.+)\/(page|route)\.(js|jsx|ts|tsx)$/);
    if (!appMatch) return null;

    let routePath = appMatch[1];

    // Конвертуємо Next.js динамічні сегменти в параметри
    const params = [];

    // [id] -> :id (dynamic)
    routePath = routePath.replace(/\[([^\]\.]+)\]/g, (match, param) => {
      params.push({ name: param, type: 'dynamic' });
      return ':' + param;
    });

    // [...slug] -> *slug (catch-all)
    routePath = routePath.replace(/\[\.\.\.([^\]]+)\]/g, (match, param) => {
      params.push({ name: param, type: 'catch-all' });
      return '*' + param;
    });

    // [[...slug]] -> *slug? (optional catch-all)
    routePath = routePath.replace(/\[\[\.\.\.([^\]]+)\]\]/g, (match, param) => {
      params.push({ name: param, type: 'optional-catch-all' });
      return '*' + param + '?';
    });

    // Групи маршрутів (group) -> видаляємо
    routePath = routePath.replace(/\([^)]+\)\//g, '');

    return {
      path: '/' + routePath,
      type: type,
      file: filePath,
      framework: 'Next.js',
      router: 'App Router',
      params: params,
    };
  },

  // === NEXT.JS PAGES ROUTER ===
  _analyzeNextPagesRouter: function (files, routes) {
    const pageFiles = files.filter(
      (f) =>
        f.name.match(/\/pages\/.*\.(js|jsx|ts|tsx)$/) &&
        !f.name.includes('/api/') &&
        !f.name.match(/\/_app\.(js|jsx|ts|tsx)$/) &&
        !f.name.match(/\/_document\.(js|jsx|ts|tsx)$/) &&
        !f.name.match(/\/_error\.(js|jsx|ts|tsx)$/) &&
        !f.name.match(/\/404\.(js|jsx|ts|tsx)$/) &&
        !f.name.match(/\/500\.(js|jsx|ts|tsx)$/)
    );

    const apiFiles = files.filter((f) =>
      f.name.match(/\/pages\/api\/.*\.(js|jsx|ts|tsx)$/)
    );

    // Аналізуємо page файли
    pageFiles.forEach((file) => {
      const route = this._parseNextPagesRoute(file.name, 'page');
      if (route) {
        routes.push(route);
      }
    });

    // Аналізуємо API файли
    apiFiles.forEach((file) => {
      const route = this._parseNextPagesRoute(file.name, 'api');
      if (route && file.content) {
        route.methods = this._extractHttpMethods(file.content);
      }
      if (route) {
        routes.push(route);
      }
    });
  },

  _parseNextPagesRoute: function (filePath, type) {
    // Витягуємо шлях з pages/
    const pagesMatch = filePath.match(
      /\/pages\/(.+)\.(js|jsx|ts|tsx)$/
    );
    if (!pagesMatch) return null;

    let routePath = pagesMatch[1];
    const params = [];

    // index -> /
    if (routePath === 'index') {
      routePath = '';
    } else if (routePath.endsWith('/index')) {
      routePath = routePath.replace(/\/index$/, '');
    }

    // [id] -> :id
    routePath = routePath.replace(/\[([^\]\.]+)\]/g, (match, param) => {
      params.push({ name: param, type: 'dynamic' });
      return ':' + param;
    });

    // [...slug] -> *slug
    routePath = routePath.replace(/\[\.\.\.([^\]]+)\]/g, (match, param) => {
      params.push({ name: param, type: 'catch-all' });
      return '*' + param;
    });

    // [[...slug]] -> *slug?
    routePath = routePath.replace(/\[\[\.\.\.([^\]]+)\]\]/g, (match, param) => {
      params.push({ name: param, type: 'optional-catch-all' });
      return '*' + param + '?';
    });

    return {
      path: '/' + routePath,
      type: type,
      file: filePath,
      framework: 'Next.js',
      router: 'Pages Router',
      params: params,
    };
  },

  // === REACT ROUTER ===
  _analyzeReactRouter: function (jsFiles, routes, version) {
    jsFiles.forEach((file) => {
      const content = file.content || "";

      if (version === 6) {
        // React Router v6: <Route path="/users/:id" element={<UserPage />} />
        const v6Matches = content.matchAll(
          /<Route\s+[^>]*path\s*=\s*["']([^"']+)["'][^>]*element\s*=\s*\{?\s*([^}]+?)\s*\}?/g
        );
        for (const match of v6Matches) {
          const routePath = match[1];
          const component = this._extractReactElementComponent(match[2]);
          this._addRouteIfNotExists(
            routes,
            this._parseReactRouterRoute(routePath, component, file.name, 6)
          );
        }

        // Alternative: element before path
        const v6AltMatches = content.matchAll(
          /<Route\s+[^>]*element\s*=\s*\{?\s*([^}]+?)\s*\}?[^>]*path\s*=\s*["']([^"']+)["']/g
        );
        for (const match of v6AltMatches) {
          const component = this._extractReactElementComponent(match[1]);
          const routePath = match[2];
          this._addRouteIfNotExists(
            routes,
            this._parseReactRouterRoute(routePath, component, file.name, 6)
          );
        }

        // Index routes: <Route index element={<Home />} />
        const v6IndexMatches = content.matchAll(
          /<Route\s+[^>]*\bindex\b[^>]*element\s*=\s*\{?\s*([^}]+?)\s*\}?/g
        );
        for (const match of v6IndexMatches) {
          const component = this._extractReactElementComponent(match[1]);
          this._addRouteIfNotExists(
            routes,
            this._parseReactRouterRoute("(index)", component, file.name, 6)
          );
        }

        const v6IndexAltMatches = content.matchAll(
          /<Route\s+[^>]*element\s*=\s*\{?\s*([^}]+?)\s*\}?[^>]*\bindex\b/g
        );
        for (const match of v6IndexAltMatches) {
          const component = this._extractReactElementComponent(match[1]);
          this._addRouteIfNotExists(
            routes,
            this._parseReactRouterRoute("(index)", component, file.name, 6)
          );
        }

        // createBrowserRouter syntax
        const routerConfigMatches = content.matchAll(
          /\{\s*path\s*:\s*["']([^"']+)["'][^}]*?(?:element\s*:\s*([^,}]+)|Component\s*:\s*([A-Z][a-zA-Z0-9_]*)|component\s*:\s*([A-Z][a-zA-Z0-9_]*)|lazy\s*:\s*([^,}]+))/g
        );
        for (const match of routerConfigMatches) {
          const routePath = match[1];
          const elementSource = match[2];
          const component =
            this._extractReactElementComponent(elementSource) ||
            match[3] ||
            match[4] ||
            (match[5] ? "lazy" : null);
          this._addRouteIfNotExists(
            routes,
            this._parseReactRouterRoute(routePath, component, file.name, 6)
          );
        }

        // useRoutes / config index routes: { index: true, element: <Home /> }
        const indexConfigMatches = content.matchAll(
          /\{\s*index\s*:\s*true[^}]*?(?:element\s*:\s*([^,}]+)|Component\s*:\s*([A-Z][a-zA-Z0-9_]*)|component\s*:\s*([A-Z][a-zA-Z0-9_]*)|lazy\s*:\s*([^,}]+))/g
        );
        for (const match of indexConfigMatches) {
          const elementSource = match[1];
          const component =
            this._extractReactElementComponent(elementSource) ||
            match[2] ||
            match[3] ||
            (match[4] ? "lazy" : null);
          this._addRouteIfNotExists(
            routes,
            this._parseReactRouterRoute("(index)", component, file.name, 6)
          );
        }
      } else {
        // React Router v5: <Route path="/users/:id" component={UserPage} />
        const v5Matches = content.matchAll(
          /<Route\s+[^>]*path\s*=\s*["']([^"']+)["'][^>]*component\s*=\s*\{?\s*([A-Z][a-zA-Z0-9]*)/g
        );
        for (const match of v5Matches) {
          const routePath = match[1];
          const component = match[2];
          this._addRouteIfNotExists(
            routes,
            this._parseReactRouterRoute(routePath, component, file.name, 5)
          );
        }

        // Alternative: component before path
        const v5AltMatches = content.matchAll(
          /<Route\s+[^>]*component\s*=\s*\{?\s*([A-Z][a-zA-Z0-9]*)[^>]*path\s*=\s*["']([^"']+)["']/g
        );
        for (const match of v5AltMatches) {
          const component = match[1];
          const routePath = match[2];
          routes.push(this._parseReactRouterRoute(routePath, component, file.name, 5));
        }

        // render prop: <Route path="..." render={() => <Component />} />
        const renderMatches = content.matchAll(
          /<Route\s+[^>]*path\s*=\s*["']([^"']+)["'][^>]*render\s*=\s*\{[^}]*<([A-Z][a-zA-Z0-9]*)/g
        );
        for (const match of renderMatches) {
          const routePath = match[1];
          const component = match[2];
          this._addRouteIfNotExists(
            routes,
            this._parseReactRouterRoute(routePath, component, file.name, 5)
          );
        }
      }
    });
  },

  _parseReactRouterRoute: function (routePath, component, filePath, version) {
    const params = [];

    // :id -> dynamic param
    const dynamicMatches = routePath.matchAll(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
    for (const match of dynamicMatches) {
      params.push({ name: match[1], type: 'dynamic' });
    }

    // * -> catch-all (v6)
    if (routePath.includes('*')) {
      params.push({ name: 'splat', type: 'catch-all' });
    }

    return {
      path: routePath,
      type: 'page',
      file: filePath,
      framework: 'React',
      router: `React Router v${version}`,
      component: component,
      params: params,
    };
  },

  _extractReactElementComponent: function (elementSource) {
    if (!elementSource) return null;
    const matches = [...elementSource.matchAll(/<([A-Z][a-zA-Z0-9_]*)/g)];
    if (matches.length === 0) return null;
    return matches[matches.length - 1][1];
  },

  _addRouteIfNotExists: function (routes, route) {
    if (!route) return;
    const exists = routes.some(
      (r) => r.path === route.path && r.file === route.file
    );
    if (!exists) {
      routes.push(route);
    }
  },

  // === CONFIG-BASED ROUTING ===
  _analyzeConfigRouting: function (jsFiles, routes) {
    // Шукаємо файли конфігурації роутінгу
    const configFiles = jsFiles.filter(
      (f) =>
        f.name.match(/routes?\.(js|jsx|ts|tsx)$/) ||
        f.name.match(/routes?\.config\.(js|jsx|ts|tsx)$/) ||
        f.name.match(/router\.(js|jsx|ts|tsx)$/)
    );

    configFiles.forEach((file) => {
      const content = file.content;

      // Шукаємо об'єкти маршрутів: { path: '/users', component: UserPage }
      const configMatches = content.matchAll(
        /\{\s*path\s*:\s*["']([^"']+)["'][^}]*(?:component|element)\s*:\s*([A-Z][a-zA-Z0-9]*)/g
      );

      for (const match of configMatches) {
        const routePath = match[1];
        const component = match[2];

        // Перевіряємо чи вже є такий маршрут
        const exists = routes.some(
          (r) => r.path === routePath && r.component === component
        );
        if (!exists) {
          routes.push(
            this._parseReactRouterRoute(routePath, component, file.name, 'config')
          );
        }
      }
    });
  },

  // === PARALLEL ROUTES (@folder) ===
  _analyzeParallelRoutes: function (files, routes) {
    // Find parallel route folders (@modal, @sidebar, etc.)
    const parallelRouteFiles = files.filter((f) =>
      f.name.match(/\/app\/.*\/@[^/]+\/.*\/(page|default)\.(js|jsx|ts|tsx)$/)
    );

    parallelRouteFiles.forEach((file) => {
      const route = this._parseParallelRoute(file.name);
      if (route) {
        route.hasClientDirective =
          file.content && file.content.includes("'use client'");
        routes.push(route);
      }
    });
  },

  _parseParallelRoute: function (filePath) {
    // Extract parallel route info: app/@modal/photo/[id]/page.tsx
    const match = filePath.match(
      /\/app\/(.*)@([^/]+)\/(.+)\/(page|default)\.(js|jsx|ts|tsx)$/
    );
    if (!match) return null;

    const prefix = match[1]; // Path before @slot
    const slotName = match[2]; // modal, sidebar, etc.
    let routePath = match[3]; // Path after @slot

    const params = [];

    // Handle dynamic segments
    routePath = routePath.replace(/\[([^\]\.]+)\]/g, (m, param) => {
      params.push({ name: param, type: 'dynamic' });
      return ':' + param;
    });

    // Handle catch-all
    routePath = routePath.replace(/\[\.\.\.([^\]]+)\]/g, (m, param) => {
      params.push({ name: param, type: 'catch-all' });
      return '*' + param;
    });

    // Remove route groups
    routePath = routePath.replace(/\([^)]+\)\//g, '');

    return {
      path: '/' + prefix + routePath,
      type: 'parallel',
      slot: slotName,
      file: filePath,
      framework: 'Next.js',
      router: 'App Router',
      params: params,
      isParallel: true,
    };
  },

  // === MIDDLEWARE ANALYSIS ===
  _analyzeMiddleware: function (files) {
    // Find middleware.ts/js at root or in src/
    const middlewareFile = files.find(
      (f) =>
        f.name.match(/^[^/]*middleware\.(js|ts)$/) ||
        f.name.match(/\/middleware\.(js|ts)$/)
    );

    if (!middlewareFile) return null;

    const content = middlewareFile.content || '';
    const result = {
      file: middlewareFile.name,
      hasConfig: false,
      matchers: [],
      features: [],
    };

    // Extract matcher config
    // export const config = { matcher: [...] }
    const matcherMatch = content.match(
      /export\s+const\s+config\s*=\s*\{[^}]*matcher\s*:\s*(\[[^\]]*\]|['"][^'"]+['"])/s
    );
    if (matcherMatch) {
      result.hasConfig = true;
      try {
        // Try to parse matchers
        const matcherStr = matcherMatch[1];
        if (matcherStr.startsWith('[')) {
          // Array of matchers
          const matches = matcherStr.matchAll(/['"]([^'"]+)['"]/g);
          for (const m of matches) {
            result.matchers.push(m[1]);
          }
        } else {
          // Single matcher string
          const singleMatch = matcherStr.match(/['"]([^'"]+)['"]/);
          if (singleMatch) {
            result.matchers.push(singleMatch[1]);
          }
        }
      } catch (e) {
        console.warn('Failed to parse middleware matcher:', e);
      }
    }

    // Detect features used in middleware
    if (content.includes('NextResponse.redirect')) {
      result.features.push('redirect');
    }
    if (content.includes('NextResponse.rewrite')) {
      result.features.push('rewrite');
    }
    if (content.includes('NextResponse.next')) {
      result.features.push('next');
    }
    if (content.includes('request.cookies') || content.includes('response.cookies')) {
      result.features.push('cookies');
    }
    if (content.includes('request.headers') || content.includes('response.headers')) {
      result.features.push('headers');
    }
    if (content.includes('NextRequest')) {
      result.features.push('NextRequest');
    }
    if (content.includes('geo') || content.includes('ip')) {
      result.features.push('geolocation');
    }
    if (content.includes('auth') || content.includes('token') || content.includes('session')) {
      result.features.push('authentication');
    }

    return result;
  },

  // === HELPERS ===
  _extractHttpMethods: function (content) {
    const methods = [];

    // Next.js App Router: export async function GET/POST/PUT/DELETE/PATCH
    const nextMethods = content.matchAll(
      /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*\(/gi
    );
    for (const match of nextMethods) {
      methods.push(match[1].toUpperCase());
    }

    // Express style: req.method === 'GET'
    if (content.includes("req.method")) {
      const methodChecks = content.matchAll(
        /req\.method\s*===?\s*["'](GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)["']/gi
      );
      for (const match of methodChecks) {
        if (!methods.includes(match[1].toUpperCase())) {
          methods.push(match[1].toUpperCase());
        }
      }
    }

    // Default to GET if no methods detected for API routes
    if (methods.length === 0) {
      methods.push('GET');
    }

    return methods;
  },
};
