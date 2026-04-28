import * as SQLite from 'expo-sqlite';

const DB_NAME = 'tb_data.db';

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * 取得（或建立）共用的資料庫連線實例。
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync(DB_NAME);
  }
  return _db;
}

/**
 * 初始化資料庫：若 logs 資料表不存在則建立。
 * 可重複呼叫（使用 CREATE TABLE IF NOT EXISTS）。
 */
export function initDb(): void {
  try {
    const db = getDb();

    db.execSync(`
      CREATE TABLE IF NOT EXISTS logs (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        record_date     TEXT    NOT NULL,
        location        TEXT    NOT NULL,
        machine_no      TEXT    NOT NULL,
        lift_system     TEXT,
        lift_software   TEXT,
        vfd_model       TEXT,
        vfd_software    TEXT,
        motor_model     TEXT,
        fault_code      TEXT,
        remark          TEXT,
        created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TRIGGER IF NOT EXISTS logs_updated_at
        AFTER UPDATE ON logs
        FOR EACH ROW
      BEGIN
        UPDATE logs SET updated_at = datetime('now') WHERE id = OLD.id;
      END;
    `);

    // Migration：若 deleted_at 欄位不存在則補上（支援舊有資料庫不報錯）
    type PragmaRow = { name: string };
    const columns = db.getAllSync<PragmaRow>('PRAGMA table_info(logs)');
    const hasDeletedAt = columns.some((col) => col.name === 'deleted_at');
    if (!hasDeletedAt) {
      db.execSync('ALTER TABLE logs ADD COLUMN deleted_at TEXT');
      console.log('[DB] ✅ 已新增 deleted_at 欄位（migration）');
    }

    console.log('[DB] ✅ 資料庫初始化成功（logs 資料表已就緒）');
  } catch (error) {
    console.error('[DB] ❌ 資料庫初始化失敗：', error);
    throw error;
  }
}
