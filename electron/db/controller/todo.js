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

  // 获取所有待办事项
  getTodosByDone({userId, done}) {
    return this.todoDao.dbTodosByDone(userId, done)
  }
}

module.exports = TodoController;
