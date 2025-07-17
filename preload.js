const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  checkUpdates: () => ipcRenderer.invoke("check-updates"),
  installUpdate: (packageId) => ipcRenderer.invoke("install-update", packageId),
});
