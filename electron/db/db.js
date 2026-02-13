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
        nickname TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
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
  dbGetUser(id) {
    return this.db.prepare('SELECT * FROM tb_users WHERE id = ?').get(id);
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
   * @param username
   * @param password
   * @returns {StatementResultingChanges}
   */
  dbAddUser(username, password) {
    const passwordHash = require('crypto').createHash('sha256').update(password).digest('hex');
    return this.db.prepare(`INSERT INTO tb_users (username, password_hash) VALUES (?, ?)`).run(username, passwordHash);
  }


}

module.exports = SQLiteDatabase;
