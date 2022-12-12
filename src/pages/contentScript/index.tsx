import { createRoot, Root } from "react-dom/client";
import { BaseStyles, ThemeProvider, ActionList, Avatar } from "@primer/react";
import React from "react";
import { CommandPalette } from "@src/components/CommandPalette/CommandPalette";

let root: Root;
let open = false;

// add binding to keydown event
if (document && document.body) {
  document.body.addEventListener("keydown", onKeydown);
}
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("keydown", onKeydown);
});

function initCommandPalette() {
  if (!root) {
    const container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === "k" && !e.defaultPrevented && !e.repeat) {
    console.log("Opening Command Palette");
    e.preventDefault();
    initCommandPalette();
    open = true;
    renderCommandPalette();
  }
}

function closeCommandPalette() {
  open = false;
  renderCommandPalette();
}

function renderCommandPalette() {
  root.render(
    <ThemeProvider colorMode="auto">
      <BaseStyles>
        <CommandPalette isOpen={open} onDismiss={closeCommandPalette} />
      </BaseStyles>
    </ThemeProvider>
  );
}

setTimeout(() => {
  initCommandPalette();
  renderCommandPalette();
}, 10);
