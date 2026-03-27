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

  // 获取列表 并按条件排序 1=创建时间倒序，2=优先级排序，3=自定义排序
  getTodosByDate(params) {
    return this.db.todo.dbTodosByDate(params);
  }

  // 更新 sort 排序
  batchUpdateTodosSort(params) {
    return this.db.todo.batchUpdateSort(params);
  }

  // 查询所有收集箱的待办
  getCollectTodos(params) {
    return this.db.todo.dbGetCollectTodos(params)
  }

  // 添加到收集箱(清空belong_day)
  dropToCollectBox(params) {
    return this.db.todo.dbDropToCollectBox(params)
  }

  // 移出收集箱
  removeFromCollectBox(params) {
    return this.db.todo.dbRemoveFromCollectBox(params)
  }

  // 查询所有已删除的待办
  getDeletedTodos(params) {
    return this.db.todo.dbGetDeletedTodos(params)
  }

  // 从回收站恢复待办
  restoreTodo(params) {
    return this.db.todo.dbRestoreTodo(params)
  }
}


module.exports = TodoController;
