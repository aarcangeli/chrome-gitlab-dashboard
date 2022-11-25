try {
  chrome.devtools.panels.create(
    "Dev Tools",
    "gitlab-logo-256.png",
    "src/pages/panel/index.html"
  );
} catch (e) {
  console.error(e);
}
