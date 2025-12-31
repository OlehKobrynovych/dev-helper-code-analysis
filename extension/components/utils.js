// Utility functions
window.Utils = {
  escapeHTML: function (str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function (match) {
      switch (match) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return match;
      }
    });
  },

  calculateSimilarity: function (str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 1;

    let matches = 0;
    const minLen = Math.min(len1, len2);

    for (let i = 0; i < minLen; i++) {
      if (str1[i] === str2[i]) {
        matches++;
      }
    }

    return matches / maxLen;
  },

  generateSearchVariants: function (fileName, fullPath) {
    const variants = new Set();

    // Повне ім'я файлу
    variants.add(fileName);

    // Ім'я без розширення (для dynamic imports)
    const nameWithoutExt = fileName.replace(/\.[^.]+$/, "");
    variants.add(nameWithoutExt);

    // Повний шлях
    variants.add(fullPath);

    // Відносні шляхи
    const pathParts = fullPath.split("/");
    for (let i = 0; i < pathParts.length; i++) {
      variants.add(pathParts.slice(i).join("/"));
      variants.add("./" + pathParts.slice(i).join("/"));
      variants.add("../" + pathParts.slice(i).join("/"));
    }

    // URL-encoded варіанти
    variants.add(encodeURIComponent(fileName));

    // Варіанти з різними слешами
    fullPath.split("/").forEach((part, idx, arr) => {
      if (idx > 0) {
        variants.add(arr.slice(idx).join("/"));
      }
    });

    return Array.from(variants);
  },
};
