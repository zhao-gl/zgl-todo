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
    // 获取数据库文件路径
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
        nickname TEXT NOT NULL,
        email TEXT,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
      )
    `);
    // 创建触发器
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_users_timestamp
      AFTER UPDATE ON tb_users
      BEGIN
        UPDATE tb_users SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
      END;
    `);
    // 创建 todos 表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tb_todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        tags TEXT,
        priority INTEGER DEFAULT 0,
        is_deleted BOOLEAN DEFAULT 0,
        is_collect BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES tb_users(id)
      )
    `);
    // 创建触发器，更新时自动修改 updated_at
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_todos_timestamp
      AFTER UPDATE ON tb_todos
      BEGIN
        UPDATE tb_todos SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
      END;
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
   * @param userId {number} 用户 ID
   * @returns {Record<string, SQLOutputValue>[]}
   */
  dbGetAllTodos(userId) {
    return this.db.prepare('SELECT * FROM tb_todos WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at DESC').all(userId);
  }

  /**
   * 添加待办事项
   * @param userId {number} 用户 ID
   * @param content {string} 待办内容
   * @param tags {null | string} 标签
   * @param priority {number} 优先级 (0-4)
   * @returns {StatementResultingChanges}
   */
  dbAddTodo(userId, content, tags = null, priority = 0) {
    return this.db.prepare(`
      INSERT INTO tb_todos (user_id, content, tags, priority)
      VALUES (?, ?, ?, ?)
    `).run(userId, content, tags, priority);
  }

  /**
   * 更新待办事项
   * @param id {number} 待办 ID
   * @param data {Object} 更新数据
   * @returns {StatementResultingChanges}
   */
  dbUpdateTodo(id, data) {
    const { content, completed, tags, priority } = data;
    return this.db.prepare(`
      UPDATE tb_todos
      SET content = ?,
          completed = ?,
          tags = ?,
          priority = ?
      WHERE id = ?
    `).run(content, completed, tags, priority, id);
  }

  /**
   * 软删除待办事项
   * @param id {number} 待办 ID
   * @returns {StatementResultingChanges}
   */
  dbDeleteTodo(id) {
    return this.db.prepare(`
      UPDATE tb_todos SET is_deleted = 1 WHERE id = ?
    `).run(id);
  }

  /**
   * 从回收站恢复待办事项
   * @param id {number} 待办 ID
   * @returns {StatementResultingChanges}
   */
  dbRestoreTodo(id) {
    return this.db.prepare(`
      UPDATE tb_todos SET is_deleted = 0 WHERE id = ?
    `).run(id);
  }

  /**
   * 获取回收站中的待办事项
   * @param userId {number} 用户 ID
   * @returns {Record<string, SQLOutputValue>[]}
   */
  dbGetDeletedTodos(userId) {
    return this.db.prepare('SELECT * FROM tb_todos WHERE user_id = ? AND is_deleted = 1 ORDER BY created_at DESC').all(userId);
  }

  /**
   * 获取收集箱中的待办事项
   * @param userId {number} 用户 ID
   * @returns {Record<string, SQLOutputValue>[]}
   */
  dbGetCollectTodos(userId) {
    return this.db.prepare('SELECT * FROM tb_todos WHERE user_id = ? AND is_collect = 1 AND is_deleted = 0 ORDER BY created_at DESC').all(userId);
  }

  /**
   * 切换收集箱状态
   * @param id {number} 待办 ID
   * @param isCollect {boolean} 是否收集
   * @returns {StatementResultingChanges}
   */
  dbToggleCollect(id, isCollect) {
    return this.db.prepare(`
      UPDATE tb_todos SET is_collect = ? WHERE id = ?
    `).run(isCollect ? 1 : 0, id);
  }

  /**
   * 根据优先级获取待办事项
   * @param userId {number} 用户 ID
   * @param priority {number} 优先级 (0-4)
   * @returns {Record<string, SQLOutputValue>[]}
   */
  dbGetTodosByPriority(userId, priority) {
    return this.db.prepare('SELECT * FROM tb_todos WHERE user_id = ? AND priority = ? AND is_deleted = 0 ORDER BY created_at DESC').all(userId, priority);
  }

  /**
   * 根据标签获取待办事项
   * @param userId {number} 用户 ID
   * @param tags {string} 标签
   * @returns {Record<string, SQLOutputValue>[]}
   */
  dbGetTodosByTag(userId, tags) {
    return this.db.prepare('SELECT * FROM tb_todos WHERE user_id = ? AND tags = ? AND is_deleted = 0 ORDER BY created_at DESC').all(userId, tags);
  }

  // ================== 用户操作 =================
  /**
   * 根据id获取用户信息
   * @param id {number}
   * @returns {Record<string, SQLOutputValue>}
   */
  dbGetUserById(id) {
    return this.db.prepare('SELECT * FROM tb_users WHERE id = ?').get(id);
  }

  /**
   * 根据username获取用户
   * @param username {string}
   * @returns {Record<string, SQLOutputValue>}
   */
  dbGetUserByUsername(username) {
    return this.db.prepare('SELECT * FROM tb_users WHERE username = ?').get(username);
  }

  /**
   * 注册用户
   * @param username {string} 用户名
   * @param nickname {string} 昵称
   * @param password {string} 密码
   * @returns {StatementResultingChanges}
   */
  dbAddUser(username, nickname, password) {
    return this.db.prepare(`INSERT INTO tb_users (username, nickname, password_hash) VALUES (?, ?, ?)`).run(username, nickname, password);
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
