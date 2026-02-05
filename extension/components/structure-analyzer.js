// Structure Analyzer - визначення архітектурного паттерну проекту
window.StructureAnalyzer = {
  analyze: function (files) {
    const result = {
      pattern: 'Unknown',
      confidence: 0,
      reasons: [],
      details: {},
      suggestions: [],
    };

    // Normalize file paths
    const paths = files.map((f) => '/' + f.name.replace(/\\/g, '/'));

    // Run all pattern detectors
    const patterns = [
      this._detectFeatureBased(paths),
      this._detectLayerBased(paths),
      this._detectAtomicDesign(paths),
      this._detectDomainDriven(paths),
      this._detectFlat(paths),
      this._detectNextJsConvention(paths),
    ];

    // Find the best matching pattern
    const bestPattern = patterns.reduce(
      (best, current) => (current.score > best.score ? current : best),
      { score: 0 }
    );

    result.pattern = bestPattern.pattern || 'Unknown';
    result.confidence = Math.min(bestPattern.score, 100);
    result.reasons = bestPattern.reasons || [];
    result.details = bestPattern.details || {};

    // Generate suggestions based on detected pattern
    result.suggestions = this._generateSuggestions(result, paths);

    return result;
  },

  // Feature-based / Module-based structure
  // src/features/auth/, src/features/dashboard/, etc.
  _detectFeatureBased: function (paths) {
    const result = {
      pattern: 'Feature-based',
      score: 0,
      reasons: [],
      details: { features: [] },
    };

    const featurePaths = [
      /\/features\/([^/]+)\//,
      /\/modules\/([^/]+)\//,
      /\/domains\/([^/]+)\//,
    ];

    const features = new Set();

    paths.forEach((path) => {
      for (const regex of featurePaths) {
        const match = path.match(regex);
        if (match) {
          features.add(match[1]);
          result.score += 5;
        }
      }
    });

    if (features.size > 0) {
      result.details.features = Array.from(features);
      result.reasons.push(`Found ${features.size} feature modules`);

      // Check if features have internal structure (components, hooks, etc.)
      const hasInternalStructure = paths.some((p) =>
        p.match(/\/features\/[^/]+\/(components|hooks|services|utils)\//)
      );
      if (hasInternalStructure) {
        result.score += 20;
        result.reasons.push('Features have internal structure');
      }
    }

    return result;
  },

  // Layer-based structure
  // src/components/, src/hooks/, src/services/, etc.
  _detectLayerBased: function (paths) {
    const result = {
      pattern: 'Layer-based',
      score: 0,
      reasons: [],
      details: { layers: [] },
    };

    const layers = {
      components: /\/components\//,
      pages: /\/pages\//,
      views: /\/views\//,
      hooks: /\/hooks\//,
      services: /\/services\//,
      utils: /\/utils\//,
      helpers: /\/helpers\//,
      lib: /\/lib\//,
      api: /\/api\//,
      types: /\/types\//,
      store: /\/store\//,
      redux: /\/redux\//,
      contexts: /\/contexts\//,
      constants: /\/constants\//,
      assets: /\/assets\//,
      styles: /\/styles\//,
    };

    const foundLayers = [];

    Object.entries(layers).forEach(([name, regex]) => {
      if (paths.some((p) => regex.test(p))) {
        foundLayers.push(name);
        result.score += 5;
      }
    });

    if (foundLayers.length >= 3) {
      result.details.layers = foundLayers;
      result.reasons.push(`Found ${foundLayers.length} layers: ${foundLayers.slice(0, 5).join(', ')}`);

      // Bonus for standard React structure
      const hasStandardReact =
        foundLayers.includes('components') &&
        (foundLayers.includes('hooks') || foundLayers.includes('services'));
      if (hasStandardReact) {
        result.score += 15;
        result.reasons.push('Standard React layer structure');
      }
    }

    return result;
  },

  // Atomic Design
  // src/components/atoms/, molecules/, organisms/, templates/, pages/
  _detectAtomicDesign: function (paths) {
    const result = {
      pattern: 'Atomic Design',
      score: 0,
      reasons: [],
      details: { levels: [] },
    };

    const atomicLevels = ['atoms', 'molecules', 'organisms', 'templates'];
    const foundLevels = [];

    atomicLevels.forEach((level) => {
      if (paths.some((p) => p.includes(`/${level}/`))) {
        foundLevels.push(level);
        result.score += 15;
      }
    });

    if (foundLevels.length >= 2) {
      result.details.levels = foundLevels;
      result.reasons.push(`Found atomic levels: ${foundLevels.join(', ')}`);
    }

    return result;
  },

  // Domain-Driven Design
  // src/domain/, src/application/, src/infrastructure/
  _detectDomainDriven: function (paths) {
    const result = {
      pattern: 'Domain-Driven',
      score: 0,
      reasons: [],
      details: { layers: [] },
    };

    const dddLayers = {
      domain: /\/(domain|entities|aggregates)\//,
      application: /\/(application|usecases|services)\//,
      infrastructure: /\/(infrastructure|adapters|repositories)\//,
      presentation: /\/(presentation|ui|views)\//,
    };

    const foundLayers = [];

    Object.entries(dddLayers).forEach(([name, regex]) => {
      if (paths.some((p) => regex.test(p))) {
        foundLayers.push(name);
        result.score += 15;
      }
    });

    if (foundLayers.length >= 2) {
      result.details.layers = foundLayers;
      result.reasons.push(`Found DDD layers: ${foundLayers.join(', ')}`);
    }

    return result;
  },

  // Flat structure
  // All files in src/ without subdirectories
  _detectFlat: function (paths) {
    const result = {
      pattern: 'Flat',
      score: 0,
      reasons: [],
      details: {},
    };

    // Count files directly in src/
    const srcFiles = paths.filter((p) => p.match(/^\/src\/[^/]+\.(js|jsx|ts|tsx)$/));
    const totalSrcFiles = paths.filter((p) => p.startsWith('/src/')).length;

    if (totalSrcFiles > 0 && srcFiles.length / totalSrcFiles > 0.5) {
      result.score = 30;
      result.reasons.push(`${srcFiles.length} files directly in src/`);
      result.details.flatFiles = srcFiles.length;
    }

    return result;
  },

  // Next.js Convention (App Router or Pages Router)
  _detectNextJsConvention: function (paths) {
    const result = {
      pattern: 'Next.js Convention',
      score: 0,
      reasons: [],
      details: {},
    };

    const hasAppDir = paths.some((p) => p.match(/\/app\/.*\/page\./));
    const hasPagesDir = paths.some((p) =>
      p.match(/\/pages\/.*\.(js|jsx|ts|tsx)$/)
    );

    if (hasAppDir) {
      result.score += 40;
      result.reasons.push('Uses Next.js App Router convention');
      result.details.router = 'app';

      // Check for route groups
      if (paths.some((p) => p.match(/\/app\/\([^)]+\)\//))) {
        result.score += 10;
        result.reasons.push('Uses route groups');
      }

      // Check for parallel routes
      if (paths.some((p) => p.match(/\/app\/@[^/]+\//))) {
        result.score += 10;
        result.reasons.push('Uses parallel routes');
      }
    }

    if (hasPagesDir && !hasAppDir) {
      result.score += 35;
      result.reasons.push('Uses Next.js Pages Router convention');
      result.details.router = 'pages';
    }

    return result;
  },

  // Generate suggestions based on detected structure
  _generateSuggestions: function (result, paths) {
    const suggestions = [];

    if (result.confidence < 40) {
      suggestions.push({
        type: 'warning',
        message:
          'Project structure is unclear. Consider adopting a consistent pattern.',
      });
    }

    if (
      result.pattern === 'Flat' &&
      paths.filter((p) => p.match(/\.(js|jsx|ts|tsx)$/)).length > 20
    ) {
      suggestions.push({
        type: 'recommendation',
        message:
          'Consider organizing files into folders (components/, hooks/, etc.) as the project grows.',
      });
    }

    if (result.pattern === 'Layer-based') {
      const hasFeatures = paths.some((p) => p.includes('/features/'));
      if (!hasFeatures && result.details.layers?.length > 5) {
        suggestions.push({
          type: 'info',
          message:
            'Large layer-based projects may benefit from feature-based organization for better scalability.',
        });
      }
    }

    return suggestions;
  },
};
