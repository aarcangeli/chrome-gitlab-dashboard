import packageJson from "./package.json";

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  options_page: "src/pages/options/index.html",
  background: { service_worker: "src/pages/background/index.js", type: "module" },
  action: {
    default_popup: "src/pages/popup/index.html",
  },
  icons: {
    "256": "gitlab-logo-256.png",
  },
  web_accessible_resources: [
    {
      resources: ["assets/js/*.js", "assets/css/*.css", "icon-128.png", "icon-34.png", "src/pages/contentScriptLoaded/index.js", "*.js.map"],
      matches: ["*://*/*"],
    },
  ],
  permissions: ["storage"],
  content_scripts: [
    {
      matches: ["*://*/*"],
      js: ["src/pages/contentScript/index.js"],
      run_at: "document_start",
    },
  ],
  // optional permissions
  optional_host_permissions: ["http://*/", "https://*/"],
};

export default manifest;
