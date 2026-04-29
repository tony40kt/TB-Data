# TB-Data（For TB）

## 目的
用於升降機（電梯）故障排除工作日誌的離線記錄與搜尋，Phase 1~4 為單機測試版；Phase 5 才加入雲端儲存與多人同步。

## 開發環境（鎖定）
- Framework：Expo SDK **54.0.2**（`expo` npm 套件 `54.x.x`，詳見 `package.json`）
- Node.js：**20 LTS**（建議使用 `node -v` 確認，版本需 `20.x`）
- Package manager：**npm**（請勿混用 yarn / pnpm，否則會破壞 `package-lock.json`）
- 平台：iOS（Phase 1~4）

---

## 如何在新電腦跑起專案（可重現）

### 前置需求
| 工具 | 建議版本 | 確認指令 |
|------|----------|----------|
| Node.js | 20 LTS | `node -v` |
| npm | 隨 Node 附帶（≥ 10） | `npm -v` |
| Git | 任何近期版本 | `git --version` |
| Expo Go（iPhone） | App Store 最新版 | — |

> **平台說明**：Phase 1~4 僅支援 **iOS**（iPhone + Expo Go）；Android 支援計畫於 Phase 4 加入。

### 安裝
> ⚠️ 請使用 **npm** 安裝，不要用 `yarn install` 或 `pnpm install`，避免產生額外的 lockfile 或破壞現有 `package-lock.json`。

```bash
git clone https://github.com/tony40kt/TB-Data.git
cd TB-Data
npm install
```

### 啟動（加 `-c` 清除 Metro 快取）
```bash
npx expo start -c
```

Metro bundler 啟動後，終端機會顯示 QR Code。

### iOS 真機測試（Expo Go）
1. 在 iPhone 上安裝 **Expo Go**（App Store）。
2. 確認手機與電腦在同一 Wi-Fi 網路。
3. 用 iPhone 的相機 App 或直接在 Expo Go 內掃描終端機顯示的 QR Code。
4. App 自動載入，首頁（列表頁）正常顯示即代表環境成功。

---

## 本機資料庫（SQLite）

App 使用 `expo-sqlite` 在裝置本機儲存資料：
- 資料庫檔案名稱：`tb_data.db`
- **首次啟動時自動建立**，無需手動執行任何 SQL 或 migration 指令。
- 資料存在裝置本機（Expo Go 沙盒），解除安裝 Expo Go 或清除 App 資料才會清空。

### 快速產生測試資料
進入 App 的 **「設定」Tab** → 點擊「建立測試日誌」按鈕，可一鍵插入一筆測試記錄（地點：測試地點，機號：TEST01）；重複點擊可建立多筆，方便驗收列表、搜尋等功能。

---

## 常見問題排除

### Q1：Expo Go 無法連線（掃 QR Code 後一直 loading）
- **優先嘗試**：在 Expo 終端機按 `t` 切換為 **Tunnel** 模式（跨網段時更穩定）。
- **其次**：確認手機與電腦在同一 Wi-Fi，或切換 `l`（LAN）試試。
- 在 Expo 終端機可用以下按鍵切換模式：
  - `l` → LAN
  - `t` → Tunnel（需要全域安裝 `@expo/ngrok`：`npm install -g @expo/ngrok`；此為開發工具，非專案依賴，全域安裝不影響 `package-lock.json`）

### Q2：Metro 顯示奇怪錯誤或模組找不到
清除 Metro 快取後重啟：
```bash
npx expo start -c
```

### Q3：`npm install` 失敗或有套件版本衝突
```bash
rm -rf node_modules
npm install
```
若仍有問題，確認 Node.js 版本是否為 **20.x**（`node -v`）。

### Q4：不同電腦版本不一致（版本飄移）
本 repo 已提交 `package-lock.json`，只要執行 `npm install`（不加 `--legacy-peer-deps` 等旗標）就會以 lockfile 為準，確保所有人安裝相同版本。

---

## 專案資料夾結構
本專案採用 **expo-router**，以 `app/` 作為畫面主結構（取代傳統的 `screens/`）：

```
TB-Data/
├── app/             # expo-router 頁面（tabs、logs 等）
├── components/      # 共用 UI 元件
├── db/              # SQLite 初始化、schema、queries
├── docs/            # 測試清單、操作說明、文案規範
├── package.json
├── package-lock.json  ← 鎖定依賴版本，請一併提交
└── ...
```

---

## Roadmap

### Phase 1（單機離線）
目標：在手機本機資料庫儲存工作日誌，支援 CRUD + 全欄位搜尋 + 多條件篩選 + 匯出。

#### 工作日誌欄位（logs）
1. 記錄日期（可修改，預設今天）【必填】
2. 地點【必填】
3. 機號（僅英文+數字）【必填】
4. 升降機系統
5. 升降機軟件
6. 變頻型號（僅英文+數字）
7. 變頻軟件（僅英文+數字）
8. 摩打型號（僅英文+數字）
9. 故障碼（僅數字）
10. 備註

#### 搜尋
- 所有欄位都可搜尋
- 支援多條件篩選（例如：地點 + 機號 + 故障碼）

### Phase 2（單機離線）
- 部分欄位改為下拉選單：升降機系統 / 升降機軟件（預設 test-a、test-b）
- 本機權限等級：admin / user / guest
- 測試按鍵可切換不同權限（方便驗證）

### Phase 3（單機離線）
- 管理員可更改帳戶使用者等級
- Gmail 註冊/登入（登入後預設 user；未登入為 guest）

### Phase 4（單機離線）
- iOS + Android（功能不變）

### Phase 5（雲端）
- 雲端資料庫儲存
- 多人使用與同步（低成本測試版）
