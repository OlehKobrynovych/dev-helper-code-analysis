// Main popup controller
const zipInput = document.getElementById("zipInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadProgress = document.getElementById("uploadProgress");
const uploadResults = document.getElementById("uploadResults");
const uploadSection = document.getElementById("uploadSection");

uploadBtn.addEventListener("click", () => zipInput.click());

zipInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  uploadProgress.style.display = "block";
  uploadResults.style.display = "none";
  uploadSection.style.display = "none";

  const reader = new FileReader();

  reader.onload = async (event) => {
    try {
      const arrayBuffer = event.target.result;
      console.log("ArrayBuffer loaded:", arrayBuffer instanceof ArrayBuffer);

      const dataView = new DataView(arrayBuffer);
      const result = await window.ZipHandler.analyzeZipProject(dataView);
      console.log("result", result);
      displayResults(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Помилка аналізу: " + error.message);
      uploadSection.style.display = "block";
    } finally {
      uploadProgress.style.display = "none";
      zipInput.value = "";
    }
  };

  reader.onerror = () => {
    alert("Помилка читання файлу");
    uploadProgress.style.display = "none";
    uploadSection.style.display = "block";
  };

  reader.readAsArrayBuffer(file);
});

function displayResults(result) {
  console.log("Results:", result);

  let html = window.UIRenderer.renderResultsHTML(result);
  uploadResults.innerHTML = html;
  uploadResults.style.display = "block";

  const reuploadBtn = document.getElementById("reuploadBtn");
  if (reuploadBtn) {
    reuploadBtn.addEventListener("click", () => zipInput.click());
  }
}
