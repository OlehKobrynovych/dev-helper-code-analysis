window.UIRenderer = window.UIRenderer || {};

// 3. Render Code Health Analysis
window.UIRenderer.renderCodeHealth = function (result) {
    const files = result.files || [];
    const codeHealthIssues = [];
    const largeFiles = [];

    // File patterns to analyze (source files only)
    const sourceFilePatterns = [/\.(js|jsx|ts|tsx|vue|svelte)$/, /^[^.]*$/];

    // Patterns to ignore
    const ignoredPatterns = [
      /node_modules/,
      /\.(test|spec|stories|mock)\.[jt]sx?$/,
      /\.d\.ts$/,
      /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i,
      /package-lock\.json$/,
      /routeTree\.gen\.ts$/,
    ];

    // Analyze files for code health issues
    files.forEach((file) => {
      if (!file.content) return;

      const fileName = file.name.split("/").pop();
      const fileExt = fileName.split(".").pop().toLowerCase();

      // Skip non-source files and ignored patterns
      const isSourceFile = sourceFilePatterns.some((pattern) =>
        file.name.match(pattern)
      );
      const isIgnored = ignoredPatterns.some((pattern) =>
        file.name.match(pattern)
      );

      if (!isSourceFile || isIgnored) return;

      const lines = file.content.split("\n");
      const lineCount = lines.length;
      const isLargeFile = lineCount > 500;

      // Only track source files for large files
      if (isLargeFile && fileExt.match(/^(js|jsx|ts|tsx|vue|svelte)$/)) {
        largeFiles.push({
          name: fileName,
          path: file.name,
          lines: lineCount,
        });
      }

      // Skip complexity analysis for non-code files
      if (!fileExt.match(/^(js|jsx|ts|tsx|vue|svelte)$/)) return;

      // Advanced complexity analysis
      let ifElseCount = 0;
      let loopCount = 0;
      let nestingLevel = 0;
      let currentNesting = 0;
      let functionNesting = 0;
      let maxFunctionNesting = 0;

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (
          !trimmedLine ||
          trimmedLine.startsWith("//") ||
          trimmedLine.startsWith("*")
        ) {
          return;
        }

        // Count if/else statements
        if (trimmedLine.match(/\b(if|else if|else)\s*\(/)) {
          ifElseCount++;
        }

        // Count loops
        if (
          trimmedLine.match(/\b(for|while|do|forEach|map|filter|reduce)\s*\(/)
        ) {
          loopCount++;
        }

        // Track function declarations
        if (
          trimmedLine.match(
            /\b(function|const|let|var|class|interface|type|enum)\s+\w+\s*[=:(]/
          )
        ) {
          functionNesting = currentNesting + 1;
          maxFunctionNesting = Math.max(maxFunctionNesting, functionNesting);
        }

        // Track nesting level
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        currentNesting += openBraces - closeBraces;
        nestingLevel = Math.max(nestingLevel, currentNesting);

        if (closeBraces > 0) {
          functionNesting = Math.max(0, functionNesting - closeBraces);
        }
      });

      // Calculate complexity score
      const complexity =
        ifElseCount * 2 + loopCount * 2 + maxFunctionNesting * 3;

      // Only show files with significant complexity or deep nesting
      const isComplex =
        complexity > 30 ||
        ifElseCount > 10 ||
        loopCount > 5 ||
        maxFunctionNesting > 4 ||
        nestingLevel > 5;

      if (isComplex) {
        codeHealthIssues.push({
          name: fileName,
          path: file.name,
          complexity,
          ifElseCount,
          loopCount,
          nestingLevel,
          functionNesting: maxFunctionNesting,
          lines: lineCount,
          isLargeFile: isLargeFile,
        });
      }
    });

    // Sort by complexity (descending)
    codeHealthIssues.sort((a, b) => b.complexity - a.complexity);
    largeFiles.sort((a, b) => b.lines - a.lines);

    // Display code health section if there are any issues
    if (codeHealthIssues.length === 0 && largeFiles.length === 0) return "";

    let html = `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">
          <span style="color:#3b82f6;">📊 Аналіз якості коду</span>
        </h3>
        <div style="max-height: 400px; overflow-y: auto; padding-right: 8px;">
    `;

    if (largeFiles.length > 0) {
      html += `
        <div style="margin-bottom:${
          codeHealthIssues.length > 0 ? "16px" : "0"
        };">
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Великі файли (>500 рядків):</div>
          <div style="background:#f9fafb;border-radius:6px;padding:8px;font-size:12px;">
            ${largeFiles
              .map(
                (file) => `
              <div style="padding:6px 8px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
                <div style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${
                  file.path
                }">
                  ${file.name}
                  <span style="color:#9ca3af;font-size:11px;margin-left:8px;">${file.path.replace(
                    file.name,
                    ""
                  )}</span>
                </div>
                <span style="color:#dc2626;font-weight:500;margin-left:12px;">${
                  file.lines
                } рядків</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    if (codeHealthIssues.length > 0) {
      html += `
        <div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Потенційні проблеми складності:</div>
          <div style="background:#f9fafb;border-radius:6px;padding:8px;font-size:12px;">
            ${codeHealthIssues
              .map((file) => {
                const issues = [];
                if (file.complexity > 50)
                  issues.push(
                    `дуже висока складність (${file.complexity} балів)`
                  );
                else if (file.complexity > 30)
                  issues.push(`висока складність (${file.complexity} балів)`);

                if (file.functionNesting > 4)
                  issues.push(
                    `функції з глибоким вкладенням (до ${file.functionNesting} рівнів)`
                  );
                if (file.nestingLevel > 5)
                  issues.push(
                    `глибоке вкладення (${file.nestingLevel} рівнів)`
                  );
                if (file.ifElseCount > 10)
                  issues.push(`багато умов (${file.ifElseCount})`);
                if (file.loopCount > 5)
                  issues.push(`багато циклів (${file.loopCount})`);
                if (file.isLargeFile)
                  issues.push(`великий файл (${file.lines} рядків)`);

                // Calculate severity score
                const severityScore = Math.min(
                  100,
                  Math.floor(
                    file.complexity * 0.4 +
                      file.functionNesting * 10 +
                      file.ifElseCount * 0.5 +
                      file.loopCount * 1 +
                      file.nestingLevel * 2
                  )
                );

                // Determine severity color
                let severityColor = "#10b981";
                if (severityScore > 70) severityColor = "#ef4444";
                else if (severityScore > 50) severityColor = "#f59e0b";
                else if (severityScore > 30) severityColor = "#3b82f6";

                return `
                <div style="padding:10px;border-bottom:1px solid #e5e7eb;position:relative;">
                  <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${severityColor};border-radius:2px 0 0 2px;"></div>
                  <div style="margin-left:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
                      <div style="font-weight:500;flex:1;min-width:0;">
                        <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${
                          file.path
                        }">
                          ${file.name}
                        </div>
                        <div style="font-size:11px;color:#6b7280;margin-top:2px;">
                          ${file.path.replace(file.name, "")}
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:8px;margin-left:8px;">
                        <span style="font-size:11px;color:#6b7280;">
                          <span style="color:#374151;font-weight:500;">${
                            file.complexity
                          }</span> балів
                        </span>
                      </div>
                    </div>
                    ${
                      issues.length > 0
                        ? `
                      <div style="font-size:11px;color:#4b5563;margin-top:4px;">
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px;">
                          ${issues
                            .map(
                              (issue) => `
                            <span style="display:inline-flex;align-items:center;background:${severityColor}10;color:${severityColor};padding:2px 6px;border-radius:4px;font-size:10px;font-weight:500;border:1px solid ${severityColor}20;">
                              ${issue}
                            </span>
                          `
                            )
                            .join("")}
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;font-size:10px;color:#6b7280;margin-top:4px;">
                          <span>${file.lines} рядків</span>
                          <span>•</span>
                          <span>${file.ifElseCount} умов</span>
                          <span>•</span>
                          <span>${file.loopCount} циклів</span>
                          <span>•</span>
                          <span>вкладеність до ${
                            file.nestingLevel
                          } рівнів</span>
                        </div>
                      </div>
                    `
                        : ""
                    }
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `;
    }

    html += "</div></div>";
    return html;
  };
