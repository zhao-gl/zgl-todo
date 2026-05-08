const SQLiteDatabase = require("../db");

class SettingsController {
  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  // 获取用户完整设置
  getSettings(userId) {
    return this.db.setting.dbGetSettings(userId);
  }

  // 保存/覆盖用户设置
  saveSettings(userId, settingsObj) {
    return this.db.setting.dbSaveSettings(userId, settingsObj);
  }

  // 更新单条设置项
  updateSetting(userId, key, value) {
    return this.db.setting.dbUpdateSetting(userId, key, value);
  }
}

module.exports = SettingsController;
