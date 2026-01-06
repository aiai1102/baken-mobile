/**
 * Format Utilities
 * 表示用のフォーマット関数
 */

/**
 * 金額を日本円形式でフォーマット
 * @param amount - 金額
 * @returns ¥記号付き、桁区切りの文字列（例: ¥10,000）
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * 日付を表示用にフォーマット
 * @param dateString - 'YYYY-MM-DD'形式の日付文字列
 * @returns 'YYYY/MM/DD'形式の文字列
 */
export function formatDate(dateString: string): string {
  return dateString.replace(/-/g, '/');
}

/**
 * 回収率を表示用にフォーマット
 * @param roi - 回収率（%）
 * @returns 小数点1桁の%表示（例: 85.2%）
 */
export function formatROI(roi: number): string {
  return `${roi.toFixed(1)}%`;
}

/**
 * 今日の日付を'YYYY-MM-DD'形式で取得
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}