
const { app, BrowserWindow, ipcMain } = require('electron')
const { spawn, execFileSync } = require('child_process')
const path = require('node:path')
const fs = require('node:fs')

let phpProcess = null
let mysqlProcess = null

// Local MySQL credentials — only used in the packaged app (127.0.0.1 only, never exposed)
const LOCAL_DB_PORT = '3307'
const LOCAL_DB_NAME = 'sgtdb'
const LOCAL_DB_USER = 'sgt_root'
const LOCAL_DB_PASS = 'sgt_local'

// Helpers
function getPlatform() {
  return process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'
}

function getPhpBinary() {
  if (!app.isPackaged) return 'php'
  const platform = getPlatform()
  const binary = platform === 'win' ? 'php.exe' : 'php'
  return path.join(process.resourcesPath, 'php', platform, binary)
}

function getMysqldBinary() {
  const platform = getPlatform()
  const binary = platform === 'win' ? 'mariadbd.exe' : 'mariadbd'
  return path.join(process.resourcesPath, 'mysql', platform, 'bin', binary)
}

function getMysqlClientBinary() {
  const platform = getPlatform()
  const binary = platform === 'win' ? 'mariadb.exe' : 'mariadb'
  return path.join(process.resourcesPath, 'mysql', platform, 'bin', binary)
}


function getMysqlBaseDir() {
  return path.join(process.resourcesPath, 'mysql', getPlatform())
}

// Linux/macOS: mysqld is dynamically linked — point the linker at our bundled libs
function getMysqlEnv() {
  const env = { ...process.env }
  const libDir = path.join(getMysqlBaseDir(), 'lib')
  const platform = getPlatform()
  if (platform === 'linux') {
    env.LD_LIBRARY_PATH = libDir + (process.env.LD_LIBRARY_PATH ? `:${process.env.LD_LIBRARY_PATH}` : '')
  } else if (platform === 'mac') {
    env.DYLD_FALLBACK_LIBRARY_PATH = libDir + (process.env.DYLD_FALLBACK_LIBRARY_PATH ? `:${process.env.DYLD_FALLBACK_LIBRARY_PATH}` : '')
  }
  return env
}

function getBackendPath() {
  if (!app.isPackaged) return path.join(__dirname, '../../backend')
  return path.join(process.resourcesPath, 'backend')
}

function getDataDir() {
  // userData persists across app updates and is writable — unlike resourcesPath
  return path.join(app.getPath('userData'), 'mysql_data')
}

// ── MySQL ─────────────────────────────────────────────────────────────────────

// Returns true on first run (data dir did not exist yet)
function initMySQLDataDir() {
  const dataDir = getDataDir()
  if (fs.existsSync(path.join(dataDir, 'mysql'))) return false

  console.log('[MySQL] Primera ejecución: inicializando directorio de datos...')
  fs.mkdirSync(dataDir, { recursive: true })

  const platform = getPlatform()
  const baseDir = getMysqlBaseDir()

  if (platform === 'win') {
<<<<<<< HEAD
=======
    // On Windows, use mariadbd.exe --initialize-insecure
    // This creates a fresh data directory with an empty root password
    // No --basedir flag needed — the binary infers it from its own location
>>>>>>> e37fe8939f7f1b45d2d6707483bd605fb388bfd3
    const mariadbd = path.join(baseDir, 'bin', 'mariadbd.exe')
    execFileSync(mariadbd, [
      '--initialize-insecure',
      `--datadir=${dataDir}`,
<<<<<<< HEAD
    ], { stdio: 'inherit', env: getMysqlEnv() })
  } else {
=======
    ], { stdio: 'pipe', env: getMysqlEnv() })
  } else {
    // On Linux/macOS, mariadb-install-db is a shell script that accepts these flags
>>>>>>> e37fe8939f7f1b45d2d6707483bd605fb388bfd3
    const installScript = path.join(baseDir, 'scripts', 'mariadb-install-db')
    execFileSync(installScript, [
      `--datadir=${dataDir}`,
      `--basedir=${baseDir}`,
      '--auth-root-authentication-method=normal',
<<<<<<< HEAD
    ], { stdio: 'inherit', env: getMysqlEnv() })
=======
    ], { stdio: 'pipe', env: getMysqlEnv() })
>>>>>>> e37fe8939f7f1b45d2d6707483bd605fb388bfd3
  }

  return true
}

function spawnMySQL() {
console.log('====== spawnMySQL() CALLED ======')
  console.log('[MySQL] binary:', getMysqldBinary())
  console.log('[MySQL] dataDir:', getDataDir())
  console.log('[MySQL] basedir:', getMysqlBaseDir())
  console.log('[MySQL] port:', LOCAL_DB_PORT)

  const dataDir = getDataDir()

  mysqlProcess = spawn(getMysqldBinary(), [
    `--datadir=${dataDir}`,
    `--basedir=${getMysqlBaseDir()}`,
    `--port=${LOCAL_DB_PORT}`,
    '--bind-address=127.0.0.1',
    `--socket=${path.join(dataDir, 'mysql.sock')}`,
    '--console',
  ], { windowsHide: true, env: getMysqlEnv() })

// Catch failures to spawn the process itself (binary missing, permissions, etc.)
  mysqlProcess.on('error', (err) => {
    console.error('[MySQL] ERROR AL LANZAR PROCESO:', err)
  })

  // ← Blind spot #1: you weren't capturing stdout, only stderr
  // MariaDB writes startup info to stdout before errors go to stderr
  mysqlProcess.stdout.on('data', (d) =>
    console.log('[MySQL stdout]', d.toString().trim())
  )

  mysqlProcess.stderr.on('data', (d) =>
    console.log('[MySQL stderr]', d.toString().trim())
  )

  // ← Blind spot #2: 'close' without an exit code tells you nothing
  // Show the actual exit code AND signal so you know why it died
  mysqlProcess.on('close', (code, signal) => {
    console.log(`[MySQL] cerrado código=${code} signal=${signal}`)
  })

  mysqlProcess.on('exit', (code, signal) => {
    console.log(`[MySQL] exit código=${code} signal=${signal}`)
  })
}

