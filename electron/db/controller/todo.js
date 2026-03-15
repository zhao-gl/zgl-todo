const SQLiteDatabase = require("../db");
const { responseTemplate } = require("../../utils");

class TodoController {
  constructor() {
    this.todoDao = SQLiteDatabase.getInstance();
  }

  // 添加待办事项
  addTodo({userId, content, type}) {
    return this.todoDao.dbAddTodo(userId, content, type);
  }

  // 更新待办事项
  updateTodo(params) {
    return this.todoDao.dbUpdateTodo(params);
  }

  // 删除待办事项
  deleteTodo(id) {
    return this.todoDao.dbDeleteTodo(id);
  }

  // 根据日期获取待办事项
  getTodosByDate(params) {
    return this.todoDao.dbGetTodosByDate(params);
  }

  // 获取所有待办事项
  getTodosByDone({userId, done}) {
    return this.todoDao.dbTodosByDone(userId, done)
  }
}

module.exports = TodoController;
