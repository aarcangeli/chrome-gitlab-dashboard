if (location.host !== "github.com") {
  console.log("Loading GL Dashboard Content Script");
  import(chrome.runtime.getURL("src/pages/contentScriptLoaded/index.js"));
}
