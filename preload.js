const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openWeb: (url) => {
    ipcRenderer.send("open-external-url", url);
  },
  deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
  getLang: () => ipcRenderer.invoke("get-lang"),
  relauch: () => ipcRenderer.invoke("relauch"),
  checkFile: (filePath) => ipcRenderer.invoke("check-file", filePath),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  writeFile: (filePath, content) =>
    ipcRenderer.invoke("write-file", { filePath, content }),
});
