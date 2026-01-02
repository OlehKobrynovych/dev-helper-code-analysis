// Images Analyzer
window.ImagesAnalyzer = {
  analyzeImages: function (imageFiles, jsFiles, cssFiles, htmlFiles = []) {
    const allImages = [];
    const usedImages = new Set();

    // Збираємо всі зображення з різними варіантами шляхів
    imageFiles.forEach(function (file) {
      const fileName = file.name.split("/").pop();
      const relativePath = file.name;

      allImages.push({
        name: fileName,
        path: relativePath,
        // Додаткові варіанти для пошуку
        searchVariants: window.Utils.generateSearchVariants(
          fileName,
          relativePath
        ),
      });
    });

    console.log("🖼️ Found", allImages.length, "images");

    // Об'єднуємо контент з усіх файлів
    const allFiles = [...jsFiles, ...cssFiles, ...htmlFiles];
    const allContent = allFiles.map((f) => f.content || "").join(" ");

    // Покращений пошук використання зображень
    allImages.forEach(function (img) {
      // Перевіряємо всі можливі варіанти посилання на зображення
      const isUsed = img.searchVariants.some((variant) => {
        // Перевірка з урахуванням можливих кавичок, дужок тощо
        const patterns = [
          variant, // exact match
          `"${variant}"`, // в подвійних лапках
          `'${variant}'`, // в одинарних лапках
          `\`${variant}\``, // в бектіках
          `(${variant})`, // в дужках (CSS url)
          `/${variant}`, // з слешем
          variant.replace(/\\/g, "/"), // заміна бекслешів
        ];

        return patterns.some((pattern) => allContent.includes(pattern));
      });

      if (isUsed) {
        usedImages.add(img.name);
      }
    });

    console.log("🖼️ Used", usedImages.size, "images");

    const unused = allImages.filter((img) => !usedImages.has(img.name));
    console.log("🖼️ Unused", unused.length, "images");

    return {
      total: allImages.length,
      unused: unused,
      used: usedImages.size,
      unusedDetails: unused.map((img) => ({ name: img.name, path: img.path })),
    };
  },
};
