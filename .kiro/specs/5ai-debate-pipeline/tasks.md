# Implementation Tasks: 5AIエージェント議論パイプライン

## Task Group 1: 基盤構築（型定義・共通テンプレート）

パイプライン全体の型定義と、全フェーズで共有されるテンプレートを整備する。
他の全タスクグループの前提となる基盤レイヤー。

### Task 1.1: TypeScript型定義の作成
- **Priority**: P0
- **Estimated effort**: L
- **Dependencies**: なし
- **Files to create/modify**:
  - `src/pipeline/types/index.ts` - 全データモデル（design.md Section 4の全interface）
- **Acceptance criteria**:
  - [ ] ResearchOutput, Finding, DataPoint, Trend, Risk, Source が定義されていること (REQ-002.3)
  - [ ] PerplexityResearchOutput（ClaimVerification, SourceRegistryEntry, ContradictionFlag, DataFreshness含む）が定義されていること (REQ-003.1)
  - [ ] IntellectualHonestyFields, Disagreement が定義されていること (REQ-004.2)
  - [ ] HistoricalValidationOutput と関連interface（HistoricalParallel, SuccessPattern, FailureWarning, RecoveryPlaybook, StrategicFramework, EraSimilarity, HistoryVerdict）が定義されていること (REQ-001.5)
  - [ ] IntegratedReport と関連interface（Recommendation, ProConMatrix, RiskHeatmapEntry, DecisionPoint, ExecutionRoadmap, HonestySummary, ResearchIntegration）が定義されていること (REQ-001.6, REQ-005.4)
  - [ ] PipelineState, PhaseStatus, PhaseName が定義されていること
  - [ ] PipelineHandoffEntry, PipelineHandoffType が定義されていること (REQ-008.2)
  - [ ] ResearchToolResult, SearchResult が定義されていること (REQ-010.1)
  - [ ] TypeScript strict modeでエラーが0件であること
- **Implementation notes**:
  - design.md Section 4のコードブロックをそのまま型定義として実装
  - `any`型の使用は禁止（品質基準準拠）
  - exportで全interfaceを公開

### Task 1.2: 知的誠実性ルール共通テンプレート作成
- **Priority**: P0
- **Estimated effort**: M
- **Dependencies**: なし
- **Files to create/modify**:
  - `templates/pipeline/intellectual-honesty.md` - 4原則 + 必須出力フィールド指示
- **Acceptance criteria**:
  - [ ] 4原則（同意前弱点特定、「妥当」禁止、迎合排除、早すぎる収束禁止）が記述されていること (REQ-004.1)
  - [ ] 必須出力フィールド（weakest_point_identified, disagreements[], verification_method）の指示が含まれること (REQ-004.2)
  - [ ] Phase 1〜4の全プロンプトに組み込み可能な形式であること
- **Implementation notes**:
  - design.md Section 6.2のテンプレート内容を基に作成
  - 各フェーズのテンプレートから`{include:intellectual-honesty.md}`的にインクルードされる想定

---

## Task Group 2: コマンド基盤（init / status / run）

パイプラインの初期化、状態確認、一括実行の3つの管理コマンドを作成する。
個別フェーズコマンドの前提となるオーケストレーション基盤。

### Task 2.1: /pipeline:init コマンド作成
- **Priority**: P0
- **Estimated effort**: M
- **Dependencies**: Task 1.1
- **Files to create/modify**:
  - `.claude/commands/pipeline-init.md` - 案件初期化コマンド
- **Acceptance criteria**:
  - [ ] slug引数から案件ID（YYYYMMDD-NNN-slug形式）が生成されること (REQ-008.1)
  - [ ] `.kiro/ai-coordination/workflow/research/{案件ID}/` ディレクトリが作成されること
  - [ ] pipeline-state.json が初期状態で生成されること
  - [ ] handoff-log.json にinit記録が追加されること (REQ-008.2)
  - [ ] 案件IDと作業ディレクトリパスが表示されること
- **Implementation notes**:
  - design.md Section 5.3の詳細設計に準拠
  - 既存のsd003 `/workflow:init`パターンを参考にしつつ、パイプライン用に新規作成

### Task 2.2: /pipeline:status コマンド作成
- **Priority**: P0
- **Estimated effort**: S
- **Dependencies**: Task 2.1
- **Files to create/modify**:
  - `.claude/commands/pipeline-status.md` - 進捗確認コマンド
