const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 这里可以添加需要暴露给渲染进程的 API
  getAppVersion: () => process.env.npm_package_version
})
