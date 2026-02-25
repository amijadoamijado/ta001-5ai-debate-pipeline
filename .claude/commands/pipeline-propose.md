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

### Step 0: エンフォースメントチェック（`.claude/rules/pipeline/enforcement.md` 準拠）

**以下のチェックを全て通過しなければ、本フェーズの実行に進んではならない。**

1. `pipeline-state.json` を読み込む
2. Phase 0 の `status` が `completed` であることを確認
3. 以下の必須入力ファイルが存在し、サイズ > 0 であることを確認:
   - `.kiro/ai-coordination/workflow/research/{project_id}/phase0_research_integrated.json`
4. `phase0_research_integrated.json` が有効なJSONであることをパース確認

**不合格時**: 実行を中止し、不合格理由を表示。「`/pipeline:research {project_id}` を先に実行してください」と案内。

---

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

6. **出力検証（完了前バリデーション）**

   以下のチェックを全て通過しなければ、フェーズを `completed` にしてはならない。

   - [ ] `phase1_proposal.json` が有効なJSONであること
   - [ ] `weakest_point_identified` が存在し、`target_phase`, `claim`, `weakness`, `severity` が全て非空
   - [ ] `disagreements` が配列として存在（空配列の場合は理由が明記されていること）
   - [ ] `verification_method` が存在し、`approach`, `tools_used`, `limitations` が全て非空
   - [ ] `phase1_proposal.md` が生成されていること

   **不合格時**: `pipeline-state.json` の `phase1` を `failed` に設定し、エラー内容を `error` フィールドに記録。

7. **完了処理**
   - 出力検証に合格した場合のみ、`pipeline-state.json` の `phase1` を `completed` に更新。
   - `handoff-log.json` に `phase1_proposal` を記録。

## 出力フォーマット
- 提案概要と生成されたファイルパスを表示します。
- 次のフェーズ（Phase 2: 補強）への案内を表示します。
