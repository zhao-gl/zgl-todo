const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const {setupIPC, setIpcEventListener } = require('./ipc/ipc');
const { performance } = require('perf_hooks');
const {getInstance} = require("./db/db");
// 关键：禁用所有策略加载（组策略 + 注册表策略）
app.commandLine.appendSwitch('disable-policy-key');
app.commandLine.appendSwitch('no-experiments');
app.commandLine.appendSwitch('ignore-certificate-errors'); // 忽略证书错误
// 禁用 IndexedDB、WebSQL（如果应用不需要）
app.commandLine.appendSwitch('disable-features', 'WebSQL,IndexedDB');
// 性能计时器
const perfTimers = new Map();
function startTimer(name) {
  perfTimers.set(name, process.hrtime.bigint());
  console.log(`[PERF] 开始计时: ${name}`);
}
// 结束计时器
function endTimer(name) {
  const start = perfTimers.get(name);
  if (start) {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // 转换为毫秒
    console.log(`[PERF] ${name} 耗时: ${duration.toFixed(2)}ms`);
    perfTimers.delete(name);
  }
}

console.log('应用程序启动');
let mainWindow;
let db;
const isMac = process.platform === 'darwin';
// 创建主窗口
function createWindow () {
  console.log('正在创建主窗口');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // 移除默认的菜单栏
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false // 生产禁用 DevTools
    }
  })

  if (app.isPackaged) {
    // 生产环境：加载本地 dist 文件
    console.log('生产环境：加载本地 dist 文件');
    startTimer('load-dist-file');
    mainWindow.loadFile('./dist/index.html');
    mainWindow.show();
    endTimer('load-dist-file');
    // 防止通过快捷键打开
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // 禁用 F12、Ctrl+Shift+I、Ctrl+Shift+J 等 DevTools 快捷键
      if (input.control && input.shift && (input.key === 'I' || input.key === 'J')) {
        event.preventDefault();
      }
      if (input.key === 'F12') {
        event.preventDefault();
      }
    });
  } else {
    // 开发环境：加载 Vite 开发服务器
    console.log('开发环境：加载 Vite 开发服务器');
    startTimer('load-vite-url');
    const url = 'http://127.0.0.1:3000';
    // 为了改善用户体验，立即显示窗口，而不是等待页面加载完成
    mainWindow.show();
    mainWindow.webContents.openDevTools();
    // 监听页面加载事件
    mainWindow.webContents.on('did-start-loading', () => {
      startTimer('page-loading');
      console.log('[PERF] 页面开始加载');
    });

    mainWindow.webContents.on('did-stop-loading', () => {
      endTimer('page-loading');
      console.log('[PERF] 页面加载完成');
    });

    mainWindow.webContents.on('dom-ready', () => {
      endTimer('dom-ready');
      console.log('[PERF] DOM 准备就绪');
    });

    mainWindow.webContents.on('did-finish-load', () => {
      endTimer('finish-load');
      console.log('[PERF] 页面完全加载完成');
    });

    mainWindow.loadURL(url).then(() => {
      console.log('Vite 开发服务器 URL 加载成功');
    }).catch((error) => {
      console.error('Vite 服务器连接失败:', error.message);
    });
  }
}

// 应用程序就绪后,创建主窗口
app.whenReady().then(async () => {
  startTimer('app-ready-to-create-window');
  console.log('Electron 应用程序已就绪');
  console.log('开始初始化数据库');
  // 初始化数据库
  db = getInstance();
  console.log('初始化数据库完成');
  // ===================== IPC =====================
  console.log('开始设置 IPC 事件监听器');
  // setupIPC();
  setIpcEventListener();
  console.log('IPC 事件监听器已设置');

  // ===================== WINDOW =====================
  console.log('开始创建主窗口');
  createWindow();
  console.log('主窗口创建完成');
  endTimer('app-ready-to-create-window');

  // 输出性能测量结果
  setInterval(() => {
    const measures = performance.getEntriesByType('measure');
    measures.forEach(measure => {
      console.log(`[PERFORMANCE] ${measure.name}: ${measure.duration}ms`);
    });
  }, 1000);
})

// 监听应用程序激活事件（在macOS上，当没有打开的窗口时，重新创建一个窗口）
app.on('activate', function () {
  console.log('应用程序被激活');
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log('没有打开的窗口，创建新窗口');
    createWindow()
  }
})

// 监听窗口全部关闭事件（在非macOS平台上退出应用程序）
app.on('window-all-closed', function () {
  console.log('所有窗口已关闭');
  if (process.platform !== 'darwin') {
    console.log('非 macOS 平台，退出应用程序');
    // 关闭数据库连接
    if (db) {
      db.close();
    }
    app.quit()
  }
})
