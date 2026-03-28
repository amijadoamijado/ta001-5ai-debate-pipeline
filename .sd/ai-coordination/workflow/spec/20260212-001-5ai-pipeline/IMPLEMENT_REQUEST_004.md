# 実装指示: /pipeline:status コマンド作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 004 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/004-pipeline-status` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

```bash
# ブランチ作成コマンド
git checkout -b feature/20260212-001-5ai-pipeline/004-pipeline-status
```

## 2. 実装タスク概要

**タスク番号**: 004
**タスク名**: /pipeline:status コマンド作成（Task 2.2）

### 2.1 目的
パイプライン案件の進捗状況を確認するスラッシュコマンドを作成する。pipeline-state.jsonを読み込み、全フェーズの状態、出力ファイルの存在確認、リサーチツールの利用可否を表形式で表示する。フェーズ失敗からの再開判断に使用される重要なコマンドである（design.md Section 8.3 再開フロー）。

### 2.2 依存タスク
| 依存タスク番号 | 状態 | 備考 |
|--------------|------|------|
| 003 | Pending | /pipeline:init で作成されるpipeline-state.jsonを読み込むため |

## 3. 実装範囲

### 3.1 変更可能ファイル
| ファイルパス | アクション | 説明 |
|------------|----------|------|
| `.claude/commands/pipeline-status.md` | Create | 進捗確認コマンド |

### 3.2 禁止領域
| ファイル/ディレクトリ | 理由 |
|---------------------|------|
| `CLAUDE.md` | フレームワーク設定 |
| `.kiro/specs/` | 仕様書は変更不可 |

### 3.3 参照のみ
| ファイルパス | 参照理由 |
|------------|---------|
| `.kiro/specs/5ai-debate-pipeline/design.md` | Section 8.3 再開フロー、Section 4.6 パイプライン状態管理 |
| `.kiro/specs/5ai-debate-pipeline/requirements.md` | REQ-008.3 コマンド体系の確認 |
| `src/pipeline/types/index.ts` | PipelineState, PhaseStatus型の構造確認 |

## 4. 追加・変更仕様（差分）

### 4.1 コマンド仕様

コマンドファイル `.claude/commands/pipeline-status.md` は、Claude Codeのスラッシュコマンドとして動作するMarkdownファイルである。ユーザーが `/pipeline:status {案件ID}` と入力した際にClaude Codeがこのファイルを読み込み、パイプラインの状態を表示する。

### 4.2 処理フロー

```
入力: 案件ID
  例: /pipeline:status 20260212-001-new-service-launch

処理:
  1. pipeline-state.json の読み込み
     - パス: .kiro/ai-coordination/workflow/research/{案件ID}/pipeline-state.json
     - 存在しない場合: エラーメッセージ「案件が見つかりません」を表示

  2. フェーズ状態の収集
     - 各フェーズ（phase0〜phase4）のstatus, started_at, completed_at, error を取得

  3. 出力ファイルの存在確認
     - 各フェーズの期待出力ファイルが実際に存在するか確認
     - 存在: ○ / 不在: ✕ で表示

  4. リサーチツール利用可否の確認
     - pipeline-state.json の research_tools を読み取り

  5. 結果の表示
     - 表形式で全情報を表示

出力フォーマット:
```

### 4.3 出力フォーマット（表示例）

```markdown
## パイプライン状態: 20260212-001-new-service-launch

### 基本情報
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-new-service-launch |
| 案件タイプ | A（新規サービス・新規事業） |
| ステータス | running |
| 作成日時 | 2026-02-12T10:00:00+09:00 |
| 最終更新 | 2026-02-12T11:30:00+09:00 |
| 現在フェーズ | phase2 |

### フェーズ進捗
| フェーズ | 状態 | 開始 | 完了 | 出力ファイル |
|---------|------|------|------|------------|
| Phase 0（リサーチ） | completed | 10:05 | 11:00 | ○ |
| Phase 1（提案） | completed | 11:01 | 11:10 | ○ |
| Phase 2（補強） | running | 11:11 | - | - |
| Phase 3（批判） | pending | - | - | - |
| Phase 3.5（歴史的検証） | pending | - | - | - |
| Phase 4（統合） | pending | - | - | - |

### 出力ファイル確認
| ファイル | 存在 |
|---------|------|
| phase0_research_integrated.json | ○ |
| phase1_proposal.json | ○ |
| phase1_proposal.md | ○ |
| phase2_reinforcement.json | ✕ |
| phase2_reinforcement.md | ✕ |
| phase3_critique.json | ✕ |
| phase3_critique.md | ✕ |
| phase3_5_historical.json | ✕ |
| phase3_5_historical.md | ✕ |
| phase4_integrated_report.json | ✕ |
| phase4_integrated_report.md | ✕ |

### リサーチツール
| ツール | 利用可否 |
|--------|---------|
| Brave Search API | ○ |
| Tavily API | ○ |
| Exa API | ✕ |

### エラー情報
（エラーなし）
```

