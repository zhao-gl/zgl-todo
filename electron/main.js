const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const {setupIPC, setIpcEventListener } = require('./ipc/ipc');

const isMac = process.platform === 'darwin';

// 创建主窗口
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
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

// 应用程序就绪后,创建主窗口
app.whenReady().then(() => {
  // ===================== WINDOW =====================
  createWindow();
  // ===================== IPC =====================
  setImmediate(() => {
    setupIPC();
    setIpcEventListener();
  });
})

// 监听应用程序激活事件（在macOS上，当没有打开的窗口时，重新创建一个窗口）
app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// 监听窗口全部关闭事件（在非macOS平台上退出应用程序）
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



