// ZIP File Handler
window.ZipHandler = {
  extractZipFiles: async function (view) {
    const files = [];
    let eocdOffset = -1;

    for (let i = view.byteLength - 22; i >= 0; i--) {
      if (view.getUint32(i, true) === 0x06054b50) {
        eocdOffset = i;
        break;
      }
    }

    if (eocdOffset === -1) throw new Error("Invalid ZIP file");

    const centralDirOffset = view.getUint32(eocdOffset + 16, true);
    const numEntries = view.getUint16(eocdOffset + 10, true);
    let offset = centralDirOffset;

    for (let i = 0; i < numEntries; i++) {
      if (view.getUint32(offset, true) !== 0x02014b50) break;

      const fileNameLength = view.getUint16(offset + 28, true);
      const extraFieldLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      const localHeaderOffset = view.getUint32(offset + 42, true);

      const fileNameBytes = new Uint8Array(
        view.buffer,
        offset + 46,
        fileNameLength
      );
      const fileName = new TextDecoder().decode(fileNameBytes);

      if (!fileName.endsWith("/")) {
        if (view.getUint32(localHeaderOffset, true) === 0x04034b50) {
          const compMethod = view.getUint16(localHeaderOffset + 8, true);
          const compSize = view.getUint32(localHeaderOffset + 18, true);
          const uncompSize = view.getUint32(localHeaderOffset + 22, true);
          const localFileNameLength = view.getUint16(
            localHeaderOffset + 26,
            true
          );
          const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
          const dataOffset =
            localHeaderOffset + 30 + localFileNameLength + localExtraLength;

          try {
            let content = "";

            if (compMethod === 0) {
              const fileData = new Uint8Array(
                view.buffer,
                dataOffset,
                uncompSize
              );
              content = new TextDecoder().decode(fileData);
            } else if (compMethod === 8) {
              const compressedData = new Uint8Array(
                view.buffer,
                dataOffset,
                compSize
              );
              const ds = new DecompressionStream("deflate-raw");
              const writer = ds.writable.getWriter();
              writer.write(compressedData);
              writer.close();

              const reader = ds.readable.getReader();
              const chunks = [];
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
              }

              const totalLength = chunks.reduce(
                (acc, chunk) => acc + chunk.length,
                0
              );
              const result = new Uint8Array(totalLength);
              let position = 0;
              for (const chunk of chunks) {
                result.set(chunk, position);
                position += chunk.length;
              }
              content = new TextDecoder().decode(result);
            }

            if (content) files.push({ name: fileName, content: content });
          } catch (error) {
            console.warn("⚠️ Failed:", fileName);
          }
        }
      }

      offset += 46 + fileNameLength + extraFieldLength + commentLength;
    }

    console.log("✅ Extracted", files.length, "files");
    return files;
  },

  analyzeZipProject: function (zipData) {
    return new Promise(function (resolve, reject) {
      try {
        const view = zipData;

        window.ZipHandler.extractZipFiles(view)
          .then(function (files) {
            console.log("📦 Extracted files:", files.length);

            const cssFiles = files.filter((f) =>
              f.name.match(/\.(css|scss|sass|less)$/)
            );
            const jsFiles = files.filter((f) =>
              f.name.match(/\.(js|jsx|ts|tsx)$/)
            );
            const imageFiles = files.filter((f) =>
              f.name.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)
            );

            console.log("🎨 CSS/SCSS files:", cssFiles.length);
            console.log("⚡ JS files:", jsFiles.length);
            console.log("🖼️ Image files:", imageFiles.length);

            const packageFile = files.find((f) =>
              /package\.json$/i.test(f.name)
            );
            let projectName = null;
            let packageJson = null;
            if (packageFile) {
              try {
                packageJson = JSON.parse(packageFile.content);
                if (packageJson && typeof packageJson.name === "string") {
                  projectName = packageJson.name.trim();
                }
              } catch (e) {
                console.error("Error parsing package.json:", e);
              }
            }

            // Analyze project architecture
            let projectType = "Unknown";
            let framework = "Unknown";
            let structure = "Unknown";

            const hasReactDependency = (() => {
              if (!packageJson) return false;

              const allDeps = {
                ...(packageJson.dependencies || {}),
                ...(packageJson.devDependencies || {}),
                ...(packageJson.peerDependencies || {}),
              };

              return Object.keys(allDeps).some(
                (dep) =>
                  dep === "react" ||
                  dep.startsWith("react/") ||
                  dep.endsWith("-react") ||
                  dep === "react-dom" ||
                  dep === "react-native" ||
                  dep === "preact"
              );
            })();

            const hasReactInProject = (() => {
              if (!packageJson) return false;

              const packageContent = JSON.stringify(packageJson).toLowerCase();
              return (
                packageContent.includes("react-scripts") ||
                packageContent.includes("react-dev-utils") ||
                packageContent.includes('"react":') ||
                packageContent.includes("'react':") ||
                packageContent.includes('"react-dom":') ||
                packageContent.includes("'react-dom':") ||
                (packageJson.scripts &&
                  Object.values(packageJson.scripts).some(
                    (script) => script && script.includes("react-scripts")
                  ))
              );
            })();

            // Framework-specific checks
            const hasNext = files.some(
              (f) =>
                f.name === "next.config.js" ||
                f.name === "next.config.mjs" ||
                f.name === "next.config.ts"
            );
            const hasVite = files.some(
              (f) =>
                f.name === "vite.config.js" ||
                f.name === "vite.config.ts" ||
                f.name === "vite.config.mjs"
            );
            const hasCRA = files.some(
              (f) =>
                f.name === "package.json" &&
                (f.content.includes("react-scripts") ||
                  f.content.includes("react-dev-utils"))
            );
            const hasAngular = files.some((f) => f.name === "angular.json");
            const hasVue = files.some(
              (f) =>
                f.name === "vue.config.js" ||
                (f.name === "package.json" &&
                  (f.content.includes('"vue"') || f.content.includes("'vue'")))
            );

            // Determine project type
            if (hasNext) {
              projectType = "SSR/SSG";
              framework = "Next.js";
            } else if (hasVue) {
              projectType = "SPA/SSR";
              framework = "Vue.js";
            } else if (hasAngular) {
              projectType = "SPA";
              framework = "Angular";
            } else if (hasCRA) {
              projectType = "SPA";
              framework = "React (CRA)";
            } else if (hasVite && hasReactDependency) {
              projectType = "SPA/SSR";
              framework = "React (Vite)";
            } else if (hasReactDependency || hasReactInProject) {
              projectType = "SPA";
              framework = "React";
            }

            // Analyze project structure
            const srcFiles = files.filter((f) => f.name.startsWith("src/"));
            const hasFeatureFolders = srcFiles.some((f) =>
              f.name.match(/src\/[^/]+\/components\//)
            );
            const hasLayerFolders = srcFiles.some((f) =>
              f.name.match(/src\/(components|pages|hooks|utils|services)\//)
            );

            if (hasFeatureFolders) {
              structure = "Feature-based";
            } else if (hasLayerFolders) {
              structure = "Layer-based";
            }

            // Calculate nesting level
            const maxNesting = files.reduce((max, file) => {
              const depth = (file.name.match(/\//g) || []).length;
              return Math.max(max, depth);
            }, 0);

            const architectureInfo = {
              projectType,
              framework,
              structure,
              nestingLevel: maxNesting,
            };

            const cssAnalysis = window.CSSAnalyzer.analyzeCSSClasses(
              cssFiles,
              jsFiles
            );
            const functionAnalysis = window.Analyzers.analyzeFunctions(jsFiles);
            const variableAnalysis = window.Analyzers.analyzeVariables(jsFiles);
            const imageAnalysis = window.Analyzers.analyzeImages(
              imageFiles,
              jsFiles,
              cssFiles
            );
            const duplicateFunctions =
              window.Analyzers.findDuplicateFunctions(jsFiles);
            const apiRoutes = window.APIAnalyzer.analyzeAPIRoutes(jsFiles);
            const fileTypesInfo = window.Analyzers.analyzeFileTypes(files);
            const pagesInfo = window.Analyzers.analyzePages(files);
            const typesAnalysis =
              window.Analyzers.analyzeTypeScriptTypes(files);

            // Нові аналізатори
            const exportsAnalysis =
              window.Analyzers.analyzeUnusedExports(jsFiles);
            const componentsAnalysis =
              window.Analyzers.analyzeUnusedComponents(jsFiles);
            const hooksAnalysis = window.Analyzers.analyzeUnusedHooks(jsFiles);
            const enumsInterfacesAnalysis =
              window.Analyzers.analyzeUnusedEnumsInterfaces(jsFiles);
            const apiEndpointsAnalysis =
              window.Analyzers.analyzeUnusedAPIEndpoints(jsFiles);

            // Analyze project dependencies
            const dependencyAnalysis =
              window.Analyzers.analyzeDependencies(jsFiles);
            console.log(
              "📊 Dependency analysis completed:",
              dependencyAnalysis
            );

            resolve({
              architecture: architectureInfo,
              unusedCSS: cssAnalysis.unused,
              unusedFunctions: functionAnalysis.unused,
              unusedVariables: variableAnalysis.unused,
              unusedImages: imageAnalysis.unused,
              unusedExports: exportsAnalysis.unused,
              unusedComponents: componentsAnalysis.unused,
              unusedHooks: hooksAnalysis.unused,
              unusedEnumsInterfaces: enumsInterfacesAnalysis.unused,
              unusedAPIEndpoints: apiEndpointsAnalysis.unused,
              duplicateFunctions: duplicateFunctions,
              dependencyAnalysis: dependencyAnalysis,
              apiRoutes: apiRoutes,
              fileTypes: fileTypesInfo,
              pages: pagesInfo,
              typesAnalysis: typesAnalysis,
              stats: {
                cssFilesAnalyzed: cssFiles.length,
                jsFilesAnalyzed: jsFiles.length,
                totalCSSClasses: cssAnalysis.total,
                totalFunctions: functionAnalysis.total,
                totalVariables: variableAnalysis.total,
                totalImages: imageAnalysis.total,
                totalExports: exportsAnalysis.total,
                totalComponents: componentsAnalysis.total,
                totalHooks: hooksAnalysis.total,
                totalEnumsInterfaces: enumsInterfacesAnalysis.total,
                totalAPIEndpoints: apiEndpointsAnalysis.total,
                totalCyclicDependencies:
                  dependencyAnalysis.cyclicDependencies.length,
                totalGodFiles: dependencyAnalysis.godFiles.length,
                totalFiles: files.length,
              },
              projectName,
              packageJson,
              files,
            });
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  },
};
