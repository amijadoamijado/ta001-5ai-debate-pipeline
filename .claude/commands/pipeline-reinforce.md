# /pipeline:reinforce {project_id}

## 概要
補強分析（Phase 2）を実行します。Phase 1の提案に対して、Codex APIが分析官として数値的裏付けとロジック検証を行います。

## 引数
- `project_id`: 案件ID。

## 前提条件
- `pipeline-state.json` が存在すること。
- Phase 1（提案）が `completed` 状態であること。
- `phase1_proposal.json` が存在すること。
- `phase0_codex_research.json` が存在すること。

## 実行手順

### Step 0: エンフォースメントチェック（`.claude/rules/pipeline/enforcement.md` 準拠）

**以下のチェックを全て通過しなければ、本フェーズの実行に進んではならない。**

1. `pipeline-state.json` を読み込む
2. Phase 1 の `status` が `completed` であることを確認
3. 以下の必須入力ファイルが存在し、サイズ > 0 であることを確認:
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase1_proposal.json`
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase0_codex_research.json`
4. 上記JSONが有効であることをパース確認

**不合格時**: 実行を中止し、不合格理由を表示。「`/pipeline:propose {project_id}` を先に実行してください」と案内。

---

1. **フェーズ状態チェック**
   - 案件IDの `pipeline-state.json` を確認し、Phase 1が完了しているか確認します。

2. **フェーズ開始記録**
   - `pipeline-state.json` の `phase2` ステータスを `running` に更新します。

3. **リサーチツールの準備 (M-003)**
   - 以下の順序でリサーチツール（Tavily）の利用可能性を確認し、フォールバックを適用します。
     1. MCP経由で接続試行 → 成功ならMCP使用
     2. 失敗 → REST API直接呼び出し（環境変数 `TAVILY_API_KEY` にキーがあれば）
     3. 失敗 → WebSearchツール（Claude Code組み込み）で代替
     4. 全失敗 → 訓練データの知識のみで続行（Graceful Degradation）
   - フォールバック発生時は、`pipeline-state.json` およびログに「{ツール名} → {フォールバック先}」を記録します。

4. **プロンプトの構築**
   - 以下のファイルを読み込み、プロンプトを合成します。
     - `templates/pipeline/intellectual-honesty.md`
     - `templates/pipeline/phase2/reinforcement.md`
   - `phase1_proposal.json` と `phase0_codex_research.json` の内容をコンテキストとして追加します。
   - **行政データ活用指示 (REQ-011.4)**: Phase 0で取得された行政データ（`administrative_data`）がある場合、それを数値裏付けに使用する指示を追加します。
     - Type B案件: 官公需入札データを価格ベンチマークとして使用
     - Type A案件: e-Statデータを市場規模の客観的根拠として使用
     - 信頼度調整: 官公需データは `reliability: "high"` で扱う

5. **Codex APIの実行**
   - 合成したプロンプトをCodex APIに送信し、補強分析を生成させます。
   - 内部的にTavily API（またはWebSearch）を使用して数値データの裏取りを実行させます。

6. **出力の保存**
   - 生成されたJSONセクションを `phase2_reinforcement.json` として保存します。
   - 生成されたMarkdownセクションを `phase2_reinforcement.md` として保存します。

7. **出力検証（完了前バリデーション）**

   以下のチェックを全て通過しなければ、フェーズを `completed` にしてはならない。

   - [ ] `phase2_reinforcement.json` が有効なJSONであること
   - [ ] `weakest_point_identified` が存在し、全サブフィールド非空
   - [ ] `disagreements` が配列として存在（空配列の場合は理由が明記されていること）
   - [ ] `verification_method` が存在し、全サブフィールド非空
   - [ ] `phase2_reinforcement.md` が生成されていること

   **不合格時**: `pipeline-state.json` の `phase2` を `failed` に設定し、エラー内容を `error` フィールドに記録。

8. **完了処理**
   - 出力検証に合格した場合のみ、`pipeline-state.json` の `phase2` を `completed` に更新。
   - `handoff-log.json` に `phase2_reinforcement` を記録。

## 出力フォーマット
- 分析概要と生成されたファイルパスを表示します。
- 次のフェーズ（Phase 3: 批判）への案内を表示します。
