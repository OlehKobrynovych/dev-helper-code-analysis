window.StorageAnalyzer = {
  analyze: function(files) {
    const storage = {
      localStorage: new Set(),
      sessionStorage: new Set(),
      cookies: new Set(),
      indexedDB: false,
    };

    const localStorageRegex = /localStorage\.(getItem|setItem|removeItem)\(\s*['"`]([^'"`]+)['"`]/g;
    const sessionStorageRegex = /sessionStorage\.(getItem|setItem|removeItem)\(\s*['"`]([^'"`]+)['"`]/g;
    const cookieRegex = /(?:new Cookies\(\)\.get\(\s*['"`]([^'"`]+)['"`]\)|document\.cookie\s*=\s*['"`]([^'"`]+)=)/g;
    const indexedDBRegex = /indexedDB\.open\(/;

    files.forEach(file => {
      if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.html')) {
        const content = file.content;

        let match;
        while ((match = localStorageRegex.exec(content)) !== null) {
          storage.localStorage.add(match[2]);
        }
        while ((match = sessionStorageRegex.exec(content)) !== null) {
          storage.sessionStorage.add(match[2]);
        }
        while ((match = cookieRegex.exec(content)) !== null) {
          storage.cookies.add(match[1] || match[2]);
        }

        if (indexedDBRegex.test(content)) {
          storage.indexedDB = true;
        }
      }
    });

    return {
      localStorage: [...storage.localStorage],
      sessionStorage: [...storage.sessionStorage],
      cookies: [...storage.cookies],
      indexedDB: storage.indexedDB,
    };
  }
};
