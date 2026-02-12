# /pipeline:propose {project_id}

## 概要
戦略提案（Phase 1）を実行します。Phase 0のリサーチデータを入力として、Claude APIが戦略オプションを構築します。

## 引数
- `project_id`: 案件ID。

## 前提条件
- `pipeline-state.json` が存在すること。
- Phase 0（リサーチ）が `completed` 状態であること。
- `phase0_research_integrated.json` が存在すること。

## 実行手順

1. **フェーズ状態チェック**
   - 案件IDの `pipeline-state.json` を確認し、Phase 0が完了しているか確認します。未完了の場合はエラーを表示します。

2. **フェーズ開始記録**
   - `pipeline-state.json` の `phase1` ステータスを `running` に更新します。

3. **プロンプトの構築**
   - 以下のファイルを読み込み、プロンプトを合成します。
     - `templates/pipeline/intellectual-honesty.md`
     - `templates/pipeline/phase1/proposal.md`
   - `phase0_research_integrated.json` の内容をコンテキストとして追加します。

4. **Claude APIの実行**
   - 合成したプロンプトをClaude APIに送信し、戦略提案を生成させます。

5. **出力の保存**
   - 生成されたJSONセクションを `phase1_proposal.json` として保存します。
   - 生成されたMarkdownセクションを `phase1_proposal.md` として保存します。

6. **完了処理**
   - `pipeline-state.json` の `phase1` を `completed` に更新。
   - `handoff-log.json` に `phase1_proposal` を記録。

## 出力フォーマット
- 提案概要と生成されたファイルパスを表示します。
- 次のフェーズ（Phase 2: 補強）への案内を表示します。
