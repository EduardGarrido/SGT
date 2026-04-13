const { contextBridge, ipcRenderer } = require('electron')

// Most handled via PHP backend
contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
})