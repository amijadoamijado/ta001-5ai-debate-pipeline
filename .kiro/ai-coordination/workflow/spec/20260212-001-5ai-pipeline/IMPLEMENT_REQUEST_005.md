# 実装指示: /pipeline:run コマンド作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 005 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/005-pipeline-run` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

```bash
# ブランチ作成コマンド
git checkout -b feature/20260212-001-5ai-pipeline/005-pipeline-run
```

## 2. 実装タスク概要

**タスク番号**: 005
**タスク名**: /pipeline:run コマンド作成（Task 2.3）

### 2.1 目的
Phase 0〜4を順次自動実行する一括実行コマンドを作成する。各フェーズ完了後に次フェーズを自動開始する「自動チェーン」を実現する。フェーズ失敗時にはpipeline-state.jsonにエラーを記録し停止する。パイプライン全体を1コマンドで実行するための最上位コマンドである。

### 2.2 依存タスク
| 依存タスク番号 | 状態 | 備考 |
|--------------|------|------|
| 003 | Pending | /pipeline:init（案件初期化が前提） |
| ※ Task 3.1〜3.7 | 未着手 | 各フェーズコマンド（pipeline-research, pipeline-propose, pipeline-reinforce, pipeline-critique, pipeline-history, pipeline-integrate）が全て完成している必要がある |

**重要**: このコマンドは各フェーズコマンドを順次呼び出す構造であるため、コマンドファイル自体の作成は可能だが、実際の動作テストは全フェーズコマンド完成後となる。

## 3. 実装範囲

### 3.1 変更可能ファイル
| ファイルパス | アクション | 説明 |
|------------|----------|------|
| `.claude/commands/pipeline-run.md` | Create | 全フェーズ一括実行コマンド |

### 3.2 禁止領域
| ファイル/ディレクトリ | 理由 |
|---------------------|------|
| `CLAUDE.md` | フレームワーク設定 |
| `.kiro/specs/` | 仕様書は変更不可 |

### 3.3 参照のみ
| ファイルパス | 参照理由 |
|------------|---------|
| `.kiro/specs/5ai-debate-pipeline/design.md` | Section 5.4-5.5 自動チェーン設計 |
| `.kiro/specs/5ai-debate-pipeline/requirements.md` | REQ-008.3 コマンド体系、REQ-001 パイプライン構成 |
| `src/pipeline/types/index.ts` | PipelineState, PipelineHandoffEntry型の確認 |

## 4. 追加・変更仕様（差分）

### 4.1 コマンド仕様

コマンドファイル `.claude/commands/pipeline-run.md` は、Claude Codeのスラッシュコマンドとして動作するMarkdownファイルである。ユーザーが `/pipeline:run {案件ID} {caseType}` と入力した際にClaude Codeがこのファイルを読み込み、全フェーズを順次自動実行する。

### 4.2 処理フロー（design.md Section 5.4 準拠）

```
入力: 案件ID, caseType (A|B|C|D)
  例: /pipeline:run 20260212-001-new-service-launch typeA

前提条件チェック:
  1. 案件IDが指定されていること
  2. caseTypeが A, B, C, D のいずれかであること
  3. pipeline-state.json が存在すること（/pipeline:init 実行済み）
  4. ステータスが "initialized" または "paused" または "failed" であること

処理:
  1. pipeline-state.json の case_type を設定
  2. pipeline-state.json の status を "running" に更新

  3. /pipeline:research {案件ID} {caseType} を実行
     → 完了待ち → pipeline-state.json 確認

  4. /pipeline:propose {案件ID} を実行
     → 完了待ち → pipeline-state.json 確認

  5. /pipeline:reinforce {案件ID} を実行
     → 完了待ち → pipeline-state.json 確認

  6. /pipeline:critique {案件ID} を実行
     → 完了待ち → pipeline-state.json 確認

  7. /pipeline:history {案件ID} を実行
     → 完了待ち → pipeline-state.json 確認

  8. /pipeline:integrate {案件ID} を実行
     → 完了待ち → pipeline-state.json 確認

  9. 全フェーズ完了
     - pipeline-state.json の status を "completed" に更新
     - handoff-log.json に pipeline_complete を記録
     - 完了メッセージを表示

エラー時:
  - フェーズ失敗
    → pipeline-state.json にエラーを記録（該当フェーズの error フィールド）
    → pipeline-state.json の status を "failed" に更新
    → ユーザーに失敗フェーズと原因を報告
    → 再開方法を案内（/pipeline:status → 原因解消 → /pipeline:run で再開）
```