- **Acceptance criteria**:
  - [ ] pipeline-state.json を読み込み、全フェーズの状態を表形式で表示すること
  - [ ] 各フェーズのステータス（pending/running/completed/failed/skipped）が表示されること
  - [ ] 失敗フェーズのエラー内容が表示されること
  - [ ] 出力ファイルの存在確認結果が表示されること
  - [ ] リサーチツール（Brave/Tavily/Exa）の利用可否が表示されること
- **Implementation notes**:
  - design.md Section 8.3の再開フローで使用される重要コマンド

### Task 2.3: /pipeline:run コマンド作成
- **Priority**: P0
- **Estimated effort**: M
- **Dependencies**: Task 2.1, Task 3.1, Task 3.2, Task 3.3, Task 3.4, Task 3.5, Task 3.6
- **Files to create/modify**:
  - `.claude/commands/pipeline-run.md` - 全フェーズ一括実行コマンド
- **Acceptance criteria**:
  - [ ] Phase 0〜4を順次自動実行すること (REQ-008.3)
  - [ ] 各フェーズ完了後に次フェーズを自動開始すること（design.md Section 5.5 自動チェーンルール準拠）
  - [ ] フェーズ失敗時にpipeline-state.jsonにエラーを記録し停止すること
  - [ ] 失敗フェーズと原因をユーザーに報告すること
  - [ ] pipeline_complete をhandoff-log.jsonに記録すること (REQ-008.2)
- **Implementation notes**:
  - design.md Section 5.4の自動チェーン設計に準拠
  - 個別フェーズコマンドを順次呼び出す構造

---

## Task Group 3: フェーズ別コマンド + テンプレート

各フェーズ（Phase 0〜4）のコマンドとプロンプトテンプレートを作成する。
パイプラインの中核機能。

### Task 3.1: Phase 0 リサーチコマンド + テンプレート作成
- **Priority**: P0
- **Estimated effort**: XL
- **Dependencies**: Task 1.1, Task 1.2, Task 2.1
- **Files to create/modify**:
  - `.claude/commands/pipeline-research.md` - Phase 0実行コマンド
  - `templates/pipeline/phase0/claude-research.md` - Claude Deep Research指示
  - `templates/pipeline/phase0/chatgpt-research.md` - ChatGPT Deep Research指示
  - `templates/pipeline/phase0/gemini-research.md` - Gemini Deep Research指示
  - `templates/pipeline/phase0/grok-research.md` - Grok調査指示
  - `templates/pipeline/phase0/perplexity-research.md` - Perplexityファクトチェック指示
  - `templates/pipeline/phase0/codex-research.md` - Codex技術調査指示
- **Acceptance criteria**:
  - [ ] 6件のAI別リサーチテンプレートが作成されていること (REQ-001.1)
  - [ ] Chrome MCP操作フロー（タブ操作→入力→起動→待機→取得→保存）が定義されていること (REQ-002.1)
  - [ ] 各AIの出力が共通リサーチフォーマット（ResearchOutput）に準拠すること (REQ-002.3)
  - [ ] Perplexityテンプレートにclaim_verifications, source_registry, contradiction_flags, data_freshnessの指示が含まれること (REQ-003.1)
  - [ ] 6件の個別リサーチJSONが所定ディレクトリに保存されること (REQ-002.2)
  - [ ] 統合処理（Perplexity信頼度調整、矛盾検出、技術実現性反映、感情データ付与、死角チェック）が定義されていること (REQ-005.1〜005.6)
  - [ ] phase0_research_integrated.json が生成されること
  - [ ] エラーハンドリング（タイムアウト、ページロード失敗、ログイン切れ）が定義されていること
  - [ ] pipeline-state.json とhandoff-log.json が更新されること
- **Implementation notes**:
  - design.md Section 3.2（Chrome Automation Module）と3.3（Research Collector）に準拠
  - AI別URLとUI操作の注意事項を各テンプレートに記載
  - 部分完了ハンドリング（design.md Section 8.2）を含む

### Task 3.2: Phase 0 案件タイプ別テンプレート作成
- **Priority**: P1
- **Estimated effort**: L
- **Dependencies**: Task 3.1
- **Files to create/modify**:
  - `templates/pipeline/phase0/case-types/typeA-new-business.md` - 新規サービス・新規事業
  - `templates/pipeline/phase0/case-types/typeB-improvement.md` - 既存事業改善・収益性向上
  - `templates/pipeline/phase0/case-types/typeC-dx.md` - DX・業務改革
  - `templates/pipeline/phase0/case-types/typeD-crisis.md` - リスク・危機対応
