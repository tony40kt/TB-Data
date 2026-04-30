# Phase 3 Auth 規格文件：登入流程與角色對應

> **用途**：本文件為 Phase 3「登入與角色管理」的單一規格依據（single source of truth），後續 Gmail 登入實作（#36）、角色儲存（#37）與 Admin 角色管理（#38）的實作均以此為準。  
> 全文採用繁體中文；用詞沿用 [`docs/ui-text.zh-Hant.md`](./ui-text.zh-Hant.md)。

---

## 1. 核心原則

- 本 App 為**單機離線**運作，不進行雲端同步、不依賴後端伺服器。
- Gmail 登入僅用於取得使用者身分識別（`email`），資料本身不上傳至任何伺服器。
- 角色（`role`）與登入狀態均儲存於**本機**，重新開啟 App 後仍保留。

---

## 2. 角色狀態定義

| 狀態 | 角色 | 繁中名稱 | 說明 |
|------|------|---------|------|
| 未登入 | `guest` | 訪客 | App 剛開啟或登出後，視為訪客；唯讀，不可新增／編輯／刪除。 |
| 登入成功（新帳號） | `user` | 一般使用者 | 首次使用該 Gmail 登入，預設角色為 `user`，可新增、編輯、刪除，但不可匯出。 |
| 登入成功（已知帳號） | 沿用本機設定 | — | 若本機已存在該 `email` 的角色記錄，登入後直接套用，不重置為 `user`。 |
| 登出 | `guest` | 訪客 | 登出後立即回到 `guest`，角色限制即時生效。 |

### 2.1 角色權限對照（沿用 Phase 2 規格）

| 功能 | admin（管理員） | user（一般使用者） | guest（訪客） |
|------|:--------------:|:-----------------:|:------------:|
| 新增記錄 | ✅ | ✅ | ❌ |
| 編輯記錄 | ✅ | ✅ | ❌ |
| 刪除記錄 | ✅ | ✅ | ❌ |
| 搜尋記錄 | ✅ | ✅ | ✅ |
| 匯出資料（CSV） | ✅ | ❌ | ❌ |
| 管理使用者角色（#38） | ✅ | ❌ | ❌ |

---

## 3. 資料儲存設計（單機離線）

### 3.1 使用者身分識別

- 採用 **Gmail `email`** 作為唯一身分識別 key。
- 不儲存密碼或 Token（OAuth 流程由 Expo AuthSession 管理）。

### 3.2 本機 Role Mapping

**目的**：記住每個 `email` 對應的角色，重新開啟 App 後仍生效。

| 儲存位置 | AsyncStorage |
|--------|--------------|
| Key | `tbdata.roleMap` |
| 資料格式 | JSON 字串，結構為 `{ [email: string]: "admin" | "user" | "guest" }` |
| 範例 | `{"user@gmail.com":"user","admin@gmail.com":"admin"}` |

**讀寫時機**：

| 時機 | 動作 |
|------|------|
| 登入成功時 | 從 `tbdata.roleMap` 查詢該 `email`；若不存在則寫入 `"user"` |
| Admin 修改某 `email` 角色時（#38） | 更新 `tbdata.roleMap` 並同步全域狀態 |
| 登出時 | 不修改 `tbdata.roleMap`（保留記錄，以便下次登入沿用） |
| App 啟動時 | 讀取 `tbdata.currentEmail`（見 3.3）後，再查 `tbdata.roleMap` 取得角色 |

### 3.3 目前登入狀態

| 儲存位置 | AsyncStorage |
|--------|--------------|
| Key | `tbdata.currentEmail` |
| 可能值 | Gmail `email` 字串，或 `null`（未登入） |

**讀寫時機**：

| 時機 | 動作 |
|------|------|
| 登入成功時 | 寫入 `tbdata.currentEmail = email` |
| 登出時 | 寫入 `tbdata.currentEmail = null` |
| App 啟動時 | 讀取 `tbdata.currentEmail`；若為 `null` 則角色為 `guest` |

### 3.4 曾登入過的 Email 清單（供 #38 使用）

**目的**：Admin 管理頁面（#38）只能管理「本機曾登入過的帳號」，不從網路抓取。

