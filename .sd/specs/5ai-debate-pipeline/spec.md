# 技術設計書: 5AIエージェント議論パイプライン

## 1. 技術概要 (Technical Overview)

### 1.1 システム概要

5つの異なるAI（Claude, ChatGPT, Gemini, Grok, Perplexity）+ Codex + Claude Codeを連携させ、経営意思決定を支援する6フェーズのパイプラインシステム。

**システムの本質**: これはプロンプト駆動のオーケストレーションシステムである。従来のソフトウェアアプリケーションではなく、スラッシュコマンド（`.claude/commands/`）、プロンプトテンプレート、TypeScript型定義の組み合わせで構成される。Claude Codeがオーケストレーターとして全フェーズを駆動する。

### 1.2 6フェーズパイプライン概要

```
Phase 0: 5AI Deep Research（Chrome自動化・無料）
    ↓ phase0_research_integrated.json
Phase 1: 戦略提案（Claude API・従量課金）
    ↓ phase1_proposal.json
Phase 2: 補強分析（Codex API・従量課金）
    ↓ phase2_reinforcement.json
Phase 3: 批判・検証（Gemini API・従量課金）
    ↓ phase3_critique.json
Phase 3.5: 歴史的検証（Claude Code・ローカル・無料）
    ↓ phase3_5_historical.json
Phase 4: 統合（Claude API・従量課金）
    ↓ phase4_integrated_report.json + phase4_integrated_report.md
```

### 1.3 主要設計判断

| 判断 | 選択 | 根拠 |
|------|------|------|
| オーケストレーション方式 | Claude Codeスラッシュコマンド | 追加フレームワーク不要、既存sd003パターン活用 |
| Phase 0実行方式 | Claude in Chrome MCP | サブスク内無料、各AI Web版を直接操作 |
| Phase 3.5実行方式 | Claude Codeローカル実行 | 追加APIコストゼロ、訓練データ+リサーチツール活用 |
| データ形式 | JSON（構造化）+ Markdown（人間可読） | 機械処理と人間レビューの両立 |
| 型定義 | TypeScript interfaces | 型安全性と開発者体験 |
| リサーチツール | Brave/Tavily/Exa API | 無料枠内で収まる月数回の使用頻度 |

---

## 2. アーキテクチャ (Architecture)

### 2.1 全体アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code (Orchestrator)                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ /pipeline:*  │  │ Handoff      │  │ Pipeline State     │    │
│  │ Commands     │→ │ Logger       │  │ Manager            │    │
│  └──────┬───────┘  └──────────────┘  └────────────────────┘    │
│         │                                                        │
│  ┌──────▼────────────────────────────────────────────────────┐  │
│  │              Pipeline Orchestrator                         │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────────┐  │  │
│  │  │ Case    │ │ Template│ │ Research│ │ Intellectual  │  │  │
│  │  │ Type    │ │ Engine  │ │ Tool    │ │ Honesty       │  │  │
│  │  │ Router  │ │         │ │ Manager │ │ Validator     │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └───────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│         │              │             │              │             │
└─────────┼──────────────┼─────────────┼──────────────┼────────────┘
          │              │             │              │
    ┌─────▼─────┐  ┌────▼────┐  ┌────▼────┐  ┌─────▼─────┐
    │  Phase 0  │  │ Phase 1 │  │ Phase 2 │  │ Phase 3   │
    │  Chrome   │  │ Claude  │  │ Codex   │  │ Gemini    │
    │  MCP      │  │ API     │  │ API     │  │ API       │
    │  (5AI+    │  │         │  │         │  │           │
    │   Codex)  │  │         │  │         │  │           │
    └───────────┘  └─────────┘  └─────────┘  └───────────┘
                                                    │
                                              ┌─────▼─────┐
                                              │ Phase 3.5 │
                                              │ Claude    │
                                              │ Code      │
                                              │ (Local)   │
                                              └─────┬─────┘
                                                    │
                                              ┌─────▼─────┐
                                              │ Phase 4   │
                                              │ Claude    │
                                              │ API       │
                                              └───────────┘

    ┌───────────────────────────────────────────┐
    │         Research Tool Layer                │
    │  ┌───────┐  ┌────────┐  ┌──────┐         │
    │  │ Brave │  │ Tavily │  │ Exa  │         │
    │  │ API   │  │ API    │  │ API  │         │
    │  └───────┘  └────────┘  └──────┘         │
    └───────────────────────────────────────────┘
```

### 2.2 データフロー詳細

```
User: /pipeline:run {案件ID} typeA
         │
         ▼
