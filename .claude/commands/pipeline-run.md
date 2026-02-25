# /pipeline:run {project_id} {case_type}

## 概要
5AI議論パイプラインの全フェーズ（Phase 0〜4）を一括実行します。各フェーズを自動的にチェーンし、失敗時には状態を保存して停止します。

## 引数
- `project_id`: 案件ID。
- `case_type`: 案件タイプ（`A`: 新規、`B`: 既存改善、`C`: DX、`D`: 危機対応）。

## 前提条件
- `/pipeline:init` により案件が初期化されていること。
- `pipeline-state.json` が存在すること。
- ステータスが `initialized`, `paused`, または `failed` であること。

## 実行手順

1. **引数・状態チェック**
   - `project_id` と `case_type` (A/B/C/D) が正しく指定されているか確認します。
   - `pipeline-state.json` を読み込み、現在のステータスを確認します。

2. **ステータス更新**
   - `pipeline-state.json` の `case_type` を設定し、`status` を `running` に更新します。

3. **自動チェーン実行 (Phase 0 〜 4)（`.claude/rules/pipeline/enforcement.md` Rule 5 準拠）**

   以下の順序で各フェーズのコマンドを呼び出します。各フェーズ完了後、**バリデーションゲート**を通過してから次へ進みます。既に `completed` になっているフェーズはスキップします。

   各フェーズ完了後のバリデーションゲート:
   1. 出力ファイル存在チェック → 欠落なら**停止**
   2. 出力スキーマ検証（enforcement.md Rule 2） → BLOCK判定なら**停止**
   3. 知的誠実性検証（enforcement.md Rule 3） → BLOCK判定なら**停止**
   4. `pipeline-state.json` 更新確認 → 更新なしなら**停止**
   5. 全チェック合格 → 次フェーズへ自動進行

   フェーズ実行順序:
   - **Phase 0 (Research)**: `/pipeline:research {project_id} {case_type}` → バリデーションゲート
   - **Phase 1 (Proposal)**: `/pipeline:propose {project_id}` → バリデーションゲート
   - **Phase 2 (Reinforcement)**: `/pipeline:reinforce {project_id}` → バリデーションゲート
   - **Phase 3 (Critique)**: `/pipeline:critique {project_id}` → バリデーションゲート
   - **Phase 3.5 (Historical)**: `/pipeline:history {project_id}` → バリデーションゲート
   - **Phase 4 (Integration)**: `/pipeline:integrate {project_id}` → 最終検証

4. **完了処理**
   - 全フェーズが正常終了した場合：
     - `pipeline-state.json` の `status` を `completed` に更新します。
     - `handoff-log.json` に `pipeline_complete` を記録します。
     - 最終レポートへのリンクを含む完了メッセージを表示します。

5. **エラーハンドリング**
   - いずれかのフェーズで失敗（`failed`）した場合：
     - `pipeline-state.json` の `status` を `failed` に更新します。
     - 失敗したフェーズ名とエラー内容をユーザーに報告します。
     - 再開方法（原因解消後に再度 `/pipeline:run`）を案内して停止します。

## 出力フォーマット

### 実行結果
| フェーズ | 状態 | 備考 |
|---------|------|------|
| Phase 0 | {p0_status} | |
| Phase 1 | {p1_status} | |
| Phase 2 | {p2_status} | |
| Phase 3 | {p3_status} | |
| Phase 3.5 | {p35_status} | |
| Phase 4 | {p4_status} | |

### 最終成果物（成功時）
- レポート: `.kiro/ai-coordination/workflow/research/{project_id}/phase4_integrated_report.md`

### エラー情報（失敗時）
- フェーズ: {failed_phase}
- 内容: {error_message}
