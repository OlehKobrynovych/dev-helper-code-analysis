// Background service worker for DevHelper Code Analysis extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("DevHelper Code Analysis extension installed");
});

let devHelperWindowId = null;

function createDevHelperWindow() {
  chrome.windows.create(
    {
      url: "popup.html",
      type: "popup",
      width: 800,
      height: 800,
      focused: true,
    },
    (newWindow) => {
      if (chrome.runtime.lastError) {
        console.error("Failed to create DevHelper window:", chrome.runtime.lastError);
        return;
      }
      devHelperWindowId = newWindow?.id ?? null;
    }
  );
}

function openOrFocusDevHelperWindow() {
  if (!devHelperWindowId) {
    createDevHelperWindow();
    return;
  }

  chrome.windows.update(devHelperWindowId, { focused: true }, (updatedWindow) => {
    if (chrome.runtime.lastError || !updatedWindow) {
      devHelperWindowId = null;
      createDevHelperWindow();
    }
  });
}

chrome.action.onClicked.addListener(() => {
  openOrFocusDevHelperWindow();
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeCode") {
    // Handle code analysis requests
    sendResponse({ success: true });
  }
  return true;
});

// Store analysis results
chrome.storage.local.get(["analysisHistory"], (result) => {
  if (!result.analysisHistory) {
    chrome.storage.local.set({ analysisHistory: [] });
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === devHelperWindowId) {
    devHelperWindowId = null;
  }
});
