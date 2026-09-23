import { renameSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

function emitIndexHtml(): Plugin {
  return {
    name: "desktop-index-html",
    writeBundle(options) {
      const dir = options.dir ?? resolve(root, "dist-desktop");
      renameSync(resolve(dir, "desktop.html"), resolve(dir, "index.html"));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), emitIndexHtml()],
  resolve: {
    alias: { "@": resolve(root, "src") },
  },
  build: {
    outDir: "dist-desktop",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(root, "desktop.html"),
    },
  },
});