async function waitMySQL(tries = 30) {
  const args = ['-u', 'root', `--port=${LOCAL_DB_PORT}`, '--host=127.0.0.1', '-e', 'SELECT 1']
  for (let i = 0; i < tries; i++) {
    await new Promise((r) => setTimeout(r, 500))
    try {
      execFileSync(getMysqlClientBinary(), args, { stdio: 'pipe', env: getMysqlEnv() })
      console.log('[MySQL] listo.')
      return
    } catch (_) { /* todavía arrancando */ }
  }
  throw new Error('[MySQL] no respondió después de varios intentos')
}

// Imports the schema and creates the application user — first run only
function setupDatabase() {
  console.log('[MySQL] Configurando base de datos...')
  const clientArgs = ['-u', 'root', `--port=${LOCAL_DB_PORT}`, '--host=127.0.0.1']

  execFileSync(getMysqlClientBinary(), clientArgs, {
    input: `CREATE DATABASE IF NOT EXISTS \`${LOCAL_DB_NAME}\`;`,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: getMysqlEnv(),
  })

  const schemaSQL = fs.readFileSync(
    path.join(getBackendPath(), 'config', 'database.sql'), 'utf8'
  )
  execFileSync(getMysqlClientBinary(), [...clientArgs, LOCAL_DB_NAME], {
    input: schemaSQL,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: getMysqlEnv(),
  })

  const userSQL = [
    `CREATE USER IF NOT EXISTS '${LOCAL_DB_USER}'@'127.0.0.1' IDENTIFIED BY '${LOCAL_DB_PASS}';`,
    `CREATE USER IF NOT EXISTS '${LOCAL_DB_USER}'@'localhost' IDENTIFIED BY '${LOCAL_DB_PASS}';`,
    `GRANT ALL PRIVILEGES ON ${LOCAL_DB_NAME}.* TO '${LOCAL_DB_USER}'@'127.0.0.1';`,
    `GRANT ALL PRIVILEGES ON ${LOCAL_DB_NAME}.* TO '${LOCAL_DB_USER}'@'localhost';`,
    `FLUSH PRIVILEGES;`,
  ].join('\n')
  execFileSync(getMysqlClientBinary(), clientArgs, {
    input: userSQL,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: getMysqlEnv(),
  })

  console.log('[MySQL] Base de datos configurada.')
}

// ── PHP ───────────────────────────────────────────────────────────────────────

function spawnPHP() {
  const phpBin = getPhpBinary()
  const backend = getBackendPath()
  const router = path.join(backend, 'index.php')

  phpProcess = spawn(phpBin, ['-S', 'localhost:8000', '-t', backend, router], {
    windowsHide: true,
  })

  phpProcess.stderr.on('data', (d) => console.log('[PHP]', d.toString().trim()))
  phpProcess.on('close', (code) => console.log('[PHP] cerrado con código:', code))
}

async function waitPHP(tries = 10) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch('http://localhost:8000/api/ping')
      if (res.ok) {
        console.log('[PHP] listo.')
        return
      }
    } catch (_) { /* todavía arrancando */ }
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
}

// App lifecycle

app.whenReady().then(async () => {
  if (app.isPackaged) {
    Object.assign(process.env, {
      DB_HOST: '127.0.0.1',
      DB_PORT: LOCAL_DB_PORT,
      DB_NAME: LOCAL_DB_NAME,
      DB_USER: LOCAL_DB_USER,
      DB_PASS: LOCAL_DB_PASS,
      APP_ENV: 'production',
    })

    const isFirstRun = initMySQLDataDir()
    spawnMySQL()
    await waitMySQL()

    if (isFirstRun) setupDatabase()

    spawnPHP()
    await waitPHP()

    try {
      const seeder = path.join(getBackendPath(), 'config', 'seeder.php')
      execFileSync(getPhpBinary(), [seeder], { stdio: 'inherit' })
    } catch (e) {
      console.error('[Seeder] Error:', e.message)
    }
  } else {
    spawnPHP()
    await waitPHP()

    try {
      const seeder = path.join(getBackendPath(), 'config', 'seeder.php')
      execFileSync('php', [seeder], { stdio: 'inherit' })
    } catch (e) {
      console.error('[Seeder] Error:', e.message)
    }
  }

  ipcMain.handle('ping', () => 'pong')

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  if (phpProcess) phpProcess.kill()
  if (mysqlProcess) mysqlProcess.kill()
})

app.on('window-all-closed', () => {
  if (getPlatform() !== 'mac') app.quit()
})
