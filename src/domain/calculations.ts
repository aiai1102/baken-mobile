/**
 * Domain Calculations - Pure TypeScript (Expo移植可能)
 * 回収率計算ロジック（Reactに依存しない）
 */

import type { BetRecord, TotalStats } from './types';

/**
 * レコード配列から合計統計を計算
 * @param records - BetRecordの配列
 * @returns 総購入額、総払戻額、回収率
 */
export function calcTotals(records: BetRecord[]): TotalStats {
  const spent = records.reduce((sum, r) => sum + r.spent, 0);
  // returned === null の場合は0として計算
  const returned = records.reduce((sum, r) => sum + (r.returned ?? 0), 0);
  
  // 回収率計算: (総払戻 / 総購入) * 100
  // 総購入が0の場合は0%
  const roi = spent > 0 ? (returned / spent) * 100 : 0;
  
  return {
    spent,
    returned,
    roi: Math.round(roi * 10) / 10, // 小数点1桁に丸める
  };
}