┌─── Phase 0 ──────────────────────────────────────────────┐
│  Chrome MCP → ChatGPT Web → phase0_chatgpt_research.json │
│  Chrome MCP → Gemini Web  → phase0_gemini_research.json  │
│  Chrome MCP → Perplexity  → phase0_perplexity_research.json │
│  Chrome MCP → Grok Web    → phase0_grok_research.json    │
│  Chrome MCP → Claude Web  → phase0_claude_research.json  │
│  Codex CLI  → Web検索     → phase0_codex_research.json   │
│  ────────────────────────────────────────────────────     │
│  統合処理 → phase0_research_integrated.json               │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌─── Phase 1 ──────────────────────────────────────────────┐
│  入力: phase0_research_integrated.json                    │
│  処理: Claude API（戦略参謀プロンプト + 知的誠実性ルール） │
│  出力: phase1_proposal.json + phase1_proposal.md          │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌─── Phase 2 ──────────────────────────────────────────────┐
│  入力: phase1_proposal.json + phase0 技術調査             │
│  処理: Codex API（補強分析プロンプト + Tavily裏取り）      │
│  出力: phase2_reinforcement.json + phase2_reinforcement.md │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌─── Phase 3 ──────────────────────────────────────────────┐
│  入力: phase1_proposal.json + phase2_reinforcement.json   │
│  処理: Gemini API（批判者プロンプト + Brave/Exa反証検索）  │
│  出力: phase3_critique.json + phase3_critique.md          │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌─── Phase 3.5 ────────────────────────────────────────────┐
│  入力: phase1 + phase2 + phase3                           │
│  処理: Claude Code ローカル（歴史参謀 + Brave/Tavily/Exa） │
│  出力: phase3_5_historical.json + phase3_5_historical.md  │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌─── Phase 4 ──────────────────────────────────────────────┐
│  入力: Phase 0〜3.5 全出力                                │
│  処理: Claude API（統合責任者プロンプト）                   │
│  出力: phase4_integrated_report.json                      │
│       + phase4_integrated_report.md（意思決定ダッシュボード）│
└──────────────────────────────────────────────────────────┘
```

### 2.3 ディレクトリ構造

```
ta001/
├── .claude/
│   └── commands/
│       ├── pipeline-init.md           # /pipeline:init
│       ├── pipeline-research.md       # /pipeline:research
│       ├── pipeline-propose.md        # /pipeline:propose
│       ├── pipeline-reinforce.md      # /pipeline:reinforce
│       ├── pipeline-critique.md       # /pipeline:critique
│       ├── pipeline-history.md        # /pipeline:history
│       ├── pipeline-integrate.md      # /pipeline:integrate
│       ├── pipeline-run.md            # /pipeline:run
│       └── pipeline-status.md         # /pipeline:status
│
├── src/
│   └── pipeline/
│       └── types/
│           └── index.ts               # 全TypeScript型定義
│
├── templates/
│   └── pipeline/
│       ├── intellectual-honesty.md     # 知的誠実性ルール（全フェーズ共通）
│       ├── phase0/
│       │   ├── claude-research.md      # Claude Deep Research指示
│       │   ├── chatgpt-research.md     # ChatGPT Deep Research指示
│       │   ├── gemini-research.md      # Gemini Deep Research指示
│       │   ├── grok-research.md        # Grok調査指示
│       │   ├── perplexity-research.md  # Perplexityファクトチェック指示
│       │   ├── codex-research.md       # Codex技術調査指示
│       │   └── case-types/
│       │       ├── typeA-new-business.md
│       │       ├── typeB-improvement.md
│       │       ├── typeC-dx.md
│       │       └── typeD-crisis.md
│       ├── phase1/
│       │   └── proposal.md             # Phase 1 提案プロンプト
│       ├── phase2/
│       │   └── reinforcement.md        # Phase 2 補強プロンプト
│       ├── phase3/
│       │   └── critique.md             # Phase 3 批判プロンプト
│       ├── phase3_5/
│       │   └── historical.md           # Phase 3.5 歴史的検証プロンプト
│       └── phase4/
│           └── integration.md          # Phase 4 統合プロンプト
│
└── .kiro/
    ├── specs/
    │   └── 5ai-debate-pipeline/
    │       ├── spec.json
    │       ├── requirements.md
    │       ├── design.md               # 本ファイル
    │       └── tasks.md
    └── ai-coordination/
        ├── handoff/
        │   └── handoff-log.json        # 既存（拡張）
        └── workflow/
            └── research/
                └── {案件ID}/           # 案件別データ
                    ├── pipeline-state.json
                    ├── phase0_claude_research.json
                    ├── phase0_chatgpt_research.json
                    ├── phase0_gemini_research.json
                    ├── phase0_grok_research.json
                    ├── phase0_perplexity_research.json
                    ├── phase0_codex_research.json
                    ├── phase0_research_integrated.json
                    ├── phase1_proposal.json
                    ├── phase1_proposal.md
                    ├── phase2_reinforcement.json
                    ├── phase2_reinforcement.md
                    ├── phase3_critique.json
                    ├── phase3_critique.md
                    ├── phase3_5_historical.json
                    ├── phase3_5_historical.md
                    ├── phase4_integrated_report.json
                    └── phase4_integrated_report.md
