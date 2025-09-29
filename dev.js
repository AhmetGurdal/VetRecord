const path = require("path");
const fs = require("fs");
require("electron-reload")(__dirname);

const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");

async function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("renderer/index.html");
  // Menu.setApplicationMenu(null);
}

try {
  const settingsRaw = fs.readFileSync("./data/settings.json", "utf8");
  const settings = JSON.parse(settingsRaw);
  let appLanguage = "en-US"; // default fallback
  if (settings.language === "tr") {
    appLanguage = "tr-TR";
  } else if (settings.language === "en") {
    appLanguage = "en-US";
  }

  // Set Chromium's language before the app is ready
  app.commandLine.appendSwitch("lang", appLanguage);
} catch (err) {
  console.warn(
    "Could not read settings.json, using default language (en-US)",
    err
  );
  app.commandLine.appendSwitch("lang", appLanguage);
}

app.whenReady().then(async () => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("open-external-url", (event, url) => {
  shell.openExternal(url);
});

// IPC handlers
ipcMain.handle("read-file", async (event, filePath) => {
  return fs.promises.readFile(filePath, "utf8");
});

ipcMain.handle("check-file", async (event, filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error("Error checking file:", err);
    return false;
  }
});

ipcMain.handle("delete-file", async (event, filePath) => {
  await fs.promises.readFile(filePath, "utf8");
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Failed to delete the file:", err);
      return;
    }
    console.log("File deleted successfully!");
  });
});

ipcMain.handle("write-file", async (event, { filePath, content }) => {
  return fs.promises.writeFile(filePath, content, "utf8");
});

ipcMain.handle("get-lang", () => {
  return app.commandLine.getSwitchValue("lang");
});

ipcMain.handle("relauch", () => {
  app.relaunch();
  app.exit();
});
