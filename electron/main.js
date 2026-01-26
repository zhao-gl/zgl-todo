const { app, ipcMain, BrowserWindow, Menu } = require('electron')
const path = require('path')

const isMac = process.platform === 'darwin';

// 创建主窗口
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false, // 移除默认的菜单栏
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (app.isPackaged) {
    // 生产环境：加载本地 dist 文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // 开发环境：加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:3000');
  }
}

// 应用程序就绪后,创建主窗口并激活事件监听器
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 监听窗口全部关闭事件（在非macOS平台上退出应用程序）
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// 获取发送事件的窗口实例
function getWindowFromEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

// 监听-关闭窗口
ipcMain.on('window-close', (event) => {
  const win = getWindowFromEvent(event);
  if (win) win.close();
});

// 监听-最小化窗口
ipcMain.on('window-minimize', (event) => {
  const win = getWindowFromEvent(event);
  if (win) win.minimize();
});

// 监听-最大化窗口
ipcMain.on('window-maximize', (event) => {
  const win = getWindowFromEvent(event);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});
