const { app, BrowserWindow } = require("electron");
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

installExtension(REACT_DEVELOPER_TOOLS).then((name) => {
  console.log(`Added Extension:  ${name}`);
})
  .catch((err) => {
    console.log('An error occurred: ', err);
  });

app.on("ready", () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
  });
  win.loadFile("./public/index.html");
  win.webContents.openDevTools();
});