- **Acceptance criteria**:
  - [ ] 4つの案件タイプテンプレートが作成されていること (REQ-006.1〜006.4)
  - [ ] 各テンプレートにAI別（Claude/ChatGPT/Gemini/Grok/Perplexity/Codex）のリサーチ指示が含まれること
  - [ ] REQ-006の指示表の内容が正確に反映されていること
  - [ ] Case Type Router（design.md Section 3.11）が案件タイプに応じてテンプレートを選択できること
- **Implementation notes**:
  - requirements.md REQ-006.1〜006.4の表を各テンプレートに展開

### Task 3.3: Phase 1 提案コマンド + テンプレート作成
- **Priority**: P0
- **Estimated effort**: M
- **Dependencies**: Task 1.1, Task 1.2, Task 2.1
- **Files to create/modify**:
  - `.claude/commands/pipeline-propose.md` - Phase 1実行コマンド
  - `templates/pipeline/phase1/proposal.md` - 戦略提案プロンプト
- **Acceptance criteria**:
  - [ ] phase0_research_integrated.json を入力として読み込むこと (REQ-001.2)
  - [ ] 知的誠実性ルールが組み込まれていること (REQ-004.1, REQ-004.2)
  - [ ] 複数の選択肢が提示される指示が含まれること
  - [ ] Codexの技術実現性評価の反映義務が記述されていること (REQ-005.3)
  - [ ] 出力にweakest_point_identified, disagreements[], verification_methodが必須であること
  - [ ] phase1_proposal.json + phase1_proposal.md が生成されること
  - [ ] pipeline-state.json とhandoff-log.json が更新されること
- **Implementation notes**:
  - design.md Section 3.4（Phase 1 Proposal Generator）に準拠
  - プロンプト構成: 知的誠実性 + Phase 1専用指示 + 案件タイプコンテキスト + Phase 0データ

### Task 3.4: Phase 2 補強コマンド + テンプレート作成
- **Priority**: P0
- **Estimated effort**: M
- **Dependencies**: Task 1.1, Task 1.2, Task 2.1
- **Files to create/modify**:
  - `.claude/commands/pipeline-reinforce.md` - Phase 2実行コマンド
  - `templates/pipeline/phase2/reinforcement.md` - 補強分析プロンプト
- **Acceptance criteria**:
  - [ ] phase1_proposal.json + phase0_codex_research.json を入力として読み込むこと (REQ-001.3)
  - [ ] 知的誠実性ルールが組み込まれていること
  - [ ] 数字的裏付け、ロジック検証、弱い前提の特定が指示されていること
  - [ ] Tavily APIでの数値データ裏取り指示が含まれること (REQ-010.2)
  - [ ] phase2_reinforcement.json + phase2_reinforcement.md が生成されること
  - [ ] pipeline-state.json とhandoff-log.json が更新されること
- **Implementation notes**:
  - design.md Section 3.5（Phase 2 Reinforcement Analyzer）に準拠
  - 補強分析の4観点を指示に含める

### Task 3.5: Phase 3 批判コマンド + テンプレート作成
- **Priority**: P0
- **Estimated effort**: M
- **Dependencies**: Task 1.1, Task 1.2, Task 2.1
- **Files to create/modify**:
  - `.claude/commands/pipeline-critique.md` - Phase 3実行コマンド
  - `templates/pipeline/phase3/critique.md` - 批判・検証プロンプト
- **Acceptance criteria**:
  - [ ] phase1_proposal.json + phase2_reinforcement.json を入力として読み込むこと (REQ-001.4)
  - [ ] 知的誠実性ルールが組み込まれていること
  - [ ] 少なくとも3つの失敗シナリオ構築が指示されていること
  - [ ] 定量的リスク評価と反証提示（具体的根拠付き）が指示されていること
  - [ ] Brave/Exa APIでの反証事例検索指示が含まれること (REQ-010.2)
  - [ ] phase3_critique.json + phase3_critique.md が生成されること
  - [ ] pipeline-state.json とhandoff-log.json が更新されること
- **Implementation notes**:
  - design.md Section 3.6（Phase 3 Critic）に準拠
  - 批判の3軸（失敗シナリオ、定量リスク、反証）を明確に指示

