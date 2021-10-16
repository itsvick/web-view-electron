const { ipcRenderer, remote } = require("electron");
function reload(params) {
  console.log("remote", remote);
  // remote.getCurrentWindow().loadURL("https://github.com");
  ipcRenderer.send("reload-page");
}
