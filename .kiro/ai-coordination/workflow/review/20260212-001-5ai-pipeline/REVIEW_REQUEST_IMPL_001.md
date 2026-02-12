# コードレビュー依頼: 5AI議論パイプライン 全実装

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| レビュー種別 | IMPL（全15タスク一括レビュー） |
| 発行日時 | 2026-02-12 17:30 |
| 発行者 | Claude Code |
| 宛先 | Codex |
| 実装者 | Gemini CLI |
| 対象コミット | `7604b1c1` |
| 対象ブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |
| ステータス | Pending |

---

## 1. レビュー対象の概要

### 1.1 プロジェクト概要
5つの異なるAI（Claude, ChatGPT, Gemini, Grok, Perplexity）+ Codex + Claude Codeを連携させ、経営意思決定を支援する6フェーズの議論パイプラインシステム。プロンプト駆動のオーケストレーションシステムであり、従来のアプリケーションではない。

### 1.2 実装概要（全15タスク）

| グループ | タスク | 内容 |
|---------|--------|------|
| Group 1: 基盤 | Task 1.1 | TypeScript型定義（`src/pipeline/types/index.ts`） |
| | Task 1.2 | 知的誠実性ルールテンプレート |
| Group 2: コマンド基盤 | Task 2.1 | `/pipeline:init` コマンド |
| | Task 2.2 | `/pipeline:status` コマンド |
| | Task 2.3 | `/pipeline:run` 自動チェーンコマンド |
| Group 3: フェーズ別 | Task 3.1 | Phase 0 リサーチ（5AI + Codex） |
| | Task 3.2 | Phase 0 案件タイプ別テンプレート（A/B/C/D） |
| | Task 3.3 | Phase 1 提案（Claude API） |
| | Task 3.4 | Phase 2 補強（Codex API + Tavily） |
| | Task 3.5 | Phase 3 批判（Gemini API + Brave/Exa） |
| | Task 3.6 | Phase 3.5 歴史的検証（Claude Code + 全3ツール） |
| | Task 3.7 | Phase 4 統合（Claude API） |
| Group 4: 統合 | Task 4.1 | handoff-log.json パイプライン拡張 |
| | Task 4.2 | E2E動作検証（ファイル配置確認済み） |
| | Task 4.3 | リサーチツールフォールバック確認 |

---

## 2. レビュー対象ファイル一覧

### 2.1 TypeScript型定義（1件）
| ファイル | 行数（概算） | 対応REQ |
|---------|------------|---------|
| `src/pipeline/types/index.ts` | ~300行 | REQ-002.3, REQ-003.1, REQ-004.2, REQ-001.5, REQ-001.6, REQ-008.2, REQ-010.1 |

### 2.2 スラッシュコマンド（9件）
| ファイル | 対応フェーズ | 対応REQ |
|---------|------------|---------|
| `.claude/commands/pipeline-init.md` | 初期化 | REQ-008.1 |
| `.claude/commands/pipeline-status.md` | 状態確認 | REQ-008.3 |
| `.claude/commands/pipeline-run.md` | 一括実行 | REQ-008.3, REQ-NF-001 |
| `.claude/commands/pipeline-research.md` | Phase 0 | REQ-001.1, REQ-002.1, REQ-005.1-6 |
| `.claude/commands/pipeline-propose.md` | Phase 1 | REQ-001.2 |
| `.claude/commands/pipeline-reinforce.md` | Phase 2 | REQ-001.3 |
| `.claude/commands/pipeline-critique.md` | Phase 3 | REQ-001.4 |
| `.claude/commands/pipeline-history.md` | Phase 3.5 | REQ-001.5 |
| `.claude/commands/pipeline-integrate.md` | Phase 4 | REQ-001.6 |

