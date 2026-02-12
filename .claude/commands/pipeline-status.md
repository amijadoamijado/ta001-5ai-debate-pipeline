# /pipeline:status {project_id}

## 概要
5AI議論パイプライン案件の進捗状況、フェーズごとのステータス、および出力ファイルの存在を確認します。

## 引数
- `project_id`: 案件ID（例: `20260212-001-new-service-launch`）。

## 前提条件
- 指定された案件の `pipeline-state.json` が存在すること。

## 実行手順

1. **引数チェック**
   - `project_id` が指定されているか確認してください。未指定の場合はエラーを表示して終了します。

2. **pipeline-state.json の読み込み**
   - `.kiro/ai-coordination/workflow/research/{project_id}/pipeline-state.json` を読み込みます。
   - ファイルが存在しない場合は、「案件 ID {project_id} が見つかりません」と表示して終了します。

3. **出力ファイルの存在確認**
   - 各フェーズの期待される出力ファイルが `.kiro/ai-coordination/workflow/research/{project_id}/` 配下に存在するか確認します。
   - **期待されるファイル一覧:**
     - Phase 0: `phase0_claude_research.json`, `phase0_chatgpt_research.json`, `phase0_gemini_research.json`, `phase0_grok_research.json`, `phase0_perplexity_research.json`, `phase0_codex_research.json`, `phase0_research_integrated.json`
     - Phase 1: `phase1_proposal.json`, `phase1_proposal.md`
     - Phase 2: `phase2_reinforcement.json`, `phase2_reinforcement.md`
     - Phase 3: `phase3_critique.json`, `phase3_critique.md`
     - Phase 3.5: `phase3_5_historical.json`, `phase3_5_historical.md`
     - Phase 4: `phase4_integrated_report.json`, `phase4_integrated_report.md`

4. **情報の整理と表示**
   - 以下のフォーマットに従って現在の状態を表示してください。

## 出力フォーマット

### 基本情報
| 項目 | 値 |
|------|-----|
| 案件ID | {pipeline_id} |
| 案件タイプ | {case_type} |
| ステータス | {status} |
| 作成日時 | {created_at} |
| 最終更新 | {updated_at} |
| 現在フェーズ | {current_phase} |

### フェーズ進捗
| フェーズ | 状態 | 開始 | 完了 | 出力 |
|---------|------|------|------|------|
| Phase 0 (Research) | {p0_status} | {p0_start} | {p0_end} | {p0_file_check} |
| Phase 1 (Proposal) | {p1_status} | {p1_start} | {p1_end} | {p1_file_check} |
| Phase 2 (Reinforce) | {p2_status} | {p2_start} | {p2_end} | {p2_file_check} |
| Phase 3 (Critique) | {p3_status} | {p3_start} | {p3_end} | {p3_file_check} |
| Phase 3.5 (History) | {p35_status} | {p35_start} | {p35_end} | {p35_file_check} |
| Phase 4 (Integrate) | {p4_status} | {p4_start} | {p4_end} | {p4_file_check} |

※ 出力列: ○ (全ファイル存在), △ (一部存在), ✕ (なし)

### リサーチツール
| ツール | 利用可否 |
|--------|---------|
| Brave Search API | {brave} |
| Tavily API | {tavily} |
| Exa API | {exa} |

### エラー情報
{もしエラーがあれば表形式で表示。なければ「(エラーなし)」を表示}

---
### 次のステップ
- パイプライン実行: `/pipeline:run {project_id}`
- 特定フェーズ再開: `/pipeline:{phase_name} {project_id}`
