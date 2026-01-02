// Analyzers - утилітарні функції аналізу
window.Analyzers = {
  analyzeFileTypes: function (files) {
    const fileTypes = {};

    files.forEach(function (file) {
      if (file.name.includes("node_modules/")) return;
      if (file.name.includes(".git/")) return;

      const ext = file.name.split(".").pop();
      if (ext && ext.length < 10) {
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }
    });

    return fileTypes;
  },
};
