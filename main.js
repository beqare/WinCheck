const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");

  // Menü entfernen
  win.setMenu(null);
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Winget Befehle über IPC
ipcMain.handle("check-updates", async () => {
  return new Promise((resolve, reject) => {
    const winget = spawn("winget", ["upgrade"]);
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
  return new Promise((resolve, reject) => {
    const winget = spawn("winget", [
      "upgrade",
      "--id",
      packageId,
      "--accept-source-agreements",
      "--accept-package-agreements",
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