| 儲存位置 | AsyncStorage |
|--------|--------------|
| Key | `tbdata.knownEmails` |
| 資料格式 | JSON 字串，結構為 `string[]`（排序可依首次登入順序） |
| 範例 | `["user@gmail.com","admin@gmail.com"]` |

**讀寫時機**：

| 時機 | 動作 |
|------|------|
| 每次登入成功時 | 若該 `email` 不在清單中，則 append 並存回 `tbdata.knownEmails` |
| 讀取（#38 管理頁） | 直接從 `tbdata.knownEmails` 讀取完整清單 |

### 3.5 Storage Key 彙總

| Key | 型別 | 用途 |
|-----|------|------|
| `tbdata.currentEmail` | `string | null` | 目前登入的 Gmail email；`null` 表示未登入 |
| `tbdata.roleMap` | `{ [email]: Role }` | 各 email 對應角色，重開仍存在 |
| `tbdata.knownEmails` | `string[]` | 本機曾登入過的 email 清單（供 #38 使用） |

---

## 4. 第一個 Admin 的取得方式（方案 B：開發模式按鈕升權）

### 4.1 開發模式定義

Phase 3 使用 React Native 內建的 `__DEV__` 全域變數作為**唯一開關**：

```ts
// constants/devConfig.ts
export const DEV_MODE = __DEV__; // 開發模式自動為 true；正式 build 自動為 false
```

> **說明**：`__DEV__` 在 `expo start`（開發模式）下為 `true`，正式 production build（`eas build --profile production`）自動為 `false`，不需手動改回。Phase 3 不使用 `EXPO_PUBLIC_DEV_MODE` 或其他環境變數，避免實作者混淆。

### 4.2 升權按鈕（設定頁）

- **顯示條件**：`DEV_MODE === true` **且**目前使用者已登入（非 `guest`）。
- **位置**：設定頁，顯示於「開發工具」區塊。
- **按鈕文字**：`🛠️ 升級為管理員（僅開發模式）`
- **操作邏輯**：
  1. 將目前登入的 `email` 在 `tbdata.roleMap` 中更新為 `"admin"`。
  2. 全域角色狀態立即更新為 `admin`。
  3. 顯示提示：`✅ 已將 {email} 升級為管理員。`
- **限制說明**（文件記錄）：
  - 此為 Phase 3 最小落地方案，僅適合開發測試情境。
  - 正式版建議改成：
    - **allowlist**：在常數檔或設定檔中維護一組 admin email 清單，登入時自動賦予 admin 角色。
    - **後端控管**：由伺服器決定角色，本機僅快取。

---

## 5. 登入狀態機（State Machine）

```
          ┌──────────┐
          │  guest   │◄────────────── 登出 / App 冷啟動（無 currentEmail）
          └────┬─────┘
               │ Gmail 登入成功
               ▼
      ┌──────────────────┐
      │  查 tbdata.roleMap│
      └────────┬─────────┘
               │
       ┌───────┴────────┐
       │ 無記錄          │ 有記錄
       ▼                ▼
   role = user     role = 原記錄
   寫入 roleMap    （user / admin / guest）
       │                │
       └───────┬─────────┘
               ▼
        ┌──────────────┐
        │  登入中狀態   │
        │（role 已套用）│
        └──────────────┘
```

---

## 6. UI 文案（沿用 `docs/ui-text.zh-Hant.md`）

下列為 Phase 3 Auth 新增的 UI 文案 key（應在 `docs/ui-text.zh-Hant.md` 同步補充）：

| Key | 使用情境 | 建議文字 |
|-----|---------|---------|
| `auth.status.logged_out` | 設定頁 — 未登入狀態 | 未登入 |
| `auth.status.logged_in` | 設定頁 — 已登入，顯示 email | 已登入：{email} |
| `btn.login` | 設定頁 — 登入按鈕 | 🔑 使用 Gmail 登入 |
| `btn.logout` | 設定頁 — 登出按鈕 | 登出 |
| `auth.role.default_user` | 登入成功後的角色提示 | ✅ 登入成功，目前角色：一般使用者 |
| `auth.role.restored` | 登入成功且沿用舊角色時的提示 | ✅ 登入成功，沿用角色：{roleName} |
| `btn.dev.elevate_admin` | 設定頁開發工具區塊 | 🛠️ 升級為管理員（僅開發模式） |
| `auth.dev.elevated` | 升權成功提示 | ✅ 已將 {email} 升級為管理員。 |
| `auth.section.dev_tools` | 設定頁開發工具區塊標題 | 開發工具 |

