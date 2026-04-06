const { app, BrowserWindow, ipcMain } = require('electron') // We are importing 2 modules with CommonJS module syntax
// BrowserWindow, which creates and manages app windows
// app controls the application's event lifecycle

const path = require('node:path')
const createWindow = () => {

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('src/renderer/index.html')
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
