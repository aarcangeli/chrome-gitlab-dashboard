import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import makeManifest from "./utils/plugins/make-manifest";
import customDynamicImport from "./utils/plugins/custom-dynamic-import";
import addHmr from "./utils/plugins/add-hmr";
import manifest from "./manifest";

const root = resolve(__dirname, "src");
const pagesDir = resolve(root, "pages");
const assetsDir = resolve(root, "assets");
const outDir = resolve(__dirname, "dist");
const publicDir = resolve(__dirname, "public");

const isDev = process.env.NODE_ENV === "development";

// ENABLE HMR IN BACKGROUND SCRIPT
const enableHmrInBackgroundScript = true;

console.log("isDev", isDev);
export default defineConfig({
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir,
    },
  },
  plugins: [react(), makeManifest(manifest), customDynamicImport(), addHmr({ background: enableHmrInBackgroundScript, view: true })],
  publicDir,
  build: {
    outDir,
    sourcemap: isDev,
    minify: !isDev,
    rollupOptions: {
      input: {
        background: resolve(pagesDir, "background", "index.ts"),
        contentScript: resolve(pagesDir, "contentScript", "content-script-loader.ts"),
        contentScriptLoaded: resolve(pagesDir, "contentScript", "index.tsx"),
        contentScriptDemo: resolve(pagesDir, "contentScript", "demo.html"),
        popup: resolve(pagesDir, "popup", "index.html"),
        options: resolve(pagesDir, "options", "index.html"),
      },
      output: {
        entryFileNames: "src/pages/[name]/index.js",
        chunkFileNames: "assets/js/[name].[hash].js",
        preserveModules: false,
        esModule: false,
        assetFileNames: (assetInfo) => {
          const { dir, name: _name } = path.parse(assetInfo.name);
          const assetFolder = getLastElement(dir.split("/"));
          const name = assetFolder + firstUpperCase(_name);
          return `assets/[ext]/${name}.chunk.[ext]`;
        },
      },
    },
  },
});

function getLastElement<T>(array: ArrayLike<T>): T {
  const length = array.length;
  const lastIndex = length - 1;
  return array[lastIndex];
}

function firstUpperCase(str: string) {
  const firstAlphabet = new RegExp(/( |^)[a-z]/, "g");
  return str.toLowerCase().replace(firstAlphabet, (L) => L.toUpperCase());
}