---

## 7. 手動驗證步驟（Expo Go iOS）

以下步驟須在 Expo Go（iOS 實機）執行，作為 Phase 3 的驗收基準。

### 步驟 1：未登入 → guest 限制生效
1. 冷啟動 App（或確認已登出）。
2. 開啟設定頁，確認顯示「未登入」。
3. 嘗試新增／編輯記錄，應顯示 `🔒 訪客不可新增記錄` / `🔒 訪客不可編輯記錄`。

### 步驟 2：登入新帳號 → 預設 user 限制生效
1. 點擊「🔑 使用 Gmail 登入」。
2. 完成 Google OAuth，設定頁顯示「已登入：{email}」。
3. 確認角色提示顯示「✅ 登入成功，目前角色：一般使用者」。
4. 嘗試匯出，應顯示 `🔒 一般使用者不可匯出資料`。
5. 新增／編輯／刪除應正常可用。

### 步驟 3：登出 → 回到 guest
1. 點擊「登出」按鈕。
2. 設定頁顯示「未登入」。
3. 嘗試新增記錄，應顯示 `🔒 訪客不可新增記錄`。

### 步驟 4：開發模式 — 升級為 admin
1. 確認 `DEV_MODE = true`。
2. 使用 Gmail 登入（任意帳號）。
3. 設定頁「開發工具」區塊顯示「🛠️ 升級為管理員（僅開發模式）」按鈕。
4. 點擊按鈕，確認提示「✅ 已將 {email} 升級為管理員。」
5. 確認設定頁角色顯示已變為「管理員」。

### 步驟 5：admin 管理入口（依 #38 完成後驗收）
1. 以 admin 身分登入。
2. 設定頁出現「使用者角色管理」入口。
3. 進入管理頁，列出本機曾登入過的 email。
4. 將某 email 的角色改為 `guest`，確認保存後該帳號登入即受限。

### 步驟 6：重開 App → 狀態與 role mapping 仍存在
1. 完成步驟 2 或步驟 4（至少有一個 email 已登入或已升為 admin）。
2. 完全關閉並重新開啟 App。
3. 設定頁應顯示上次登入的 `email` 與對應角色（`user` 或 `admin`），不需重新登入。

---

## 8. 非目標（Phase 3 不做）

- 雲端資料同步／多裝置共享。
- 後端 API／由伺服器控管角色。
- 多語言（i18n）支援。
- 真正的「所有使用者清單」（本期僅管理本機曾登入過的 email）。

---

## 9. 後續演進路徑（Phase 4+）

| 現況（Phase 3 最小落地） | 建議的正式版做法 |
|------------------------|----------------|
| `DEV_MODE` 常數開關 | 改為讀取 `__DEV__` 或 CI 環境變數 |
| 開發模式按鈕升權 | allowlist（常數檔）或後端 API 控管 |
| 本機曾登入清單 | 後端使用者資料庫 |
| AsyncStorage role mapping | 結合後端 JWT claims 或 Firestore |

---

## 10. 相關文件與 Issue

| 文件 / Issue | 說明 |
|-------------|------|
| [`docs/phase2-permissions.md`](./phase2-permissions.md) | Phase 2 角色定義與限制點（本文件沿用並擴充） |
| [`docs/ui-text.zh-Hant.md`](./ui-text.zh-Hant.md) | 繁中 UI 文案集中管理 |
| #34 | Phase 3 Epic |
| #36 | Gmail 登入／登出 UI 實作 |
| #37 | 角色儲存（email ↔ role mapping） |
| #38 | Admin 可修改使用者角色 |

---

*此文件對應 Issue #35，作為 Phase 3 後續實作（#36 #37 #38）的規格依據。*
