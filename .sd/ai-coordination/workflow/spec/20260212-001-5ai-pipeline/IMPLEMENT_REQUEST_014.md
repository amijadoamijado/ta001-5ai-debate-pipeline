# 実装指示: エンドツーエンド動作検証

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 014 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/014-e2e-verification` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

```bash
# ブランチ作成コマンド
git checkout -b feature/20260212-001-5ai-pipeline/014-e2e-verification
```

## 2. 実装タスク概要

**タスク番号**: 014（Task 4.2）
**タスク名**: エンドツーエンド動作検証

### 2.1 目的

全タスクの実装が完了した後に、パイプライン全体の整合性を検証する。ファイルの存在確認、パス参照の正確性、フェーズ遷移の正確性、handoff-log.jsonの記録形式を確認する。

**このタスクではファイルの新規作成・変更は行わない（検証のみ）。**

### 2.2 依存タスク
| 依存タスク番号 | 状態 | 備考 |
|--------------|------|------|
| Task 2.3 | 実装済み前提 | /pipeline:run コマンド（全フェーズコマンド完成後） |
| 全Task 3.x | 実装済み前提 | 全フェーズコマンド + テンプレートが完成していること |
| Task 4.1 | 実装済み前提 | handoff-log.json拡張が完了していること |

## 3. 実装範囲

### 3.1 変更可能ファイル
| ファイルパス | アクション | 説明 |
|------------|----------|------|
| なし | - | 検証のみ。ファイル変更なし |

### 3.2 検証対象ファイル（全23件）

#### コマンドファイル（9件）
| # | ファイルパス | 検証項目 |
|---|------------|---------|
| 1 | `.claude/commands/pipeline-init.md` | 存在確認 + 案件ID生成ロジック |
| 2 | `.claude/commands/pipeline-research.md` | 存在確認 + Chrome MCPフロー |
| 3 | `.claude/commands/pipeline-propose.md` | 存在確認 + Phase 0出力参照 |
| 4 | `.claude/commands/pipeline-reinforce.md` | 存在確認 + Phase 1出力参照 |
| 5 | `.claude/commands/pipeline-critique.md` | 存在確認 + Phase 2出力参照 |
| 6 | `.claude/commands/pipeline-history.md` | 存在確認 + Phase 1-3出力参照 |
| 7 | `.claude/commands/pipeline-integrate.md` | 存在確認 + Phase 0-3.5全出力参照 |
| 8 | `.claude/commands/pipeline-run.md` | 存在確認 + 全フェーズ連鎖 |
| 9 | `.claude/commands/pipeline-status.md` | 存在確認 + pipeline-state.json読み込み |

#### プロンプトテンプレート（13件）
| # | ファイルパス | 検証項目 |
|---|------------|---------|
| 10 | `templates/pipeline/intellectual-honesty.md` | 存在確認 + 4原則 |
| 11 | `templates/pipeline/phase0/claude-research.md` | 存在確認 |
| 12 | `templates/pipeline/phase0/chatgpt-research.md` | 存在確認 |
| 13 | `templates/pipeline/phase0/gemini-research.md` | 存在確認 |
| 14 | `templates/pipeline/phase0/grok-research.md` | 存在確認 |
| 15 | `templates/pipeline/phase0/perplexity-research.md` | 存在確認 |
| 16 | `templates/pipeline/phase0/codex-research.md` | 存在確認 |
| 17 | `templates/pipeline/phase0/case-types/typeA-new-business.md` | 存在確認 |
| 18 | `templates/pipeline/phase0/case-types/typeB-improvement.md` | 存在確認 |
| 19 | `templates/pipeline/phase0/case-types/typeC-dx.md` | 存在確認 |
| 20 | `templates/pipeline/phase0/case-types/typeD-crisis.md` | 存在確認 |
| 21 | `templates/pipeline/phase1/proposal.md` | 存在確認 + 知的誠実性参照 |
| 22 | `templates/pipeline/phase2/reinforcement.md` | 存在確認 + 知的誠実性参照 |
| 23 | `templates/pipeline/phase3/critique.md` | 存在確認 + 知的誠実性参照 |

#### 別タスクで作成済みのファイル（検証に含めるが上記23件外）
| # | ファイルパス | 検証項目 |
|---|------------|---------|
| - | `templates/pipeline/phase3_5/historical.md` | 存在確認 + 6検証観点 |
| - | `templates/pipeline/phase4/integration.md` | 存在確認 + 8構成要素 |
| - | `src/pipeline/types/index.ts` | 存在確認 + 全interface定義 |

## 4. 検証仕様（差分）

### 4.1 検証カテゴリA: ファイル存在確認

全23件の新規ファイルが所定のパスに配置されていることを確認する。

**検証手順**:
```bash
# 各ファイルの存在を確認
ls -la .claude/commands/pipeline-*.md
ls -la templates/pipeline/intellectual-honesty.md
ls -la templates/pipeline/phase0/*.md
ls -la templates/pipeline/phase0/case-types/*.md
ls -la templates/pipeline/phase1/proposal.md
ls -la templates/pipeline/phase2/reinforcement.md
ls -la templates/pipeline/phase3/critique.md
ls -la templates/pipeline/phase3_5/historical.md
ls -la templates/pipeline/phase4/integration.md
ls -la src/pipeline/types/index.ts
```

**期待結果**: 全ファイルが存在し、内容が空でないこと

### 4.2 検証カテゴリB: テンプレート参照パスの検証

各コマンドファイル内で参照されているテンプレートファイルのパスが実際に存在するファイルを指していることを確認する。

**検証手順**:
```
各コマンドファイルを読み込み:
1. テンプレート読み込み指示のパスを抽出
2. 抽出したパスのファイルが実際に存在するか確認
3. 不一致があればエラーとして報告
```

**検証対象のパス参照**:

| コマンド | 参照テンプレート |
|---------|----------------|
| pipeline-research.md | phase0/*.md, case-types/*.md, intellectual-honesty.md |
| pipeline-propose.md | phase1/proposal.md, intellectual-honesty.md |
| pipeline-reinforce.md | phase2/reinforcement.md, intellectual-honesty.md |
| pipeline-critique.md | phase3/critique.md, intellectual-honesty.md |
| pipeline-history.md | phase3_5/historical.md, intellectual-honesty.md |
| pipeline-integrate.md | phase4/integration.md, intellectual-honesty.md |

### 4.3 検証カテゴリC: pipeline-state.json フェーズ遷移の検証

各コマンドがpipeline-state.jsonのフェーズステータスを正しく更新する設計になっていることを確認する。

**検証すべき遷移**:

| フェーズ | 開始時更新 | 完了時更新 |
|---------|-----------|-----------|
| phase0 | status: 'pending' → 'running' | status: 'running' → 'completed' |
| phase1 | status: 'pending' → 'running' | status: 'running' → 'completed' |
| phase2 | status: 'pending' → 'running' | status: 'running' → 'completed' |
| phase3 | status: 'pending' → 'running' | status: 'running' → 'completed' |
| phase3_5 | status: 'pending' → 'running' | status: 'running' → 'completed' |
| phase4 | status: 'pending' → 'running' | status: 'running' → 'completed' |

**前提条件チェックの検証**:

| コマンド | 確認すべき前フェーズ |
|---------|-------------------|
| pipeline-propose.md | Phase 0 completed |
| pipeline-reinforce.md | Phase 1 completed |
| pipeline-critique.md | Phase 2 completed |
| pipeline-history.md | Phase 3 completed |
| pipeline-integrate.md | Phase 3.5 completed |

### 4.4 検証カテゴリD: handoff-log.json エントリ形式の検証

各コマンドがhandoff-log.jsonに記録するエントリの形式がPipelineHandoffEntry型に準拠していることを確認する。

**検証対象の8エントリタイプ**:

| コマンド | 記録すべきtype |
|---------|--------------|
| pipeline-research.md | phase0_research_start, phase0_research_complete |
| pipeline-propose.md | phase1_proposal |
| pipeline-reinforce.md | phase2_reinforcement |
| pipeline-critique.md | phase3_critique |
| pipeline-history.md | phase3_5_historical |
| pipeline-integrate.md | phase4_integration |
| pipeline-run.md | pipeline_complete |

### 4.5 検証カテゴリE: 入出力ファイルの整合性

各フェーズの出力ファイルが次フェーズの入力ファイルとして正しく参照されていることを確認する。

**データフロー検証**:

```
Phase 0 出力: phase0_research_integrated.json
  → Phase 1 入力として参照されるか? ✓/✗

Phase 1 出力: phase1_proposal.json
  → Phase 2 入力として参照されるか? ✓/✗
  → Phase 3 入力として参照されるか? ✓/✗
  → Phase 3.5 入力として参照されるか? ✓/✗

Phase 2 出力: phase2_reinforcement.json
  → Phase 3 入力として参照されるか? ✓/✗
  → Phase 3.5 入力として参照されるか? ✓/✗

Phase 3 出力: phase3_critique.json
  → Phase 3.5 入力として参照されるか? ✓/✗

Phase 0-3.5 全出力:
  → Phase 4 入力として参照されるか? ✓/✗
```

## 5. 受け入れテスト

### 5.1 全体検証結果
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| E2E-014-001 | 全23件のファイルが所定パスに存在すること | 全ファイル存在 |
| E2E-014-002 | テンプレート参照パスが全て正しいこと | パス不一致ゼロ |
| E2E-014-003 | pipeline-state.jsonのフェーズ遷移設計が正しいこと | 全遷移が定義済み |
| E2E-014-004 | handoff-log.jsonのエントリ形式がPipelineHandoffEntry型に準拠すること | 8タイプ全て準拠 |
| E2E-014-005 | 入出力ファイルの参照が全て整合していること | 全参照が正しい |
| E2E-014-006 | 前提条件チェックが全コマンドで定義されていること | 全コマンドに前提条件あり |

### 5.2 制限事項（検証不可項目）
| 確認ID | 確認内容 | 理由 |
|--------|---------|------|
| SKIP-014-001 | Phase 0 Chrome自動化の実行テスト | ライブブラウザ（ログイン済み環境）が必要 |
| SKIP-014-002 | Phase 1-4 APIコマンドの実行テスト | 実APIキー設定が必要 |
| SKIP-014-003 | リサーチツール（Brave/Tavily/Exa）の接続テスト | APIキー設定が必要 |

### 5.3 検証レポート形式

検証結果を以下の形式でレポートすること:

```markdown
# E2E検証レポート

## 検証日時: YYYY-MM-DD HH:MM

## カテゴリA: ファイル存在確認
| # | ファイル | 存在 | 備考 |
|---|---------|------|------|
| 1 | .claude/commands/pipeline-init.md | ✓/✗ | |
| ... | ... | ... | ... |
| 23 | src/pipeline/types/index.ts | ✓/✗ | |

**結果**: XX/23 件存在

## カテゴリB: テンプレート参照パス
| コマンド | 参照テンプレート | 存在 |
|---------|----------------|------|
| ... | ... | ✓/✗ |

**結果**: 不一致 XX 件

## カテゴリC: フェーズ遷移設計
| フェーズ | 開始更新 | 完了更新 | 前提条件チェック |
|---------|---------|---------|---------------|
| ... | ✓/✗ | ✓/✗ | ✓/✗ |

**結果**: 未定義遷移 XX 件

## カテゴリD: handoff-log.jsonエントリ
| type | 定義済み | 型準拠 |
|------|---------|--------|
| ... | ✓/✗ | ✓/✗ |

**結果**: 未定義タイプ XX 件

## カテゴリE: 入出力整合性
| データフロー | 整合 |
|------------|------|
| Phase 0→1 | ✓/✗ |
| Phase 1→2 | ✓/✗ |
| ... | ... |

**結果**: 不整合 XX 件

## 総合判定: PASS / FAIL
## 問題一覧（FAILの場合）:
1. ...
```

## 6. コミット方針

### 6.1 コミットメッセージ形式
```
docs(pipeline): add E2E verification report

- Verify all 23 pipeline files exist in correct paths
- Validate template reference paths
- Confirm phase transition design
- Check handoff-log.json entry format compliance

Refs: 20260212-001-5ai-pipeline#014
```

### 6.2 コミット粒度
- 検証レポートのみ（ファイル変更なし）。問題が発見された場合は修正を別コミットで対応

## 7. 注意事項

### 7.1 プロジェクト特性
- [ ] これは検証タスクであり、ファイルの新規作成・変更は行わない
- [ ] 問題を発見した場合は修正せず、レポートに記録して報告すること
- [ ] 修正は別タスクとして対応する

### 7.2 品質基準
- [ ] 全23件のファイルが検証対象に含まれていること
- [ ] 検証結果が定量的（件数ベース）に報告されること
- [ ] 制限事項（検証不可項目）が明記されていること

### 7.3 特記事項
- Phase 0のChrome自動化はライブブラウザ環境でのみテスト可能。このタスクでは「コマンドファイルの設計が正しいか」のみを静的に検証する
- Phase 1-4のAPIコマンドは実APIキーが必要。このタスクでは「テンプレートとコマンドの整合性」を静的に検証する
- 問題が発見された場合、修正は別タスクで対応する。このタスクの目的は「問題の発見と報告」

## 8. 完了報告フォーマット

実装完了時、以下の形式で報告:

```markdown
## 実装完了報告（検証タスク）

### 変更ファイル
| ファイル | アクション | 行数 |
|---------|----------|------|
| なし（検証のみ） | - | - |

### 検証結果サマリー
| カテゴリ | 結果 | 詳細 |
|---------|------|------|
| A: ファイル存在 | XX/23 | {問題あれば記述} |
| B: パス参照 | XX件不一致 | {問題あれば記述} |
| C: フェーズ遷移 | XX件未定義 | {問題あれば記述} |
| D: handoff形式 | XX件非準拠 | {問題あれば記述} |
| E: 入出力整合 | XX件不整合 | {問題あれば記述} |

### 総合判定: PASS / FAIL

### 次のアクション
- PASS: パイプライン完成
- FAIL: 問題箇所の修正タスクを起票
```

---
**発行日時**: 2026-02-12 16:00
**発行者**: Claude Code
