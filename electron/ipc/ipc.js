const {ipcMain, BrowserWindow} = require("electron");
const TodoController = require('../db/controller/todo');
const UserController = require('../db/controller/user');
const todoController = new TodoController();
const userController = new UserController();

const methodMap = {
  getAllTodos: () => todoController.getAllTodos(),
  addTodo: (...args) => todoController.addTodo(...args),
  getUser: (...args) => userController.getUser(...args),
  getAllUsers: (...args) => userController.getAllUsers(...args),
  addUser: (...args) => userController.addUser(...args),
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

  // 监听-获取数据库版本
  ipcMain.handle('db-query', async (event, method, ...args) => {
    try {
      // 动态调用方法
      if (methodMap[method]) {
        return await methodMap[method](...args);
      } else {
        throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error; // 将错误抛回渲染进程
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
