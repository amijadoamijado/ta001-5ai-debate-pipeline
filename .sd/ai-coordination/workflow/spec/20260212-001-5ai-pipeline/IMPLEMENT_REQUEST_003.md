# 実装指示: /pipeline:init コマンド作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 003 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/003-pipeline-init` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

```bash
# ブランチ作成コマンド
git checkout -b feature/20260212-001-5ai-pipeline/003-pipeline-init
```

## 2. 実装タスク概要

**タスク番号**: 003
**タスク名**: /pipeline:init コマンド作成（Task 2.1）

### 2.1 目的
パイプライン案件を初期化するスラッシュコマンドを作成する。slug引数から案件IDを生成し、作業ディレクトリとpipeline-state.jsonを初期化する。パイプライン全体のエントリーポイントとなるコマンドである。

### 2.2 依存タスク
| 依存タスク番号 | 状態 | 備考 |
|--------------|------|------|
| 001 | Pending | PipelineState, PhaseStatus, PhaseName の型定義が必要 |

## 3. 実装範囲

### 3.1 変更可能ファイル
| ファイルパス | アクション | 説明 |
|------------|----------|------|
| `.claude/commands/pipeline-init.md` | Create | 案件初期化コマンド |

### 3.2 禁止領域
| ファイル/ディレクトリ | 理由 |
|---------------------|------|
| `CLAUDE.md` | フレームワーク設定 |
| `.kiro/specs/` | 仕様書は変更不可 |
| `.kiro/ai-coordination/handoff/handoff-log.json` | 既存ファイル（実行時に更新されるが、コマンド定義では変更しない） |

### 3.3 参照のみ
| ファイルパス | 参照理由 |
|------------|---------|
| `.kiro/specs/5ai-debate-pipeline/design.md` | Section 5.3 詳細設計の確認 |
| `.kiro/specs/5ai-debate-pipeline/requirements.md` | REQ-008.1 案件管理構造の確認 |
| `src/pipeline/types/index.ts` | PipelineState型の構造確認（Task 001成果物） |

## 4. 追加・変更仕様（差分）

### 4.1 コマンド仕様

コマンドファイル `.claude/commands/pipeline-init.md` は、Claude Codeのスラッシュコマンドとして動作するMarkdownファイルである。ユーザーが `/pipeline:init {slug}` と入力した際にClaude Codeがこのファイルを読み込み、記載された手順に従って処理を実行する。

### 4.2 処理フロー（design.md Section 5.3 準拠）

```
入力: slug（案件の短縮名）
  例: /pipeline:init new-service-launch

処理:
  1. 案件ID生成
     - 形式: YYYYMMDD-NNN-{slug}
     - NNN: 当日の連番（001から開始）
     - 例: 20260212-001-new-service-launch

  2. ディレクトリ作成
     - パス: .kiro/ai-coordination/workflow/research/{案件ID}/
     - 例: .kiro/ai-coordination/workflow/research/20260212-001-new-service-launch/

  3. pipeline-state.json 初期化
     - PipelineState型に準拠した初期状態JSONを生成
     - 全フェーズのstatusを "pending" に設定
     - research_toolsの利用可否を環境変数から判定

  4. handoff-log.json に init 記録を追加
     - type: (カスタム) "pipeline_init"
     - from: "Claude Code"
     - to: "Pipeline System"
     - phase: "phase0"（初期状態）

出力:
  - 案件IDの表示
  - 作業ディレクトリパスの表示
  - リサーチツール（Brave/Tavily/Exa）の利用可否の表示
  - 次のステップの案内
```

### 4.3 pipeline-state.json 初期値

```json
{
  "pipeline_id": "{案件ID}",
  "slug": "{slug}",
  "case_type": "",
  "created_at": "{ISO8601タイムスタンプ}",
  "updated_at": "{ISO8601タイムスタンプ}",
  "current_phase": "phase0",
  "status": "initialized",
  "phases": {
    "phase0": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
    "phase1": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
    "phase2": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
    "phase3": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
    "phase3_5": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
    "phase4": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null }
  },
  "research_tools": {
    "brave": false,
    "tavily": false,
    "exa": false
  }
}
```

### 4.4 リサーチツール利用可否の判定

