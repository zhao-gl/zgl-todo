const SQLiteDatabase = require("../db");
const { responseTemplate } = require("../../utils");
const crypto = require("crypto");

class UserController {
  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  // 根据id获取用户
  getUserById(id) {
    return this.db.dbGetUserById(id);
  }

  // 根据username获取用户
  getUserByUsername(username) {
    return this.db.dbGetUserByUsername(username);
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
    // 空值校验
    if (!username || !password) {
      return '用户名和密码不能为空!';
    }
    // 校验用户名是否已存在
    const existingUser = this.db.dbGetUserByUsername(username);
    if (existingUser) {
      return '用户名已存在!';
    }
    const passwordHash = require('crypto').createHash('sha256').update(password).digest('hex');
    return this.db.dbAddUser(username, passwordHash);
  }

  // 修改用户密码
  uploadUserPassword(id, password) {
    return this.db.dbUpdateUserPassword(id, password);
  }

  // 删除用户
  deleteUser(id) {
    return this.db.dbDeleteUser(id);
  }

  // 登录
  login(username, password) {
    const user = this.db.dbLogin(username, password);
    if (user) {
      // 对输入的密码进行相同的哈希处理
      const crypto = require('crypto');
      const inputPasswordHash = crypto.createHash('sha256').update(password).digest('hex');
      // 比较哈希值
      if (user.password_hash !== inputPasswordHash) {
        return 401;
      }
    }else{
      return null;
    }
    return user;
  }
}

module.exports = UserController;
