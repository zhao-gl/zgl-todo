const SQLiteDatabase = require("../db");

class TypeController {
  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  // 添加类型
  addType(params) {
    return this.db.type.dbAddType(params);
  }

  // 删除类型
  deleteType(id) {
    return this.db.type.dbDeleteType(id);
  }

  // 修改类型
  updateType(params) {
    return this.db.type.dbUpdateType(params);
  }

  // 根据用户ID查询类型
  getTypesByUserId(userId) {
    return this.db.type.dbGetTypesByUserId(userId);
  }
}

module.exports = TypeController;
