# /pipeline:history {project_id}

## 概要
歴史的検証（Phase 3.5）を実行します。提案された戦略を古今東西の歴史的事例と照合し、成功パターンや失敗の警告を抽出します。このフェーズはClaude Codeがローカルで実行します。

## 引数
- `project_id`: 案件ID。

## 前提条件
- `pipeline-state.json` が存在すること。
- Phase 3（批判）が `completed` 状態であること。
- `phase1_proposal.json`, `phase2_reinforcement.json`, `phase3_critique.json` が存在すること。

## 実行手順

### Step 0: エンフォースメントチェック（`.claude/rules/pipeline/enforcement.md` 準拠）

**以下のチェックを全て通過しなければ、本フェーズの実行に進んではならない。**

1. `pipeline-state.json` を読み込む
2. Phase 3 の `status` が `completed` であることを確認
3. 以下の必須入力ファイルが存在し、サイズ > 0 であることを確認:
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase1_proposal.json`
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase2_reinforcement.json`
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase3_critique.json`
4. 上記JSONが有効であることをパース確認

**不合格時**: 実行を中止し、不合格理由を表示。「`/pipeline:critique {project_id}` を先に実行してください」と案内。

---

1. **フェーズ状態チェック**
   - 案件IDの `pipeline-state.json` を確認し、Phase 3が完了しているか確認します。

2. **フェーズ開始記録**
   - `pipeline-state.json` の `phase3_5` ステータスを `running` に更新します。

3. **リサーチツールの準備 (M-003)**
   - 以下の順序で各リサーチツール（Brave, Tavily, Exa）の利用可能性を確認し、フォールバックを適用します。
     1. MCP経由で接続試行 → 成功ならMCP使用
     2. 失敗 → REST API直接呼び出し（環境変数等にキーがあれば）
     3. 失敗 → WebSearchツール（Claude Code組み込み）で代替
     4. 全失敗 → 訓練データの知識のみで続行（Graceful Degradation）
   - フォールバック発生時は、`pipeline-state.json` およびログに「{ツール名} → {フォールバック先}」を記録します。

4. **プロンプトの構築**
   - 以下のファイルを読み込み、プロンプトを合成します。
     - `templates/pipeline/intellectual-honesty.md`
     - `templates/pipeline/phase3_5/historical.md`
   - Phase 1, 2, 3 のJSONデータをコンテキストとして追加します。

5. **歴史的検証の実行（Claude Code）**
   - 合成したプロンプトに基づき、Claude Codeが自身の知識とリサーチツールを駆使して歴史的分析を実行します。
   - ポーター、アンゾフ、BCG、フォード、トヨタ、マスク等の戦略理論・改善哲学との照合を行います。

6. **出力の保存**
   - 生成されたJSONセクションを `phase3_5_historical.json` として保存します。
   - 生成されたMarkdownセクションを `phase3_5_historical.md` として保存します。

7. **出力検証（完了前バリデーション）**

   以下のチェックを全て通過しなければ、フェーズを `completed` にしてはならない。

   - [ ] `phase3_5_historical.json` が有効なJSONであること
   - [ ] `weakest_point_identified` が存在し、全サブフィールド非空
   - [ ] `disagreements` が配列として存在
   - [ ] `verification_method` が存在し、全サブフィールド非空
   - [ ] `historical_parallels` が配列で1件以上（REQ-001.5）
   - [ ] `success_patterns` が配列で**成功事例3件以上**（REQ-001.5）
   - [ ] `failure_warnings` が配列で**失敗事例3件以上**（REQ-001.5）
   - [ ] `recovery_playbooks` が配列で1件以上（REQ-001.5）
   - [ ] `strategic_frameworks` が配列で**3件以上**（REQ-001.5）
   - [ ] `history_verdict.judgment` が `support` / `caution` / `against` のいずれか（REQ-001.5）
   - [ ] `phase3_5_historical.md` が生成されていること

   **不合格時**: `pipeline-state.json` の `phase3_5` を `failed` に設定し、エラー内容を `error` フィールドに記録。

8. **完了処理**
   - 出力検証に合格した場合のみ、`pipeline-state.json` の `phase3_5` を `completed` に更新。
   - `handoff-log.json` に `phase3_5_historical` を記録。

## 出力フォーマット
- 歴史判定（History Verdict）の要約と生成されたファイルパスを表示します。
- 次のフェーズ（Phase 4: 統合）への案内を表示します。
