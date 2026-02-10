const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const {setupIPC, setIpcEventListener } = require('./ipc/ipc');
const log = require('electron-log');
const { performance } = require('perf_hooks');
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
  log.info(`[PERF] 开始计时: ${name}`);
}
// 结束计时器
function endTimer(name) {
  const start = perfTimers.get(name);
  if (start) {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // 转换为毫秒
    log.info(`[PERF] ${name} 耗时: ${duration.toFixed(2)}ms`);
    perfTimers.delete(name);
  }
}

// 配置 electron-log
log.initialize();
// 自定义时间戳格式为绝对时间
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'
log.info('应用程序启动');
const isMac = process.platform === 'darwin';
// 创建主窗口
function createWindow () {
  log.info('正在创建主窗口');
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // 移除默认的菜单栏
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (app.isPackaged) {
    // 生产环境：加载本地 dist 文件
    log.info('生产环境：加载本地 dist 文件');
    startTimer('load-dist-file');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    log.info('窗口已显示');
    mainWindow.show();
    endTimer('load-dist-file');
  } else {
    // 开发环境：加载 Vite 开发服务器
    log.info('开发环境：加载 Vite 开发服务器');
    startTimer('load-vite-url');
    const url = 'http://127.0.0.1:3000';
    log.info('开始加载 Vite 开发服务器 URL');
    // 为了改善用户体验，立即显示窗口，而不是等待页面加载完成
    log.info('窗口已显示');
    mainWindow.show();

    // 监听页面加载事件
    mainWindow.webContents.on('did-start-loading', () => {
      startTimer('page-loading');
      log.info('[PERF] 页面开始加载');
    });

    mainWindow.webContents.on('did-stop-loading', () => {
      endTimer('page-loading');
      log.info('[PERF] 页面加载完成');
    });

    mainWindow.webContents.on('dom-ready', () => {
      endTimer('dom-ready');
      log.info('[PERF] DOM 准备就绪');
    });

    mainWindow.webContents.on('did-finish-load', () => {
      endTimer('finish-load');
      log.info('[PERF] 页面完全加载完成');
    });

    mainWindow.loadURL(url).then(() => {
      endTimer('load-vite-url');
      log.info('Vite 开发服务器 URL 加载成功');
    }).catch((error) => {
      endTimer('load-vite-url');
      log.error('Vite 服务器连接失败:', error.message);
      log.info("Vite 尚未就绪，等待重连...");
      setTimeout(() => {
        log.info('尝试重新连接到 Vite 服务器');
        mainWindow.loadURL(url)
      }, 2000);
    });
  }
}

// 应用程序就绪后,创建主窗口
app.whenReady().then(async () => {
  startTimer('app-ready-to-create-window');
  log.info('Electron 应用程序已就绪');

  // ===================== IPC =====================
  log.info('开始设置 IPC 事件监听器');
  // setupIPC();
  setIpcEventListener();
  log.info('IPC 事件监听器已设置');

  // ===================== WINDOW =====================
  log.info('开始创建主窗口');
  createWindow();
  log.info('主窗口创建完成');
  endTimer('app-ready-to-create-window');

  // 输出性能测量结果
  setInterval(() => {
    const measures = performance.getEntriesByType('measure');
    measures.forEach(measure => {
      log.info(`[PERFORMANCE] ${measure.name}: ${measure.duration}ms`);
    });
  }, 1000);
})

// 监听应用程序激活事件（在macOS上，当没有打开的窗口时，重新创建一个窗口）
app.on('activate', function () {
  log.info('应用程序被激活');
  if (BrowserWindow.getAllWindows().length === 0) {
    log.info('没有打开的窗口，创建新窗口');
    createWindow()
  }
})

// 监听窗口全部关闭事件（在非macOS平台上退出应用程序）
app.on('window-all-closed', function () {
  log.info('所有窗口已关闭');
  if (process.platform !== 'darwin') {
    log.info('非 macOS 平台，退出应用程序');
    app.quit()
  }
})
