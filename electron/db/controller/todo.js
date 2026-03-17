const SQLiteDatabase = require("../db");
const { generateId } = require("../../utils");

class TodoController {
  constructor() {
    this.todoDao = SQLiteDatabase.getInstance();
  }

  // 添加待办事项
  addTodo({userId, content, belongDay, type}) {
    const tid = generateId();
    return this.todoDao.dbAddTodo(userId, tid, content, belongDay, type);
  }

  // 删除待办事项
  deleteTodo(id) {
    return this.todoDao.dbDeleteTodo(id);
  }

  // 更新待办事项
  updateTodo(params) {
    return this.todoDao.dbUpdateTodo(params);
  }

  // 根据日期获取待办
  getTodosByDate(params) {
    return this.todoDao.dbTodosByDate(params);
  }

  // 根据 sort 排序
  getTodosBySort(params) {
    return this.todoDao.dbTodosBySort(params);
  }
  // 更新 sort 排序
  batchUpdateTodosSort(params) {
    return this.todoDao.batchUpdateSort(params);
  }

  // 获取所有待办事项
  getTodosByDone({userId, done}) {
    return this.todoDao.dbTodosByDone(userId, done)
  }
}

module.exports = TodoController;
