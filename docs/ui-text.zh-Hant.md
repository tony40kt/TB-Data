# 繁體中文 UI 文案規範

> **用途**：集中整理 Phase 1 所有常用按鈕、提示與錯誤訊息，確保整個應用的文案一致。
> 新增或修改任何 UI 文字／錯誤訊息前，請先查閱本文件；若現有文案不符合需求，請在本文件補充後再同步至程式碼。

---

## 一、常用按鈕文字

| Key | 使用情境 | 建議文字 | 備註 |
|-----|---------|---------|------|
| `btn.save` | 新增頁 / 編輯頁 — 儲存表單 | 💾 儲存 | 目前程式碼：`💾 儲存` |
| `btn.cancel` | 編輯頁 — 放棄修改、返回上一頁 | 取消 | 目前程式碼：`取消` |
| `btn.reset` | 新增頁 — 清空所有欄位 | 🔄 清除 | 目前程式碼：`🔄 清除` |
| `btn.back` | 詳情頁 / 錯誤頁 — 返回列表 | ← 返回列表 | 目前程式碼：`← 返回列表` / `返回列表` |
| `btn.edit` | 詳情頁 — 進入編輯頁 | ✏️ 編輯 | 目前程式碼：`✏️ 編輯` |
| `btn.delete` | 詳情頁 — 刪除日誌 | 刪除 | 刪除中狀態顯示：`刪除中…` |
| `btn.delete.confirm` | 刪除確認 Alert — 確認按鈕 | 確認刪除 | destructive 樣式 |
| `btn.search` | 搜尋頁 — 執行搜尋 | 🔍 搜尋 | 無條件時灰色禁用 |
| `btn.clear` | 搜尋頁 — 清除搜尋條件及結果 | ✕ 清除 | 有條件 / 有結果時才顯示 |
| `btn.export` | 搜尋頁 — 複製結果至剪貼簿 | 📋 複製結果 | 有結果時才顯示 |
| `btn.ok` | Alert 確認 — 通用確定 | 確定 | 例如刪除成功後的 Alert |

---

## 二、常用錯誤／提示文字

### 2-1 驗證錯誤（表單 inline）

| Key | 使用情境 | 建議文字 | 相關 Issue |
|-----|---------|---------|-----------|
| `err.date.empty` | 記錄日期欄位為空白 | 記錄日期不可空白 | #10 |
| `err.date.format` | 記錄日期格式不符 YYYY-MM-DD | 記錄日期格式必須為 YYYY-MM-DD | #10 |
| `err.date.invalid` | 記錄日期雖符合格式但不是真實存在的日期（例如 2024-02-30） | 記錄日期不是有效日期 | #10 |
| `err.location.empty` | 地點欄位為空白 | 地點不可空白 | #10 |
| `err.machine_no.empty` | 機號欄位為空白 | 機號不可空白 | #10 |
| `err.machine_no.format` | 機號含有非英文/數字/句點(.) 的字元 | 機號只能輸入英文/數字/句點(.) | #11 |
| `err.vfd_model.format` | 變頻型號含有非英文/數字/句點(.) 的字元 | 變頻型號只能輸入英文/數字/句點(.) | #11 |
| `err.vfd_software.format` | 變頻軟件含有非英文/數字/句點(.) 的字元 | 變頻軟件只能輸入英文/數字/句點(.) | #11 |
| `err.motor_model.format` | 摩打型號含有非英文/數字/句點(.) 的字元 | 摩打型號只能輸入英文/數字/句點(.) | #11 |
| `err.fault_code.format` | 故障碼含有非數字字元 | 故障碼只能輸入數字 | #12 |

### 2-2 系統操作提示（Alert / 狀態區塊）

| Key | 使用情境 | 建議文字 | 備註 |
|-----|---------|---------|------|
| `alert.delete.title` | 刪除確認 Alert 標題 | 確認刪除 | |
| `alert.delete.message` | 刪除確認 Alert 內文 | 確定要刪除此日誌嗎？此操作不可復原。 | |
| `alert.delete.success.title` | 刪除成功 Alert 標題 | 已刪除 | |
| `alert.delete.success.message` | 刪除成功 Alert 內文 | 日誌已成功刪除。 | |
| `alert.delete.fail.title` | 刪除失敗 Alert 標題 | 刪除失敗 | 內文為實際錯誤訊息 |
| `msg.edit.success` | 編輯頁儲存成功訊息（inline） | ✅ 已更新，正在返回詳情頁… | |
| `msg.edit.fail` | 編輯頁儲存失敗訊息（inline） | ❌ 更新失敗：{errorMessage} | `{errorMessage}` 為實際錯誤訊息 |
| `alert.copy.success` | 複製結果成功 Alert | ✅ 已複製 {count} 筆 | `{count}` 為筆數 |
| `alert.copy.fail` | 複製結果失敗 Alert | ❌ 無法複製到剪貼簿，請再試一次 | |
| `msg.search.error` | 搜尋頁搜尋失敗（inline） | ❌ 搜尋失敗 | 下方顯示詳細錯誤訊息 |
| `msg.db.insert.fail` | DB 新增失敗（設定頁） | 新增失敗：{errorMessage} | `{errorMessage}` 為實際錯誤訊息 |

