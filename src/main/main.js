const { app, BrowserWindow, ipcMain } = require('electron')
const { spawn, execSync} = require('child_process')
const path = require('node:path')

let phpProcess = null

// Dev:  uses system PHP (php must be installed on the dev machine)
// Prod: uses the binary bundled inside the app via extraResources
function getPhpBinary() {
  if (!app.isPackaged) return 'php'

  const platform = process.platform === 'win32'  ? 'win'
                 : process.platform === 'darwin'  ? 'mac'
                 : 'linux'

  const binary = process.platform === 'win32' ? 'php.exe' : 'php'

  return path.join(process.resourcesPath, 'php', platform, binary)
}

function getBackendPath() {
  if (!app.isPackaged) return path.join(__dirname, '../../backend')
  return path.join(process.resourcesPath, 'backend')
}

// ── Spawn PHP built-in server ─────────────────────────────────────────────────
function spawnPHP() {
  const phpBin  = getPhpBinary()
  const backend = getBackendPath()
  const router  = path.join(backend, 'index.php')

  phpProcess = spawn(phpBin, ['-S', 'localhost:8000', '-t', backend, router], {
    windowsHide: true, // don't flash a terminal window on Windows
  })

  phpProcess.stderr.on('data', (d) => console.log('[PHP]', d.toString()))
  phpProcess.on('close', (code) => console.log('[PHP] cerrado con código:', code))
  // code -> 0 closed normally, 1 error, 2 misuse, 127 command not found

}

// ── Wait for PHP to be ready ──────────────────────────────────────────────────
async function waitPHP(tries = 10) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch('http://localhost:8000/api/ping')
      if (res.ok) return true
    } catch (_) { /* still starting */ }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('[PHP] no respondió después de varios intentos')
}

// ── Create window ─────────────────────────────────────────────────────────────
function createWindow() {

  const win = new BrowserWindow({
    width: 1200,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']) // Vite dev server
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html')) // production build
  }
    // add this temporarily to createWindow() in main.js
win.webContents.openDevTools()
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  spawnPHP()
  await waitPHP()

    // Correr seeder para crear admin por defecto
    try {
    const phpBin  = getPhpBinary()
    const seeder  = path.join(getBackendPath(), 'seeder.php')

    execSync(`"${phpBin}" "${seeder}"`)
    
  } catch (e) {
    console.error('Error en el seeder:', e.message)
  }

  ipcMain.handle('ping', () => 'pong')

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  if (phpProcess) phpProcess.kill()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})