const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let splash;

function createWindow() {
  splash = new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    center: true,
    resizable: false,

    transparent: true,
    icon: path.join(__dirname, "icon.ico"),
  });

  splash.loadFile("splash.html");

  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    show: false,
    
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("index.html");

  const minSplashTime = 2000;
  const splashStart = Date.now();

  mainWindow.once("ready-to-show", () => {
    const elapsed = Date.now() - splashStart;
    const waitTime = Math.max(minSplashTime - elapsed, 0);

    setTimeout(() => {
      if (splash) splash.close();
      mainWindow.show();
    }, waitTime);
  });

  mainWindow.setMenu(null);
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("check-updates", async () => {
  return new Promise((resolve) => {
    const winget = spawn("winget", ["upgrade", "--include-unknown"]);
    let output = "";

    winget.stdout.on("data", (data) => {
      output += data.toString();
    });

    winget.stderr.on("data", (data) => {
      console.error("Winget Error:", data.toString());
    });

    winget.on("close", () => {
      resolve(output);
    });
  });
});

ipcMain.handle("install-update", async (event, packageId) => {
  return new Promise((resolve) => {
    const winget = spawn("winget", [
      "upgrade",
      "--id",
      packageId,
      "--accept-source-agreements",
      "--accept-package-agreements",
      "--include-unknown",
    ]);

    winget.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    winget.stderr.on("data", (data) => {
      console.error("Winget Error:", data.toString());
    });

    winget.on("close", (code) => {
      resolve(code === 0);
    });
  });
});
