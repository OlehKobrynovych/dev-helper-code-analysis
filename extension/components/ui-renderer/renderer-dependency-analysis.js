window.UIRenderer = window.UIRenderer || {};

// 4. Render Dependency Analysis
window.UIRenderer.renderDependencyAnalysis = function (result) {
    if (!result.dependencyAnalysis) return "";

    const {
      cyclicDependencies = [],
      godFiles = [],
      hubFiles = [],
      mostUsedComponents = [],
    } = result.dependencyAnalysis;

    let html = `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#3b82f6;">
          🔄 Аналіз залежностей
        </h3>
        <div>
          <!-- Cyclic Dependencies -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1e40af;">
              🔄 Циклічні залежності (${cyclicDependencies.length})
            </h4>
            ${
              cyclicDependencies.length > 0
                ? `
              <div style="background:#eff6ff;border-radius:6px;padding:12px;border:1px solid #dbeafe;">
                ${cyclicDependencies
                  .map(
                    (cycle, index) => `
                  <div style="margin-bottom: ${
                    index < cyclicDependencies.length - 1 ? "12px" : "0"
                  };">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                      <span style="font-size:11px;color:#3b82f6;">Цикл #${
                        index + 1
                      }</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:11px;color:#1e40af;">
                      ${cycle
                        .map(
                          (file, i, arr) =>
                            `<span>${file.split("/").pop()}${
                              i < arr.length - 1 ? " → " : ""
                            }</span>`
                        )
                        .join("")}
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : '<div style="color:#6b7280;font-size:12px;padding:8px 0;">Циклічних залежностей не знайдено</div>'
            }
          </div>

          <!-- God Files -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1e40af;">
              🏛️ "God Files" - файли з багатьма імпортами
            </h4>
            <p style="font-size:10px;color:#6b7280;margin:0 0 8px 0;">
              Файли, які імпортують багато інших файлів (високі вихідні залежності)
            </p>
            ${
              godFiles.length > 0
                ? `
              <div style="background:#f0f9ff;border-radius:6px;border:1px solid #e0f2fe;overflow:hidden;max-height:300px;overflow-y:auto;">
                <div style="display:grid;grid-template-columns:1fr 120px;font-size:11px;background:#e0f2fe;padding:6px 10px;font-weight:600;color:#0369a1;position:sticky;top:0;z-index:1;">
                  <div>Файл</div>
                  <div style="text-align:right;">Імпортує</div>
                </div>
                ${godFiles
                  .map(
                    (file) => `
                  <div style="display:grid;grid-template-columns:1fr 120px;padding:6px 10px;border-bottom:1px solid #e0f2fe;font-size:11px;">
                    <div>
                      <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${
                        file.fullPath
                      }">
                        ${file.file}
                      </div>
                      <div style="font-size:9px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${
                        file.fullPath
                      }">
                        ${file.fullPath}
                      </div>
                    </div>
                    <div style="text-align:right;color:#0c4a6e;font-weight:500;">
                      ${file.imports} ${this.getWordForm(file.imports, [
                      "файл",
                      "файли",
                      "файлів",
                    ])}
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : '<div style="color:#6b7280;font-size:12px;padding:8px 0;">Не знайдено</div>'
            }
          </div>

          <!-- Hub Files -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1e40af;">
              🌟 "Hub Files" - популярні файли
            </h4>
            <p style="font-size:10px;color:#6b7280;margin:0 0 8px 0;">
              Файли, які імпортуються багатьма іншими (високі вхідні залежності)
            </p>
            ${
              hubFiles.length > 0
                ? `
              <div style="background:#fef3ff;border-radius:6px;border:1px solid #fae8ff;overflow:hidden;max-height:300px;overflow-y:auto;">
                <div style="display:grid;grid-template-columns:1fr 140px;font-size:11px;background:#fae8ff;padding:6px 10px;font-weight:600;color:#86198f;position:sticky;top:0;z-index:1;">
                  <div>Файл</div>
                  <div style="text-align:right;">Імпортується</div>
                </div>
                ${hubFiles
                  .map(
                    (file) => `
                  <div style="display:grid;grid-template-columns:1fr 140px;padding:6px 10px;border-bottom:1px solid #fae8ff;font-size:11px;">
                    <div>
                      <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${
                        file.fullPath
                      }">
                        ${file.file}
                      </div>
                      <div style="font-size:9px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${
                        file.fullPath
                      }">
                        ${file.fullPath}
                      </div>
                    </div>
                    <div style="text-align:right;color:#86198f;font-weight:500;">
                      ${file.importedBy} ${this.getWordForm(file.importedBy, [
                      "файлом",
                      "файлами",
                      "файлами",
                    ])}
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : '<div style="color:#6b7280;font-size:12px;padding:8px 0;">Не знайдено</div>'
            }
          </div>

          <!-- Most Used Components -->
          <div>
            <h4 style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1e40af;">
              🏆 Найчастіше використовувані компоненти
            </h4>
            ${
              mostUsedComponents.length > 0
                ? `
              <div style="background:#f5f3ff;border-radius:6px;border:1px solid #ede9fe;overflow:hidden;max-height:300px;overflow-y:auto;">
                <div style="display:grid;grid-template-columns:1fr 120px;font-size:11px;background:#ede9fe;padding:6px 10px;font-weight:600;color:#5b21b6;position:sticky;top:0;z-index:1;">
                  <div>Компонент</div>
                  <div style="text-align:right;">Використань</div>
                </div>
                ${mostUsedComponents
                  .map(
                    (comp) => `
                  <div style="display:grid;grid-template-columns:1fr 120px;padding:6px 10px;border-bottom:1px solid #ede9fe;font-size:11px;">
                    <div>
                      <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${
                        comp.name
                      }">
                        ${comp.name}
                      </div>
                      ${
                        comp.file
                          ? `
                        <div style="font-size:9px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${comp.file}">
                          ${comp.file}
                        </div>
                      `
                          : ""
                      }
                    </div>
                    <div style="text-align:right;color:#5b21b6;font-weight:500;">
                      ${comp.totalCount || comp.count} разів
                      ${
                        comp.fileCount
                          ? `<div style="font-size:9px;color:#6b7280;">у ${
                              comp.fileCount
                            } ${this.getWordForm(comp.fileCount, [
                              "файлі",
                              "файлах",
                              "файлах",
                            ])}</div>`
                          : ""
                      }
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : '<div style="color:#6b7280;font-size:12px;padding:8px 0;">Не знайдено</div>'
            }
          </div>
        </div>
      </div>
    `;

    return html;
  };