### Task 3.6: Phase 3.5 歴史的検証コマンド + テンプレート作成
- **Priority**: P0
- **Estimated effort**: L
- **Dependencies**: Task 1.1, Task 1.2, Task 2.1
- **Files to create/modify**:
  - `.claude/commands/pipeline-history.md` - Phase 3.5実行コマンド
  - `templates/pipeline/phase3_5/historical.md` - 歴史的検証プロンプト
- **Acceptance criteria**:
  - [ ] phase1 + phase2 + phase3の出力を入力として読み込むこと (REQ-001.5)
  - [ ] 知的誠実性ルールが組み込まれていること
  - [ ] 6つの検証観点（大成企業、失敗企業、回復企業、古今東西の戦略、時代転換点、歴史の落とし穴）が含まれること
  - [ ] 歴史参謀の行動規範5か条が含まれること
  - [ ] Brave/Tavily/Exa API全3ツールの使い分け指示が含まれること (REQ-010.2)
  - [ ] 出力にhistorical_parallels, success_patterns, failure_warnings, recovery_playbooks, strategic_frameworks, era_similarity, history_verdictが含まれること
  - [ ] 成功事例3件以上、失敗事例3件以上の出力が指示されていること
  - [ ] phase3_5_historical.json + phase3_5_historical.md が生成されること
  - [ ] pipeline-state.json とhandoff-log.json が更新されること
- **Implementation notes**:
  - design.md Section 3.7（Phase 3.5 Historical Validator）に準拠
  - Claude Codeがローカルで実行（追加APIコストなし）
  - リサーチツール使い分け: Brave（広範検索）、Tavily（構造化取得）、Exa（セマンティック検索）

### Task 3.7: Phase 4 統合コマンド + テンプレート作成
- **Priority**: P0
- **Estimated effort**: L
- **Dependencies**: Task 1.1, Task 1.2, Task 2.1
- **Files to create/modify**:
  - `.claude/commands/pipeline-integrate.md` - Phase 4実行コマンド
  - `templates/pipeline/phase4/integration.md` - 統合プロンプト
- **Acceptance criteria**:
  - [ ] Phase 0〜3.5の全出力を入力として読み込むこと (REQ-001.6)
  - [ ] 知的誠実性ルールが組み込まれていること
  - [ ] 統合レポートの8構成要素（エグゼクティブサマリー、推奨案、賛否マトリックス、歴史支持/警告、リスクヒートマップ、意思決定ポイント、実行ロードマップ、知的誠実性レポート）が指示されていること
  - [ ] 歴史的検証結果が最終判断に反映される指示が含まれること
  - [ ] confidenceスコア付き最終推奨案の出力が指示されていること
  - [ ] phase4_integrated_report.json + phase4_integrated_report.md（意思決定ダッシュボード）が生成されること
  - [ ] pipeline-state.json とhandoff-log.json が更新されること
- **Implementation notes**:
  - design.md Section 3.8（Phase 4 Integrator）に準拠
  - 全フェーズの主要論点を公平に扱う統合責任者の立場

---

## Task Group 4: 統合・検証

全コンポーネントの結合テスト、ドキュメント整備、最終検証。

### Task 4.1: handoff-log.json パイプライン用拡張
- **Priority**: P0
- **Estimated effort**: S
- **Dependencies**: Task 2.1
- **Files to create/modify**:
  - `.kiro/ai-coordination/handoff/handoff-log.json` - 既存ファイルにパイプライン用エントリ形式を追加対応
- **Acceptance criteria**:
  - [ ] PipelineHandoffType（8種類）が記録可能であること (REQ-008.2)
  - [ ] 既存のsd003ハンドオフエントリとの互換性が保たれること
  - [ ] phaseフィールドがエントリに含まれること
- **Implementation notes**:
  - 既存handoff-log.jsonの構造を壊さず、パイプライン用エントリを追加する形式
  - design.md Section 3.10（Handoff Logger）に準拠

### Task 4.2: エンドツーエンド動作検証
- **Priority**: P0
- **Estimated effort**: L
- **Dependencies**: Task 2.3（全フェーズコマンド完成後）
- **Files to create/modify**:
  - なし（検証のみ）
- **Acceptance criteria**:
  - [ ] `/pipeline:init` で案件が正常に初期化されること
  - [ ] `/pipeline:status` で全フェーズの状態が正しく表示されること
  - [ ] 各フェーズコマンドの前提条件チェック（前フェーズ完了確認）が動作すること
  - [ ] テンプレートファイルの参照パスが全て正しいこと
  - [ ] pipeline-state.json のフェーズ遷移が正しく記録されること
  - [ ] handoff-log.json に各フェーズのエントリが正しく記録されること
  - [ ] 23件の新規ファイルが全て所定のパスに配置されていること
