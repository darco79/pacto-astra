const { app, BrowserWindow } = require("electron");
const { createReadStream, existsSync, statSync } = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

function desktopRoot() {
  return path.join(__dirname, "..", "dist-desktop");
}

function insideRoot(root, file) {
  const resolved = path.resolve(file);
  return resolved === root || resolved.startsWith(root + path.sep);
}

function startStatic(root) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = path.resolve(root, `.${pathname}`);
    const send = (target, status, headers, start, end) => {
      res.writeHead(status, headers);
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      createReadStream(target, start == null ? {} : { start, end }).pipe(res);
    };
    if (!insideRoot(root, file) || !existsSync(file) || !statSync(file).isFile()) {
      const index = path.join(root, "index.html");
      if (!existsSync(index)) {
        res.writeHead(404);
        res.end("No está el juego empaquetado.");
        return;
      }
      send(index, 200, { "Content-Type": MIME[".html"] });
      return;
    }
    const stat = statSync(file);
    const type = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        res.writeHead(416);
        res.end();
        return;
      }
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stat.size - 1;
      if (start > end || end >= stat.size) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        res.end();
        return;
      }
      send(
        file,
        206,
        {
          "Content-Type": type,
          "Content-Length": end - start + 1,
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
        },
        start,
        end,
      );
      return;
    }
    send(file, 200, {
      "Content-Type": type,
      "Content-Length": stat.size,
      "Accept-Ranges": "bytes",
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, port: typeof address === "object" && address ? address.port : 0 });
    });
  });
}

function createWindow(url) {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: "Pacto Astra",
    backgroundColor: "#0c0a09",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.removeMenu();
  void win.loadURL(url);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

app.whenReady().then(async () => {
  if (process.env.ELECTRON_DEV === "1" && process.env.DESKTOP_URL) {
    createWindow(process.env.DESKTOP_URL);
    return;
  }
  const root = desktopRoot();
  const { server, port } = await startStatic(root);
  createWindow(`http://127.0.0.1:${port}/`);
  app.on("before-quit", () => server.close());
});

app.on("window-all-closed", () => app.quit());
