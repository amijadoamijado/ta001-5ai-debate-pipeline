# /pipeline:research {project_id} {case_type}

## 概要
5AI Deep Research（Phase 0）を実行します。Chrome MCPを使用して複数のAI（ChatGPT, Gemini, Perplexity, Grok, Claude）および Codex CLI を順次起動し、リサーチデータを収集・統合します。

## 引数
- `project_id`: 案件ID。
- `case_type`: 案件タイプ（A/B/C/D）。

## 前提条件
- `pipeline-state.json` が存在すること。
- Chrome MCP拡張が利用可能であること。

## 実行手順

1. **フェーズ開始記録**
   - `pipeline-state.json` の `phase0` ステータスを `running` に更新します。
   - `case_type` 引数を `pipeline-state.json` に保存します。

2. **行政MCP接続チェック (REQ-011.3)**
   - 案件タイプに応じた行政データソースの接続状態を確認します。
   - **MCP接続フォールバック構造**:
     ```
     1. MCP経由で接続試行 → 成功ならMCP使用
     2. 失敗 → REST API直接呼出（環境変数にキーがあれば）
     3. 失敗 → WebSearchツールで代替
     4. 全失敗 → 訓練データの知識のみで続行（Graceful Degradation）
     ```
   - フォールバック発生時は、`pipeline-state.json` およびログに「{API名} → {フォールバック先}」を記録します。

2. **案件タイプ別テンプレートの選択 (M-001)**
   - `case_type` 引数に基づき、以下のテンプレートを選択します。
     - **A**: `templates/pipeline/phase0/case-types/typeA-new-business.md`
     - **B**: `templates/pipeline/phase0/case-types/typeB-improvement.md`
     - **C**: `templates/pipeline/phase0/case-types/typeC-dx.md`
     - **D**: `templates/pipeline/phase0/case-types/typeD-crisis.md`
   - 選択したテンプレートのAI別セクションを、後続の各AI用プロンプトに注入します。

3. **案件タイプ別行政データソース選択 (REQ-011.2)**

   | 案件タイプ | 行政データソース | 対象AI |
   |-----------|----------------|---------|
   | **A** | e-Stat（市場規模） | Gemini |
   | **B** | 官公需入札 | ChatGPT |
   | **C** | e-Stat（技術統計） | Claude |
   | **D** | 不動産価格 | Grok |

   選択された行政データソース情報を各AIプロンプトに付加します。

4. **5AI + Codex 個別リサーチの実行**
   各AIに対して以下の手順を順番に実行します。

   ### ChatGPT Deep Research
   - `templates/pipeline/phase0/chatgpt-research.md` に案件タイプ別指示を組み合わせて使用。
   - Chromeで `chat.openai.com` を開き、「Deep Research」モードを選択してプロンプトを入力。
   - 完了後、JSON出力を `phase0_chatgpt_research.json` として保存。

   ### Gemini Deep Research
   - `templates/pipeline/phase0/gemini-research.md` に案件タイプ別指示を組み合わせて使用。
   - Chromeで `gemini.google.com` を開き、Deep Researchモードを有効にしてプロンプトを入力。
   - 完了後、JSON出力を `phase0_gemini_research.json` として保存。

   ### Perplexity Deep Research
   - `templates/pipeline/phase0/perplexity-research.md` に案件タイプ別指示を組み合わせて使用。
   - Chromeで `perplexity.ai` を開き、Pro Searchモードでプロンプトを入力。
   - 完了後、JSON出力を `phase0_perplexity_research.json` として保存。

   ### Grok Research
   - `templates/pipeline/phase0/grok-research.md` に案件タイプ別指示を組み合わせて使用。
   - Chromeで `x.com/i/grok` を開き、プロンプトを入力。
   - 完了後、JSON出力を `phase0_grok_research.json` として保存。

   ### Claude Deep Research
   - `templates/pipeline/phase0/claude-research.md` に案件タイプ別指示を組み合わせて使用。
   - Chromeで `claude.ai` を開き、Deep Researchモードでプロンプトを入力。
   - 完了後、JSON出力を `phase0_claude_research.json` として保存。

   ### Codex Technical Research
   - `templates/pipeline/phase0/codex-research.md` に案件タイプ別指示を組み合わせて使用。
   - Codex CLIで直接実行し、Web検索ツールを活用。
   - 完了後、JSON出力を `phase0_codex_research.json` として保存。

4. **リサーチデータの統合（Research Collector）**
   - 保存された6つのJSONを読み込みます。
   - **行政データ統合 (REQ-011.3)**: 各AIの `administrative_data` を収集し、統合レポートに付加します。
   - **Perplexityの検証反映**: `claim_verifications` を基に他AIの `confidence` を調整。
   - **矛盾検出**: `contradiction_flags` を集計し、統合レポートの「矛盾点」として整理。
   - **技術的裏付け**: Codexの結果を基に、実現可能性のリスクスコアを算出。
   - **死角分析**: 各AIの `gaps` をマージし、共通する「未解決課題（Blind Spots）」を特定。
   - 統合された結果を `phase0_research_integrated.json` として保存。

5. **完了処理**
   - `pipeline-state.json` の `phase0` を `completed` に更新。
   - `handoff-log.json` に `phase0_research_complete` を記録。

## エラーハンドリング (M-002)
- **タイムアウト**: 10分待機後、ユーザーに手動介入（継続/スキップ）を要求します。
- **ページロード失敗**: 1回リトライ後、該当AIをスキップします。`pipeline-state.json` にスキップ情報を記録し、統合レポートの `coverage_score` を下方修正、`blind_spots` に担当領域を追加します。
- **ログイン切れ**: パイプラインを一時停止し、ユーザーにログイン再要求のメッセージを表示します。ログイン確認後、該当AIから再開します。
- **出力形式不正**: 自動的にパースを試みますが、失敗した場合は `error` フィールドに記録し、手動修正を促します。
- **一部AI実行不能**: 取得済みのデータのみで統合を試み、その旨をログに記録します。
