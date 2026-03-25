const SQLiteDatabase = require("../db");
const { generateId } = require("../../utils");

class TodoController {
  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  // 添加待办事项
  addTodo({userId, content, belongDay, type_id}) {
    const tid = generateId();
    return this.db.todo.dbAddTodo(userId, tid, content, belongDay, type_id);
  }

  // 删除待办事项
  deleteTodo(tid) {
    return this.db.todo.dbDeleteTodo(tid);
  }

  // 更新待办事项
  updateTodo(params) {
    return this.db.todo.dbUpdateTodo(params);
  }

  // 根据日期获取待办
  getTodosByDate(params) {
    return this.db.todo.dbTodosByDate(params);
  }

  // 根据 sort 排序
  getTodosBySort(params) {
    return this.db.todo.dbTodosBySort(params);
  }
  // 更新 sort 排序
  batchUpdateTodosSort(params) {
    return this.db.todo.batchUpdateSort(params);
  }

  // 获取所有待办事项
  getTodosByDone({userId, done}) {
    return this.db.todo.dbTodosByDone(userId, done)
  }
}

module.exports = TodoController;