### 4.4 エラー表示（失敗フェーズがある場合）

```markdown
### エラー情報
| フェーズ | エラー内容 |
|---------|-----------|
| Phase 3 | Gemini API呼び出し失敗: Rate limit exceeded |

### 再開方法
```bash
# Phase 3を再実行
/pipeline:critique 20260212-001-new-service-launch

# 再実行後、残りを一括実行
/pipeline:run 20260212-001-new-service-launch typeA
```
```

### 4.5 各フェーズの期待出力ファイル一覧

| フェーズ | 期待出力ファイル |
|---------|----------------|
| Phase 0 | `phase0_claude_research.json`, `phase0_chatgpt_research.json`, `phase0_gemini_research.json`, `phase0_grok_research.json`, `phase0_perplexity_research.json`, `phase0_codex_research.json`, `phase0_research_integrated.json` |
| Phase 1 | `phase1_proposal.json`, `phase1_proposal.md` |
| Phase 2 | `phase2_reinforcement.json`, `phase2_reinforcement.md` |
| Phase 3 | `phase3_critique.json`, `phase3_critique.md` |
| Phase 3.5 | `phase3_5_historical.json`, `phase3_5_historical.md` |
| Phase 4 | `phase4_integrated_report.json`, `phase4_integrated_report.md` |

### 4.6 コマンドファイルの構造

```markdown
# /pipeline:status コマンド

## 概要
パイプライン案件の進捗状況を確認する。

## 引数
$ARGUMENTS = 案件ID

## 前提条件チェック
1. 案件IDが指定されていること
2. pipeline-state.json が存在すること

## 実行手順
[上記4.2の処理フローを自然言語で記述]

## 出力フォーマット
[上記4.3の表形式を定義]
```

## 5. 受け入れテスト

### 5.1 受け入れ基準チェックリスト
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| AC-001 | pipeline-state.json を読み込み、全フェーズの状態を表形式で表示すること | 6フェーズの状態表が定義 |
| AC-002 | 各フェーズのステータス（pending/running/completed/failed/skipped）が表示されること | ステータス列が定義 |
| AC-003 | 失敗フェーズのエラー内容が表示されること | エラー情報セクションが定義 |
| AC-004 | 出力ファイルの存在確認結果が表示されること | ファイル確認表が定義 |
| AC-005 | リサーチツール（Brave/Tavily/Exa）の利用可否が表示されること | ツール可否表が定義 |
| AC-006 | 失敗時の再開方法が案内されること | 再開コマンド例が記述 |

### 5.2 手動確認項目
| 確認ID | 確認内容 | 手順 | 期待結果 |
|--------|---------|------|---------|
| MC-001 | 初期化直後の表示 | `/pipeline:init test` → `/pipeline:status {ID}` | 全フェーズ pending 表示 |
| MC-002 | 存在しない案件ID | `/pipeline:status nonexistent` | エラーメッセージ表示 |

## 6. コミット方針

### コミットメッセージ形式
```
feat(pipeline): add /pipeline:status command for progress monitoring

Displays phase status table, output file verification,
research tool availability, and error recovery guidance.

Refs: 20260212-001-5ai-pipeline#004
```

## 7. 注意事項

### 7.1 技術的制約
- [ ] スラッシュコマンドファイルとして正しいMarkdown構文であること
- [ ] Claude Codeが解釈可能な形式で手順を記述すること
- [ ] UTF-8（BOM付き）エンコーディングで保存すること
- [ ] 改行コードはCRLFを使用すること

### 7.2 品質基準
- [ ] 表示が見やすく、一目で状態が把握できること
- [ ] エラーケースの表示が明確であること
- [ ] 再開方法の案内が具体的であること

### 7.3 特記事項
- このコマンドはdesign.md Section 8.3 の再開フローで使用される重要コマンドである
- 状態の読み取りのみで、pipeline-state.json を変更しないこと（読み取り専用）
- handoff-log.json への記録は不要（参照のみのコマンドのため）
- 出力ファイルの存在確認は `ls` コマンドまたはファイルシステムAPIで行う

## 8. 完了報告フォーマット

実装完了時、以下の形式で報告:

```markdown
## 実装完了報告

### 変更ファイル
| ファイル | アクション | 行数 |
|---------|----------|------|
| `.claude/commands/pipeline-status.md` | Create | XXX行 |

### 検証結果
- コマンド構文: 正しいMarkdown
- 出力フォーマット: 全セクション定義済み
- エラーハンドリング: 記述済み

### 次のアクション
- Codexレビュー依頼
```

---
**発行日時**: 2026-02-12 16:00
**発行者**: Claude Code
