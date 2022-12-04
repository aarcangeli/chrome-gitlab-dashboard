import React from "react";
import { createRoot } from "react-dom/client";
import Options from "@pages/options/Options";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import { createGlobalStyle } from "styled-components";
import { BaseStyles, themeGet, ThemeProvider } from "@primer/react";

refreshOnUpdate("pages/options");

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
        <Options />
      </BaseStyles>
    </ThemeProvider>
  );
}

init();
