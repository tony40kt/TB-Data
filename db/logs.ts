/**
 * db/logs.ts
 *
 * logs 資料表的 CRUD 操作（新增 / 查詢）。
 * 欄位命名與 db/init.ts 及 db/schema.ts 一致。
 */

import { getDb } from './init';

/**
 * 新增日誌所需的輸入型別。
 * 必填：record_date、location、machine_no；其餘欄位可省略（允許空值）。
 */
export interface NewLogInput {
  /** 記錄日期，格式 YYYY-MM-DD（必填） */
  record_date: string;
  /** 工作地點（必填） */
  location: string;
  /** 機號，僅英文字母與數字（必填） */
  machine_no: string;
  /** 升降機系統（選填） */
  lift_system?: string;
  /** 升降機軟件（選填） */
  lift_software?: string;
  /** 變頻型號（選填） */
  vfd_model?: string;
  /** 變頻軟件（選填） */
  vfd_software?: string;
  /** 摩打型號（選填） */
  motor_model?: string;
  /** 故障碼（選填） */
  fault_code?: string;
  /** 備註（選填） */
  remark?: string;
}

/**
 * 新增一筆日誌到 SQLite，回傳插入的 rowId（即 id）。
 * 使用參數化查詢避免 SQL injection。
 *
 * @param input - 新增日誌的輸入資料
 * @returns 插入的 rowId（INTEGER）
 * @throws 若資料庫操作失敗，拋出錯誤
 */
export function insertLog(input: NewLogInput): number {
  try {
    const db = getDb();
    const result = db.runSync(
      `INSERT INTO logs (
        record_date, location, machine_no,
        lift_system, lift_software,
        vfd_model, vfd_software,
        motor_model, fault_code, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.record_date,
        input.location,
        input.machine_no,
        input.lift_system ?? null,
        input.lift_software ?? null,
        input.vfd_model ?? null,
        input.vfd_software ?? null,
        input.motor_model ?? null,
        input.fault_code ?? null,
        input.remark ?? null,
      ],
    );
    console.log(`[DB] ✅ 已新增 1 筆日誌，rowId = ${result.lastInsertRowId}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[DB] ❌ 新增日誌失敗：', error);
    throw error;
  }
}

/**
 * logs 資料表的完整列型別（含系統欄位）。
 * 與 db/init.ts 的 CREATE TABLE 一致。
 */
export interface LogRow {
  id: number;
  record_date: string;
  location: string;
  machine_no: string;
  lift_system: string | null;
  lift_software: string | null;
  vfd_model: string | null;
  vfd_software: string | null;
  motor_model: string | null;
  fault_code: string | null;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 查詢所有日誌，依記錄日期新到舊排序（日期相同時 id 新到舊）。
 *
 * @returns 日誌陣列，若無資料則回傳空陣列
 */
export function listLogs(): LogRow[] {
  try {
    const db = getDb();
    const rows = db.getAllSync<LogRow>(
      'SELECT * FROM logs ORDER BY record_date DESC, id DESC',
    );
    return rows;
  } catch (error) {
    console.error('[DB] ❌ 查詢日誌列表失敗：', error);
    throw error;
  }
}

/**
 * 依 id 查詢單筆日誌。
 *
 * @param id - 日誌的主鍵 id
 * @returns 對應的日誌列，若找不到則回傳 null
 * @throws 若資料庫操作失敗，拋出錯誤
 */
export function getLogById(id: number): LogRow | null {
  try {
    const db = getDb();
    const row = db.getFirstSync<LogRow>(
      'SELECT * FROM logs WHERE id = ? LIMIT 1',
      [id],
    );
    return row ?? null;
  } catch (error) {
    console.error(`[DB] ❌ 查詢日誌詳情失敗（id=${id}）：`, error);
    throw error;
  }
}

/**
 * 查詢最新一筆日誌（依 id 降序取第一筆）。
 * 可用於插入後的自我驗證。
 *
 * @returns 最新一筆日誌，若無資料則回傳 null
 */
export function getLatestLog(): LogRow | null {
  try {
    const db = getDb();
    const row = db.getFirstSync<LogRow>(
      'SELECT * FROM logs ORDER BY id DESC LIMIT 1',
    );
    return row ?? null;
  } catch (error) {
    console.error('[DB] ❌ 查詢最新日誌失敗：', error);
    throw error;
  }
}
