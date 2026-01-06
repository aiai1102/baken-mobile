/**
 * Domain Filters - Pure TypeScript (Expo移植可能)
 * データフィルタリングロジック（Reactに依存しない）
 */

import type { BetRecord } from './types';

/**
 * 指定年のレコードのみをフィルタリング
 * @param records - BetRecordの配列
 * @param year - フィルタする年（例: 2025）
 * @returns 指定年のレコード配列
 */
export function filterByYear(records: BetRecord[], year: number): BetRecord[] {
  return records.filter((record) => {
    const recordYear = new Date(record.date).getFullYear();
    return recordYear === year;
  });
}

/**
 * レコードを日付降順でソート
 * @param records - BetRecordの配列
 * @returns ソート済みレコード配列
 */
export function sortByDateDesc(records: BetRecord[]): BetRecord[] {
  return [...records].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}