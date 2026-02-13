// src/database.js
let dbInstance = null;

class SQLiteDatabase {
  static getInstance() {
    if (!dbInstance) {
      dbInstance = new SQLiteDatabase();
    }
    return dbInstance;
  }

  constructor() {
    // 确保只在 Electron 主进程中初始化
    if (typeof process === 'undefined' || process.type !== 'browser') {
      throw new Error('Database can only be used in Electron main process');
    }

    const { app } = require('electron');
    const Database = require('better-sqlite3');
    const path = require('path');

    const dbPath = path.join(app.getPath('userData'), 'zgl-todo.db');
    this.db = new Database(dbPath);
    this.init();
  }

  /**
   * 初始化数据库
   */
  init() {
    // 创建 users 表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tb_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // 创建 todos 表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tb_todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close();
    }
  }
  // ================== 待办操作 =================
  /**
   * 获取所有待办事项
   * @returns {Record<string, SQLOutputValue>[]}
   */
  dbGetAllTodos() {
    return this.db.prepare('SELECT * FROM tb_todos ORDER BY created_at DESC').all();
  }

  /**
   * 添加待办事项
   * @param title
   * @returns {StatementResultingChanges}
   */
  dbAddTodo(title) {
    return this.db.prepare('INSERT INTO tb_todos (title) VALUES (?)').run(title);
  }

  // ================== 用户操作 =================
  /**
   * 根据id获取用户
   * @param id
   * @returns {Record<string, SQLOutputValue>}
   */
  dbGetUserById(id) {
    return this.db.prepare('SELECT * FROM tb_users WHERE id = ?').get(id);
  }

  /**
   * 根据username获取用户
   * @param username
   * @returns {Record<string, SQLOutputValue>}
   */
  dbGetUserByUsername(username) {
    return this.db.prepare('SELECT * FROM tb_users WHERE username = ?').get(username);
  }

  /**
   * 获取所有用户
   * @returns {Record<string, SQLOutputValue>[]}
   */
  dbGetAllUsers() {
    return this.db.prepare('SELECT * FROM tb_users').all();
  }

  /**
   * 添加用户
   * @param username {string} 用户名
   * @param password {string} 密码
   * @returns {StatementResultingChanges}
   */
  dbAddUser(username, password) {
    return this.db.prepare(`INSERT INTO tb_users (username, password_hash) VALUES (?, ?)`).run(username, password);
  }

  /**
   * 更新用户密码
   * @param id {number} 用户id
   * @param password {string} 新密码
   * @returns {StatementResultingChanges}
   */
  dbUpdateUserPassword(id, password) {
    return this.db.prepare(`UPDATE tb_users SET password_hash = ? WHERE id = ?`).run(password, id);
  }

  /**
   * 删除用户
   * @param id {number} 用户id
   * @returns {StatementResultingChanges}
   */
  dbDeleteUser(id) {
    return this.db.prepare(`DELETE FROM tb_users WHERE id = ?`).run(id);
  }

  /**
   * 登录
   * @param username {string} 用户名
   * @param password {string} 密码
   * @returns {Record<string, SQLOutputValue> | null}
   */
  dbLogin(username, password) {
    return this.db.prepare(`SELECT * FROM tb_users WHERE username = ?`).get(username);
  }
}

module.exports = SQLiteDatabase;