### 2.3 プロンプトテンプレート（17件）
| ファイル | 用途 | 対応REQ |
|---------|------|---------|
| `templates/pipeline/intellectual-honesty.md` | 知的誠実性ルール（全フェーズ共通） | REQ-004.1 |
| `templates/pipeline/phase0/claude-research.md` | Claude Deep Research指示 | REQ-001.1 |
| `templates/pipeline/phase0/chatgpt-research.md` | ChatGPT Deep Research指示 | REQ-001.1 |
| `templates/pipeline/phase0/gemini-research.md` | Gemini Deep Research指示 | REQ-001.1 |
| `templates/pipeline/phase0/grok-research.md` | Grok調査指示 | REQ-001.1 |
| `templates/pipeline/phase0/perplexity-research.md` | Perplexityファクトチェック | REQ-003.1 |
| `templates/pipeline/phase0/codex-research.md` | Codex技術調査 | REQ-001.1 |
| `templates/pipeline/phase0/case-types/typeA-new-business.md` | 新規事業 | REQ-006.1 |
| `templates/pipeline/phase0/case-types/typeB-improvement.md` | 既存改善 | REQ-006.2 |
| `templates/pipeline/phase0/case-types/typeC-dx.md` | DX | REQ-006.3 |
| `templates/pipeline/phase0/case-types/typeD-crisis.md` | 危機対応 | REQ-006.4 |
| `templates/pipeline/phase1/proposal.md` | 戦略提案プロンプト | REQ-001.2, REQ-004.1 |
| `templates/pipeline/phase2/reinforcement.md` | 補強分析プロンプト | REQ-001.3, REQ-004.1 |
| `templates/pipeline/phase3/critique.md` | 批判・検証プロンプト | REQ-001.4, REQ-004.1 |
| `templates/pipeline/phase3_5/historical.md` | 歴史的検証プロンプト | REQ-001.5, REQ-004.1 |
| `templates/pipeline/phase4/integration.md` | 統合プロンプト | REQ-001.6, REQ-004.1 |

---

## 3. レビュー観点（重点確認項目）

### 3.1 仕様適合性（最重要）
以下の仕様書との一致を確認:
- **要件定義書**: `.kiro/specs/5ai-debate-pipeline/requirements.md`
- **技術設計書**: `.kiro/specs/5ai-debate-pipeline/design.md`
- **実装タスク**: `.kiro/specs/5ai-debate-pipeline/tasks.md`
- **実装指示書**: `.kiro/ai-coordination/workflow/spec/20260212-001-5ai-pipeline/IMPLEMENT_REQUEST_001〜015.md`

### 3.2 TypeScript型定義の完全性
- [ ] design.md Section 4 の全interface（30+）が定義されているか
- [ ] ResearchOutput, PerplexityResearchOutput, IntellectualHonestyFields が正確か
- [ ] HistoricalValidationOutput に歴史参謀固有フィールドが全て含まれるか
- [ ] IntegratedReport に統合レポート8構成要素が反映されるか
- [ ] PipelineState, PipelineHandoffEntry が設計通りか
- [ ] `any`型が使用されていないか（品質基準違反）
- [ ] TypeScript strict mode準拠か

### 3.3 知的誠実性ルールの一貫性
- [ ] `intellectual-honesty.md`に4原則が正確に記述されているか
- [ ] 4原則: 同意前弱点特定 / 「妥当」禁止 / 迎合排除 / 早すぎる収束禁止
- [ ] 必須出力フィールド（weakest_point_identified, disagreements[], verification_method）の指示があるか
- [ ] Phase 1〜4の各テンプレートが知的誠実性ルールを組み込んでいるか

### 3.4 Phase 0 Chrome自動化フローの設計品質
- [ ] 各AI（ChatGPT/Gemini/Perplexity/Grok/Claude）のリサーチテンプレートが存在するか
- [ ] Chrome MCP操作フロー（タブ操作→入力→起動→待機→取得→保存）が定義されているか
- [ ] Perplexityのclaim_verifications, contradiction_flags, data_freshnessが指示されているか
- [ ] エラーハンドリング（タイムアウト、ページロード失敗、ログイン切れ）が定義されているか
- [ ] 統合処理ロジック（信頼度調整、矛盾検出、技術実現性反映、死角チェック）があるか

### 3.5 Phase 3.5 歴史参謀の品質（パイプライン差別化要素）
- [ ] 6つの検証観点が含まれているか（大成企業/失敗企業/回復企業/戦略理論/時代転換点/落とし穴）
- [ ] 行動規範5か条が含まれているか
- [ ] 優先戦略フレームワーク: **ポーター**（Five Forces + コスト/差別化/ニッチ）、**アンゾフ**、**BCG PPM**
- [ ] 改善哲学: **ヘンリー・フォード**、**トヨタTPS**（カイゼン/JIT/自働化/なぜなぜ5回）、**イーロン・マスク**（第一原理）
- [ ] Brave/Tavily/Exa全3ツールの使い分けが指示されているか
- [ ] 成功事例3件以上 + 失敗事例3件以上の出力要求があるか
- [ ] history_verdictの出力構造（judgment/confidence/rationale/do_list/dont_list）があるか