- **Implementation notes**:
  - Phase 0のChrome自動化は実環境（ブラウザログイン済み）でのみ完全テスト可能
  - Phase 1〜4のAPIコマンドは実APIキー設定が前提
  - ファイル構成・パス参照・状態遷移の正確性を重点的に検証

### Task 4.3: リサーチツールフォールバック動作確認
- **Priority**: P1
- **Estimated effort**: S
- **Dependencies**: Task 3.1, Task 3.5, Task 3.6
- **Files to create/modify**:
  - なし（検証のみ）
- **Acceptance criteria**:
  - [ ] 全APIキー設定済み時に各ツールが正しく使い分けられること (REQ-010.3)
  - [ ] 一部APIキー未設定時にWebSearchで代替されること (REQ-010.4)
  - [ ] 全APIキー未設定時にパイプラインが停止せずWebSearchで続行すること（Graceful Degradation）
  - [ ] フォールバック時にログに警告が記録されること
- **Implementation notes**:
  - design.md Section 7.3のフォールバック戦略に準拠

---

## タスクサマリー

| Group | タスク数 | P0 | P1 | 総工数 |
|-------|---------|----|----|--------|
| Group 1: 基盤構築 | 2 | 1 | 0 | L + M |
| Group 2: コマンド基盤 | 3 | 3 | 0 | M + S + M |
| Group 3: フェーズ別コマンド | 7 | 6 | 1 | XL + L + M×3 + L×2 |
| Group 4: 統合・検証 | 3 | 2 | 1 | S + L + S |
| **合計** | **15** | **12** | **2** | **約30〜40時間** |

## クリティカルパス

```
Task 1.1 (型定義)
    ↓
Task 2.1 (/pipeline:init)
    ↓
Task 3.1 (Phase 0) → Task 3.2 (案件タイプ別)
Task 3.3 (Phase 1)
Task 3.4 (Phase 2)
Task 3.5 (Phase 3)
Task 3.6 (Phase 3.5)
Task 3.7 (Phase 4)
    ↓ （全フェーズコマンド完成）
Task 2.3 (/pipeline:run)
    ↓
Task 4.2 (E2E検証)
```

最長依存チェーン: Task 1.1 → Task 2.1 → Task 3.1 → Task 3.2 → Task 2.3 → Task 4.2（6ステップ）

## 並列実行可能なタスク

以下のタスクはTask 2.1完了後に並列実行可能:
- Task 3.1, 3.3, 3.4, 3.5, 3.6, 3.7（各フェーズコマンドは独立して作成可能）
- Task 1.2（知的誠実性テンプレートは型定義とは独立）
- Task 4.1（handoff-log拡張）

## 要件トレーサビリティ

| 要件ID | 対応タスク |
|--------|-----------|
| REQ-001.1 | Task 3.1 |
| REQ-001.2 | Task 3.3 |
| REQ-001.3 | Task 3.4 |
| REQ-001.4 | Task 3.5 |
| REQ-001.5 | Task 3.6 |
| REQ-001.6 | Task 3.7 |
| REQ-002.1 | Task 3.1 |
| REQ-002.2 | Task 3.1, Task 2.1 |
| REQ-002.3 | Task 1.1 |
| REQ-003.1 | Task 1.1, Task 3.1 |
| REQ-004.1 | Task 1.2 |
| REQ-004.2 | Task 1.1, Task 1.2 |
| REQ-005.1〜005.6 | Task 3.1 |
| REQ-006.1〜006.4 | Task 3.2 |
| REQ-007.1〜007.2 | アーキテクチャ設計（タスク横断） |
| REQ-008.1 | Task 2.1 |
| REQ-008.2 | Task 1.1, Task 4.1 |
| REQ-008.3 | Task 2.1, 2.2, 2.3, 3.1〜3.7 |
| REQ-009.1 | Task 3.1〜3.7（全AI配置） |
| REQ-010.1〜010.5 | Task 1.1, Task 3.1, 3.5, 3.6, Task 4.3 |
| REQ-NF-001 | Task 2.3 |
| REQ-NF-002 | Task 3.1 |
| REQ-NF-003 | Task 2.1, Task 3.1〜3.7 |
