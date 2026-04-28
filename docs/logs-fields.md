# logs 欄位定義規格

> **Single Source of Truth**：程式定義見 [`db/schema.ts`](../db/schema.ts)，此文件為人類可讀版本。  
> 建表語句見 [`db/init.ts`](../db/init.ts)。

---

## 業務欄位（欄位 1–10）

| # | 欄位名稱 | 繁中標籤 | 型別 | 必填 | 輸入規則 / 備註 |
|---|----------|----------|------|:----:|-----------------|
| 1 | `record_date` | 記錄日期 | TEXT | ✅ 必填 | 格式 `YYYY-MM-DD`；**UI 預設今天，可修改** |
| 2 | `location` | 地點 | TEXT | ✅ 必填 | 自由輸入 |
| 3 | `machine_no` | 機號 | TEXT | ✅ 必填 | 僅英文字母與數字，例如 `A01` |
| 4 | `lift_system` | 升降機系統 | TEXT | — | 自由輸入；Phase 2 改為下拉選單 |
| 5 | `lift_software` | 升降機軟件 | TEXT | — | 自由輸入；Phase 2 改為下拉選單 |
| 6 | `vfd_model` | 變頻型號 | TEXT | — | 僅英文字母與數字 |
| 7 | `vfd_software` | 變頻軟件 | TEXT | — | 僅英文字母與數字 |
| 8 | `motor_model` | 摩打型號 | TEXT | — | 僅英文字母與數字 |
| 9 | `fault_code` | 故障碼 | TEXT | — | 僅數字 |
| 10 | `remark` | 備註 | TEXT | — | 自由輸入 |

> **必填規則**：欄位 1–3（`record_date`、`location`、`machine_no`）為 `NOT NULL`，  
> 表單提交前需驗證不可空白，否則顯示繁中錯誤提示。

> **日期預設值**：`record_date` 的 UI 預設值為當天日期（`new Date()` 取得），  
> 使用者可自行修改為任意有效日期（格式 `YYYY-MM-DD`）。  
> 此為前端行為；資料庫層的 `record_date` 欄位沒有 `DEFAULT` 子句，值由應用層負責傳入。

---

## 系統欄位

| 欄位名稱 | 繁中標籤 | 型別 | SQLite 預設值 | 說明 |
|----------|----------|------|---------------|------|
| `id` | ID | INTEGER | — | `PRIMARY KEY AUTOINCREMENT`，系統自動產生，不由 UI 輸入 |
| `created_at` | 建立時間 | TEXT | `datetime('now')` | INSERT 時自動填入，不可修改 |
| `updated_at` | 更新時間 | TEXT | `datetime('now')` | 由 trigger `logs_updated_at` 在每次 UPDATE 後自動更新 |

---

## 驗收對照方式（不需跑程式）

1. 開啟 [`db/init.ts`](../db/init.ts) 中的 `CREATE TABLE IF NOT EXISTS logs` 語句
2. 逐欄核對上表「欄位名稱」與「必填（NOT NULL）」是否一致
3. 開啟 [`db/schema.ts`](../db/schema.ts) 中的 `LOGS_BUSINESS_FIELDS` 陣列，確認每筆的 `name`、`required`、`note` 與本文件一致
4. 確認 `LOGS_REQUIRED_FIELDS` 匯出值為 `['record_date', 'location', 'machine_no']`

---

*最後更新：對應 Issue #9（defines logs schema, closes #9）*
