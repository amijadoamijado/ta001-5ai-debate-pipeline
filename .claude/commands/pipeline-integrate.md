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

6. **完了処理 (M-008)**
   - `pipeline-state.json` の `phase4` を `completed` に更新。
   - `pipeline-state.json` の全体の `status` を `completed` に更新。
   - `handoff-log.json` に以下の2つのエントリを記録。
     1. `phase4_integration`（Phase 4実行完了）
     2. `pipeline_complete`（パイプライン全体完了）

## 出力フォーマット
- パイプライン全体の完了メッセージと、最終成果物（意思決定ダッシュボード）へのパスを表示します。
