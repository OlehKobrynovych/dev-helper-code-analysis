// API Usage Analyzer - зіставлення server routes з client calls
window.APIUsageAnalyzer = {
  analyze: function (jsFiles, apiRoutes) {
    const result = {
      serverEndpoints: [],
      clientCalls: [],
      matched: [],
      unmatchedServer: [],
      unmatchedClient: [],
      stats: {
        totalServerEndpoints: 0,
        totalClientCalls: 0,
        matchedCount: 0,
        coverage: 0,
      },
    };

    // Extract server endpoints from API routes
    result.serverEndpoints = this._extractServerEndpoints(apiRoutes);

    // Extract client API calls
    result.clientCalls = this._extractClientCalls(jsFiles);

    // Match server endpoints with client calls
    this._matchEndpoints(result);

    // Calculate stats
    result.stats.totalServerEndpoints = result.serverEndpoints.length;
    result.stats.totalClientCalls = result.clientCalls.length;
    result.stats.matchedCount = result.matched.length;
    result.stats.coverage =
      result.serverEndpoints.length > 0
        ? Math.round(
            (result.matched.length / result.serverEndpoints.length) * 100
          )
        : 0;

    return result;
  },

  _extractServerEndpoints: function (apiRoutes) {
    if (!apiRoutes || !Array.isArray(apiRoutes)) return [];

    return apiRoutes
      .filter((route) => route.type === 'api')
      .map((route) => ({
        path: route.path,
        methods: route.methods || ['GET'],
        file: route.file,
        params: route.params || [],
      }));
  },

  _extractClientCalls: function (jsFiles) {
    const calls = [];

    jsFiles.forEach((file) => {
      const content = file.content;
      if (!content) return;

      // Skip API route files and config files
      if (
        file.name.includes('/api/') ||
        file.name.includes('route.') ||
        file.name.match(/\.config\.(js|ts)$/)
      ) {
        return;
      }

      // Extract fetch calls
      this._extractFetchCalls(content, file.name, calls);

      // Extract axios calls
      this._extractAxiosCalls(content, file.name, calls);

      // Extract useSWR/useQuery calls
      this._extractDataFetchingHooks(content, file.name, calls);
    });

    return calls;
  },

  _extractFetchCalls: function (content, fileName, calls) {
    // fetch('/api/users')
    // fetch(`/api/users/${id}`)
    const fetchMatches = content.matchAll(
      /\bfetch\s*\(\s*['"`]([^'"`]+)['"`]/g
    );
    for (const match of fetchMatches) {
      const url = match[1];
      if (url.startsWith('/api') || url.includes('/api/')) {
        const method = this._extractMethodFromContext(content, match.index);
        calls.push({
          url: this._normalizeApiPath(url),
          method: method,
          file: fileName,
          type: 'fetch',
          raw: url,
        });
      }
    }

    // Template literal fetch: fetch(`/api/users/${id}`)
    const templateFetchMatches = content.matchAll(
      /\bfetch\s*\(\s*`([^`]+)`/g
    );
    for (const match of templateFetchMatches) {
      const url = match[1];
      if (url.startsWith('/api') || url.includes('/api/')) {
        const method = this._extractMethodFromContext(content, match.index);
        calls.push({
          url: this._normalizeApiPath(url),
          method: method,
          file: fileName,
          type: 'fetch',
          raw: url,
          isDynamic: url.includes('${'),
        });
      }
    }
  },

  _extractAxiosCalls: function (content, fileName, calls) {
    // axios.get('/api/users')
    const axiosMethodCalls = content.matchAll(
      /axios\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of axiosMethodCalls) {
      const method = match[1].toUpperCase();
      const url = match[2];
      if (url.startsWith('/api') || url.includes('/api/')) {
        calls.push({
          url: this._normalizeApiPath(url),
          method: method,
          file: fileName,
          type: 'axios',
          raw: url,
        });
      }
    }

    // axios({ url: '/api/users', method: 'POST' })
    const axiosConfigCalls = content.matchAll(
      /axios\s*\(\s*\{[^}]*url\s*:\s*['"`]([^'"`]+)['"`][^}]*method\s*:\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of axiosConfigCalls) {
      const url = match[1];
      const method = match[2].toUpperCase();
      if (url.startsWith('/api') || url.includes('/api/')) {
        calls.push({
          url: this._normalizeApiPath(url),
          method: method,
          file: fileName,
          type: 'axios',
          raw: url,
        });
      }
    }

    // api.get, apiClient.post, etc.
    const customAxiosCalls = content.matchAll(
      /(?:api|apiClient|client|httpClient)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of customAxiosCalls) {
      const method = match[1].toUpperCase();
      const url = match[2];
      if (url.startsWith('/api') || url.includes('/api/') || url.startsWith('/')) {
        calls.push({
          url: this._normalizeApiPath(url),
          method: method,
          file: fileName,
          type: 'axios-custom',
          raw: url,
        });
      }
    }
  },

  _extractDataFetchingHooks: function (content, fileName, calls) {
    // useSWR('/api/users')
    const swrMatches = content.matchAll(
      /\buseSWR\s*\(\s*['"`]([^'"`]+)['"`]/g
    );
    for (const match of swrMatches) {
      const url = match[1];
      if (url.startsWith('/api') || url.includes('/api/')) {
        calls.push({
          url: this._normalizeApiPath(url),
          method: 'GET',
          file: fileName,
          type: 'useSWR',
          raw: url,
        });
      }
    }

    // useQuery with fetch
    const useQueryMatches = content.matchAll(
      /\buseQuery\s*\([^)]*['"`]([^'"`]*\/api[^'"`]*)['"`]/g
    );
    for (const match of useQueryMatches) {
      calls.push({
        url: this._normalizeApiPath(match[1]),
        method: 'GET',
        file: fileName,
        type: 'useQuery',
        raw: match[1],
      });
    }
  },

  _extractMethodFromContext: function (content, matchIndex) {
    // Look for method in context around the fetch call
    const contextStart = Math.max(0, matchIndex - 100);
    const contextEnd = Math.min(content.length, matchIndex + 200);
    const context = content.substring(contextStart, contextEnd);

    const methodMatch = context.match(
      /method\s*:\s*['"`](GET|POST|PUT|PATCH|DELETE)['"`]/i
    );
    return methodMatch ? methodMatch[1].toUpperCase() : 'GET';
  },

  _normalizeApiPath: function (url) {
    // Remove query strings
    let path = url.split('?')[0];

    // Replace template variables with :param
    path = path.replace(/\$\{[^}]+\}/g, ':param');

    // Normalize multiple slashes
    path = path.replace(/\/+/g, '/');

    // Ensure starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    return path;
  },

  _matchEndpoints: function (result) {
    const matchedServerPaths = new Set();
    const matchedClientCalls = new Set();

    result.clientCalls.forEach((call, callIndex) => {
      result.serverEndpoints.forEach((endpoint, endpointIndex) => {
        if (this._pathsMatch(call.url, endpoint.path)) {
          // Check method match
          const methodMatches =
            endpoint.methods.includes(call.method) ||
            endpoint.methods.includes('*');

          if (methodMatches) {
            result.matched.push({
              serverEndpoint: endpoint,
              clientCall: call,
            });
            matchedServerPaths.add(endpointIndex);
            matchedClientCalls.add(callIndex);
          }
        }
      });
    });

    // Find unmatched server endpoints
    result.serverEndpoints.forEach((endpoint, index) => {
      if (!matchedServerPaths.has(index)) {
        result.unmatchedServer.push(endpoint);
      }
    });

    // Find unmatched client calls
    result.clientCalls.forEach((call, index) => {
      if (!matchedClientCalls.has(index)) {
        result.unmatchedClient.push(call);
      }
    });
  },

  _pathsMatch: function (clientPath, serverPath) {
    // Normalize paths
    const clientParts = clientPath.split('/').filter(Boolean);
    const serverParts = serverPath.split('/').filter(Boolean);

    if (clientParts.length !== serverParts.length) {
      // Check for catch-all
      const hasCatchAll = serverParts.some((p) => p.startsWith('*'));
      if (!hasCatchAll) return false;
    }

    for (let i = 0; i < serverParts.length; i++) {
      const serverPart = serverParts[i];
      const clientPart = clientParts[i];

      // Dynamic segment
      if (serverPart.startsWith(':') || serverPart.startsWith('*')) {
        continue;
      }

      // Client dynamic placeholder
      if (clientPart === ':param') {
        continue;
      }

      // Exact match required
      if (serverPart !== clientPart) {
        return false;
      }
    }

    return true;
  },
};
