const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

// 在创建窗口前，移除默认菜单
Menu.setApplicationMenu(null);

// 创建主窗口
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  mainWindow.setTitle('zgl-todo')

  // 开发时加载 Vite dev server
  if (app.isPackaged) {
    // 生产环境：加载本地 dist 文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // 开发环境：加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:3000');
  }
}

/**
 * 应用程序就绪后的初始化逻辑
 * 创建主窗口并设置应用激活事件监听器
 */
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

/**
 * 监听窗口全部关闭事件
 * 在非macOS平台上退出应用程序
 */
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
