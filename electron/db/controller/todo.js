const SQLiteDatabase = require("../db");
const { responseTemplate } = require("../../utils");

class TodoController {
  constructor() {
    this.todoDao = SQLiteDatabase.getInstance();
  }

  // 获取所有待办事项
  getAllTodos() {
    this.todoDao.dbGetAllTodos();
    return this.todoDao.dbGetAllTodos();
  }

  // 添加待办事项
  addTodo(title) {
    return this.todoDao.dbAddTodo(title);
  }
}

module.exports = TodoController;
