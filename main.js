// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, net, session, Menu } = require("electron");
const path = require("path");
let mainWindow;
let deeplinkingUrl;
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
  app.on("second-instance", (e, argv) => {
    // Someone tried to run a second instance, we should focus our window.

    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform == "win32") {
      // Keep only command line / deep linked arguments
      deeplinkingUrl = argv.slice(1);
    }
    // logEverywhere("app.makeSingleInstance# " + deeplinkingUrl);

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
} else {
  app.quit();
  return;
}
function createWindow() {
  // Create the browser window.
  console.log(
    "icon",
    path.join(__dirname, "assets", "icons", "png", "1024x1024.png")
  );
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // icon: getAssetPath('icon.png'),
    icon: path.join(__dirname, "assets", "icons", "png", "1024x1024.png"),
    webPreferences: {
      // preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      // devTools: false
    },
  });

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  // mainWindow.loadFile("no-internet.html");
  mainWindow.loadURL("https://thenextweb.com/news/apple-october-18-2021-event");
  mainWindow.webContents.on(
    "did-fail-load",
    (
      event = Event,
      errorCode = number,
      errorDescription = string,
      validatedURL = string,
      isMainFrame = boolean
    ) => {
      if (
        errorDescription === "ERR_INTERNET_DISCONNECTED" ||
        errorDescription === "ERR_PROXY_CONNECTION_FAILED"
      ) {
        // console.log(errorDescription);
        mainWindow.loadFile("no-internet.html");
      }
    }
  );

  ipcMain.on("reload-page", () => {
    console.log("in reload page", net.isOnline());

    if (net.isOnline()) {
      setTimeout(() => {
        mainWindow.loadURL(
          "https://thenextweb.com/news/apple-october-18-2021-event"
        );
      }, 2000);
    }
  });

  Menu.setApplicationMenu(null);

  // Protocol handler for win32
  if (process.platform == "win32") {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = process.argv.slice(1);
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = "SuperDuperAgent";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

if (!app.isDefaultProtocolClient("arms")) {
  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient("arms");
}

app.on("will-finish-launching", () => {
  // Protocol handler for osx
  app.on("open-url", (event, url) => {
    event.preventDefault();
    deeplinkingUrl = url;
    // logEverywhere("open-url# " + deeplinkingUrl);
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
