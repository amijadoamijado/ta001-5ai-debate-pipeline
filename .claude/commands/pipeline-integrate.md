# /pipeline:integrate {project_id}

## 概要
統合レポート（Phase 4）を実行します。Phase 0〜3.5の全出力を統合し、経営者が意思決定に使える最終レポート（意思決定ダッシュボード）をClaude APIが生成します。

## 引数
- `project_id`: 案件ID。

## 前提条件
- `pipeline-state.json` が存在すること。
- Phase 3.5（歴史的検証）が `completed` 状態であること。
- Phase 0〜3.5の全てのJSON出力ファイルが存在すること。

## 実行手順

### Step 0: エンフォースメントチェック（`.claude/rules/pipeline/enforcement.md` 準拠）

**以下のチェックを全て通過しなければ、本フェーズの実行に進んではならない。**

1. `pipeline-state.json` を読み込む
2. Phase 3.5 の `status` が `completed` であることを確認
3. 以下の必須入力ファイルが**全て**存在し、サイズ > 0 であることを確認:
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase0_research_integrated.json`
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase1_proposal.json`
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase2_reinforcement.json`
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase3_critique.json`
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase3_5_historical.json`
4. 上記JSONが有効であることをパース確認

**不合格時**: 実行を中止し、不合格理由（欠落ファイル一覧）を表示。「`/pipeline:history {project_id}` を先に実行してください」と案内。

---

1. **フェーズ状態チェック**
   - 案件IDの `pipeline-state.json` を確認し、Phase 3.5が完了しているか確認します。

2. **フェーズ開始記録**
   - `pipeline-state.json` の `phase4` ステータスを `running` に更新します。

3. **プロンプトの構築**
   - 以下のファイルを読み込み、プロンプトを合成します。
     - `templates/pipeline/intellectual-honesty.md`
     - `templates/pipeline/phase4/integration.md`
   - Phase 0, 1, 2, 3, 3.5 の全てのJSONデータの要点を抽出し、コンテキストとして追加します。

4. **Claude APIの実行**
   - 合成したプロンプトをClaude APIに送信し、最終統合レポートを生成させます。

5. **出力の保存**
   - 生成されたJSONセクションを `phase4_integrated_report.json` として保存します。
   - 生成されたMarkdownセクションを `phase4_integrated_report.md` として保存します。

6. **出力検証（完了前バリデーション）**

   以下のチェックを全て通過しなければ、フェーズを `completed` にしてはならない。

   - [ ] `phase4_integrated_report.json` が有効なJSONであること
   - [ ] `weakest_point_identified` が存在し、全サブフィールド非空
   - [ ] `disagreements` が配列として存在
   - [ ] `verification_method` が存在し、全サブフィールド非空
   - [ ] `executive_summary` が非空文字列であること（REQ-001.6）
   - [ ] `recommendations` が配列で1件以上、各項目に `confidence` (0-1)（REQ-001.6）
   - [ ] `history_supported_options` が配列であること（REQ-001.6）
   - [ ] `history_warned_options` が配列であること（REQ-001.6）
   - [ ] `decision_points` が配列で1件以上（REQ-001.6）
   - [ ] `phase4_integrated_report.md` が生成されていること

   **不合格時**: `pipeline-state.json` の `phase4` を `failed` に設定し、エラー内容を `error` フィールドに記録。

7. **完了処理 (M-008)**
   - 出力検証に合格した場合のみ、`pipeline-state.json` の `phase4` を `completed` に更新。
   - `pipeline-state.json` の全体の `status` を `completed` に更新。
   - `handoff-log.json` に以下の2つのエントリを記録。
     1. `phase4_integration`（Phase 4実行完了）
     2. `pipeline_complete`（パイプライン全体完了）

## 出力フォーマット
- パイプライン全体の完了メッセージと、最終成果物（意思決定ダッシュボード）へのパスを表示します。