### 4.3 自動チェーンルール（design.md Section 5.5 準拠）

| トリガー | 自動実行 | 説明 |
|---------|---------|------|
| `/pipeline:run` 開始 | → Phase 0〜4の順次自動実行 | 一括実行モード |
| Phase 0完了 | → Phase 1自動開始 | 統合レポート完成後 |
| Phase 1完了 | → Phase 2自動開始 | 提案書完成後 |
| Phase 2完了 | → Phase 3自動開始 | 補強レポート完成後 |
| Phase 3完了 | → Phase 3.5自動開始 | 批判レポート完成後 |
| Phase 3.5完了 | → Phase 4自動開始 | 歴史的検証完成後 |

**重要**: 個別実行時（`/pipeline:propose` 等を直接呼び出した場合）は自動チェーンしない。自動チェーンは `/pipeline:run` からの実行時のみ適用される。

### 4.4 再開ロジック

パイプラインが "failed" 状態から再開される場合:

```
1. pipeline-state.json を読み込み
2. 各フェーズのstatusを確認
3. "completed" のフェーズはスキップ
4. "failed" のフェーズから再実行
5. 以降のフェーズを順次実行
```

### 4.5 pipeline_complete のhandoff-log.json記録

```json
{
  "timestamp": "{ISO8601タイムスタンプ}",
  "type": "pipeline_complete",
  "project_id": "{案件ID}",
  "from": "Claude Code",
  "to": "User",
  "file": "workflow/research/{案件ID}/phase4_integrated_report.md",
  "phase": "phase4",
  "note": "パイプライン全フェーズ完了。最終レポート: phase4_integrated_report.md"
}
```

### 4.6 完了時の出力フォーマット

```markdown
## パイプライン完了: {案件ID}

### 実行結果
| フェーズ | 状態 | 所要時間 |
|---------|------|---------|
| Phase 0（リサーチ） | completed | XX分 |
| Phase 1（提案） | completed | XX分 |
| Phase 2（補強） | completed | XX分 |
| Phase 3（批判） | completed | XX分 |
| Phase 3.5（歴史的検証） | completed | XX分 |
| Phase 4（統合） | completed | XX分 |

### 最終成果物
- **意思決定ダッシュボード**: `.kiro/ai-coordination/workflow/research/{案件ID}/phase4_integrated_report.md`
- **構造化データ**: `.kiro/ai-coordination/workflow/research/{案件ID}/phase4_integrated_report.json`

### 次のステップ
1. `phase4_integrated_report.md` を確認してください
2. 意思決定ポイントについて経営判断をお願いします
```

### 4.7 失敗時の出力フォーマット

```markdown
## パイプライン停止: {案件ID}

### 失敗フェーズ
| 項目 | 値 |
|------|-----|
| フェーズ | Phase X（{フェーズ名}） |
| エラー | {エラー内容} |

### 完了済みフェーズ
| フェーズ | 状態 |
|---------|------|
| Phase 0 | completed |
| Phase 1 | completed |
| Phase 2 | failed ← ここで停止 |

### 再開方法
```bash
# 1. 状態確認
/pipeline:status {案件ID}

# 2. 原因を解消後、失敗フェーズを個別再実行
/pipeline:{失敗フェーズコマンド} {案件ID}

# 3. 残りを一括実行
/pipeline:run {案件ID} {caseType}
```
```

### 4.8 コマンドファイルの構造

