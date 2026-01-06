/**
 * Domain Types - Pure TypeScript (Expo移植可能)
 * Reactに依存しない型定義
 */

export interface BetRecord {
  id: string;
  date: string; // 'YYYY-MM-DD'
  spent: number; // 購入金額
  returned: number | null; // 払い戻し金額（null=未入力, 0=外れ, >0=的中）
  memo?: string; // メモ（任意）
}

export interface TotalStats {
  spent: number;
  returned: number;
  roi: number; // 回収率（%）
}