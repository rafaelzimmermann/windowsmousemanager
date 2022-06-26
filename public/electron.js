const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const isDev = require('electron-is-dev');

const devices = require('./devices');

ipcMain.on('list-devices', async (e) => {
  const result = await devices.listMices()
  e.returnValue = result
})

let cache = {}

ipcMain.on('list-devices', async (e) => {
  if (cache.hasOwnProperty('devices')) {
    e.returnValue = cache['devices']
    return
  }
  const result = await devices.listMices()
  if (result.length > 0) {
    cache['devices'] = result
  }
  e.returnValue = result
})

ipcMain.on('list-devices-no-cache', async (e) => {
  const result = await devices.listMices()
  if (result.length > 0) {
    cache['devices'] = result
  }
  e.returnValue = result
})
ipcMain.on('update-device', async (e, payload) => {
  e.returnValue = await devices.updateRegistry(payload).catch((r) => r)
})

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadURL( `file://${path.join(__dirname, '../build/index.html')}`)
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});