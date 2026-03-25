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

  // 查询所有类型
  getAllTypes() {
    return this.db.type.dbGetAllTypes();
  }
}

module.exports = TypeController;