```

---

## 3. コンポーネント設計 (Component Design)

### 3.1 Pipeline Orchestrator

パイプライン全体を制御するメインコントローラー。Claude Codeがスラッシュコマンドを通じて各フェーズを順次実行する。

**責務**:
- フェーズ間のデータ受け渡し
- パイプライン状態管理（pipeline-state.json）
- エラー時のリカバリー判断
- 自動チェーン実行（`/pipeline:run`時）

**処理フロー**:
```
1. pipeline-state.json を読み込み
2. 現在のフェーズを確認
3. 前フェーズの出力ファイル存在を検証
4. テンプレートエンジンでプロンプトを構築
5. 対象AIにプロンプトを送信
6. 出力をJSON + Markdownで保存
7. pipeline-state.json を更新
8. handoff-log.json にフェーズ遷移を記録
9. 次フェーズへ（/pipeline:run時は自動継続）
```

### 3.2 Chrome Automation Module (Phase 0)

Claude in Chrome MCP拡張を使用して、各AIのWeb版Deep Researchを順次操作する。

**実行順序と操作フロー**:

```
各AI共通フロー:
1. Chrome MCPでタブを開く / 既存タブに切り替え
2. ページのスナップショットを取得
3. プロンプト入力欄を特定
4. テンプレートから生成した指示を入力
5. Deep Research / 調査を起動
6. 完了を待機（ポーリング or 手動確認）
7. 結果テキストをコピー
8. ローカルファイルに保存（共通JSON形式に変換）
```

**AI別注意事項**:

| AI | URL | 操作上の注意 |
|----|-----|-------------|
| ChatGPT | chat.openai.com | Deep Researchボタンの位置がUI更新で変わる可能性 |
| Gemini | gemini.google.com | Deep Researchモードの明示的な選択が必要 |
| Perplexity | perplexity.ai | Pro Searchモードを選択 |
| Grok | x.com/i/grok | Xアカウントログイン状態が前提 |
| Claude | claude.ai | Deep Researchモードの選択 |

**エラーハンドリング**:
- タイムアウト: 10分待機後、ユーザーに手動介入を要求
- ページロード失敗: 1回リトライ後スキップ、ログに記録
- ログイン切れ: ユーザーにログイン再要求し一時停止

### 3.3 Phase 0 Research Collector

5AI + Codexのリサーチ結果を共通フォーマットに変換し、統合レポートを生成する。

**統合処理ロジック**:
```
1. 6件の個別リサーチJSONを読み込み
2. Perplexityのclaim_verificationsで他AIデータの信頼度を調整（REQ-005.1）
3. contradiction_flagsを抽出し矛盾リストを構築（REQ-005.2）
4. Codexの技術実現性をリスクフラグとして反映（REQ-005.3）
5. Grokの感情データを参考情報として付与（REQ-005.5）
6. 全AI欠落視点をblind_spotsとして記録（REQ-005.6）
7. phase0_research_integrated.json を生成
```

### 3.4 Phase 1 Proposal Generator

Claude APIを使用して、Phase 0の統合リサーチに基づく戦略提案を生成する。

**入力**: `phase0_research_integrated.json`
**処理**: Claude API呼び出し（`templates/pipeline/phase1/proposal.md` テンプレート使用）
**出力**: `phase1_proposal.json` + `phase1_proposal.md`

**プロンプト構成**:
```
[知的誠実性ルール（共通）]
+
[Phase 1専用指示]
+
[案件タイプ別コンテキスト]
+
[Phase 0統合リサーチデータ]
```

### 3.5 Phase 2 Reinforcement Analyzer

Codex APIを使用して、Phase 1提案の数字的裏付けとロジック検証を行う。

**入力**: `phase1_proposal.json` + `phase0_codex_research.json`
**処理**: Codex API呼び出し + Tavily APIでの数値データ裏取り
**出力**: `phase2_reinforcement.json` + `phase2_reinforcement.md`

**補強分析の観点**:
1. 定量データの裏付け（市場規模、成長率等）
2. 前提条件のロジック検証
3. 弱い前提の特定と代替シナリオ
4. 技術実現性の深掘り（Phase 0 Codex調査との照合）

### 3.6 Phase 3 Critic

Gemini APIを使用して、提案に対する批判的分析を行う。

**入力**: `phase1_proposal.json` + `phase2_reinforcement.json`
**処理**: Gemini API呼び出し + Brave/Exa APIでの反証事例検索
**出力**: `phase3_critique.json` + `phase3_critique.md`

**批判の3軸**:
1. 失敗シナリオの構築（最低3つ）
2. 定量的リスク評価
3. 反証の提示（具体的根拠付き）

### 3.7 Phase 3.5 Historical Validator

Claude Codeがローカルで実行する歴史的検証フェーズ。追加APIコストなし。

**入力**: `phase1_proposal.json` + `phase2_reinforcement.json` + `phase3_critique.json`
**処理**: Claude Code訓練データ知識 + Brave/Tavily/Exa APIでの裏取り
**出力**: `phase3_5_historical.json` + `phase3_5_historical.md`

**歴史参謀の検証プロセス**:
```
1. 提案の核心戦略を抽出
2. 訓練データから類似の歴史的事例を想起
3. Brave APIで企業史・倒産事例を広範検索
4. Tavily APIで構造化されたビジネス分析を取得
5. Exa APIで意味ベースの類似パターンを発見
6. 成功パターン・失敗警告・回復プレイブックを構築
7. 適用可能な歴史的戦略理論・改善哲学を選定（ポーター/アンゾフ/BCG/フォード/トヨタTPS/マスクを優先検討）
8. 時代の転換点との類似性を分析
9. history_verdict（歴史の総合判定）を下す
```

**リサーチツール使い分け**:
```
┌─ 「○○業界 倒産 原因 事例」 ──→ Brave（広範検索）
│
├─ 「企業の戦略転換レポート」 ──→ Tavily（構造化取得）
│
└─ 「この戦略に似た歴史的事例」 ──→ Exa（セマンティック検索）
```

### 3.8 Phase 4 Integrator

Claude APIを使用して、Phase 0〜3.5の全出力を統合し、意思決定ダッシュボードを生成する。

**入力**: Phase 0〜3.5の全出力ファイル
**処理**: Claude API呼び出し（全フェーズデータの統合分析）
**出力**: `phase4_integrated_report.json` + `phase4_integrated_report.md`

**統合レポートの構成**:
```
1. エグゼクティブサマリー
2. 推奨案（confidenceスコア付き）
3. 賛否両論マトリックス
4. 歴史が支持する選択肢 vs 歴史が警告する選択肢
5. リスクヒートマップ
6. 意思決定ポイント（経営者が判断すべき項目）
7. 実行ロードマップ（選択肢別）
8. 知的誠実性レポート（全フェーズの不一致・弱点集約）
```

### 3.9 Research Tool Manager

Brave/Tavily/Exa APIの抽象化レイヤー。環境変数でのAPI設定とフォールバック動作を管理する。

**設計方針**: MCPサーバーとして利用可能な場合はMCP経由、そうでない場合はClaude Codeの`WebSearch`ツールにフォールバック。

**フォールバック戦略**:
```
1. MCP経由で接続試行
2. 失敗 → REST API直接呼び出し（環境変数にキーあれば）
3. 失敗 → WebSearchツール（Claude Code組み込み）
4. 全失敗 → 訓練データの知識のみで続行（ログに警告記録）
```

### 3.10 Handoff Logger

全フェーズ遷移を`handoff-log.json`に記録する。sd003の既存形式を拡張。

**記録タイミング**:
- 各フェーズ開始時
- 各フェーズ完了時
- エラー発生時
- パイプライン完了時

### 3.11 Case Type Router

案件タイプ（A/B/C/D）に応じて適切なテンプレートを選択する。

**ルーティングロジック**:
```
入力: caseType (A | B | C | D)
  ↓
