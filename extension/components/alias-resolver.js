// Alias Resolver - читання та резолюція path aliases з конфігів
window.AliasResolver = {
  resolve: function (files) {
    const result = {
      aliases: {},
      baseUrl: '',
      source: null,
    };

    // Спробуємо знайти конфіги в порядку пріоритету
    const tsconfigFile = files.find(
      (f) =>
        f.name.match(/tsconfig\.json$/) ||
        f.name.match(/tsconfig\.app\.json$/) ||
        f.name.match(/tsconfig\.base\.json$/)
    );

    const jsconfigFile = files.find((f) => f.name.match(/jsconfig\.json$/));

    const viteConfigFile = files.find((f) =>
      f.name.match(/vite\.config\.(js|ts|mjs)$/)
    );

    // 1. Спочатку пробуємо tsconfig.json
    if (tsconfigFile) {
      const parsed = this._parseTsConfig(tsconfigFile.content);
      if (parsed) {
        result.aliases = { ...result.aliases, ...parsed.aliases };
        result.baseUrl = parsed.baseUrl || result.baseUrl;
        result.source = 'tsconfig.json';
      }
    }

    // 2. Потім jsconfig.json (якщо немає tsconfig)
    if (jsconfigFile && !result.source) {
      const parsed = this._parseTsConfig(jsconfigFile.content);
      if (parsed) {
        result.aliases = { ...result.aliases, ...parsed.aliases };
        result.baseUrl = parsed.baseUrl || result.baseUrl;
        result.source = 'jsconfig.json';
      }
    }

    // 3. Vite config
    if (viteConfigFile) {
      const viteAliases = this._parseViteConfig(viteConfigFile.content);
      if (viteAliases && Object.keys(viteAliases).length > 0) {
        result.aliases = { ...result.aliases, ...viteAliases };
        if (!result.source) {
          result.source = 'vite.config';
        }
      }
    }

    // 4. Додаємо стандартні aliases якщо нічого не знайдено
    if (Object.keys(result.aliases).length === 0) {
      result.aliases = this._getDefaultAliases();
      result.source = 'defaults';
    }

    return result;
  },

  _parseTsConfig: function (content) {
    try {
      // Видаляємо коментарі з JSON (tsconfig дозволяє коментарі)
      const cleanContent = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
        .replace(/\/\/.*$/gm, '') // line comments
        .replace(/,(\s*[}\]])/g, '$1'); // trailing commas

      const config = JSON.parse(cleanContent);
      const compilerOptions = config.compilerOptions || {};

      const result = {
        aliases: {},
        baseUrl: compilerOptions.baseUrl || '',
      };

      // Парсимо paths
      const paths = compilerOptions.paths || {};

      Object.entries(paths).forEach(([alias, targets]) => {
        // Конвертуємо TypeScript path alias в простий формат
        // "@/*": ["./src/*"] -> "@/": "src/"
        // "@components/*": ["./src/components/*"] -> "@components/": "src/components/"

        let aliasKey = alias;
        let targetPath = targets[0] || '';

        // Видаляємо /* з кінця
        if (aliasKey.endsWith('/*')) {
          aliasKey = aliasKey.slice(0, -1); // "@/*" -> "@/"
        }

        // Видаляємо ./ з початку та /* з кінця target
        targetPath = targetPath.replace(/^\.\//, '').replace(/\/\*$/, '/');

        // Додаємо / в кінець якщо немає
        if (!aliasKey.endsWith('/') && !aliasKey.endsWith('*')) {
          aliasKey += '/';
        }
        if (!targetPath.endsWith('/') && targetPath !== '') {
          targetPath += '/';
        }

        result.aliases[aliasKey] = targetPath;
      });

      return result;
    } catch (e) {
      console.warn('Failed to parse tsconfig/jsconfig:', e);
      return null;
    }
  },

  _parseViteConfig: function (content) {
    const aliases = {};

    try {
      // Шукаємо resolve.alias конфігурацію
      // resolve: { alias: { '@': '/src' } }
      // або
      // resolve: { alias: [{ find: '@', replacement: '/src' }] }

      // Варіант 1: Object syntax
      const objectAliasMatch = content.match(
        /alias\s*:\s*\{([^}]+)\}/
      );
      if (objectAliasMatch) {
        const aliasContent = objectAliasMatch[1];

        // Парсимо пари ключ-значення
        // '@': resolve(__dirname, 'src')
        // '@': '/src'
        // '@': path.resolve(__dirname, 'src')
        const pairMatches = aliasContent.matchAll(
          /['"]([^'"]+)['"]\s*:\s*(?:(?:path\.)?resolve\s*\([^,]+,\s*)?['"]([^'"]+)['"]/g
        );

        for (const match of pairMatches) {
          let aliasKey = match[1];
          let targetPath = match[2];

          // Нормалізуємо шлях
          targetPath = targetPath.replace(/^\.?\//, '').replace(/\/$/, '') + '/';

          if (!aliasKey.endsWith('/')) {
            aliasKey += '/';
          }

          aliases[aliasKey] = targetPath;
        }
      }

      // Варіант 2: Array syntax
      const arrayAliasMatch = content.match(
        /alias\s*:\s*\[([^\]]+)\]/
      );
      if (arrayAliasMatch) {
        const aliasContent = arrayAliasMatch[1];

        // { find: '@', replacement: '/src' }
        const findReplaceMatches = aliasContent.matchAll(
          /find\s*:\s*['"]([^'"]+)['"][^}]*replacement\s*:\s*(?:(?:path\.)?resolve\s*\([^,]+,\s*)?['"]([^'"]+)['"]/g
        );

        for (const match of findReplaceMatches) {
          let aliasKey = match[1];
          let targetPath = match[2];

          targetPath = targetPath.replace(/^\.?\//, '').replace(/\/$/, '') + '/';

          if (!aliasKey.endsWith('/')) {
            aliasKey += '/';
          }

          aliases[aliasKey] = targetPath;
        }
      }
    } catch (e) {
      console.warn('Failed to parse vite config:', e);
    }

    return aliases;
  },

  _getDefaultAliases: function () {
    // Стандартні aliases для популярних проектів
    return {
      '@/': 'src/',
      '~/': 'src/',
      '@components/': 'src/components/',
      '@lib/': 'src/lib/',
      '@utils/': 'src/utils/',
      '@hooks/': 'src/hooks/',
      '@services/': 'src/services/',
      '@styles/': 'src/styles/',
      '@assets/': 'src/assets/',
      '@types/': 'src/types/',
    };
  },

  // Резолюція конкретного шляху імпорту
  resolveImport: function (importPath, aliases, files) {
    // Перевіряємо чи шлях починається з alias
    for (const [alias, target] of Object.entries(aliases)) {
      if (importPath.startsWith(alias)) {
        const resolved = importPath.replace(alias, target);
        return this._findFile(resolved, files);
      }
    }

    // Якщо не alias - повертаємо як є
    return importPath;
  },

  _findFile: function (path, files) {
    // Можливі розширення
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
    const indexFiles = ['/index.ts', '/index.tsx', '/index.js', '/index.jsx'];

    // Спочатку пробуємо точний шлях
    for (const ext of extensions) {
      const fullPath = path + ext;
      const found = files.find(
        (f) => f.name.endsWith(fullPath) || f.name.endsWith('/' + fullPath)
      );
      if (found) return found.name;
    }

    // Потім пробуємо index файли
    for (const indexFile of indexFiles) {
      const fullPath = path.replace(/\/$/, '') + indexFile;
      const found = files.find(
        (f) => f.name.endsWith(fullPath) || f.name.endsWith('/' + fullPath)
      );
      if (found) return found.name;
    }

    return path;
  },

  // Отримати всі aliases для відображення в UI
  getAliasesList: function (result) {
    return Object.entries(result.aliases).map(([alias, target]) => ({
      alias: alias,
      target: target,
      source: result.source,
    }));
  },
};
