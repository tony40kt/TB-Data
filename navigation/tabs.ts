/** 每個 Tab 頁籤的設定 */
export type TabConfig = {
  /** expo-router 路由名稱（檔名）*/
  name: string;
  /** Tab Bar 顯示標題（繁中）*/
  title: string;
  /** 頁面 Header 標題（繁中）*/
  headerTitle: string;
  /** Tab Bar 圖示（emoji）*/
  icon: string;
};

/** 四個主要頁籤設定 */
export const TAB_CONFIG: TabConfig[] = [
  { name: 'list',     title: '列表', headerTitle: '日誌列表', icon: '📋' },
  { name: 'add',      title: '新增', headerTitle: '新增日誌', icon: '➕' },
  { name: 'search',   title: '搜尋', headerTitle: '搜尋',     icon: '🔍' },
  { name: 'settings', title: '設定', headerTitle: '設定',     icon: '⚙️' },
];