```
環境変数チェック:
  - BRAVE_API_KEY が設定済み → research_tools.brave = true
  - TAVILY_API_KEY が設定済み → research_tools.tavily = true
  - EXA_API_KEY が設定済み → research_tools.exa = true
```

### 4.5 handoff-log.json への記録形式

```json
{
  "timestamp": "{ISO8601タイムスタンプ}",
  "type": "pipeline_init",
  "project_id": "{案件ID}",
  "from": "Claude Code",
  "to": "Pipeline System",
  "file": "workflow/research/{案件ID}/pipeline-state.json",
  "phase": "phase0",
  "note": "パイプライン案件初期化: {slug}"
}
```

### 4.6 コマンドファイルの構造

```markdown
# /pipeline:init コマンド

## 概要
パイプライン案件を初期化する。

## 引数
$ARGUMENTS = slug（案件の短縮名）

## 前提条件チェック
1. slug引数が指定されていること
2. .kiro/ai-coordination/ ディレクトリが存在すること

## 実行手順
[上記4.2の処理フローを自然言語で記述]

## 出力フォーマット
[案件ID、ディレクトリパス、ツール可否、次ステップの表示]
```

## 5. 受け入れテスト

### 5.1 受け入れ基準チェックリスト
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| AC-001 | slug引数から案件ID（YYYYMMDD-NNN-slug形式）が生成されること | 正しい形式のID生成手順が記述 (REQ-008.1) |
| AC-002 | `.kiro/ai-coordination/workflow/research/{案件ID}/` ディレクトリが作成されること | ディレクトリ作成手順が記述 |
| AC-003 | pipeline-state.json が初期状態で生成されること | PipelineState型準拠の初期値JSONが記述 |
| AC-004 | handoff-log.json にinit記録が追加されること | 記録形式が記述 (REQ-008.2) |
| AC-005 | 案件IDと作業ディレクトリパスが表示されること | 出力フォーマットが記述 |
| AC-006 | リサーチツールの利用可否が表示されること | 環境変数チェックロジックが記述 |

### 5.2 手動確認項目
| 確認ID | 確認内容 | 手順 | 期待結果 |
|--------|---------|------|---------|
| MC-001 | コマンドの呼び出し形式 | `/pipeline:init test-case` を実行 | エラーなく初期化完了 |
| MC-002 | 同日2回目の初期化 | 同日に2回 `/pipeline:init` を実行 | NNNが002に増加 |

## 6. コミット方針

### コミットメッセージ形式
```
feat(pipeline): add /pipeline:init command for case initialization

Creates project directory, initializes pipeline-state.json,
records init event in handoff-log.json, and checks research
tool availability (Brave/Tavily/Exa API keys).

Refs: 20260212-001-5ai-pipeline#003
```

## 7. 注意事項

### 7.1 技術的制約
- [ ] スラッシュコマンドファイルとして正しいMarkdown構文であること
- [ ] Claude Codeが解釈可能な形式で手順を記述すること
- [ ] UTF-8（BOM付き）エンコーディングで保存すること
- [ ] 改行コードはCRLFを使用すること

### 7.2 品質基準
- [ ] 処理手順が明確で曖昧さがないこと
- [ ] エラーケース（slug未指定等）の対応が記述されていること
- [ ] 出力フォーマットがユーザーフレンドリーであること

### 7.3 特記事項
- このコマンドはsd003の `/workflow:init` パターンを参考にしつつ、パイプライン専用に新規作成する
- `.claude/commands/` に配置することでClaude Codeのスラッシュコマンドとして自動認識される
- 案件IDの連番（NNN）は、同日に既に作成された案件数を `.kiro/ai-coordination/workflow/research/` 配下のディレクトリ名から判定する
- `case_type` は init 時点では空文字列とし、`/pipeline:run` や `/pipeline:research` 実行時に設定する

## 8. 完了報告フォーマット

実装完了時、以下の形式で報告:

```markdown
## 実装完了報告

### 変更ファイル
| ファイル | アクション | 行数 |
|---------|----------|------|
| `.claude/commands/pipeline-init.md` | Create | XXX行 |

### 検証結果
- コマンド構文: 正しいMarkdown
- 処理フロー: 全ステップ記述済み
- エラーハンドリング: 記述済み

### 次のアクション
- Codexレビュー依頼
```

---
**発行日時**: 2026-02-12 16:00
**発行者**: Claude Code
