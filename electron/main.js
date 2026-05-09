const { app, Tray, Menu, BrowserWindow, nativeImage } = require('electron')
const path = require('path')
const {setIpcEventListener} = require('./ipc/ipc');
const { performance } = require('perf_hooks');
const {getInstance} = require("./db/db");
app.commandLine.appendSwitch('disable-policy-key'); // 禁用所有策略加载（组策略 + 注册表策略）
app.commandLine.appendSwitch('no-experiments'); // 禁用实验性功能，防止不稳定或未正式发布的特性影响应用运行
app.commandLine.appendSwitch('ignore-certificate-errors'); // 忽略证书错误
app.commandLine.appendSwitch('disable-http-cache'); // 禁用缓存
app.commandLine.appendSwitch('disable-site-isolation-trials'); // 禁用站点隔离
app.commandLine.appendSwitch('disable-features', 'WebSQL,IndexedDB'); // 禁用特定存储技术
app.commandLine.appendSwitch('high-dpi-support', 'true'); // 允许高 DPI 缩放
// 设置任务栏 AppUserModelID（Windows），让任务栏正确显示应用名称而非 "Electron"
app.setAppUserModelId('com.zgl.todo');
// 强制窗口标题，确保任务栏右键菜单正确显示
const APP_TITLE = 'zgl-todo';
// Menu.setApplicationMenu(null) // 彻底移除顶部菜单和快捷键
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
let tray = null;

// 显示/恢复主窗口
function showMainWindow() {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
}

// 创建托盘
function createTray() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'build/icons/favicon-32.png')
    : path.join(__dirname, '../build/icons/favicon-32.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: () => showMainWindow() },
    { label: '退出', click: () => {
      if (db) db.close();
      app.quit();
    }}
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('zgl-todo');
  // 点击托盘图标显示窗口
  tray.on('click', () => showMainWindow());
}
// 创建主窗口
function createWindow () {
  console.log('正在创建主窗口');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    title: APP_TITLE,
    icon: app.isPackaged
      ? path.join(process.resourcesPath, 'build/icons/app.ico')
      : path.join(__dirname, '../build/icons/app.ico'),
    frame: false, // 移除默认的菜单栏
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: true, // 生产禁用 DevTools
      spellcheck: false // 禁用拼写检查
    }
  })

  if (app.isPackaged) {
    // 生产环境：加载本地 dist 文件
    console.log('生产环境：加载本地 dist 文件');
    startTimer('load-dist-file');
    mainWindow.loadFile('./dist/index.html');
    mainWindow.show();
    endTimer('load-dist-file');
    // 确保窗口标题
    mainWindow.setTitle(APP_TITLE);
    // Windows：显式设置任务栏图标
    const winIconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'build/icons/app.ico')
      : path.join(__dirname, '../build/icons/app.ico');
    mainWindow.setIcon(nativeImage.createFromPath(winIconPath));
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
    // Windows：开发环境也设置任务栏图标
    const winIconPathDev = path.join(__dirname, '../build/icons/app.ico');
    mainWindow.setIcon(nativeImage.createFromPath(winIconPathDev));
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
      // 确保窗口标题被正确设置（Vite 开发模式可能会覆盖 title）
      mainWindow.setTitle(APP_TITLE);
    });

    mainWindow.loadURL(url).then(() => {
      console.log('Vite 开发服务器 URL 加载成功');
    }).catch((error) => {
      console.error('Vite 服务器连接失败:', error.message);
    });
  }

  // 通用：页面加载后强制设置窗口标题
  mainWindow.webContents.on('page-title-updated', (event) => {
    event.preventDefault();
  });
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

  // 监听窗口状态变化并通知渲染进程
  mainWindow.on('maximize', () => {
    console.log('窗口已最大化');
    mainWindow.webContents.send('window-state-changed', { isMaximized: true });
  });

  mainWindow.on('unmaximize', () => {
    console.log('窗口已取消最大化');
    mainWindow.webContents.send('window-state-changed', { isMaximized: false });
  });

  mainWindow.on('minimize', () => {
    console.log('窗口已最小化');
    mainWindow.webContents.send('window-state-changed', { isMinimized: true });
  });

  mainWindow.on('restore', () => {
    console.log('窗口已恢复');
    mainWindow.webContents.send('window-state-changed', { isMinimized: false });
  });
  console.log('主窗口创建完成');
  endTimer('app-ready-to-create-window');

  // 创建系统托盘
  createTray();
})

// 监听应用程序激活事件（在macOS上，当没有打开的窗口时，重新创建一个窗口）
app.on('activate', function () {
  console.log('应用程序被激活');
  showMainWindow();
})

// 监听窗口关闭事件 — 隐藏到托盘而不是退出
app.on('window-all-closed', function () {
  console.log('所有窗口已关闭，隐藏到托盘');
  // 不做任何操作，保持应用在托盘运行
})

// 应用退出前释放托盘资源
app.on('before-quit', function () {
  if (tray) {
    tray.destroy();
    tray = null;
  }
  if (db) {
    db.close();
  }
})
