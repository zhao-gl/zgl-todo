const { app } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

// 数据库存储路径（推荐放在 userData 目录）
// const dbPath = path.join(app.getPath('userData'), 'app.db');
let db;
function initDB() {
  if (!db) {
    const Database = require('better-sqlite3'); // 延迟 require
    const dbPath = path.join(app.getPath('userData'), 'app.db');
    db = new Database(dbPath);
    console.log('Database opened:', dbPath);

    // 初始化表
    db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0
      )
    `);
  }
  return db;
}

// 查询数据
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    return stmt.all(params);
  } else {
    const result = stmt.run(params);
    return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
  }
}

module.exports = {
  db,
  initDB,
  query
}
