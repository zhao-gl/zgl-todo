const { ipcMain, BrowserWindow } = require("electron");
const TodoController = require('../db/controller/todo');
const UserController = require('../db/controller/user');

// 初始化控制器
const controllers = {
  todo: new TodoController(),
  user: new UserController(),
};

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

  // 监听-获取窗口状态
  ipcMain.handle('get-window-state', (event) => {
    const win = getWindowFromEvent(event);
    if (win) {
      return {
        isMaximized: win.isMaximized(),
        isMinimized: win.isMinimized(),
        isVisible: win.isVisible()
      };
    }
    return null;
  });

  // 监听-获取数据库版本
  ipcMain.handle('db-query', async (event, method, ...args) => {
    try {
      // 解析方法名格式: "controllerName.methodName"
      const [controllerName, methodName] = method.split('.');
      if (!controllerName || !methodName) {
        throw new Error('方法名格式错误，应为 "controller.method"');
      }
      const controller = controllers[controllerName];
      if (!controller) {
        throw new Error(`未找到控制器: ${controllerName}`);
      }
      if (typeof controller[methodName] !== 'function') {
        throw new Error(`控制器 ${controllerName} 中未找到方法: ${methodName}`);
      }
      // ✅ 调用对应方法，传入所有参数
      return await controller[methodName](...args);
    } catch (error) {
      console.error('❌ db-query 执行失败:', error.message);
      return {
        success: false,
        error: error.message,
        method,
        args // 用于调试
      };
    }
  });
}

// 获取发送事件的窗口实例
function getWindowFromEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

module.exports = {
  setIpcEventListener
}