Phase 0テンプレート選択:
  → templates/pipeline/phase0/case-types/type{X}-*.md
  ↓
各AI用のリサーチ指示を案件タイプに応じて生成
```

---

## 4. データモデル (Data Models)

### 4.1 共通リサーチ出力フォーマット

```typescript
/** 全AIの共通リサーチ出力形式 (REQ-002.3) */
interface ResearchOutput {
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

interface Finding {
  category: string;
  summary: string;
  details: string;
  evidence: string[];
  confidence: number;
}

interface DataPoint {
  metric: string;
  value: string | number;
  unit: string;
  source: string;
  date: string;
}

interface Trend {
  name: string;
  direction: 'up' | 'down' | 'stable' | 'emerging';
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

interface Risk {
  category: string;
  description: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface Source {
  url: string;
  title: string;
  date: string;
  reliability: 'high' | 'medium' | 'low';
}
```

### 4.2 Perplexity固有フィールド (REQ-003)

```typescript
/** Perplexity専用の拡張フィールド */
interface PerplexityResearchOutput extends ResearchOutput {
  claim_verifications: ClaimVerification[];
  source_registry: SourceRegistryEntry[];
  contradiction_flags: ContradictionFlag[];
  data_freshness: DataFreshness;
}

interface ClaimVerification {
  claim: string;
  source_ai: string;
  verified: boolean | 'partial';
  sources: Source[];
  confidence: number;
  notes: string;
}

interface SourceRegistryEntry {
  url: string;
  title: string;
  date: string;
  reliability_score: number; // 0-1
  used_by_claims: string[];
}

interface ContradictionFlag {
  claim_a: string;
  source_a: string;
  claim_b: string;
  source_b: string;
  resolution: string;
  severity: 'critical' | 'major' | 'minor';
}

interface DataFreshness {
  oldest_source_date: string;
  newest_source_date: string;
  staleness_risk: 'high' | 'medium' | 'low';
  notes: string;
}
```

### 4.3 知的誠実性フィールド (REQ-004)

```typescript
/** 全フェーズ（Phase 1〜4）の出力に必須のフィールド */
interface IntellectualHonestyFields {
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

interface Disagreement {
  target_claim: string;
  target_phase: string;
  alternative_view: string;
  evidence: string[];
  confidence_in_alternative: number;
}
```

### 4.4 歴史的検証出力 (REQ-001.5)

```typescript
/** Phase 3.5 歴史的検証の出力構造 */
interface HistoricalValidationOutput extends IntellectualHonestyFields {
  historical_parallels: HistoricalParallel[];
  success_patterns: SuccessPattern[];
  failure_warnings: FailureWarning[];
  recovery_playbooks: RecoveryPlaybook[];
  strategic_frameworks: StrategicFramework[];
  era_similarity: EraSimilarity;
  history_verdict: HistoryVerdict;
}

interface HistoricalParallel {
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

interface SuccessPattern {
  pattern_name: string;
  examples: string[];
  key_factors: string[];
  applicability_to_proposal: string;
  confidence: number;
}

interface FailureWarning {
  warning: string;
  historical_examples: string[];
  fatal_factor: string;
  proposal_risk_level: 'high' | 'medium' | 'low';
  mitigation_suggestion: string;
}

interface RecoveryPlaybook {
  scenario: string;
  historical_recovery: string;
  turning_point: string;
  steps: string[];
  timeline: string;
}

interface StrategicFramework {
  name: string; // e.g., "ポーターの競争戦略", "アンゾフの成長マトリックス", "BCG PPM", "フォードの改善", "トヨタTPS", "マスクの第一原理", "孫子の兵法"
  author: string;
  era: string;
  applicable_principle: string;
  application_to_proposal: string;
}

interface EraSimilarity {
  current_era_characteristics: string[];
  most_similar_historical_era: string;
  similarity_score: number; // 0-1
  key_parallels: string[];
  key_differences: string[];
}

interface HistoryVerdict {
  judgment: 'support' | 'caution' | 'against';
  confidence: number;
  rationale: string;
  historical_success_rate: string; // e.g., "類似戦略の歴史的成功率: 約40%"
  do_list: string[];
  dont_list: string[];
}
```

### 4.5 統合レポート構造 (REQ-001.6 + REQ-005.4)

```typescript
/** Phase 4 最終統合レポートの構造 */
interface IntegratedReport extends IntellectualHonestyFields {
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

interface Recommendation {
  option: string;
  confidence: number; // 0-1
  rationale: string;
  risks: string[];
  history_support: 'strong' | 'moderate' | 'weak' | 'against';
  timeline: string;
  estimated_cost: string;
}

interface ProConMatrix {
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

interface RiskHeatmapEntry {
  risk: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  source_phase: string;
  mitigation: string;
}

interface DecisionPoint {
  question: string;
  options: string[];
  recommended: string;
  rationale: string;
  deadline: string;
}

interface ExecutionRoadmap {
  option_name: string;
  phases: {
    phase: string;
    duration: string;
    key_actions: string[];
    milestones: string[];
    budget: string;
  }[];
}

interface HonestySummary {
  total_disagreements: number;
  unresolved_contradictions: string[];
  weakest_assumptions: string[];
  areas_of_consensus: string[];
  confidence_range: { min: number; max: number };
}

interface ResearchIntegration {
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

### 4.6 パイプライン状態管理

```typescript
/** パイプラインの実行状態を追跡 */
interface PipelineState {
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

type PhaseName =
  | 'phase0'
  | 'phase1'
  | 'phase2'
  | 'phase3'
  | 'phase3_5'
  | 'phase4';

interface PhaseStatus {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at: string | null;
  completed_at: string | null;
  output_files: string[];
  error: string | null;
}
```

### 4.7 ハンドオフログエントリ (REQ-008.2)

```typescript
/** パイプライン用ハンドオフログエントリ */
interface PipelineHandoffEntry {
  timestamp: string;
  type: PipelineHandoffType;
  project_id: string;
  from: string;
  to: string;
  file: string;
  phase: PhaseName;
  note: string;
}

type PipelineHandoffType =
  | 'phase0_research_start'
  | 'phase0_research_complete'
  | 'phase1_proposal'
  | 'phase2_reinforcement'
  | 'phase3_critique'
  | 'phase3_5_historical'
  | 'phase4_integration'
  | 'pipeline_complete';
```

---

## 5. コマンド設計 (Command Design)

### 5.1 コマンド一覧と配置

| コマンド | ファイル | 説明 |
|---------|--------|------|
| `/pipeline:init {slug}` | `.claude/commands/pipeline-init.md` | 案件初期化 |
| `/pipeline:research {案件ID} {type}` | `.claude/commands/pipeline-research.md` | Phase 0実行 |
| `/pipeline:propose {案件ID}` | `.claude/commands/pipeline-propose.md` | Phase 1実行 |
| `/pipeline:reinforce {案件ID}` | `.claude/commands/pipeline-reinforce.md` | Phase 2実行 |
| `/pipeline:critique {案件ID}` | `.claude/commands/pipeline-critique.md` | Phase 3実行 |
| `/pipeline:history {案件ID}` | `.claude/commands/pipeline-history.md` | Phase 3.5実行 |
| `/pipeline:integrate {案件ID}` | `.claude/commands/pipeline-integrate.md` | Phase 4実行 |
| `/pipeline:run {案件ID} {type}` | `.claude/commands/pipeline-run.md` | 全フェーズ一括 |
| `/pipeline:status {案件ID}` | `.claude/commands/pipeline-status.md` | 進捗確認 |

### 5.2 コマンド構造（共通パターン）

各コマンドファイルの構造:

```markdown
# /pipeline:{phase} コマンド

## 前提条件チェック
1. pipeline-state.json の存在確認
2. 前フェーズの完了確認
3. 必要ファイルの存在確認

## テンプレート読み込み
1. 知的誠実性ルール（共通）読み込み
2. フェーズ専用テンプレート読み込み
3. 案件タイプ別テンプレート読み込み（該当フェーズのみ）

## 実行手順
1. 入力データの読み込み
2. プロンプト構築（テンプレート + データ）
3. AI呼び出し / ローカル処理
4. 出力のJSON + Markdown保存
5. pipeline-state.json 更新
6. handoff-log.json 記録

## 完了報告
- 出力ファイルパス
- 次フェーズの案内
```

### 5.3 `/pipeline:init` 詳細設計

```markdown
入力: slug（案件の短縮名）
処理:
  1. 案件ID生成: YYYYMMDD-NNN-{slug}
  2. ディレクトリ作成: .kiro/ai-coordination/workflow/research/{案件ID}/
  3. pipeline-state.json 初期化
  4. handoff-log.json にinit記録
出力: 案件ID + 作業ディレクトリパスの表示
```

### 5.4 `/pipeline:run` 自動チェーン設計

```markdown
入力: 案件ID, caseType (A|B|C|D)
処理:
  1. /pipeline:research 実行 → 完了待ち
  2. /pipeline:propose 実行 → 完了待ち
  3. /pipeline:reinforce 実行 → 完了待ち
  4. /pipeline:critique 実行 → 完了待ち
  5. /pipeline:history 実行 → 完了待ち
  6. /pipeline:integrate 実行 → 完了待ち
  7. 全フェーズ完了 → pipeline_complete 記録
エラー時:
  - フェーズ失敗 → pipeline-state.jsonにエラー記録
  - ユーザーに失敗フェーズと原因を報告
  - /pipeline:status で確認 → 失敗フェーズから再開可能
```

### 5.5 自動チェーンルール

sd003の自動連鎖ルールを踏襲し、パイプライン版を定義する。

| トリガー | 自動実行 | 説明 |
|---------|---------|------|
| `/pipeline:run` 開始 | → Phase 0〜4の順次自動実行 | 一括実行モード |
| Phase 0完了 | → Phase 1自動開始（runモード時） | 統合レポート完成後 |
| Phase 1完了 | → Phase 2自動開始（runモード時） | 提案書完成後 |
| Phase 2完了 | → Phase 3自動開始（runモード時） | 補強レポート完成後 |
| Phase 3完了 | → Phase 3.5自動開始（runモード時） | 批判レポート完成後 |
| Phase 3.5完了 | → Phase 4自動開始（runモード時） | 歴史的検証完成後 |

**個別実行時（`/pipeline:propose`等）は自動チェーンしない**。完了報告と次フェーズの案内のみ。

---

## 6. プロンプトテンプレート設計 (Prompt Template Design)

### 6.1 テンプレート構造

全フェーズ共通のテンプレート合成パターン:

```
[知的誠実性ルール] ← templates/pipeline/intellectual-honesty.md
        +
[フェーズ専用指示] ← templates/pipeline/phase{N}/{name}.md
        +
[案件タイプ別指示] ← templates/pipeline/phase0/case-types/type{X}-*.md（Phase 0のみ）
        +
[入力データ]       ← .kiro/ai-coordination/workflow/research/{案件ID}/phase{N-1}_*.json
```

### 6.2 知的誠実性ルール（全フェーズ共通）

`templates/pipeline/intellectual-honesty.md`:

```markdown
## 知的誠実性ルール（最上位規範）

以下の4原則は、あなたの出力における絶対的な行動規範です。
これらに違反する出力は、パイプライン全体の信頼性を損ないます。

### 原則1: 同意の前に弱点を特定せよ
前のエージェントの主張に同意する前に、最も弱い点を特定してください。
弱点を1つも見つけられないなら、自分の理解が浅い可能性を疑ってください。

### 原則2: 「妥当」は結論であり出発点ではない
検証なしの「妥当」は出力禁止です。
「妥当である」は検証プロセスの結果としてのみ許されます。

### 原則3: 迎合は合意ではない
前のエージェントの結論をそのまま追認することは「迎合」です。
独自検証を経ていない同意はパイプラインに価値を追加しません。

### 原則4: 早すぎる収束は思考の放棄
議論の早期段階で結論に収束することを禁止します。
各フェーズは前フェーズの結論を「仮説」として扱い、反証可能性を常に保持してください。

### 必須出力フィールド
以下の3フィールドを必ず出力に含めてください:
- `weakest_point_identified`: 前フェーズの最も弱い主張
- `disagreements[]`: 前フェーズと異なる見解（ゼロの場合は理由を明記）
- `verification_method`: 各claimの検証方法の説明
```

### 6.3 フェーズ別テンプレート概要

| テンプレート | 主な指示内容 |
|-------------|-------------|
| `phase1/proposal.md` | 戦略参謀としてビジョンと選択肢を構築。複数案提示。Codex技術実現性の反映義務 |
| `phase2/reinforcement.md` | 分析官として数字の裏付け。弱い前提の特定。Web検索での裏取り指示 |
| `phase3/critique.md` | 批判者として失敗シナリオ構築（3つ以上）。定量的リスク評価。反証提示 |
| `phase3_5/historical.md` | 歴史参謀として古今東西の事例照合。6つの検証観点。行動規範5か条 |
| `phase4/integration.md` | 統合責任者として全フェーズ統合。賛否両論公平。confidenceスコア付き推奨案 |

### 6.4 案件タイプ別テンプレート（Phase 0用）

各テンプレートはREQ-006の指示表をAI別に展開:

| テンプレート | 対象 |
|-------------|------|
| `typeA-new-business.md` | 新規サービス・新規事業 |
| `typeB-improvement.md` | 既存事業の改善・収益性向上 |
| `typeC-dx.md` | DX・業務改革 |
| `typeD-crisis.md` | リスク・危機対応 |

各テンプレート内にAI別セクション（Claude/ChatGPT/Gemini/Grok/Perplexity/Codex）を含む。

---

## 7. リサーチツール統合 (Research Tool Integration)

### 7.1 API抽象化レイヤー

```typescript
/** リサーチツール統合の抽象インターフェース */
interface ResearchToolResult {
  tool: 'brave' | 'tavily' | 'exa' | 'websearch';
  query: string;
  timestamp: string;
  results: SearchResult[];
  total_results: number;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date: string | null;
  relevance_score: number;
}
```

### 7.2 MCP統合戦略

```
利用可能性チェック（起動時）:
  1. Brave MCP Server → 利用可能? → 直接使用
  2. Tavily MCP Server → 利用可能? → 直接使用
  3. Exa MCP Server → 利用可能? → 直接使用
  4. いずれも未設定 → WebSearchツール（組み込み）で代替
```

**環境変数設定**:
```
BRAVE_API_KEY=brv_xxxxx
TAVILY_API_KEY=tvly_xxxxx
EXA_API_KEY=exa_xxxxx
```

### 7.3 フォールバック動作

```
APIキー設定状態に応じた動作:

全キー設定済み:
  → 各ツールを使い分けルール（REQ-010.3）に従い使用

一部キー未設定:
  → 設定済みツールのみ使用、未設定分はWebSearchで代替
  → ログに「{ツール名} APIキー未設定、WebSearchで代替」を記録

全キー未設定:
  → WebSearchツール（Claude Code組み込み）で全検索を実行
  → ログに警告「全リサーチツールAPIキー未設定」を記録
  → パイプライン自体は停止しない（Graceful Degradation）
```

### 7.4 フェーズ別ツール使用マップ

| フェーズ | Brave | Tavily | Exa | 用途 |
|---------|-------|--------|-----|------|
| Phase 0 | o | o | - | 5AI Deep Researchの補完 |
| Phase 2 | - | o | - | 数値データ・統計の裏取り |
| Phase 3 | o | - | o | 反証事例・失敗事例の検索 |
| Phase 3.5 | o | o | o | 歴史的検証の裏取り（全3ツール） |

### 7.5 出力正規化

各ツールの検索結果はResearchOutput（REQ-002.3）の`sources[]`および`data_points[]`に変換して統合する。

---

## 8. エラーハンドリング (Error Handling)

### 8.1 フェーズ別エラー戦略

| フェーズ | エラー種別 | 対応 |
|---------|-----------|------|
| Phase 0 | Chrome操作失敗 | 1回リトライ → スキップ（該当AI分のみ） |
| Phase 0 | AI応答タイムアウト | 10分待機 → ユーザーに手動介入要求 |
| Phase 0 | ログイン切れ | 一時停止、ユーザーにログイン再要求 |
| Phase 1-4 | API呼び出し失敗 | 3回リトライ（exponential backoff） |
| Phase 1-4 | レート制限 | 待機してリトライ（Retry-After準拠） |
| Phase 3.5 | リサーチツールAPI失敗 | フォールバック（7.3参照） |
| 全フェーズ | 出力フォーマット不正 | パース試行 → 失敗時はraw保存 + 警告 |

### 8.2 部分完了ハンドリング

Phase 0で一部AIがスキップされた場合:
```
1. 取得済みの結果のみで統合レポートを生成
2. 統合レポートの research_quality.coverage_score を下方修正
3. blind_spots にスキップされたAIの担当領域を追加
4. pipeline-state.json にスキップ情報を記録
5. Phase 1以降は正常に続行
```

### 8.3 フェーズ失敗からの再開

```
1. /pipeline:status {案件ID} で状態確認
2. 失敗フェーズのエラー内容を確認
3. 原因を解消（API設定、ログイン等）
4. /pipeline:{失敗フェーズ} {案件ID} で再実行
5. 成功後、/pipeline:run で残りを一括実行も可
```

### 8.4 リトライ戦略

```
API呼び出しリトライ:
  1回目: 即座にリトライ
  2回目: 5秒待機後リトライ
  3回目: 15秒待機後リトライ
  全失敗: エラーを pipeline-state.json に記録し停止
```

---

## 9. ファイル構成 (File Structure)

### 9.1 新規作成ファイル一覧

**コマンドファイル** (9件):
```
.claude/commands/
├── pipeline-init.md
├── pipeline-research.md
├── pipeline-propose.md
├── pipeline-reinforce.md
├── pipeline-critique.md
├── pipeline-history.md
├── pipeline-integrate.md
├── pipeline-run.md
└── pipeline-status.md
```

**プロンプトテンプレート** (13件):
```
templates/pipeline/
├── intellectual-honesty.md
├── phase0/
│   ├── claude-research.md
│   ├── chatgpt-research.md
│   ├── gemini-research.md
│   ├── grok-research.md
│   ├── perplexity-research.md
│   ├── codex-research.md
│   └── case-types/
│       ├── typeA-new-business.md
│       ├── typeB-improvement.md
│       ├── typeC-dx.md
│       └── typeD-crisis.md
├── phase1/
│   └── proposal.md
├── phase2/
│   └── reinforcement.md
├── phase3/
│   └── critique.md
├── phase3_5/
│   └── historical.md
└── phase4/
    └── integration.md
```

**TypeScript型定義** (1件):
```
src/pipeline/types/
└── index.ts
```

**合計**: 23件の新規ファイル

---

## 10. 要件トレーサビリティ (Requirements Traceability)

| 要件ID | 設計コンポーネント | 実装箇所 |
|--------|------------------|---------|
| REQ-001.1 | Phase 0 Research Collector + Chrome Automation Module | `pipeline-research.md`, `templates/pipeline/phase0/` |
| REQ-001.2 | Phase 1 Proposal Generator | `pipeline-propose.md`, `templates/pipeline/phase1/` |
| REQ-001.3 | Phase 2 Reinforcement Analyzer | `pipeline-reinforce.md`, `templates/pipeline/phase2/` |
| REQ-001.4 | Phase 3 Critic | `pipeline-critique.md`, `templates/pipeline/phase3/` |
| REQ-001.5 | Phase 3.5 Historical Validator | `pipeline-history.md`, `templates/pipeline/phase3_5/` |
| REQ-001.6 | Phase 4 Integrator | `pipeline-integrate.md`, `templates/pipeline/phase4/` |
| REQ-002.1 | Chrome Automation Module | `pipeline-research.md`内のChrome MCPフロー |
| REQ-002.2 | Pipeline Orchestrator（ファイル配置） | `pipeline-state.json`, 案件ディレクトリ構造 |
| REQ-002.3 | ResearchOutput型定義 | `src/pipeline/types/index.ts` |
| REQ-003.1 | PerplexityResearchOutput型定義 | `src/pipeline/types/index.ts` |
| REQ-004.1 | 知的誠実性テンプレート | `templates/pipeline/intellectual-honesty.md` |
| REQ-004.2 | IntellectualHonestyFields型定義 | `src/pipeline/types/index.ts` |
| REQ-005.1-6 | Phase 0統合処理ロジック（Research Collector内） | `pipeline-research.md`統合ステップ |
| REQ-006.1-4 | Case Type Router + 案件タイプ別テンプレート | `templates/pipeline/phase0/case-types/` |
| REQ-007.1-2 | アーキテクチャ設計（Phase別AI/API割り当て） | 全体アーキテクチャ（セクション2） |
| REQ-008.1 | Pipeline Orchestrator（案件管理） | `pipeline-init.md`, `pipeline-state.json` |
| REQ-008.2 | Handoff Logger | `handoff-log.json`拡張、PipelineHandoffType型 |
| REQ-008.3 | コマンド設計（セクション5） | `.claude/commands/pipeline-*.md` |
| REQ-009.1 | 情報カバレッジ（全AI+Codex+Claude Code配置） | Phase 0〜3.5の全AI役割設計 |
| REQ-010.1-5 | Research Tool Manager | セクション7（リサーチツール統合） |
| REQ-NF-001 | `/pipeline:run`のフェーズスキップ対応 | pipeline-state.jsonのskippedステータス |
| REQ-NF-002 | Chrome Automation（操作者ブラウザ前提） | Phase 0設計（Chrome MCP操作フロー） |
| REQ-NF-003 | Pipeline Orchestrator（全中間ファイル保持） | 案件ディレクトリ構造（削除しない設計） |

---

## 付録

### A. コスト見積もり（1回のパイプライン実行あたり）

| フェーズ | AI/ツール | 推定コスト |
|---------|----------|-----------|
| Phase 0 | 5AI Web版 + Codex CLI | $0〜$0.50（Codex微小） |
| Phase 0補助 | Brave + Tavily | 無料枠内 |
| Phase 1 | Claude API | $0.50〜$2.00 |
| Phase 2 | Codex API + Tavily | $0.30〜$1.00 |
| Phase 3 | Gemini API + Brave + Exa | $0.30〜$1.00 |
| Phase 3.5 | Claude Code + Brave/Tavily/Exa | 無料枠内 |
| Phase 4 | Claude API | $0.50〜$2.00 |
| **合計** | | **$1.60〜$6.50** |

### B. 実行時間見積もり

| フェーズ | 推定時間 | ボトルネック |
|---------|---------|-------------|
| Phase 0 | 30〜60分 | 各AIのDeep Research完了待ち |
| Phase 1 | 2〜5分 | Claude API応答 |
| Phase 2 | 2〜5分 | Codex API応答 + Tavily検索 |
| Phase 3 | 2〜5分 | Gemini API応答 + Brave/Exa検索 |
| Phase 3.5 | 5〜15分 | Brave/Tavily/Exa検索 + 分析 |
| Phase 4 | 3〜8分 | Claude API応答（大量データ統合） |
| **合計** | **45〜100分** | Phase 0がドミナント |

---

設計書バージョン: 1.0.0
作成日: 2026-02-12
要件定義書バージョン: requirements.md (approved 2026-02-12)
