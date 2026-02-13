const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script loaded');
// 添加需要暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // =================== Window API ==================
  minimizeWindow: () => ipcRenderer.send('window-minimize'), // 添加最小化窗口的 API
  maximizeWindow: () => ipcRenderer.send('window-maximize'), // 添加最大化窗口的 API
  closeWindow: () => ipcRenderer.send('window-close'), // 添加关闭窗口的 API
  getWindowState: () => ipcRenderer.invoke('get-window-state'), // 获取窗口状态
  onWindowStateChange: (callback) => ipcRenderer.on('window-state-changed', callback), // 监听窗口状态变化

  // ===================== DB API =====================
  dbQuery: (method, ...args) => ipcRenderer.invoke('db-query', method, ...args)
})
