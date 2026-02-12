# 実装指示: TypeScript型定義の作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 001 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/001-type-definitions` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

```bash
# ブランチ作成コマンド
git checkout -b feature/20260212-001-5ai-pipeline/001-type-definitions
```

## 2. 実装タスク概要

**タスク番号**: 001
**タスク名**: TypeScript型定義の作成（Task 1.1）

### 2.1 目的
パイプライン全体で使用するデータモデルのTypeScript型定義を作成する。設計書（design.md）Section 4 に定義された全interfaceを `src/pipeline/types/index.ts` に実装する。これは他の全タスクの前提となる基盤レイヤーである。

### 2.2 依存タスク
| 依存タスク番号 | 状態 | 備考 |
|--------------|------|------|
| なし | - | 最初に実装するタスク |

## 3. 実装範囲

### 3.1 変更可能ファイル
| ファイルパス | アクション | 説明 |
|------------|----------|------|
| `src/pipeline/types/index.ts` | Create | 全データモデルの型定義 |

### 3.2 禁止領域
| ファイル/ディレクトリ | 理由 |
|---------------------|------|
| `CLAUDE.md` | フレームワーク設定 |
| `.kiro/specs/` | 仕様書は変更不可 |

### 3.3 参照のみ
| ファイルパス | 参照理由 |
|------------|---------|
| `.kiro/specs/5ai-debate-pipeline/design.md` | 設計仕様の確認（Section 4: データモデル） |
| `.kiro/specs/5ai-debate-pipeline/requirements.md` | 要件の確認 |

## 4. 追加・変更仕様（差分）

### 4.1 実装すべきTypeScript型定義

以下のコードを `src/pipeline/types/index.ts` にそのまま実装すること。全interfaceを `export` で公開する。

#### 4.1.1 共通リサーチ出力フォーマット (Section 4.1)

```typescript
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
```

#### 4.1.2 Perplexity固有フィールド (Section 4.2, REQ-003)

```typescript
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
```

#### 4.1.3 知的誠実性フィールド (Section 4.3, REQ-004)

```typescript
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
```

#### 4.1.4 歴史的検証出力 (Section 4.4, REQ-001.5)

```typescript
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
  name: string; // e.g., "ポーターの競争戦略", "アンゾフの成長マトリックス", "BCG PPM", "フォードの改善", "トヨタTPS", "マスクの第一原理", "孫子の兵法"
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
```

#### 4.1.5 統合レポート構造 (Section 4.5, REQ-001.6 + REQ-005.4)

```typescript
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
```

#### 4.1.6 パイプライン状態管理 (Section 4.6)

```typescript
/** パイプラインの実行状態を追跡 */
export interface PipelineState {
  pipeline_id: string; // 案件ID
  slug: string;
  case_type: 'A' | 'B' | 'C' | 'D';
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
```

#### 4.1.7 ハンドオフログエントリ (Section 4.7, REQ-008.2)

```typescript
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
  | 'phase0_research_start'
  | 'phase0_research_complete'
  | 'phase1_proposal'
  | 'phase2_reinforcement'
  | 'phase3_critique'
  | 'phase3_5_historical'
  | 'phase4_integration'
  | 'pipeline_complete';
```

#### 4.1.8 リサーチツール統合 (Section 7.1, REQ-010.1)

```typescript
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
```

## 5. 受け入れテスト

### 5.1 自動テスト
```bash
# TypeScript型チェック
npx tsc --noEmit --strict src/pipeline/types/index.ts
```

### 5.2 受け入れ基準チェックリスト
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| AC-001 | ResearchOutput, Finding, DataPoint, Trend, Risk, Source が定義されていること | export済み (REQ-002.3) |
| AC-002 | PerplexityResearchOutput（ClaimVerification, SourceRegistryEntry, ContradictionFlag, DataFreshness含む）が定義されていること | export済み (REQ-003.1) |
| AC-003 | IntellectualHonestyFields, Disagreement が定義されていること | export済み (REQ-004.2) |
| AC-004 | HistoricalValidationOutput と関連interface（7種）が定義されていること | export済み (REQ-001.5) |
| AC-005 | IntegratedReport と関連interface（7種）が定義されていること | export済み (REQ-001.6, REQ-005.4) |
| AC-006 | PipelineState, PhaseStatus, PhaseName が定義されていること | export済み |
| AC-007 | PipelineHandoffEntry, PipelineHandoffType が定義されていること | export済み (REQ-008.2) |
| AC-008 | ResearchToolResult, SearchResult が定義されていること | export済み (REQ-010.1) |
| AC-009 | TypeScript strict modeでエラーが0件であること | `npx tsc --noEmit --strict` 成功 |
| AC-010 | `any`型が使用されていないこと | grep検索で0件 |

## 6. コミット方針

### コミットメッセージ形式
```
feat(pipeline): add TypeScript type definitions for 5AI debate pipeline

All data model interfaces from design.md Section 4 (4.1-4.7)
including research output, intellectual honesty, historical validation,
integrated report, pipeline state, handoff log, and research tool types.

Refs: 20260212-001-5ai-pipeline#001
```

## 7. 注意事項

### 7.1 技術的制約
- [ ] TypeScript strictモード必須
- [ ] `any`型の使用は禁止（`Record<string, unknown>` を使用すること）
- [ ] 全interfaceを `export` で公開すること
- [ ] design.md Section 4 のコードブロックを忠実に実装すること

### 7.2 品質基準
- [ ] JSDocコメント必須（各interface・typeの説明）
- [ ] フィールドの型はdesign.mdの定義を厳密に踏襲
- [ ] Union型のリテラル値は完全一致させること

### 7.3 特記事項
- このプロジェクトはプロンプト駆動のオーケストレーションシステムであり、ランタイムコードではない
- 型定義はデータ構造の契約として使用される（実行時バリデーションは不要）
- `src/pipeline/types/` ディレクトリが存在しない場合は作成すること

## 8. 完了報告フォーマット

実装完了時、以下の形式で報告:

```markdown
## 実装完了報告

### 変更ファイル
| ファイル | アクション | 行数 |
|---------|----------|------|
| `src/pipeline/types/index.ts` | Create | XXX行 |

### 検証結果
- TypeScript strict mode: エラー0件
- any型使用: 0件
- export済みinterface数: XX件
- export済みtype数: XX件

### 検証コマンド結果
```bash
npx tsc --noEmit --strict src/pipeline/types/index.ts
```

### 次のアクション
- Codexレビュー依頼
```

---
**発行日時**: 2026-02-12 16:00
**発行者**: Claude Code
