const SQLiteDatabase = require("../db");
const {responseTemplate} = require("../../utils");

class UserController {
  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  // 获取用户
  getUser(id) {
    return responseTemplate(this.db.dbGetUser(id));
  }

  /**
   * 添加新用户
   * @param username 用户名
   * @param password 密码
   * @returns {*}
   */
  addUser(username, password) {
    return responseTemplate(this.db.dbAddUser(username, password));
  }
}

module.exports = UserController;