### 3.6 リサーチツール統合
- [ ] 4段階フォールバック: MCP → REST API → WebSearch → 訓練データのみ
- [ ] フェーズ別ツール使用マップ（Phase 0: Brave+Tavily, Phase 2: Tavily, Phase 3: Brave+Exa, Phase 3.5: 全3ツール）
- [ ] Graceful Degradation: 全APIキー未設定でもパイプライン停止しない設計か

### 3.7 コマンド間整合性
- [ ] `/pipeline:init`が案件ID（YYYYMMDD-NNN-slug）を正しく生成する設計か
- [ ] `/pipeline:run`の自動チェーンルール（Phase完了→次Phase自動開始）が正しいか
- [ ] `/pipeline:status`がpipeline-state.jsonを正しく読み込み表示する設計か
- [ ] 各フェーズコマンドが前フェーズの完了を前提条件としてチェックする設計か
- [ ] 全コマンドがpipeline-state.jsonとhandoff-log.jsonを更新する設計か

### 3.8 案件タイプ別テンプレート（Phase 0用）
- [ ] 4タイプ（A: 新規事業, B: 改善, C: DX, D: 危機対応）のテンプレートが存在するか
- [ ] 各テンプレートに6AI別（Claude/ChatGPT/Gemini/Grok/Perplexity/Codex）のリサーチ指示があるか
- [ ] REQ-006.1〜006.4の指示表が正確に反映されているか

---

## 4. レビュー手順

### Step 1: TypeScript型定義の検証
```bash
# src/pipeline/types/index.ts を読み込み
# design.md Section 4 との照合
```

### Step 2: 知的誠実性ルールの検証
```bash
# templates/pipeline/intellectual-honesty.md を読み込み
# 4原則 + 必須出力フィールドの確認
# Phase 1-4テンプレートでのインクルード確認
```

### Step 3: コマンドファイルの検証
```bash
# .claude/commands/pipeline-*.md を順次読み込み
# design.md Section 5 との照合
# コマンド間の整合性確認
```

### Step 4: フェーズ別テンプレートの検証
```bash
# templates/pipeline/phase{N}/*.md を順次読み込み
# 各フェーズの入出力仕様との照合
# 知的誠実性ルールの組み込み確認
```

### Step 5: 要件トレーサビリティの検証
```bash
# REQ-001〜REQ-010、REQ-NF-001〜003
# 全要件が実装でカバーされているか確認
```

---

## 5. 参照ドキュメント

| ドキュメント | パス | 用途 |
|-------------|------|------|
| 要件定義書 | `.kiro/specs/5ai-debate-pipeline/requirements.md` | 機能要件の照合 |
| 技術設計書 | `.kiro/specs/5ai-debate-pipeline/design.md` | アーキテクチャ・データモデルの照合 |
| 実装タスク | `.kiro/specs/5ai-debate-pipeline/tasks.md` | 受入基準の照合 |
| 実装指示書 | `.kiro/ai-coordination/workflow/spec/20260212-001-5ai-pipeline/IMPLEMENT_REQUEST_*.md` | 個別タスク仕様の照合 |
| REVIEW_REPORTテンプレート | `.kiro/ai-coordination/workflow/templates/REVIEW_REPORT.md` | レビュー結果の出力形式 |

---

## 6. 出力形式

レビュー結果は以下のファイルに出力してください:

```
.kiro/ai-coordination/workflow/review/20260212-001-5ai-pipeline/REVIEW_IMPL_001.md
```

REVIEW_REPORTテンプレート（`.kiro/ai-coordination/workflow/templates/REVIEW_REPORT.md`）に従って記述してください。

### 判定基準
| 判定 | 条件 |
|------|------|
| Approve | Must指摘0件、全重点確認項目Pass |
| Request Changes | Must指摘あり、または重点確認項目にFail |
| Reject | 設計根本問題、または要件との重大な乖離 |

---

**発行日時**: 2026-02-12 17:30
**発行者**: Claude Code
