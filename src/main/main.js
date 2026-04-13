const { app, BrowserWindow, ipcMain } = require('electron') // We are importing 2 modules with CommonJS module syntax
// BrowserWindow, which creates and manages app windows
// app controls the application's event lifecycle
const { spawn } = require('child_process')

const path = require('node:path')

let phpProcess = null

// Invoke PHP built-in server
function spawnPHP() {
  const root = path.join(__dirname, '../../backend')
  phpProcess = spawn('php', ['-S', 'localhost:8000', '-t', root])
  phpProcess.stderr.on('data', (d) => console.log('[PHP]', d.toString()))
  phpProcess.on('close', (code) => console.log('[PHP] cerrado:', code))
  // code -> 0 closed, 1 error, 2 misuse, 127 command not found
}

// Connect to PHP backend with retries
async function waitPHP(tries = 5) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch('http://localhost:8000/api/ping')
      // If ping route responds, PHP is ready
      if (res.ok) return true
    } catch (_error){
      // TODO
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('PHP no respondió')
}

// Create window and load React app
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']) // localhost:5173 in dev
  } else {
    win.loadFile(path.join(__dirname, '../dist/renderer/index.html'))
  }
}

// App ready: start PHP, wait for it, then create window
app.whenReady().then(async () => {
  spawnPHP()
  await waitPHP()

  ipcMain.handle('ping', () => 'pong')

  createWindow()

  // MacOS: recreate window
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Ensure PHP process is killed on app exit
app.on('will-quit', () => {
  if (phpProcess) phpProcess.kill()
})

// Window closed, app closed (except MacOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
