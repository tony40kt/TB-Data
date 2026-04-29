/**
 * 驗證日期字串是否為真實存在的日期（格式 YYYY-MM-DD）。
 * 不依賴 new Date() 的解析行為，避免時區或瀏覽器差異。
 * 呼叫前請先確認字串已通過 /^\d{4}-\d{2}-\d{2}$/ 格式檢查。
 */
export function isValidDateYYYYMMDD(s: string): boolean {
  const year = parseInt(s.substring(0, 4), 10);
  const month = parseInt(s.substring(5, 7), 10);
  const day = parseInt(s.substring(8, 10), 10);

  if (month < 1 || month > 12) return false;

  const isLeapYear =
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];

  return day >= 1 && day <= daysInMonth[month - 1];
}
