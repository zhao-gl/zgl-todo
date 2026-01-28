const {ipcMain, BrowserWindow} = require("electron");
const {initDB, query} = require("../db/db");

// 设置 IPC 处理函数
function setupIPC() {
  ipcMain.handle('db-query', async (event, sql, params = []) => {
    try {
      initDB(); // 确保数据库已打开
      return query(sql, params);
    } catch (err) {
      console.error('Database error:', err.message);
      throw err;
    }
  });
}

// 设置ipc事件监听器
function setIpcEventListener() {
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
}

// 获取发送事件的窗口实例
function getWindowFromEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

module.exports = {
  setupIPC,
  setIpcEventListener
}
