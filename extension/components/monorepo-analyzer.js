// Monorepo Analyzer - виявлення та аналіз monorepo структур
window.MonorepoAnalyzer = {
  analyze: function (files) {
    const result = {
      isMonorepo: false,
      type: null, // 'turborepo', 'nx', 'lerna', 'pnpm', 'yarn', 'npm'
      rootPackageJson: null,
      packages: [],
      workspaces: [],
      sharedDependencies: [],
      stats: {
        totalPackages: 0,
        appsCount: 0,
        packagesCount: 0,
        sharedDepsCount: 0,
      },
    };

    // Find all package.json files (excluding node_modules)
    const packageJsonFiles = files.filter(
      (f) =>
        f.name.match(/package\.json$/) && !f.name.includes('node_modules/')
    );

    if (packageJsonFiles.length <= 1) {
      // Not a monorepo
      return result;
    }

    // Find root package.json
    const rootPkg = this._findRootPackageJson(packageJsonFiles);
    if (rootPkg) {
      result.rootPackageJson = rootPkg;
    }

    // Detect monorepo type
    result.type = this._detectMonorepoType(files, rootPkg);
    result.isMonorepo = result.type !== null;

    if (!result.isMonorepo) {
      // Could still be a monorepo without explicit config
      // Check if multiple package.json in apps/ or packages/ folders
      const hasAppsOrPackages = packageJsonFiles.some(
        (f) =>
          f.name.match(/\/(apps|packages|libs|modules)\/[^/]+\/package\.json$/)
      );
      if (hasAppsOrPackages) {
        result.isMonorepo = true;
        result.type = 'unknown';
      }
    }

    if (result.isMonorepo) {
      // Parse workspaces
      result.workspaces = this._parseWorkspaces(rootPkg);

      // Analyze packages
      result.packages = this._analyzePackages(packageJsonFiles, rootPkg);

      // Find shared dependencies
      result.sharedDependencies = this._findSharedDependencies(result.packages);

      // Calculate stats
      result.stats.totalPackages = result.packages.length;
      result.stats.appsCount = result.packages.filter(
        (p) => p.type === 'app'
      ).length;
      result.stats.packagesCount = result.packages.filter(
        (p) => p.type === 'package' || p.type === 'lib'
      ).length;
      result.stats.sharedDepsCount = result.sharedDependencies.length;
    }

    return result;
  },

  _findRootPackageJson: function (packageJsonFiles) {
    // Root package.json is usually the one at the top level
    const sorted = packageJsonFiles.sort(
      (a, b) => a.name.split('/').length - b.name.split('/').length
    );

    const rootFile = sorted[0];
    if (rootFile) {
      try {
        return JSON.parse(rootFile.content);
      } catch (e) {
        console.warn('Failed to parse root package.json:', e);
      }
    }
    return null;
  },

  _detectMonorepoType: function (files, rootPkg) {
    // Check for specific monorepo tool configs
    if (files.some((f) => f.name.match(/turbo\.json$/))) {
      return 'turborepo';
    }
    if (files.some((f) => f.name.match(/nx\.json$/))) {
      return 'nx';
    }
    if (files.some((f) => f.name.match(/lerna\.json$/))) {
      return 'lerna';
    }
    if (files.some((f) => f.name.match(/pnpm-workspace\.yaml$/))) {
      return 'pnpm';
    }

    // Check workspaces in package.json
    if (rootPkg) {
      if (rootPkg.workspaces) {
        // Could be yarn or npm workspaces
        if (files.some((f) => f.name.match(/yarn\.lock$/))) {
          return 'yarn';
        }
        return 'npm';
      }
    }

    return null;
  },

  _parseWorkspaces: function (rootPkg) {
    if (!rootPkg) return [];

    const workspaces = rootPkg.workspaces;
    if (!workspaces) return [];

    // workspaces can be array or object with packages key
    if (Array.isArray(workspaces)) {
      return workspaces;
    }
    if (workspaces.packages) {
      return workspaces.packages;
    }

    return [];
  },

  _analyzePackages: function (packageJsonFiles, rootPkg) {
    const packages = [];
    const rootName = rootPkg?.name;

    packageJsonFiles.forEach((file) => {
      try {
        const pkg = JSON.parse(file.content);
        if (pkg.name === rootName) return; // Skip root

        const path = file.name.replace(/\/package\.json$/, '');
        const type = this._determinePackageType(path, pkg);

        packages.push({
          name: pkg.name || path.split('/').pop(),
          version: pkg.version,
          path: path,
          type: type,
          private: pkg.private || false,
          dependencies: Object.keys(pkg.dependencies || {}),
          devDependencies: Object.keys(pkg.devDependencies || {}),
          scripts: Object.keys(pkg.scripts || {}),
        });
      } catch (e) {
        console.warn(`Failed to parse ${file.name}:`, e);
      }
    });

    return packages;
  },

  _determinePackageType: function (path, pkg) {
    // Determine if package is an app or a library
    const pathLower = path.toLowerCase();

    if (
      pathLower.includes('/apps/') ||
      pathLower.includes('/applications/')
    ) {
      return 'app';
    }
    if (
      pathLower.includes('/packages/') ||
      pathLower.includes('/libs/') ||
      pathLower.includes('/modules/')
    ) {
      return 'package';
    }

    // Check package.json hints
    if (pkg.main || pkg.module || pkg.exports) {
      return 'package';
    }
    if (pkg.scripts?.start || pkg.scripts?.dev) {
      return 'app';
    }

    return 'unknown';
  },

  _findSharedDependencies: function (packages) {
    if (packages.length < 2) return [];

    const depCounts = new Map();

    packages.forEach((pkg) => {
      const allDeps = [...pkg.dependencies, ...pkg.devDependencies];
      allDeps.forEach((dep) => {
        depCounts.set(dep, (depCounts.get(dep) || 0) + 1);
      });
    });

    // Dependencies used in more than half of packages
    const threshold = Math.ceil(packages.length / 2);
    const shared = [];

    depCounts.forEach((count, dep) => {
      if (count >= threshold) {
        shared.push({
          name: dep,
          usedIn: count,
          percentage: Math.round((count / packages.length) * 100),
        });
      }
    });

    return shared.sort((a, b) => b.usedIn - a.usedIn).slice(0, 20);
  },
};
