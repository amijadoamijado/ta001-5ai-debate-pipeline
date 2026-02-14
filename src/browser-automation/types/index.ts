/**
 * ブラウザAI自動化 - 型定義
 *
 * Playwright + CDP ハイブリッド構成によるAIサービス自動操作の型定義。
 * 4サービス（ChatGPT, Gemini, Grok, Perplexity）のDeep Research/Think制御に使用。
 */

/** 対象AIサービス識別子 */
export type AIServiceName = 'chatgpt' | 'gemini' | 'grok' | 'perplexity';

/** 操作ステップの種別 */
export type StepAction =
  | 'navigate'
  | 'click'
  | 'type'
  | 'select'
  | 'wait'
  | 'screenshot'
  | 'extract'
  | 'check_visible'
  | 'keyboard_type'
  | 'toggle';

/** 完了検知の層 */
export type CompletionLayer = 'network' | 'mutation_observer' | 'stabilization';

/** 3状態判別 */
export type GenerationState = 'generating' | 'completed' | 'error';

/** セレクタ定義（フォールバックチェーン付き） */
export interface SelectorChain {
  primary: string;
  fallback_1?: string;
  fallback_2?: string;
  fallback_3?: string;
}

/** 操作ステップ定義 */
export interface OperationStep {
  name: string;
  action: StepAction;
  selector?: SelectorChain;
  value?: string;
  timeout?: number;
  screenshot?: boolean;
  optional?: boolean;
  description?: string;
}

/** 完了検知設定 */
export interface CompletionDetectionConfig {
  /** 優先する検知層の順序 */
  layers: CompletionLayer[];
  /** ネットワーク傍受の設定 */
  network?: {
    url_pattern: string;
    content_type: string;
    eof_marker?: string;
  };
  /** MutationObserver設定 */
  mutation_observer?: {
    streaming_class?: string;
    completion_indicators: string[];
    action_buttons: string[];
  };
  /** コンテンツ安定化設定 */
  stabilization?: {
    selector: string;
    stability_threshold_ms: number;
    poll_interval_ms: number;
    max_timeout_ms: number;
  };
  /** 適応的ポーリング */
  adaptive_polling?: {
    initial_interval_ms: number;
    multiplier: number;
    max_interval_ms: number;
  };
}

/** エラー検知パターン */
export interface ErrorDetectionPattern {
  name: string;
  selector: string;
  message_pattern?: string;
  recovery_action: 'retry' | 'screenshot_escalate' | 'skip' | 'reauth';
}

/** CAPTCHA検知設定 */
export interface CaptchaDetectionConfig {
  selectors: string[];
  escalation: {
    screenshot: boolean;
    notification_channel?: string;
    timeout_ms: number;
  };
}

/** 認証設定 */
export interface AuthConfig {
  storage_state_path: string;
  session_storage_path?: string;
  health_check_selector: string;
  login_url: string;
  login_steps?: OperationStep[];
}

/** レート制限設定 */
export interface RateLimitConfig {
  min_interval_ms: number;
  max_per_hour?: number;
  max_per_day?: number;
  backoff_multiplier: number;
}

/** AIサービス設定（YAMLから読み込む） */
export interface AIServiceConfig {
  service_name: AIServiceName;
  display_name: string;
  base_url: string;
  auth: AuthConfig;
  rate_limit: RateLimitConfig;
  selectors: Record<string, SelectorChain>;
  operation_steps: OperationStep[];
  completion_detection: CompletionDetectionConfig;
  error_patterns: ErrorDetectionPattern[];
  captcha_detection: CaptchaDetectionConfig;
  output_extraction: OutputExtractionConfig;
}

/** 出力抽出設定 */
export interface OutputExtractionConfig {
  response_selector: SelectorChain;
  format: 'html' | 'text' | 'markdown';
  citations?: {
    enabled: boolean;
    badge_selector?: string;
    link_selector?: string;
  };
  validation: OutputValidationConfig;
}

/** 出力完全性検証 */
export interface OutputValidationConfig {
  min_length: number;
  required_sections?: string[];
  truncation_markers?: string[];
  citation_continuity?: boolean;
}

/** 操作結果 */
export interface OperationResult {
  service: AIServiceName;
  success: boolean;
  content?: string;
  citations?: Citation[];
  error?: string;
  screenshots: string[];
  timing: {
    started_at: string;
    completed_at: string;
    duration_ms: number;
  };
  selector_usage: SelectorUsageLog[];
  completion_layer_used?: CompletionLayer;
}

/** 引用情報 */
export interface Citation {
  index: number;
  title: string;
  url: string;
  snippet?: string;
}

/** セレクタ使用ログ（UI変更検知用） */
export interface SelectorUsageLog {
  element_name: string;
  selector_used: string;
  is_fallback: boolean;
  fallback_level?: number;
}

/** オーケストレータの実行オプション */
export interface OrchestratorOptions {
  services: AIServiceName[];
  prompt: string;
  pipeline_id: string;
  case_type: string;
  parallel?: boolean;
  screenshot_dir?: string;
  headless?: boolean;
  timeout_per_service_ms?: number;
}

/** オーケストレータの実行結果 */
export interface OrchestratorResult {
  pipeline_id: string;
  started_at: string;
  completed_at: string;
  results: Record<AIServiceName, OperationResult>;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
    skipped: number;
  };
}

/** CDPストリームデータ */
export interface CDPStreamChunk {
  request_id: string;
  data: string;
  base64_encoded: boolean;
  eof: boolean;
}

/** MutationObserver結果 */
export interface MutationObserverResult {
  completed: boolean;
  final_content?: string;
  indicators_found: string[];
}

/** スクリーンショットメタデータ */
export interface ScreenshotMeta {
  path: string;
  step_name: string;
  timestamp: string;
  service: AIServiceName;
}
