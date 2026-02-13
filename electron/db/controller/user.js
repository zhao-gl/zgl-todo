const SQLiteDatabase = require("../db");
const {responseTemplate} = require("../../utils");

class UserController {
  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  // 根据id获取用户
  getUser(id) {
    return this.db.dbGetUser(id);
  }

  // 获取所有用户
  getAllUsers() {
    return this.db.dbGetAllUsers();
  }

  /**
   * 添加新用户
   * @param username 用户名
   * @param password 密码
   * @returns {*}
   */
  addUser(username, password) {
    return this.db.dbAddUser(username, password);
  }
}

module.exports = UserController;
