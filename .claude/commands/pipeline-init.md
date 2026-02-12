# /pipeline:init {slug}

## 概要
5AI議論パイプラインの新規案件を初期化します。案件IDの生成、ディレクトリ作成、状態管理ファイルの初期化を行います。

## 引数
- `slug`: 案件の短縮名（例: `new-service-launch`）。英数字とハイフンのみ。

## 前提条件
- `.kiro/ai-coordination/` ディレクトリが存在すること。

## 実行手順

1. **引数チェック**
   - `slug` が指定されているか確認してください。未指定の場合はエラーを表示して終了します。

2. **案件IDの生成**
   - 現在の日付（YYYYMMDD形式）を取得します。
   - `.kiro/ai-coordination/workflow/research/` 配下の既存ディレクトリを確認し、当日の最大連番（NNN）を特定します。
   - 新しいID `YYYYMMDD-NNN-{slug}` を生成します（例: `20260212-001-test`）。

3. **ディレクトリの作成**
   - `.kiro/ai-coordination/workflow/research/{案件ID}/` を作成します。

4. **リサーチツールの確認**
   - 環境変数 `BRAVE_API_KEY`, `TAVILY_API_KEY`, `EXA_API_KEY` の設定状況を確認し、各ツールの利用可否を判定します。

5. **pipeline-state.json の初期化**
   - 以下の構造で `.kiro/ai-coordination/workflow/research/{案件ID}/pipeline-state.json` を作成します。
   ```json
   {
     "pipeline_id": "{案件ID}",
     "slug": "{slug}",
     "case_type": null,
     "created_at": "{現在時刻(ISO8601)}",
     "updated_at": "{現在時刻(ISO8601)}",
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
       "brave": {brave_status},
       "tavily": {tavily_status},
       "exa": {exa_status}
     }
   }
   ```

6. **ハンドオフログの記録**
   - `.kiro/ai-coordination/handoff/handoff-log.json`（存在しない場合は新規作成）に以下のエントリを追加します。
   ```json
   {
     "timestamp": "{現在時刻(ISO8601)}",
     "type": "pipeline_init",
     "project_id": "{案件ID}",
     "from": "Claude Code",
     "to": "Pipeline System",
     "file": "workflow/research/{案件ID}/pipeline-state.json",
     "phase": "phase0",
     "note": "パイプライン案件初期化: {slug}"
   }
   ```

## 出力
初期化完了後、以下の情報を表示してください。
- **案件ID**: `{案件ID}`
- **作業ディレクトリ**: `.kiro/ai-coordination/workflow/research/{案件ID}/`
- **リサーチツール状態**:
  - Brave: {OK/NG}
  - Tavily: {OK/NG}
  - Exa: {OK/NG}
- **次のステップ**:
  - `/pipeline:status {案件ID}` で進捗を確認できます。
  - `/pipeline:run {案件ID}` でパイプラインを開始してください。
