import { ResearchOutput } from '../../pipeline/types/index.js';

/** 案件タイプ */
export type CaseType = 'A' | 'B' | 'C' | 'D';

/**
 * リサーチAPI Adapterの共通インターフェース
 *
 * 各APIの差異をこのインターフェースで吸収し、
 * Core層には ResearchOutput の標準形式のみを渡す。
 */
export interface ResearchAdapter {
  /** Adapter名（例: "Brave", "Exa"） */
  name: string;
  /** 担当役割の説明 */
  role: string;
  /** APIキーが設定済みで利用可能かを判定 */
  isAvailable(): Promise<boolean>;
  /**
   * クエリを実行し、標準形式で結果を返す
   * @param query - 検索クエリ
   * @param caseType - 案件タイプ（A:新規事業, B:改善, C:DX, D:危機対応）
   * @returns ResearchOutput（成功時）またはnull（エラー・API未設定時）
   */
  search(query: string, caseType: CaseType): Promise<ResearchOutput | null>;
}

/**
 * StorageAdapter: Web環境対応のストレージ抽象化
 *
 * ファイルシステムが使えないWeb環境では
 * IndexedDBやlocalStorageベースの実装に差し替え可能にする。
 */
export interface StorageAdapter {
  /** データを保存 */
  save(key: string, data: unknown): Promise<void>;
  /** データを読み込み */
  load<T>(key: string): Promise<T | null>;
  /** データを削除 */
  remove(key: string): Promise<void>;
  /** 全キー一覧を取得 */
  keys(): Promise<string[]>;
}
