const {ipcMain, BrowserWindow} = require("electron");
const {query} = require("../db/db");

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

  // 监听-获取数据库版本
  ipcMain.handle('db-get-version', () => {
    // return query('SELECT * FROM sqlite_master WHERE type="table" AND name="version"');
    // return initDB();
  });
}

// 获取发送事件的窗口实例
function getWindowFromEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

module.exports = {
  setIpcEventListener
}
