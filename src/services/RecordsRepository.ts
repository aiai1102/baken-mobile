/**
 * Records Repository Interface
 * 永続化のインターフェース定義（Expo移植時に実装を差し替え可能）
 */

import type { BetRecord } from '../domain/types';

export interface RecordsRepository {
  /**
   * 全レコードを取得
   */
  getAll(): Promise<BetRecord[]>;

  /**
   * レコードを追加
   */
  add(record: BetRecord): Promise<void>;

  /**
   * レコードを更新
   */
  update(record: BetRecord): Promise<void>;

  /**
   * レコードを削除
   */
  remove(id: string): Promise<void>;
}