// Framework Detector - визначення фреймворків, версій та build tools
window.FrameworkDetector = {
  detect: function (files, packageJson) {
    const result = {
      // Core frameworks
      react: { detected: false, version: null },
      nextjs: { detected: false, version: null, router: null },
      vue: { detected: false, version: null },
      angular: { detected: false, version: null },
      svelte: { detected: false, version: null },

      // Meta frameworks
      remix: { detected: false, version: null },
      astro: { detected: false, version: null },
      nuxt: { detected: false, version: null },
      gatsby: { detected: false, version: null },

      // CSS frameworks
      css: {
        tailwind: false,
        bootstrap: false,
        mui: false,
        chakra: false,
        antd: false,
        styledComponents: false,
        emotion: false,
        cssModules: false,
        sass: false,
        less: false,
      },

      // Build tools
      build: {
        tool: null,
        bundler: null,
        turbopack: false,
        typescript: false,
      },

      // Project classification
      projectType: 'Unknown',
      confidence: 0,
      reasons: [], // Детальні причини для confidence
    };

    // Parse dependencies from package.json
    const deps = this._getAllDependencies(packageJson);

    // Try to get exact versions from lock files
    const lockFileVersions = this._parseVersionsFromLockFiles(files);
    const depNames = Object.keys(deps);

    // === CORE FRAMEWORKS ===
    this._detectReact(result, deps, depNames, files, lockFileVersions);
    this._detectNextjs(result, deps, depNames, files, lockFileVersions);
    this._detectVue(result, deps, depNames, files, lockFileVersions);
    this._detectAngular(result, deps, depNames, files, lockFileVersions);
    this._detectSvelte(result, deps, depNames, files, lockFileVersions);

    // === META FRAMEWORKS ===
    this._detectRemix(result, deps, depNames, files, lockFileVersions);
    this._detectAstro(result, deps, depNames, files, lockFileVersions);
    this._detectNuxt(result, deps, depNames, files, lockFileVersions);
    this._detectGatsby(result, deps, depNames, files, lockFileVersions);

    // === CSS FRAMEWORKS ===
    this._detectCSSFrameworks(result, deps, depNames, files);

    // === BUILD TOOLS ===
    this._detectBuildTools(result, deps, depNames, files, packageJson);

    // === PROJECT TYPE ===
    this._classifyProjectType(result);

    // === CONFIDENCE SCORE ===
    const confidenceResult = this._calculateConfidence(result);
    result.confidence = confidenceResult.score;
    result.reasons = confidenceResult.reasons;

    return result;
  },

  _getAllDependencies: function (packageJson) {
    if (!packageJson) return {};
    return {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
      ...(packageJson.peerDependencies || {}),
    };
  },

  // Parse exact versions from lock files
  _parseVersionsFromLockFiles: function (files) {
    const versions = {};

    // Try package-lock.json first
    const packageLock = files.find((f) => f.name.match(/package-lock\.json$/));
    if (packageLock) {
      try {
        const lock = JSON.parse(packageLock.content);
        // npm v7+ format
        if (lock.packages && lock.packages['']) {
          const rootDeps = lock.packages[''].dependencies || {};
          Object.keys(rootDeps).forEach((dep) => {
            const pkgKey = `node_modules/${dep}`;
            if (lock.packages[pkgKey]) {
              versions[dep] = lock.packages[pkgKey].version;
            }
          });
        }
        // npm v6 format
        else if (lock.dependencies) {
          Object.entries(lock.dependencies).forEach(([name, data]) => {
            if (data.version) {
              versions[name] = data.version;
            }
          });
        }
      } catch (e) {
        console.warn('Failed to parse package-lock.json:', e);
      }
    }

    // Try yarn.lock
    const yarnLock = files.find((f) => f.name.match(/yarn\.lock$/));
    if (yarnLock && Object.keys(versions).length === 0) {
      try {
        const content = yarnLock.content;
        // Simple yarn.lock parser (handles yarn v1 format)
        const matches = content.matchAll(
          /^"?([^@\s]+)@[^":\n]+:?\n\s+version\s+"([^"]+)"/gm
        );
        for (const match of matches) {
          if (!versions[match[1]]) {
            versions[match[1]] = match[2];
          }
        }
      } catch (e) {
        console.warn('Failed to parse yarn.lock:', e);
      }
    }

    // Try pnpm-lock.yaml
    const pnpmLock = files.find((f) => f.name.match(/pnpm-lock\.yaml$/));
    if (pnpmLock && Object.keys(versions).length === 0) {
      try {
        const content = pnpmLock.content;
        // Simple pnpm-lock.yaml parser
        const matches = content.matchAll(
          /^\s+\/([^@]+)@(\d+\.\d+\.\d+[^:]*)/gm
        );
        for (const match of matches) {
          if (!versions[match[1]]) {
            versions[match[1]] = match[2];
          }
        }
      } catch (e) {
        console.warn('Failed to parse pnpm-lock.yaml:', e);
      }
    }

    return versions;
  },

  _parseVersion: function (versionStr) {
    if (!versionStr) return null;
    // Remove ^, ~, >=, etc.
    const clean = versionStr.replace(/^[\^~>=<]+/, '');
    const match = clean.match(/^(\d+)\.?(\d+)?\.?(\d+)?/);
    if (match) {
      return {
        major: parseInt(match[1], 10),
        minor: match[2] ? parseInt(match[2], 10) : 0,
        patch: match[3] ? parseInt(match[3], 10) : 0,
        raw: versionStr,
      };
    }
    return { raw: versionStr };
  },

  // === REACT ===
  _detectReact: function (result, deps, depNames, files, lockVersions) {
    if (deps['react']) {
      result.react.detected = true;
      // Prefer exact version from lock file
      const exactVersion = lockVersions['react'];
      result.react.version = exactVersion
        ? this._parseVersion(exactVersion)
        : this._parseVersion(deps['react']);
      result.react.versionSource = exactVersion ? 'lock-file' : 'package.json';
    } else if (deps['preact']) {
      result.react.detected = true;
      const exactVersion = lockVersions['preact'];
      result.react.version = exactVersion
        ? this._parseVersion(exactVersion)
        : this._parseVersion(deps['preact']);
      result.react.isPreact = true;
      result.react.versionSource = exactVersion ? 'lock-file' : 'package.json';
    }
  },

  // === NEXT.JS ===
  _detectNextjs: function (result, deps, depNames, files, lockVersions) {
    if (!deps['next']) return;

    result.nextjs.detected = true;
    const exactVersion = lockVersions['next'];
    result.nextjs.version = exactVersion
      ? this._parseVersion(exactVersion)
      : this._parseVersion(deps['next']);
    result.nextjs.versionSource = exactVersion ? 'lock-file' : 'package.json';

    // Determine router type
    const hasAppDir = files.some(
      (f) =>
        f.name.match(/\/app\//) &&
        f.name.match(/\/(page|layout|loading|error|not-found)\.(js|jsx|ts|tsx)$/)
    );
    const hasPagesDir = files.some(
      (f) =>
        f.name.match(/\/pages\//) &&
        !f.name.includes('/api/') &&
        f.name.match(/\.(js|jsx|ts|tsx)$/)
    );

    if (hasAppDir && hasPagesDir) {
      result.nextjs.router = 'hybrid';
    } else if (hasAppDir) {
      result.nextjs.router = 'app';
    } else if (hasPagesDir) {
      result.nextjs.router = 'pages';
    }

    // Check for Server/Client components
    result.nextjs.serverComponents = files.some(
      (f) =>
        f.name.match(/\.(js|jsx|ts|tsx)$/) &&
        f.content &&
        f.content.includes("'use server'")
    );
    result.nextjs.clientComponents = files.some(
      (f) =>
        f.name.match(/\.(js|jsx|ts|tsx)$/) &&
        f.content &&
        f.content.includes("'use client'")
    );

    // Check for middleware
    result.nextjs.hasMiddleware = files.some((f) =>
      f.name.match(/middleware\.(js|ts)$/)
    );

    // Check for parallel routes (@folder)
    result.nextjs.hasParallelRoutes = files.some((f) =>
      f.name.match(/\/app\/.*\/@[^/]+\//)
    );

    // Check for route groups ((folder))
    result.nextjs.hasRouteGroups = files.some((f) =>
      f.name.match(/\/app\/.*\/\([^)]+\)\//)
    );
  },

  // === VUE ===
  _detectVue: function (result, deps, depNames, files, lockVersions) {
    if (deps['vue']) {
      result.vue.detected = true;
      const exactVersion = lockVersions['vue'];
      result.vue.version = exactVersion
        ? this._parseVersion(exactVersion)
        : this._parseVersion(deps['vue']);
      result.vue.versionSource = exactVersion ? 'lock-file' : 'package.json';
    }
  },

  // === ANGULAR ===
  _detectAngular: function (result, deps, depNames, files, lockVersions) {
    if (deps['@angular/core']) {
      result.angular.detected = true;
      const exactVersion = lockVersions['@angular/core'];
      result.angular.version = exactVersion
        ? this._parseVersion(exactVersion)
        : this._parseVersion(deps['@angular/core']);
      result.angular.versionSource = exactVersion ? 'lock-file' : 'package.json';
    }
  },

  // === SVELTE ===
  _detectSvelte: function (result, deps, depNames, files, lockVersions) {
    if (deps['svelte']) {
      result.svelte.detected = true;
      const exactVersion = lockVersions['svelte'];
      result.svelte.version = exactVersion
        ? this._parseVersion(exactVersion)
        : this._parseVersion(deps['svelte']);
      result.svelte.versionSource = exactVersion ? 'lock-file' : 'package.json';
    }
  },

  // === REMIX ===
  _detectRemix: function (result, deps, depNames, files, lockVersions) {
    if (deps['@remix-run/react'] || deps['remix']) {
      result.remix.detected = true;
      const depName = deps['@remix-run/react'] ? '@remix-run/react' : 'remix';
      const exactVersion = lockVersions[depName];
      result.remix.version = exactVersion
        ? this._parseVersion(exactVersion)
        : this._parseVersion(deps[depName]);
      result.remix.versionSource = exactVersion ? 'lock-file' : 'package.json';
    }
  },

  // === ASTRO ===
  _detectAstro: function (result, deps, depNames, files, lockVersions) {
    if (deps['astro']) {
      result.astro.detected = true;
      const exactVersion = lockVersions['astro'];
      result.astro.version = exactVersion
        ? this._parseVersion(exactVersion)
        : this._parseVersion(deps['astro']);
      result.astro.versionSource = exactVersion ? 'lock-file' : 'package.json';
    }
  },

  // === NUXT ===
  _detectNuxt: function (result, deps, depNames, files, lockVersions) {
    if (deps['nuxt'] || deps['nuxt3']) {
      result.nuxt.detected = true;
      const depName = deps['nuxt'] ? 'nuxt' : 'nuxt3';
      const exactVersion = lockVersions[depName];
      result.nuxt.version = exactVersion
        ? this._parseVersion(exactVersion)
        : this._parseVersion(deps[depName]);
      result.nuxt.versionSource = exactVersion ? 'lock-file' : 'package.json';
    }
  },

  // === GATSBY ===
  _detectGatsby: function (result, deps, depNames, files, lockVersions) {
    if (deps['gatsby']) {
      result.gatsby.detected = true;
      const exactVersion = lockVersions['gatsby'];
      result.gatsby.version = exactVersion
        ? this._parseVersion(exactVersion)
        : this._parseVersion(deps['gatsby']);
      result.gatsby.versionSource = exactVersion ? 'lock-file' : 'package.json';
    }
  },

  // === CSS FRAMEWORKS ===
  _detectCSSFrameworks: function (result, deps, depNames, files) {
    const css = result.css;

    // Tailwind CSS
    css.tailwind =
      !!deps['tailwindcss'] ||
      files.some(
        (f) =>
          f.name.match(/tailwind\.config\.(js|ts|mjs|cjs)$/) ||
          (f.name.match(/\.(css|scss)$/) &&
            f.content &&
            (f.content.includes('@tailwind') ||
              f.content.includes('@apply')))
      );

    // Bootstrap
    css.bootstrap =
      !!deps['bootstrap'] ||
      !!deps['react-bootstrap'] ||
      !!deps['reactstrap'] ||
      files.some(
        (f) =>
          f.name.match(/\.(css|scss)$/) &&
          f.content &&
          f.content.includes('bootstrap')
      );

    // Material-UI / MUI
    css.mui =
      !!deps['@mui/material'] ||
      !!deps['@material-ui/core'] ||
      !!deps['@mui/joy'];

    // Chakra UI
    css.chakra = !!deps['@chakra-ui/react'];

    // Ant Design
    css.antd = !!deps['antd'] || !!deps['ant-design-vue'];

    // Styled Components
    css.styledComponents = !!deps['styled-components'];

    // Emotion
    css.emotion =
      !!deps['@emotion/react'] ||
      !!deps['@emotion/styled'] ||
      !!deps['@emotion/css'];

    // CSS Modules
    css.cssModules = files.some((f) => f.name.match(/\.module\.(css|scss|sass)$/));

    // Sass/SCSS
    css.sass =
      !!deps['sass'] ||
      !!deps['node-sass'] ||
      files.some((f) => f.name.match(/\.(scss|sass)$/));

    // Less
    css.less = !!deps['less'] || files.some((f) => f.name.match(/\.less$/));
  },

  // === BUILD TOOLS ===
  _detectBuildTools: function (result, deps, depNames, files, packageJson) {
    const build = result.build;

    // TypeScript
    build.typescript =
      !!deps['typescript'] ||
      files.some((f) => f.name.match(/tsconfig\.json$/));

    // Vite
    if (
      deps['vite'] ||
      files.some((f) => f.name.match(/vite\.config\.(js|ts|mjs)$/))
    ) {
      build.tool = 'Vite';
      build.bundler = 'Rollup';
    }

    // Create React App
    if (deps['react-scripts']) {
      build.tool = 'Create React App';
      build.bundler = 'Webpack';
    }

    // Next.js with Turbopack
    if (result.nextjs.detected) {
      const scripts = packageJson?.scripts || {};
      const hasTurbopack = Object.values(scripts).some(
        (s) => s && (s.includes('--turbo') || s.includes('--turbopack'))
      );
      if (hasTurbopack) {
        build.turbopack = true;
        build.bundler = 'Turbopack';
      } else {
        build.bundler = 'Webpack';
      }
      build.tool = 'Next.js';
    }

    // Webpack standalone
    if (
      deps['webpack'] &&
      !build.tool &&
      files.some((f) => f.name.match(/webpack\.config\.(js|ts)$/))
    ) {
      build.tool = 'Webpack';
      build.bundler = 'Webpack';
    }

    // Parcel
    if (deps['parcel'] || deps['parcel-bundler']) {
      build.tool = 'Parcel';
      build.bundler = 'Parcel';
    }

    // Rollup standalone
    if (
      deps['rollup'] &&
      !build.tool &&
      files.some((f) => f.name.match(/rollup\.config\.(js|ts|mjs)$/))
    ) {
      build.tool = 'Rollup';
      build.bundler = 'Rollup';
    }

    // esbuild
    if (deps['esbuild'] && !build.tool) {
      build.tool = 'esbuild';
      build.bundler = 'esbuild';
    }

    // Turborepo (monorepo tool)
    if (deps['turbo'] || files.some((f) => f.name.match(/turbo\.json$/))) {
      build.monorepoTool = 'Turborepo';
    }

    // Nx
    if (deps['nx'] || files.some((f) => f.name.match(/nx\.json$/))) {
      build.monorepoTool = 'Nx';
    }

    // Lerna
    if (deps['lerna'] || files.some((f) => f.name.match(/lerna\.json$/))) {
      build.monorepoTool = 'Lerna';
    }
  },

  // === PROJECT TYPE CLASSIFICATION ===
  _classifyProjectType: function (result) {
    // SSR/SSG frameworks
    if (
      result.nextjs.detected ||
      result.nuxt.detected ||
      result.remix.detected ||
      result.astro.detected ||
      result.gatsby.detected
    ) {
      if (result.nextjs.detected) {
        if (result.nextjs.router === 'app') {
          result.projectType = 'SSR (App Router)';
        } else if (result.nextjs.router === 'pages') {
          result.projectType = 'SSR (Pages Router)';
        } else if (result.nextjs.router === 'hybrid') {
          result.projectType = 'SSR (Hybrid)';
        } else {
          result.projectType = 'SSR';
        }
      } else if (result.gatsby.detected) {
        result.projectType = 'SSG';
      } else if (result.astro.detected) {
        result.projectType = 'SSG/MPA';
      } else {
        result.projectType = 'SSR';
      }
      return;
    }

    // SPA frameworks
    if (
      result.react.detected ||
      result.vue.detected ||
      result.angular.detected ||
      result.svelte.detected
    ) {
      result.projectType = 'SPA';
      return;
    }

    result.projectType = 'Unknown';
  },

  // === CONFIDENCE CALCULATION ===
  _calculateConfidence: function (result) {
    let score = 0;
    const reasons = [];

    // Framework detected (+30)
    if (result.react.detected) {
      score += 30;
      const version = result.react.version?.raw || 'unknown';
      const source = result.react.versionSource || 'package.json';
      reasons.push(`React ${version} detected (from ${source})`);
    } else if (result.vue.detected) {
      score += 30;
      const version = result.vue.version?.raw || 'unknown';
      reasons.push(`Vue ${version} detected`);
    } else if (result.angular.detected) {
      score += 30;
      const version = result.angular.version?.raw || 'unknown';
      reasons.push(`Angular ${version} detected`);
    } else if (result.svelte.detected) {
      score += 30;
      const version = result.svelte.version?.raw || 'unknown';
      reasons.push(`Svelte ${version} detected`);
    }

    // Meta framework detected (+15)
    if (result.nextjs.detected) {
      score += 15;
      const version = result.nextjs.version?.raw || 'unknown';
      const router = result.nextjs.router || 'unknown';
      reasons.push(`Next.js ${version} with ${router} router`);
    } else if (result.remix.detected) {
      score += 15;
      reasons.push(`Remix detected`);
    } else if (result.gatsby.detected) {
      score += 15;
      reasons.push(`Gatsby detected`);
    } else if (result.astro.detected) {
      score += 15;
      reasons.push(`Astro detected`);
    } else if (result.nuxt.detected) {
      score += 15;
      reasons.push(`Nuxt detected`);
    }

    // Version from lock file (+10)
    const hasLockFileVersion =
      result.react.versionSource === 'lock-file' ||
      result.nextjs.versionSource === 'lock-file' ||
      result.vue.versionSource === 'lock-file' ||
      result.angular.versionSource === 'lock-file';
    if (hasLockFileVersion) {
      score += 10;
      reasons.push('Exact version from lock file');
    }

    // Build tool detected (+15)
    if (result.build.tool) {
      score += 15;
      let buildInfo = result.build.tool;
      if (result.build.turbopack) buildInfo += ' + Turbopack';
      reasons.push(`Build tool: ${buildInfo}`);
    }

    // TypeScript (+5)
    if (result.build.typescript) {
      score += 5;
      reasons.push('TypeScript configured');
    }

    // CSS framework detected (+10)
    const cssFrameworks = this.getCSSFrameworks(result);
    if (cssFrameworks.length > 0) {
      score += 10;
      reasons.push(`CSS: ${cssFrameworks.slice(0, 3).join(', ')}`);
    }

    // Project type determined (+10)
    if (result.projectType !== 'Unknown') {
      score += 10;
      reasons.push(`Project type: ${result.projectType}`);
    }

    // Next.js specific features (+5)
    if (result.nextjs.detected) {
      if (result.nextjs.hasMiddleware) {
        score += 2;
        reasons.push('Middleware detected');
      }
      if (result.nextjs.hasParallelRoutes) {
        score += 2;
        reasons.push('Parallel routes detected');
      }
      if (result.nextjs.serverComponents || result.nextjs.clientComponents) {
        score += 1;
        reasons.push('Server/Client components used');
      }
    }

    return {
      score: Math.min(score, 100),
      reasons: reasons,
    };
  },

  // === HELPER: Get primary framework name ===
  getPrimaryFramework: function (result) {
    if (result.nextjs.detected) return 'Next.js';
    if (result.remix.detected) return 'Remix';
    if (result.gatsby.detected) return 'Gatsby';
    if (result.astro.detected) return 'Astro';
    if (result.nuxt.detected) return 'Nuxt';
    if (result.angular.detected) return 'Angular';
    if (result.vue.detected) return 'Vue.js';
    if (result.svelte.detected) return 'Svelte';
    if (result.react.detected) {
      if (result.react.isPreact) return 'Preact';
      return 'React';
    }
    return 'Unknown';
  },

  // === HELPER: Get CSS frameworks list ===
  getCSSFrameworks: function (result) {
    const frameworks = [];
    if (result.css.tailwind) frameworks.push('Tailwind CSS');
    if (result.css.bootstrap) frameworks.push('Bootstrap');
    if (result.css.mui) frameworks.push('Material-UI');
    if (result.css.chakra) frameworks.push('Chakra UI');
    if (result.css.antd) frameworks.push('Ant Design');
    if (result.css.styledComponents) frameworks.push('Styled Components');
    if (result.css.emotion) frameworks.push('Emotion');
    if (result.css.cssModules) frameworks.push('CSS Modules');
    if (result.css.sass) frameworks.push('Sass/SCSS');
    if (result.css.less) frameworks.push('Less');
    return frameworks;
  },
};
