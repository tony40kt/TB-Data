/**
 * db/schema.ts
 *
 * logs 資料表的欄位定義（Single Source of Truth）。
 * 後續 CRUD、表單驗證、型別宣告皆以此為準。
 *
 * 對應 db/init.ts 的 CREATE TABLE logs 語句。
 */

export type FieldType = 'TEXT' | 'INTEGER' | 'REAL';

export interface FieldDef {
  /** 資料庫欄位名稱（與 CREATE TABLE 一致） */
  name: string;
  /** 繁中顯示標籤 */
  label: string;
  /** SQLite 欄位型別 */
  type: FieldType;
  /** 是否必填（NOT NULL） */
  required: boolean;
  /** SQLite 預設值（字串形式，undefined 表示無預設） */
  defaultValue?: string;
  /** 欄位說明或輸入限制備註 */
  note?: string;
}

/**
 * logs 業務欄位（欄位 1–10）。
 * 欄位 1–3（record_date / location / machine_no）為必填。
 */
export const LOGS_BUSINESS_FIELDS: FieldDef[] = [
  {
    name: 'record_date',
    label: '記錄日期',
    type: 'TEXT',
    required: true,
    // DB 層無 DEFAULT；應用層（UI）應以當天日期作為預設值，使用者可修改
    note: '格式 YYYY-MM-DD；UI 預設今天，可修改（由應用層傳入，DB 層無預設值）',
  },
  {
    name: 'location',
    label: '地點',
    type: 'TEXT',
    required: true,
    note: '工作地點，自由輸入',
  },
  {
    name: 'machine_no',
    label: '機號',
    type: 'TEXT',
    required: true,
    note: '僅英文字母與數字，例如 A01',
  },
  {
    name: 'lift_system',
    label: '升降機系統',
    type: 'TEXT',
    required: false,
    note: '自由輸入；Phase 2 改為下拉選單',
  },
  {
    name: 'lift_software',
    label: '升降機軟件',
    type: 'TEXT',
    required: false,
    note: '自由輸入；Phase 2 改為下拉選單',
  },
  {
    name: 'vfd_model',
    label: '變頻型號',
    type: 'TEXT',
    required: false,
    note: '僅英文字母與數字',
  },
  {
    name: 'vfd_software',
    label: '變頻軟件',
    type: 'TEXT',
    required: false,
    note: '僅英文字母與數字',
  },
  {
    name: 'motor_model',
    label: '摩打型號',
    type: 'TEXT',
    required: false,
    note: '僅英文字母與數字',
  },
  {
    name: 'fault_code',
    label: '故障碼',
    type: 'TEXT',
    required: false,
    note: '僅數字',
  },
  {
    name: 'remark',
    label: '備註',
    type: 'TEXT',
    required: false,
    note: '自由輸入',
  },
];

/**
 * logs 系統欄位（由資料庫自動管理，不由 UI 輸入）。
 */
export const LOGS_SYSTEM_FIELDS: FieldDef[] = [
  {
    name: 'id',
    label: 'ID',
    type: 'INTEGER',
    required: true,
    note: 'PRIMARY KEY AUTOINCREMENT，系統自動產生',
  },
  {
    name: 'created_at',
    label: '建立時間',
    type: 'TEXT',
    required: true,
    defaultValue: "datetime('now')",
    note: 'ISO 8601 字串；INSERT 時自動填入，不可修改',
  },
  {
    name: 'updated_at',
    label: '更新時間',
    type: 'TEXT',
    required: true,
    defaultValue: "datetime('now')",
    note: 'ISO 8601 字串；UPDATE 時由 trigger logs_updated_at 自動更新',
  },
];

/**
 * logs 全部欄位（系統欄位在前，業務欄位在後）。
 * 可直接迭代此陣列產生表單、驗證規則或 TypeScript 型別。
 */
export const LOGS_SCHEMA: FieldDef[] = [
  ...LOGS_SYSTEM_FIELDS,
  ...LOGS_BUSINESS_FIELDS,
];

/** logs 必填的業務欄位名稱清單（方便驗證時快速查詢） */
export const LOGS_REQUIRED_FIELDS: string[] = LOGS_BUSINESS_FIELDS
  .filter((f) => f.required)
  .map((f) => f.name);
