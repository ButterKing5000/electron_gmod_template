const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

app.on("ready", () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    resizable: false,
  });
  win.loadFile("./public/index.html");
  win.webContents.openDevTools();
});

function createDir(path) {
  if (fs.existsSync(path)) return;
  fs.mkdirSync(path);
}

function createAddon(sender, data) {
  const appPath = path.dirname(app.getAppPath());
  const dir = path.join(appPath, data.name)
  const lua = path.join(dir, "lua");
  const autorun = path.join(lua, "autorun");
  const custom = path.join(lua, data.file_key)
  const init = path.join(autorun, data.file_key + "_init.lua")
  const config = path.join(custom, data.file_key + "_config.lua")
  const sv = path.join(custom, data.file_key + "_sv.lua")
  const cl = path.join(custom, data.file_key + "_cl.lua")
  const sh = path.join(custom, data.file_key + "_sh.lua")
  
  const tonumber = Number(data.tab || 2)
  const num = isNaN(tonumber) ? 2 : tonumber; 
  let tab = " ";
  tab = tab.repeat(num);
  const double = tab.repeat(2);

  let err = null;
  try {
    createDir(dir);
    createDir(lua);
    createDir(autorun);
    createDir(custom);
    fs.writeFileSync(config, `${data.global}.config = {} \n-----------------------------------------\n\n`)
    fs.writeFileSync(init, 
      `local function Initiate()
${tab}${data.global} = ${data.global} or {}
${tab}if SERVER then
${double}include("${data.global}/${path.basename(config)}")
${double}include("${data.global}/${path.basename(sh)}")
${double}include("${data.global}/${path.basename(sv)}")
${double}AddCSLuaFile("${data.global}/${path.basename(config)}")
${double}AddCSLuaFile("${data.global}/${path.basename(sh)}")
${double}AddCSLuaFile("${data.global}/${path.basename(sh)}")
${tab}else
${double}include("${data.global}/${path.basename(config)}")
${double}include("${data.global}/${path.basename(sh)}")
${double}include("${data.global}/${path.basename(sh)}")
${tab}end
end
Initiate()`);
    fs.writeFileSync(sv, "if true then end")
    fs.writeFileSync(cl, "if true then end")
    fs.writeFileSync(sh, "if true then end")
  } catch (error) {
    err = error;
    console.error(error);
  }
  sender.send("addon-done", { success: !err })
}

ipcMain.on('addon-data', (event, data) => {
  createAddon(event.sender, data);
})