### 2-3 頁面狀態訊息

| Key | 使用情境 | 建議文字 | 備註 |
|-----|---------|---------|------|
| `status.loading` | 讀取資料時的等待提示 | 讀取中… | |
| `status.not_found` | 找不到指定日誌 | 找不到此日誌 | |
| `status.load_fail` | 讀取資料失敗 | 讀取失敗 | 下方顯示詳細錯誤訊息 |
| `status.list_empty` | 日誌列表無資料 | 目前尚無日誌，請先新增一筆 | |
| `status.search_idle` | 搜尋頁尚未輸入條件 | 尚未搜尋 | |
| `status.search_loading` | 搜尋中的等待提示 | 搜尋中… | |
| `status.search_no_result` | 搜尋有結果但為 0 筆 | 找不到符合條件的日誌 | |
| `status.search_result_count` | 搜尋完成後顯示筆數 | 共 {count} 筆結果 | `{count}` 為筆數 |
| `status.deleting` | 刪除操作進行中（按鈕文字） | 刪除中… | 按鈕禁用狀態 |
| `role.admin` | 設定頁 — admin 角色繁中名稱 | 管理員 | #32 |
| `role.user` | 設定頁 — user 角色繁中名稱 | 一般使用者 | #32 |
| `role.guest` | 設定頁 — guest 角色繁中名稱 | 訪客 | #32 |
| `settings.current_role` | 設定頁 — 目前角色標籤 | 目前角色： | #32 |
| `settings.role_switched` | 設定頁 — 切換角色成功提示 | ✅ 已切換為：{roleName} | `{roleName}` 為繁中角色名稱；#32 |

## 三、欄位標籤與佔位文字

| 欄位名稱（DB） | UI 標籤 | Placeholder | 必填 |
|--------------|--------|-------------|------|
| `record_date` | 記錄日期 | YYYY-MM-DD | ✅ |
| `location` | 地點 | 工作地點 | ✅ |
| `machine_no` | 機號 | 英文/數字/句點(.) | ✅ |
| `lift_system` | 升降機系統 | （選填） | — |
| `lift_software` | 升降機軟件 | （選填） | — |
| `vfd_model` | 變頻型號 | （選填） | — |
| `vfd_software` | 變頻軟件 | （選填） | — |
| `motor_model` | 摩打型號 | （選填） | — |
| `fault_code` | 故障碼 | （選填） | — |
| `remark` | 備註 | （選填） | — |
| `created_at` | 建立時間 | — | — |
| `updated_at` | 更新時間 | — | — |

> **必填標記**：欄位標籤後加 `*`（紅色），例如：`記錄日期 *`

---

## 四、分區標題

| Key | 使用情境 | 建議文字 |
|-----|---------|---------|
| `section.required` | 新增頁 / 編輯頁 — 必填欄位區塊標題 | 必填欄位 |
| `section.optional` | 新增頁 / 編輯頁 — 選填欄位區塊標題 | 選填欄位 |
| `section.recent_search` | 搜尋頁 — 最近搜尋區塊標題 | 最近搜尋 |

---

## 五、搜尋頁 Placeholder

| 欄位 | Placeholder |
|------|-------------|
| 關鍵字 | 關鍵字（地點 / 機號 / 故障碼 / 備註） |
| 地點 | 地點（選填） |
| 機號 | 機號（選填，英數） |
| 故障碼 | 故障碼（選填） |

---

## 六、使用說明

1. **新增 UI 文字前**：先在本文件找到最接近的 Key，直接使用「建議文字」欄的文案。
2. **文案不在本表**：先在本文件補充新的 Key → 再寫入程式碼，保持同步。
3. **發現程式碼與本表不一致**：以「目前程式碼已用的文案」為準，並更新本文件（備註欄標記版本/日期）。
4. **本文件不做 i18n**：Phase 1 僅需繁體中文，待 Phase 2 有多語言需求時，再以此文件為基礎建立 i18n key 系統。
