/** 全AIの共通リサーチ出力形式 (REQ-002.3) */
export interface ResearchOutput {
  ai_name: string;
  role: string;
  query: string;
  timestamp: string; // ISO8601
  findings: Finding[];
  data_points: DataPoint[];
  trends: Trend[];
  risks: Risk[];
  gaps: string[];
  sources: Source[];
  confidence: number; // 0-1
}

export interface Finding {
  category: string;
  summary: string;
  details: string;
  evidence: string[];
  confidence: number;
}

export interface DataPoint {
  metric: string;
  value: string | number;
  unit: string;
  source: string;
  date: string;
}

export interface Trend {
  name: string;
  direction: 'up' | 'down' | 'stable' | 'emerging';
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface Risk {
  category: string;
  description: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface Source {
  url: string;
  title: string;
  date: string;
  reliability: 'high' | 'medium' | 'low';
}

/** Perplexity専用の拡張フィールド */
export interface PerplexityResearchOutput extends ResearchOutput {
  claim_verifications: ClaimVerification[];
  source_registry: SourceRegistryEntry[];
  contradiction_flags: ContradictionFlag[];
  data_freshness: DataFreshness;
}

export interface ClaimVerification {
  claim: string;
  source_ai: string;
  verified: boolean | 'partial';
  sources: Source[];
  confidence: number;
  notes: string;
}

export interface SourceRegistryEntry {
  url: string;
  title: string;
  date: string;
  reliability_score: number; // 0-1
  used_by_claims: string[];
}

export interface ContradictionFlag {
  claim_a: string;
  source_a: string;
  claim_b: string;
  source_b: string;
  resolution: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface DataFreshness {
  oldest_source_date: string;
  newest_source_date: string;
  staleness_risk: 'high' | 'medium' | 'low';
  notes: string;
}

/** 全フェーズ（Phase 1〜4）の出力に必須のフィールド */
export interface IntellectualHonestyFields {
  weakest_point_identified: {
    target_phase: string;
    claim: string;
    weakness: string;
    severity: 'critical' | 'major' | 'minor';
  };
  disagreements: Disagreement[];
  verification_method: {
    approach: string;
    tools_used: string[];
    limitations: string;
  };
}

export interface Disagreement {
  target_claim: string;
  target_phase: string;
  alternative_view: string;
  evidence: string[];
  confidence_in_alternative: number;
}

/** Phase 3.5 歴史的検証の出力構造 */
export interface HistoricalValidationOutput extends IntellectualHonestyFields {
  historical_parallels: HistoricalParallel[];
  success_patterns: SuccessPattern[];
  failure_warnings: FailureWarning[];
  recovery_playbooks: RecoveryPlaybook[];
  strategic_frameworks: StrategicFramework[];
  era_similarity: EraSimilarity;
  history_verdict: HistoryVerdict;
}

export interface HistoricalParallel {
  category: 'success' | 'failure' | 'recovery';
  entity: string;
  era: string;
  region: string;
  industry: string;
  strategy: string;
  outcome: string;
  lesson: string;
  relevance_to_proposal: string;
  sources: Source[];
}

export interface SuccessPattern {
  pattern_name: string;
  examples: string[];
  key_factors: string[];
  applicability_to_proposal: string;
  confidence: number;
}

export interface FailureWarning {
  warning: string;
  historical_examples: string[];
  fatal_factor: string;
  proposal_risk_level: 'high' | 'medium' | 'low';
  mitigation_suggestion: string;
}

export interface RecoveryPlaybook {
  scenario: string;
  historical_recovery: string;
  turning_point: string;
  steps: string[];
  timeline: string;
}

export interface StrategicFramework {
  name: string; // e.g., "ポーター", "アンゾフ", "BCG", "フォード", "トヨタTPS", "マスク", "孫子の兵法", "ランチェスター戦略"
  author: string;
  era: string;
  applicable_principle: string;
  application_to_proposal: string;
}

export interface EraSimilarity {
  current_era_characteristics: string[];
  most_similar_historical_era: string;
  similarity_score: number; // 0-1
  key_parallels: string[];
  key_differences: string[];
}

export interface HistoryVerdict {
  judgment: 'support' | 'caution' | 'against';
  confidence: number;
  rationale: string;
  historical_success_rate: string; // e.g., "類似戦略の歴史的成功率: 約40%"
  do_list: string[];
  dont_list: string[];
}

/** Phase 4 最終統合レポートの構造 */
export interface IntegratedReport extends IntellectualHonestyFields {
  executive_summary: string;
  recommendations: Recommendation[];
  pros_cons_matrix: ProConMatrix;
  history_supported_options: string[];
  history_warned_options: string[];
  risk_heatmap: RiskHeatmapEntry[];
  decision_points: DecisionPoint[];
  execution_roadmap: ExecutionRoadmap[];
  honesty_summary: HonestySummary;
  research_integration: ResearchIntegration;
}

export interface Recommendation {
  option: string;
  confidence: number; // 0-1
  rationale: string;
  risks: string[];
  history_support: 'strong' | 'moderate' | 'weak' | 'against';
  timeline: string;
  estimated_cost: string;
}

export interface ProConMatrix {
  options: {
    name: string;
    pros: string[];
    cons: string[];
    phase1_support: number;
    phase2_support: number;
    phase3_risk_level: string;
    phase3_5_history_verdict: string;
  }[];
}

export interface RiskHeatmapEntry {
  risk: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  source_phase: string;
  mitigation: string;
}

export interface DecisionPoint {
  question: string;
  options: string[];
  recommended: string;
  rationale: string;
  deadline: string;
}

export interface ExecutionRoadmap {
  option_name: string;
  phases: {
    phase: string;
    duration: string;
    key_actions: string[];
    milestones: string[];
    budget: string;
  }[];
}

export interface HonestySummary {
  total_disagreements: number;
  unresolved_contradictions: string[];
  weakest_assumptions: string[];
  areas_of_consensus: string[];
  confidence_range: { min: number; max: number };
}

export interface ResearchIntegration {
  market_overview: Record<string, unknown>;
  competitive_landscape: Record<string, unknown>;
  customer_insights: Record<string, unknown>;
  regulatory_environment: Record<string, unknown>;
  social_intelligence: Record<string, unknown>;
  source_verification: Record<string, unknown>;
  technical_feasibility: Record<string, unknown>;
  perception_vs_reality: string[];
  contradictions: ContradictionFlag[];
  blind_spots: string[];
  research_quality: {
    coverage_score: number;
    source_diversity: number;
    freshness_score: number;
  };
}

/** パイプラインの実行状態を追跡 */
export interface PipelineState {
  pipeline_id: string; // 案件ID
  slug: string;
  case_type: 'A' | 'B' | 'C' | 'D' | null;
  created_at: string;
  updated_at: string;
  current_phase: PhaseName;
  status: 'initialized' | 'running' | 'paused' | 'completed' | 'failed';
  phases: {
    [key in PhaseName]: PhaseStatus;
  };
  research_tools: {
    brave: boolean;
    tavily: boolean;
    exa: boolean;
  };
}

export type PhaseName =
  | 'phase0'
  | 'phase1'
  | 'phase2'
  | 'phase3'
  | 'phase3_5'
  | 'phase4';

export interface PhaseStatus {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at: string | null;
  completed_at: string | null;
  output_files: string[];
  error: string | null;
}

/** パイプライン用ハンドオフログエントリ */
export interface PipelineHandoffEntry {
  timestamp: string;
  type: PipelineHandoffType;
  project_id: string;
  from: string;
  to: string;
  file: string;
  phase: PhaseName;
  note: string;
}

export type PipelineHandoffType =
  | 'pipeline_init'
  | 'phase0_research_start'
  | 'phase0_research_complete'
  | 'phase1_proposal'
  | 'phase2_reinforcement'
  | 'phase3_critique'
  | 'phase3_5_historical'
  | 'phase4_integration'
  | 'pipeline_complete';

/** リサーチツール統合の抽象インターフェース */
export interface ResearchToolResult {
  tool: 'brave' | 'tavily' | 'exa' | 'websearch';
  query: string;
  timestamp: string;
  results: SearchResult[];
  total_results: number;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date: string | null;
  relevance_score: number;
}

/** 行政MCPデータソース連携 (REQ-011) */
export type AdministrativeDataSource = 'real_estate' | 'estat' | 'procurement';

export interface AdministrativeData {
  source: AdministrativeDataSource;
  source_name: string; // e.g., "国土交通省 不動産取引価格API"
  timestamp: string; // ISO8601
  data: {
    api_name: string;
    query_params: Record<string, unknown>;
    response_data: unknown;
    record_count: number;
    last_updated: string; // データソースの最終更新日
  };
  metadata: {
    reliability: 'high'; // 官公需データはhigh固定
    freshness: 'current' | 'stale' | 'archived';
    staleness_days?: number; // データ取得日からの経過日数
  };
}

/** ResearchOutputの拡張（行政データ対応） */
export interface ResearchOutputWithAdminData {
  administrative_data?: AdministrativeData[];
  data_source_mapping?: {
    case_type: 'A' | 'B' | 'C' | 'D';
    used_sources: AdministrativeDataSource[];
    confidence: number;
  };
}

/** 行政データAPIの接続状態 */
export interface AdministrativeApiStatus {
  api_name: AdministrativeDataSource;
  connection_method: 'mcp' | 'rest' | 'websearch' | 'training_only';
  is_available: boolean;
  last_check: string;
  error?: string;
}

/** 案件タイプ別の行政データマッピング */
export interface CaseTypeAdminMapping {
  case_type: 'A' | 'B' | 'C' | 'D';
  primary_sources: AdministrativeDataSource[];
  target_ai: string[];
  use_case: string;
}
