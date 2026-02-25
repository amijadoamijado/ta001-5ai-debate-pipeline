# /pipeline:critique {project_id}

## 概要
批判・検証（Phase 3）を実行します。提案と補強分析に対して、Gemini APIが批判者として失敗シナリオの構築と反証の提示を行います。

## 引数
- `project_id`: 案件ID。

## 前提条件
- `pipeline-state.json` が存在すること。
- Phase 2（補強）が `completed` 状態であること。
- `phase1_proposal.json` と `phase2_reinforcement.json` が存在すること。

## 実行手順

### Step 0: エンフォースメントチェック（`.claude/rules/pipeline/enforcement.md` 準拠）

**以下のチェックを全て通過しなければ、本フェーズの実行に進んではならない。**

1. `pipeline-state.json` を読み込む
2. Phase 2 の `status` が `completed` であることを確認
3. 以下の必須入力ファイルが存在し、サイズ > 0 であることを確認:
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase1_proposal.json`
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase2_reinforcement.json`
4. 上記JSONが有効であることをパース確認

**不合格時**: 実行を中止し、不合格理由を表示。「`/pipeline:reinforce {project_id}` を先に実行してください」と案内。

---

1. **フェーズ状態チェック**
   - 案件IDの `pipeline-state.json` を確認し、Phase 2が完了しているか確認します。

2. **フェーズ開始記録**
   - `pipeline-state.json` の `phase3` ステータスを `running` に更新します。

3. **リサーチツールの準備 (M-003)**
   - 以下の順序で各リサーチツール（Brave, Exa）の利用可能性を確認し、フォールバックを適用します。
     1. MCP経由で接続試行 → 成功ならMCP使用
     2. 失敗 → REST API直接呼び出し（環境変数 `BRAVE_API_KEY`, `EXA_API_KEY` にキーがあれば）
     3. 失敗 → WebSearchツール（Claude Code組み込み）で代替
     4. 全失敗 → 訓練データの知識のみで続行（Graceful Degradation）
   - フォールバック発生時は、`pipeline-state.json` およびログに「{ツール名} → {フォールバック先}」を記録します。

4. **プロンプトの構築**
   - 以下のファイルを読み込み、プロンプトを合成します。
     - `templates/pipeline/intellectual-honesty.md`
     - `templates/pipeline/phase3/critique.md`
   - `phase1_proposal.json` と `phase2_reinforcement.json` の内容をコンテキストとして追加します。

5. **Gemini APIの実行**
   - 合成したプロンプトをGemini APIに送信し、批判・検証分析を生成させます。
   - 内部的にBrave API / Exa API（またはWebSearch）を使用して反証事例の検索を実行させます。

6. **出力の保存**
   - 生成されたJSONセクションを `phase3_critique.json` として保存します。
   - 生成されたMarkdownセクションを `phase3_critique.md` として保存します。

7. **出力検証（完了前バリデーション）**

   以下のチェックを全て通過しなければ、フェーズを `completed` にしてはならない。

   - [ ] `phase3_critique.json` が有効なJSONであること
   - [ ] `weakest_point_identified` が存在し、全サブフィールド非空
   - [ ] `disagreements` が配列として存在
   - [ ] `verification_method` が存在し、全サブフィールド非空
   - [ ] **失敗シナリオが3件以上**含まれていること（REQ-001.4）
   - [ ] リスク評価に定量値（likelihood × impact）が含まれていること
   - [ ] 反証が1件以上の具体的根拠を含むこと
   - [ ] `phase3_critique.md` が生成されていること

   **不合格時**: `pipeline-state.json` の `phase3` を `failed` に設定し、エラー内容を `error` フィールドに記録。

8. **完了処理**
   - 出力検証に合格した場合のみ、`pipeline-state.json` の `phase3` を `completed` に更新。
   - `handoff-log.json` に `phase3_critique` を記録。

## 出力フォーマット
- 批判概要と生成されたファイルパスを表示します。
- 次のフェーズ（Phase 3.5: 歴史的検証）への案内を表示します。
