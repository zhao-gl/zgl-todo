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

    const {app} = require('electron');
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
    // 创建 tb_users 表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tb_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
      )
    `);
    // 创建 users 表触发器
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_users_timestamp
      AFTER UPDATE ON tb_users
      BEGIN
        UPDATE tb_users SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
      END;
    `);
    // 创建 tb_todos 表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tb_todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tid TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        'desc' TEXT,
        done INTEGER DEFAULT 0,
        type_id INTEGER,
        type_color TEXT,
        tags TEXT,
        sort INTEGER DEFAULT 0,
        priority INTEGER,
        is_deleted INTEGER DEFAULT 0,
        belong_day TEXT,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
        deleted_at DATETIME,
        destroy_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES tb_users (id)
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
    // 创建 tb_types 表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tb_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo_ids TEXT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
      )
    `);
    // 创建触发器，更新时自动修改 updated_at
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_types_timestamp
      AFTER UPDATE ON tb_types
      BEGIN
        UPDATE tb_types SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
      END;
    `);
    // 创建 tb_settings 表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tb_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        settings TEXT NOT NULL DEFAULT '{}',
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES tb_users (id)
      )
    `);
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_settings_timestamp
      AFTER UPDATE ON tb_settings
      BEGIN
        UPDATE tb_settings SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
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

  // 待办操作
  todo = {
    /**
     * 新增待办事项
     * @param userId {number} 用户 ID
     * @param tid {string} 待办id
     * @param content {string} 待办内容
     * @param belongDay
     * @param type_id {number} 类别
     * @returns {StatementResultingChanges}
     */
    dbAddTodo: (userId, tid, content, belongDay, type_id) => {
      return this.db.prepare(`
        INSERT INTO tb_todos (user_id, tid, content, belong_day, type_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, tid, content, belongDay, type_id);
    },

    /**
     * 更新待办事项（支持部分字段更新）
     * @param {Object} params - 必须包含 id，其他字段可选
     * @returns {StatementResultingChanges}
     */
    dbUpdateTodo: (params) => {
      const {id, ...updateFields} = params;
      // 1. 过滤掉 undefined / null（根据业务决定是否允许设为 null）
      const validFields = Object.fromEntries(
        Object.entries(updateFields).filter(([_, value]) => value !== undefined)
      );
      // 2. 如果没有要更新的字段，直接返回
      if (Object.keys(validFields).length === 0) {
        return {changes: 0};
      }
      // 3. 构建 SET 子句
      const setClause = Object.keys(validFields)
        .map(field => `${field} = ?`)
        .join(', ');
      // 4. 准备参数数组（顺序与 SET 子句一致）
      const values = [...Object.values(validFields), id];
      // 5. 执行动态 SQL
      const sql = `
        UPDATE tb_todos
        SET ${setClause},
            updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `;
      return this.db.prepare(sql).run(...values);
    },

    /**
     * 根据日期获取待办
     * @param {number} userId - 用户 ID
     * @param {string} belongDay - 日期（格式：YYYY-MM-DD）
     * @param {number} sortType - 排序类型：1=创建时间倒序，2=优先级排序，3=自定义排序
     * @returns {Record<string, SQLOutputValue>[]}
     */
    dbTodosByDate: ({userId, belongDay, sortType}) => {
      // 定义合法的排序选项（防止 SQL 注入）
      const sortOptions = {
        1: 'created_at DESC',
        2: 'priority ASC, created_at DESC', // 假设 priority 字段存在，值越小优先级越高
        3: 'sort ASC, created_at DESC'       // 自定义排序字段 `sort`
      };
      // 验证 sortType 是否合法
      if (!sortOptions.hasOwnProperty(sortType)) {
        throw new Error(`Invalid sortType: ${sortType}. Expected 1, 2, or 3.`);
      }
      const orderByClause = sortOptions[sortType];
      const sql = `
      SELECT * FROM tb_todos
        WHERE user_id = ?
          AND belong_day = ?
          AND is_deleted = 0
        ORDER BY ${orderByClause}
      `;
      return this.db.prepare(sql).all(userId, belongDay);
    },

    /**
     * 更新 sort 排序
     * @param {Array} todos - 待办事项列表
     * @returns {StatementResultingChanges}
     */
    batchUpdateSort: (todos) => {
      let stmt = this.db.prepare(`
        UPDATE tb_todos
        SET sort = ?,
            updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `);

      const transaction = this.db.transaction((items) => {
        for (const { id, sort } of items) {
          stmt.run(sort, id);
        }
      });

      transaction(todos);
    },

    /**
     * 根据是否完成筛选待办事项
     * @param userId {number} 用户 ID
     * @param done {number} 是否完成
     * @returns {Record<string, SQLOutputValue>[]}
     */
    dbTodosByDone: (userId, done) => {
      if (done !== 0 && done !== 1) {
        throw new Error('done must be 0 or 1');
      }
      const stmt = this.db.prepare(`
        SELECT * FROM tb_todos
        WHERE user_id = ?
          AND done = ?
          AND is_deleted = 0
        ORDER BY created_at DESC
      `);
      // @ts-ignore
      return stmt.all([userId, done]);
    },

    /**
     * 软删除待办事项
     * @param tid {number} 待办 ID
     * @returns {StatementResultingChanges}
     */
    dbDeleteTodo: (tid) => {
      return this.db.prepare(`
        UPDATE tb_todos
        SET is_deleted = 1,
            deleted_at = datetime('now', 'localtime'),
            destroy_at = datetime('now', 'localtime', '+30 days')
        WHERE tid = ?
      `).run(tid);
    },

    /**
     * 获取收集箱中的待办事项
     * @param userId {number} 用户 ID
     * @returns {Record<string, SQLOutputValue>[]}
     */
    dbGetCollectTodos: ({userId}) => {
      return this.db.prepare(`
        SELECT * FROM tb_todos
        WHERE user_id = ?
        AND (belong_day IS NULL OR belong_day = '')
        AND is_deleted = 0
        ORDER BY created_at DESC
      `).all(userId);
    },

    /**
     * 添加到收集箱(清空belong_day)
     * @param id {number} 待办 ID
     * @returns {StatementResultingChanges}
     */
    dbDropToCollectBox: ({id}) => {
      return this.db.prepare(`
        UPDATE tb_todos
        SET belong_day = NULL
        WHERE id = ?
      `).run(id);
    },

    /**
     * 移出收集箱到指定日期
     * @param {Object} params - 参数对象
     * @param {number} params.id - 待办 ID
     * @param {string} params.belongDay - 目标日期（格式：YYYY-MM-DD）
     * @returns {StatementResultingChanges}
     */
    dbRemoveFromCollectBox: ({id, belongDay}) => {
      return this.db.prepare(`
        UPDATE tb_todos
        SET belong_day = ?,
            updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(belongDay, id);
    },

    /**
     * 根据类型 ID 获取待办事项列表
     * @param {number} userId - 用户 ID
     * @param {number} typeId - 类型 ID
     * @param {number} sortType - 排序类型：1=创建时间倒序，2=优先级排序，3=自定义排序
     * @returns {Record<string, SQLOutputValue>[]}
     */
    dbTodosByTypeId: ({userId, typeId, sortType = 1}) => {
      // 定义合法的排序选项（防止 SQL 注入）
      const sortOptions = {
        1: 'created_at DESC',
        2: 'priority ASC, created_at DESC',
        3: 'sort ASC, created_at DESC'
      };
      // 验证 sortType 是否合法
      if (!sortOptions.hasOwnProperty(sortType)) {
        throw new Error(`Invalid sortType: ${sortType}. Expected 1, 2, or 3.`);
      }
      const orderByClause = sortOptions[sortType];
      const sql = `        SELECT * FROM tb_todos
        WHERE user_id = ?
          AND type_id = ?
          AND is_deleted = 0
        ORDER BY ${orderByClause}      `;
      return this.db.prepare(sql).all(userId, typeId);
    },

    /**
     * 获取回收站中的待办事项
     * @param userId {number} 用户 ID
     * @returns {Record<string, SQLOutputValue>[]}
     */
    dbGetDeletedTodos: ({userId}) => {
      return this.db.prepare(`
        SELECT * FROM tb_todos
        WHERE user_id = ?
        AND is_deleted = 1
        ORDER BY created_at DESC
      `).all(userId);
    },

    /**
     * 从回收站恢复待办事项
     * @param id {number} 待办 ID
     * @returns {StatementResultingChanges}
     */
    dbRestoreTodo: ({id}) => {
      return this.db.prepare(`
        UPDATE tb_todos
        SET is_deleted = 0
        WHERE id = ?
      `).run(id);
    },

    /**
     * 按月查询待办事项（用于月视图日历）
     * @param {number} userId - 用户 ID
     * @param {string} yearMonth - 年月（格式：YYYY-MM）
     * @returns {Record<string, SQLOutputValue>[]}
     */
    dbTodosByMonth: ({userId, yearMonth}) => {
      return this.db.prepare(`
        SELECT * FROM tb_todos
        WHERE user_id = ?
          AND belong_day LIKE ?
          AND is_deleted = 0
        ORDER BY belong_day ASC, priority ASC, created_at ASC
      `).all(userId, `${yearMonth}%`);
    }
  }

  // 用户操作
  user = {
    /**
     * 根据id获取用户信息
     * @param id {number}
     * @returns {Record<string, SQLOutputValue>}
     */
    dbGetUserById: (id) => {
      return this.db.prepare('SELECT * FROM tb_users WHERE id = ?').get(id);
    },

    /**
     * 根据username获取用户
     * @param username {string}
     * @returns {Record<string, SQLOutputValue>}
     */
    dbGetUserByUsername: (username) => {
      return this.db.prepare('SELECT * FROM tb_users WHERE username = ?').get(username);
    },

    /**
     * 注册用户
     * @param username {string} 用户名
     * @param password {string} 密码
     * @returns {StatementResultingChanges}
     */
    dbAddUser: (username, password) => {
      return this.db.prepare(`
      INSERT INTO tb_users (username, password_hash)
      VALUES (?, ?)`
      ).run(username, password);
    },

    /**
     * 更新用户信息
     * @param id {number} 用户id
     * @param username {string} 用户名
     * @param password {string} 新密码
     * @returns {StatementResultingChanges}
     */
    dbUpdateUser: (id, username, password) => {
      if (password) {
        return this.db.prepare(`
          UPDATE tb_users
          SET username      = ?,
              password_hash = ?
          WHERE id = ?`
        ).run(username, password, id);
      }
      return this.db.prepare(`
        UPDATE tb_users
        SET username = ?
        WHERE id = ?`
      ).run(username, id);
    },

    /**
     * 删除用户
     * @param id {number} 用户id
     * @returns {StatementResultingChanges}
     */
    dbDeleteUser: (id) => {
      return this.db.prepare(`
        DELETE
        FROM tb_users
        WHERE id = ?`
      ).run(id);
    },

    /**
     * 登录
     * @param username {string} 用户名
     * @returns {Record<string, SQLOutputValue> | null}
     */
    dbLogin: (username) => {
      return this.db.prepare(`
      SELECT *
      FROM tb_users
      WHERE username = ?`
      ).get(username);
    }
  }

  // 类型操作
  type = {
    /**
     * 新增类型
     * @param name
     * @param color
     */
    dbAddType: ({name, color}) => {
      return this.db.prepare(`
        INSERT INTO tb_types (name, color)
        VALUES (?, ?)
      `).run(name, color);
    },

    /**
     * 删除类型
     * @param id
     * @returns {*}
     */
    dbDeleteType: (id) => {
      return this.db.prepare(`
        DELETE
        FROM tb_types
        WHERE id = ?`
      ).run(id);
    },

    /**
     * 更新类型
     * @param id
     * @param name
     * @param color
     * @returns {*}
     */
    dbUpdateType: ({id, name, color}) => {
      return this.db.prepare(`
        UPDATE tb_types
        SET name = ?,
            color = ?
        WHERE id = ?`
      ).run(name, color, id);
    },

    /**
     * 查询所有类型
     * @returns {*}
     */
    dbGetAllTypes: () => {
      return this.db.prepare('SELECT * FROM tb_types').all();
    }
  }

  // 设置操作
  setting = {
    /**
     * 获取用户设置
     * @param {number} userId
     * @returns {Record<string, any> | null}
     */
    dbGetSettings: (userId) => {
      const row = this.db.prepare(`
        SELECT settings FROM tb_settings WHERE user_id = ?
      `).get(userId);
      return row ? JSON.parse(row.settings) : null;
    },

    /**
     * 保存/覆盖用户设置
     * @param {number} userId
     * @param {Record<string, any>} settingsObj
     * @returns {StatementResultingChanges}
     */
    dbSaveSettings: (userId, settingsObj) => {
      const settingsStr = JSON.stringify(settingsObj);
      const existing = this.db.prepare(`
        SELECT id FROM tb_settings WHERE user_id = ?
      `).get(userId);
      if (existing) {
        return this.db.prepare(`
          UPDATE tb_settings SET settings = ? WHERE user_id = ?
        `).run(settingsStr, userId);
      } else {
        return this.db.prepare(`
          INSERT INTO tb_settings (user_id, settings) VALUES (?, ?)
        `).run(userId, settingsStr);
      }
    },

    /**
     * 更新用户设置的某个字段（局部更新）
     * @param {number} userId
     * @param {string} key - 设置键名
     * @param {any} value - 设置值
     * @returns {StatementResultingChanges}
     */
    dbUpdateSetting: (userId, key, value) => {
      const row = this.db.prepare(`
        SELECT settings FROM tb_settings WHERE user_id = ?
      `).get(userId);
      let settings = row ? JSON.parse(row.settings) : {};
      settings[key] = value;
      const settingsStr = JSON.stringify(settings);
      if (row) {
        return this.db.prepare(`
          UPDATE tb_settings SET settings = ? WHERE user_id = ?
        `).run(settingsStr, userId);
      } else {
        return this.db.prepare(`
          INSERT INTO tb_settings (user_id, settings) VALUES (?, ?)
        `).run(userId, settingsStr);
      }
    }
  }
}

module.exports = SQLiteDatabase
