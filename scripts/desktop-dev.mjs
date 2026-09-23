import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const electronPath = require("electron");
const viteBin = require.resolve("vite/bin/vite.js");

const vite = spawn(process.execPath, [viteBin, "--config", "vite.desktop.config.ts", "--host", "127.0.0.1", "--port", "8090", "--strictPort"], {
  stdio: "inherit",
});

async function waitForVite() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch("http://127.0.0.1:8090/");
      if (res.ok || res.status === 404) return;
    } catch {
      // Vite todavía no escucha.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Vite de escritorio no arrancó en el puerto 8090.");
}

let electron;
const shutdown = () => {
  electron?.kill();
  vite.kill();
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await waitForVite();
electron = spawn(electronPath, ["."], {
  stdio: "inherit",
  env: { ...process.env, ELECTRON_DEV: "1", DESKTOP_URL: "http://127.0.0.1:8090" },
});
electron.on("exit", () => {
  vite.kill();
  process.exit(0);
});