```markdown
# /pipeline:run コマンド

## 概要
パイプラインの全フェーズ（Phase 0〜4）を順次自動実行する。

## 引数
$ARGUMENTS = 案件ID caseType
- 案件ID: /pipeline:init で生成されたID
- caseType: A（新規事業）/ B（既存改善）/ C（DX）/ D（危機対応）

## 前提条件チェック
1. 案件IDが指定されていること
2. caseTypeが A/B/C/D のいずれかであること
3. pipeline-state.json が存在すること
4. ステータスが initialized / paused / failed であること

## 自動チェーン実行
[上記4.2-4.4の処理フローを自然言語で記述]

## 完了処理
[上記4.5-4.6の完了時処理を記述]

## エラーハンドリング
[上記4.7の失敗時処理を記述]
```

## 5. 受け入れテスト

### 5.1 受け入れ基準チェックリスト
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| AC-001 | Phase 0〜4を順次自動実行すること | 6フェーズの実行手順が定義 (REQ-008.3) |
| AC-002 | 各フェーズ完了後に次フェーズを自動開始すること | 自動チェーンルールが定義 (design.md Section 5.5) |
| AC-003 | フェーズ失敗時にpipeline-state.jsonにエラーを記録し停止すること | エラー記録・停止手順が定義 |
| AC-004 | 失敗フェーズと原因をユーザーに報告すること | 失敗時出力フォーマットが定義 |
| AC-005 | pipeline_complete をhandoff-log.jsonに記録すること | 完了記録形式が定義 (REQ-008.2) |
| AC-006 | 再開ロジック（completedフェーズのスキップ）が定義されていること | 再開フローが記述 |
| AC-007 | caseType引数のバリデーションが定義されていること | A/B/C/D以外はエラー |

### 5.2 手動確認項目
| 確認ID | 確認内容 | 手順 | 期待結果 |
|--------|---------|------|---------|
| MC-001 | 正常系一括実行 | `/pipeline:run {ID} typeA` | 全フェーズ完了 |
| MC-002 | 不正なcaseType | `/pipeline:run {ID} typeX` | バリデーションエラー |
| MC-003 | 失敗からの再開 | Phase 2失敗後に再度 `/pipeline:run` | Phase 0-1スキップ、Phase 2から再開 |

## 6. コミット方針

### コミットメッセージ形式
```
feat(pipeline): add /pipeline:run command for auto-chain execution

Orchestrates Phase 0-4 sequential execution with auto-chain,
error handling, resume from failure, and pipeline completion
recording in handoff-log.json.

Refs: 20260212-001-5ai-pipeline#005
```

## 7. 注意事項

### 7.1 技術的制約
- [ ] スラッシュコマンドファイルとして正しいMarkdown構文であること
- [ ] Claude Codeが解釈可能な形式で手順を記述すること
- [ ] UTF-8（BOM付き）エンコーディングで保存すること
- [ ] 改行コードはCRLFを使用すること

### 7.2 品質基準
- [ ] 自動チェーンの各ステップが明確に定義されていること
- [ ] エラーハンドリングが全フェーズに対して定義されていること
- [ ] 再開ロジックが明確で曖昧さがないこと
- [ ] 完了・失敗時の出力が情報量充分であること

### 7.3 特記事項
- このコマンドはdesign.md Section 5.4-5.5 の自動チェーン設計に準拠する
- 各フェーズコマンドを「呼び出す」構造であり、フェーズの詳細ロジック自体は含まない
- Phase 0は最も時間がかかる（30〜60分）ため、途中経過をユーザーに随時報告すること
- 個別フェーズコマンド（Task 3.1〜3.7）の完成前でも、コマンドファイル自体は作成可能
- 自動チェーンは `/pipeline:run` 経由の実行時のみ。個別コマンド実行時は自動チェーンしない

## 8. 完了報告フォーマット

実装完了時、以下の形式で報告:

```markdown
## 実装完了報告

### 変更ファイル
| ファイル | アクション | 行数 |
|---------|----------|------|
| `.claude/commands/pipeline-run.md` | Create | XXX行 |

### 検証結果
- コマンド構文: 正しいMarkdown
- 自動チェーン: 6フェーズ全定義済み
- エラーハンドリング: 全フェーズ対応
- 再開ロジック: 定義済み
- 完了処理: handoff-log記録 + 出力フォーマット定義済み

### 次のアクション
- Codexレビュー依頼
```

---
**発行日時**: 2026-02-12 16:00
**発行者**: Claude Code
