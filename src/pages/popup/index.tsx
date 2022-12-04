import React from "react";
import { createRoot } from "react-dom/client";
import "@pages/popup/index.scss";
import "@src/style/scrollbar.scss";
import "@src/style/global-style.scss";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import Popup from "@pages/popup/Popup";
import { BaseStyles, themeGet, ThemeProvider } from "@primer/react";
import { createGlobalStyle } from "styled-components";

refreshOnUpdate("pages/popup");

// Apply global styles
// Background color must be set manually (https://github.com/primer/react/issues/2370#issuecomment-1259357065)
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${themeGet("colors.canvas.default")};
  }
`;

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find AppContainer");
  }
  const root = createRoot(appContainer);
  root.render(
    <ThemeProvider colorMode="auto">
      <BaseStyles>
        <GlobalStyle />
        <Popup />
      </BaseStyles>
    </ThemeProvider>
  );
}

init();
