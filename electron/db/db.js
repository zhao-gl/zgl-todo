// const { app } = require('electron');
// const Database = require('better-sqlite3');
// const path = require('path');
//
// // 数据库存储路径（推荐放在 userData 目录）
// // const dbPath = path.join(app.getPath('userData'), 'app.db');
// let db;
// let initPromise = null;
//
// async function initDB() {
//   if (!db && !initPromise) {
//     initPromise = _initializeDatabase();
//   }
//   await initPromise;
//   return db;
// }
//
// async function _initializeDatabase() {
//   const dbPath = path.join(app.getPath('userData'), 'app.db');
//   db = new Database(dbPath);
//
//   // 异步执行表初始化（虽然 better-sqlite3 是同步的）
//   db.exec(`    CREATE TABLE IF NOT EXISTS todos (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       title TEXT NOT NULL,
//       completed BOOLEAN DEFAULT 0
//     )
//   `);
//
//   return db;
// }
//
// // 查询数据
// function query(sql, params = []) {
//   const stmt = db.prepare(sql);
//   if (sql.trim().toUpperCase().startsWith('SELECT')) {
//     return stmt.all(params);
//   } else {
//     const result = stmt.run(params);
//     return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
//   }
// }
//
// module.exports = {
//   db,
//   initDB,
//   query
// }
