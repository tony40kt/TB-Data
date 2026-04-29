# Phase 2 規格文件：下拉選單

> **用途**：本文件為 Phase 2「升降機系統／升降機軟件」下拉選單的單一規格依據，後續 add / edit 頁的下拉 UI 實作以此為準。

---

## 1. 下拉欄位清單

| 欄位名稱 | 繁中標籤 | DB 欄型別 | 必填 |
|----------|----------|-----------|:----:|
| `lift_system` | 升降機系統 | TEXT | — 選填 |
| `lift_software` | 升降機軟件 | TEXT | — 選填 |

---

## 2. 選項來源與清單

Phase 2 使用**固定內建選項**（不需後台管理，不需雲端）。

### lift_system（升降機系統）選項

| 顯示文字 | 儲存值 |
|----------|--------|
| （不選擇） | *(空值，見第 3.2 節)* |
| test-a | `test-a` |
| test-b | `test-b` |

### lift_software（升降機軟件）選項

| 顯示文字 | 儲存值 |
|----------|--------|
| （不選擇） | *(空值，見第 3.2 節)* |
| test-a | `test-a` |
| test-b | `test-b` |

> 兩個欄位共用相同選項，未來若需分開維護可各自擴充。

---

## 3. 空值表示方式（「不選擇」行為）

### 3.1 UI 規格

- 下拉選單的**第一個選項**固定顯示「**（不選擇）**」。
- 使用者選取「（不選擇）」代表**不填寫此欄位**。
- 使用者可以從任意已選選項**切回「（不選擇）」**，切回後該欄位即視為空值。

### 3.2 DB / 程式碼層面的空值定義

- 空值在資料庫（SQLite）層儲存為 **`null`**（非空字串 `''`）。
- 與現行程式碼一致：`db/logs.ts` 的 `insertLog` 與 `updateLog` 均以 `?? null` 將 `undefined` 或未填欄位轉為 `null` 再寫入 DB。
- TypeScript 型別亦定義為 `lift_system: string | null`（見 `db/logs.ts` 的 `LogRow` 介面）。

```typescript
// db/logs.ts — 現行寫入邏輯（摘錄，供參考）
input.lift_system ?? null,   // 未選擇時傳入 null
input.lift_software ?? null, // 未選擇時傳入 null
```

### 3.3 空值讀取與初始顯示

- 從 DB 讀取記錄時，`lift_system` / `lift_software` 值可能為 `null`。
- UI 讀取到 `null` 時，下拉選單應預選「（不選擇）」（即第一個選項）。

---

## 4. 欄位行為摘要

| 行為 | 說明 |
|------|------|
| 欄位性質 | 選填（非必填） |
| 預設狀態 | 顯示「（不選擇）」，儲存 `null` |
| 選取選項 | 儲存對應字串值（如 `test-a`） |
| 切回空值 | 選取「（不選擇）」，儲存 `null` |
| DB 空值型別 | `null`（非空字串） |
| 適用頁面 | 新增頁（add）、編輯頁（edit） |

---

## 5. 實作參考

- DB 欄位定義：[`db/schema.ts`](../db/schema.ts)（`lift_system`、`lift_software`）
- DB 操作：[`db/logs.ts`](../db/logs.ts)（`insertLog`、`updateLog`、`LogRow`）
- 欄位完整規格：[`docs/logs-fields.md`](./logs-fields.md)

---

*此文件對應 Issue #30，作為後續實作下拉 UI 的依據。*
