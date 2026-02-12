const {ipcMain, BrowserWindow} = require("electron");
const TodoController = require('../db/controller/todo');
const UserController = require('../db/controller/user');
const todoController = new TodoController();
const userController = new UserController();
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
      // 根据方法名调用控制器中的对应方法
      switch (method) {
        case 'getAllTodos':
          return await todoController.getAllTodos();
        case 'addTodo':
          return await todoController.addTodo(...args);
        case 'getUser':
          return await userController.getUser(...args);
        case 'addUser':
            return await userController.addUser(...args);
        default:
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
