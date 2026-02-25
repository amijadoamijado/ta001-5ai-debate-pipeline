# 実装指示: パイプライン実行エンフォースメント（Phase Gate + 出力検証 + 知的誠実性バリデーション）

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260225-002-pipeline-enforcement |
| タスク番号 | 001 |
| 発行日時 | 2026-02-25 21:17 |
| 発行者 | Claude Code |
| 宛先 | Claude Code（自己実装） |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `claude/implement-pipeline-enforcement-S4Edb` |
| ベースブランチ | `main` |

## 2. 実装タスク概要

**タスク番号**: 001
**タスク名**: パイプライン実行エンフォースメント

### 2.1 目的

5AI議論パイプライン（20260212-001-5ai-pipeline で構築済み）の実行に対して、**プログラマティックなエンフォースメント機構**を追加する。

現在のパイプラインコマンド（`.claude/commands/pipeline-*.md`）は手順を自然言語で記述しているが、以下の重要な保証が欠如している:

| # | 欠落している保証 | リスク |
|---|----------------|--------|
| 1 | **Phase Gate 強制** | Phase 1未完了でPhase 2を実行可能。前フェーズの出力なしに次フェーズが走ると意味のない結果を生成 |
| 2 | **出力スキーマ検証** | AIが不完全なJSONを出力しても検出されず、後続フェーズが壊れたデータを入力として使用 |
| 3 | **知的誠実性フィールド検証** | `weakest_point_identified`, `disagreements[]`, `verification_method` が空・欠落でもパイプラインが進行 |
| 4 | **状態遷移の整合性** | `pipeline-state.json` の不正な状態遷移（pending→completed等）が許容される |
| 5 | **受入基準（Acceptance Criteria）チェック** | Phase 3の「失敗シナリオ3件以上」等の定量的受入基準が検証されない |

### 2.2 依存タスク
| 依存タスク番号 | 状態 | 備考 |
|--------------|------|------|
| 20260212-001-5ai-pipeline 全タスク | Completed | パイプライン基盤（型定義・コマンド・テンプレート23ファイル） |

## 3. 実装範囲

### 3.1 変更可能ファイル
| ファイルパス | アクション | 説明 |
|------------|----------|------|
| `.claude/rules/pipeline/enforcement.md` | **Create** | パイプラインエンフォースメントルール（Claude Code自動読込） |
| `.claude/commands/pipeline-propose.md` | Modify | Phase Gate + 出力検証チェックポイント追加 |
| `.claude/commands/pipeline-reinforce.md` | Modify | Phase Gate + 出力検証チェックポイント追加 |
| `.claude/commands/pipeline-critique.md` | Modify | Phase Gate + 出力検証チェックポイント追加 |
| `.claude/commands/pipeline-history.md` | Modify | Phase Gate + 出力検証チェックポイント追加 |
| `.claude/commands/pipeline-integrate.md` | Modify | Phase Gate + 出力検証チェックポイント追加 |
| `.claude/commands/pipeline-run.md` | Modify | フェーズ間出力検証ゲート追加 |
| `.claude/commands/pipeline-research.md` | Modify | 出力検証チェックポイント追加 |

### 3.2 禁止領域
| ファイル/ディレクトリ | 理由 |
|---------------------|------|
| `CLAUDE.md` | フレームワーク設定 |
| `.kiro/specs/` | 仕様書は変更不可 |
| `src/pipeline/types/index.ts` | 型定義は変更不可（検証の基準として参照のみ） |
| `templates/pipeline/` | テンプレートは変更不可 |

### 3.3 参照のみ
| ファイルパス | 参照理由 |
|------------|---------|
| `src/pipeline/types/index.ts` | 出力スキーマの検証基準 |
| `.kiro/specs/5ai-debate-pipeline/requirements.md` | 受入基準の確認 |
| `.kiro/specs/5ai-debate-pipeline/design.md` | 設計仕様の確認 |

## 4. 追加・変更仕様（差分）

### 4.1 新規ファイル: `.claude/rules/pipeline/enforcement.md`

Claude Codeが自動読込するルールファイル。パイプラインコマンド実行時に強制適用される。

```markdown
# パイプラインエンフォースメントルール

## 適用範囲
パス: `.claude/commands/pipeline-*.md` が実行される際に自動適用

---

## Rule 1: Phase Gate（フェーズ関門）

### 1.1 フェーズ順序制約

パイプラインのフェーズは以下の順序でのみ実行可能。スキップ・逆走は禁止。

| 実行フェーズ | 必須完了フェーズ | 必須入力ファイル |
|------------|---------------|----------------|
| Phase 0 | (なし) | pipeline-state.json |
| Phase 1 | Phase 0 | phase0_research_integrated.json |
| Phase 2 | Phase 1 | phase1_proposal.json, phase0_codex_research.json |
| Phase 3 | Phase 2 | phase1_proposal.json, phase2_reinforcement.json |
| Phase 3.5 | Phase 3 | phase1_proposal.json, phase2_reinforcement.json, phase3_critique.json |
| Phase 4 | Phase 3.5 | phase0〜phase3_5 全JSON |

### 1.2 Gate Check 手順（各コマンド実行前に必須）

1. `pipeline-state.json` を読み込む
2. 必須完了フェーズの `status` が `completed` であることを確認
3. 必須入力ファイルが全て存在することを確認（ファイルサイズ > 0）
4. いずれかが不合格の場合:
   - **実行を中止**する（次に進まない）
   - 不合格理由を明示的にユーザーに報告
   - 解決方法を案内（例:「先に /pipeline:propose を実行してください」）

### 1.3 状態遷移ルール

有効な `pipeline-state.json` 状態遷移:

| 現在の状態 | 許可される遷移先 | 禁止される遷移 |
|-----------|---------------|--------------|
| `pending` | `running` | `completed`, `skipped` |
| `running` | `completed`, `failed` | `pending` |
| `completed` | (変更不可) | 全て |
| `failed` | `running`（再実行時） | `completed`, `pending` |
| `skipped` | (変更不可) | 全て |

**禁止**: `pending` → `completed` への直接遷移（`running` を経由必須）

---

## Rule 2: 出力スキーマ検証（Output Validation）

### 2.1 Phase 0 出力検証

`phase0_research_integrated.json` に対して:

| チェック項目 | 基準 | 不合格時アクション |
|------------|------|-----------------|
| JSONパース成功 | 有効なJSON | エラー報告、Phase 1に進まない |
| `market_overview` 存在 | 非null | 警告 + 続行 |
| `contradictions` 存在 | 配列であること | 警告 + 続行 |
| `blind_spots` 存在 | 配列であること | 警告 + 続行 |
| `research_quality` 存在 | オブジェクトであること | 警告 + 続行 |

### 2.2 Phase 1〜3 出力検証（共通）

各フェーズの `.json` 出力に対して:

| チェック項目 | 基準 | 不合格時アクション |
|------------|------|-----------------|
| JSONパース成功 | 有効なJSON | **エラー: 次フェーズに進まない** |
| `weakest_point_identified` 存在 | 非null、全フィールド非空 | **エラー: 知的誠実性違反** |
| `disagreements` 存在 | 配列であること | **エラー: 知的誠実性違反** |
| `verification_method` 存在 | 非null、全フィールド非空 | **エラー: 知的誠実性違反** |
| `.md` ファイル存在 | 人間可読版が生成されていること | 警告 + 続行 |

### 2.3 Phase 3 固有検証

| チェック項目 | 基準 | REQ参照 |
|------------|------|---------|
| 失敗シナリオ数 | 3件以上 | REQ-001.4 |
| リスク評価 | 定量値（likelihood × impact）含む | REQ-001.4 |
| 反証 | 1件以上の具体的根拠 | REQ-001.4 |

### 2.4 Phase 3.5 固有検証

| チェック項目 | 基準 | REQ参照 |
|------------|------|---------|
| `historical_parallels` | 配列、1件以上 | REQ-001.5 |
| `success_patterns` | 配列、成功事例3件以上 | REQ-001.5 |
| `failure_warnings` | 配列、失敗事例3件以上 | REQ-001.5 |
| `recovery_playbooks` | 配列、1件以上 | REQ-001.5 |
| `strategic_frameworks` | 配列、3件以上 | REQ-001.5 |
| `history_verdict` | 非null、`judgment` が support/caution/against のいずれか | REQ-001.5 |

### 2.5 Phase 4 固有検証

| チェック項目 | 基準 | REQ参照 |
|------------|------|---------|
| `executive_summary` | 非空文字列 | REQ-001.6 |
| `recommendations` | 配列、1件以上、各項目に `confidence` (0-1) | REQ-001.6 |
| `history_supported_options` | 配列 | REQ-001.6 |
| `history_warned_options` | 配列 | REQ-001.6 |
| `decision_points` | 配列、1件以上 | REQ-001.6 |

---

## Rule 3: 知的誠実性エンフォースメント

### 3.1 必須フィールド検証（Phase 1〜4 全出力）

以下の3フィールドが**全て**存在し、**非空**であることを検証:

1. **`weakest_point_identified`**: オブジェクト型
   - `target_phase`: 非空文字列
   - `claim`: 非空文字列
   - `weakness`: 非空文字列
   - `severity`: "critical" | "major" | "minor" のいずれか

2. **`disagreements`**: 配列型
   - 空配列の場合: 出力内に「disagreementsが0件である理由」の明記が必須（REQ-004.2）
   - 非空の場合: 各要素に `target_claim`, `alternative_view`, `evidence[]` が必須

3. **`verification_method`**: オブジェクト型
   - `approach`: 非空文字列
   - `tools_used`: 非空配列
   - `limitations`: 非空文字列

### 3.2 違反時の処置

| 重大度 | 条件 | アクション |
|--------|------|---------|
| **BLOCK** | 3フィールドのいずれかが完全欠落 | 次フェーズへの進行を禁止。再生成を要求 |
| **WARN** | フィールド存在するが一部サブフィールドが空 | 警告表示。ユーザーに確認後、続行可 |
| **INFO** | disagreements が空配列（理由明記あり） | 情報表示のみ。正常 |

---

## Rule 4: handoff-log.json 記録強制

### 4.1 記録タイミング

| イベント | 記録必須 | type値 |
|---------|---------|--------|
| パイプライン初期化 | Yes | `pipeline_init` |
| 各フェーズ開始 | Yes | `phase{N}_*` |
| 各フェーズ完了 | Yes | `phase{N}_*` |
| パイプライン完了 | Yes | `pipeline_complete` |
| エラー発生 | Yes | `phase{N}_*` + error note |

### 4.2 強制チェック

各コマンド完了時に `handoff-log.json` のエントリ数を確認。
前回の記録以降にエントリが追加されていなければ警告。

---

## Rule 5: /pipeline:run 自動チェーン強制

### 5.1 フェーズ間バリデーションゲート

`/pipeline:run` 実行時、各フェーズ完了後に以下を実行:

1. **出力ファイル存在チェック** → 欠落なら停止
2. **出力スキーマ検証** (Rule 2) → BLOCK判定なら停止
3. **知的誠実性検証** (Rule 3) → BLOCK判定なら停止
4. **pipeline-state.json 更新確認** → 更新なしなら停止
5. 全チェック合格 → 次フェーズへ自動進行

### 5.2 中断・再開

- 停止した場合、`pipeline-state.json` に失敗フェーズとエラー内容を記録
- `/pipeline:status` で状況確認後、個別コマンドで再開可能
- 再開時も同じバリデーションゲートを適用
```

### 4.2 パイプラインコマンド変更: 共通パターン

各 `/pipeline:{phase}` コマンドに以下のセクションを追加:

#### 追加セクション: 「エンフォースメントチェック」（実行手順の先頭に挿入）

```markdown
## エンフォースメントチェック（実行手順 Step 0）

**以下のチェックを全て通過しなければ、本フェーズの実行に進んではならない。**

### Gate Check
1. `pipeline-state.json` を読み込む
2. 前提フェーズの status が `completed` であることを確認
3. 必須入力ファイルが全て存在し、サイズ > 0 であることを確認
4. 前フェーズの出力JSONが有効なJSONであることを確認

### 不合格時
- 実行を中止し、以下を表示:
  - 不合格チェック項目
  - 現在の pipeline-state.json の状態
  - 解決に必要なコマンド（例: `/pipeline:propose {project_id}` を先に実行）
```

#### 追加セクション: 「出力検証」（完了処理の直前に挿入）

```markdown
## 出力検証（完了処理 Step N-1）

**以下のチェックを全て通過しなければ、フェーズを `completed` にしてはならない。**

### JSON出力検証
1. 生成された `.json` ファイルが有効なJSONであることを確認
2. ファイルサイズ > 0 であることを確認

### 知的誠実性フィールド検証（Phase 1〜4）
1. `weakest_point_identified` が存在し、全サブフィールドが非空
2. `disagreements` が配列として存在
3. `verification_method` が存在し、全サブフィールドが非空

### フェーズ固有検証
（各フェーズの受入基準チェック - Rule 2.3〜2.5 参照）

### 不合格時
- `pipeline-state.json` の当該フェーズを `failed` に設定
- エラー内容を `error` フィールドに記録
- ユーザーに不合格項目と再実行方法を案内
```

### 4.3 コマンド別変更差分

#### 4.3.1 `pipeline-propose.md` 変更

| 変更箇所 | 内容 |
|---------|------|
| Step 0 追加 | Gate Check: Phase 0 completed + `phase0_research_integrated.json` 存在確認 |
| Step 5.5 追加 | 出力検証: phase1_proposal.json の知的誠実性3フィールド検証 |
| Step 6 変更 | 検証合格時のみ `completed` に遷移 |

#### 4.3.2 `pipeline-reinforce.md` 変更

| 変更箇所 | 内容 |
|---------|------|
| Step 0 追加 | Gate Check: Phase 1 completed + `phase1_proposal.json` + `phase0_codex_research.json` 存在確認 |
| Step 6.5 追加 | 出力検証: phase2_reinforcement.json の知的誠実性3フィールド検証 |
| Step 7 変更 | 検証合格時のみ `completed` に遷移 |

#### 4.3.3 `pipeline-critique.md` 変更

| 変更箇所 | 内容 |
|---------|------|
| Step 0 追加 | Gate Check: Phase 2 completed + 入力ファイル存在確認 |
| Step 6.5 追加 | 出力検証: phase3_critique.json の知的誠実性3フィールド + 失敗シナリオ3件以上 |
| Step 7 変更 | 検証合格時のみ `completed` に遷移 |

#### 4.3.4 `pipeline-history.md` 変更

| 変更箇所 | 内容 |
|---------|------|
| Step 0 追加 | Gate Check: Phase 3 completed + 入力ファイル存在確認 |
| Step 6.5 追加 | 出力検証: phase3_5_historical.json の歴史的検証固有フィールド全検証 |
| Step 7 変更 | 検証合格時のみ `completed` に遷移 |

#### 4.3.5 `pipeline-integrate.md` 変更

| 変更箇所 | 内容 |
|---------|------|
| Step 0 追加 | Gate Check: Phase 3.5 completed + Phase 0〜3.5 全JSON存在確認 |
| Step 4.5 追加 | 出力検証: phase4_integrated_report.json の統合レポート固有フィールド検証 |
| Step 5 変更 | 検証合格時のみ `completed` に遷移 |

#### 4.3.6 `pipeline-run.md` 変更

| 変更箇所 | 内容 |
|---------|------|
| Step 3 変更 | 各フェーズ間にバリデーションゲート挿入（Rule 5.1） |
| Step 3 追加文 | 「各フェーズ完了後、出力検証を実行。BLOCK判定の場合はパイプライン停止」 |

#### 4.3.7 `pipeline-research.md` 変更

| 変更箇所 | 内容 |
|---------|------|
| Step 5.5 追加 | 出力検証: phase0_research_integrated.json の存在・構造確認 |
| Step 5 変更 | 検証合格時のみ `completed` に遷移 |

## 5. 受け入れテスト

### 5.1 検証項目

| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| VE-001 | `.claude/rules/pipeline/enforcement.md` が存在すること | ファイルが作成され、5つのルールが記述されている |
| VE-002 | Phase 1コマンドに Gate Check が含まれること | `pipeline-propose.md` に「エンフォースメントチェック」セクションが存在 |
| VE-003 | Phase 2コマンドに Gate Check が含まれること | `pipeline-reinforce.md` に「エンフォースメントチェック」セクションが存在 |
| VE-004 | Phase 3コマンドに Gate Check + 失敗シナリオ検証が含まれること | `pipeline-critique.md` に両セクションが存在 |
| VE-005 | Phase 3.5コマンドに歴史的検証固有フィールド検証が含まれること | `pipeline-history.md` に検証セクションが存在 |
| VE-006 | Phase 4コマンドに統合レポート固有検証が含まれること | `pipeline-integrate.md` に検証セクションが存在 |
| VE-007 | `/pipeline:run` にフェーズ間バリデーションゲートが含まれること | `pipeline-run.md` に各フェーズ間のゲートが記述 |
| VE-008 | 知的誠実性3フィールドの検証ルールが明確であること | BLOCK/WARN/INFOの判定基準が記述されている |
| VE-009 | 状態遷移ルールが定義されていること | pending→running→completed の遷移のみ許可 |
| VE-010 | handoff-log.json 記録強制ルールが含まれること | 記録タイミングと強制チェックが定義 |

### 5.2 手動確認項目

| 確認ID | 確認内容 | 手順 | 期待結果 |
|--------|---------|------|---------|
| MC-001 | Gate Check がPhase順序を強制する | Phase 0未完了で `/pipeline:propose` を読み、Gate Checkセクションがブロックを指示するか確認 | 「Phase 0がcompletedでない」旨のエラー指示が記載されている |
| MC-002 | 知的誠実性検証が機能する | Phase 1出力に `weakest_point_identified` が欠落した場合の指示を確認 | BLOCK判定で次フェーズに進まない指示が記載されている |
| MC-003 | Phase 3固有検証が機能する | Phase 3出力に失敗シナリオが2件しかない場合の指示を確認 | 「3件以上必要」との検証ルールが記載されている |

## 6. コミット方針

### コミットメッセージ形式
```
feat(pipeline): add enforcement rules and validation gates to pipeline commands

- Create .claude/rules/pipeline/enforcement.md with 5 enforcement rules
- Add phase gate checks (Step 0) to all phase commands
- Add output validation (pre-completion) to all phase commands
- Add intellectual honesty field validation (BLOCK/WARN/INFO)
- Add inter-phase validation gates to /pipeline:run

Refs: 20260225-002-pipeline-enforcement#001
```

## 7. 注意事項

### 7.1 技術的制約
- [ ] `.claude/rules/` 配下のMarkdownはClaude Codeが自動読込するため、既存ルールと矛盾しないこと
- [ ] コマンドの変更は「追加」のみ。既存の手順は削除・変更しない（エンフォースメントを**挿入**する）
- [ ] TypeScript型定義（`src/pipeline/types/index.ts`）は変更しない（検証の基準として参照するのみ）

### 7.2 品質基準
- [ ] 5つのルール（Phase Gate、出力検証、知的誠実性、handoff記録、自動チェーン）が全て定義されていること
- [ ] 各ルールに「不合格時のアクション」が明確に定義されていること
- [ ] BLOCK / WARN / INFO の3段階判定が一貫していること

### 7.3 特記事項
- このエンフォースメントは「プロンプト駆動」であり、ランタイムのプログラム実行ではない
- Claude Codeがルールファイルを自動読込し、コマンド実行時にルールを適用する仕組み
- エンフォースメントの効果はClaude Codeの遵守に依存するが、明文化されたルールは暗黙の期待より確実に機能する
- 将来的にClaude Code Hooksによるプログラマティック検証への移行を見据えた設計

## 8. 完了報告フォーマット

実装完了時、以下の形式で報告:

```markdown
## 実装完了報告

### 変更ファイル
| ファイル | アクション | 行数 |
|---------|----------|------|
| `.claude/rules/pipeline/enforcement.md` | Create | XXX行 |
| `.claude/commands/pipeline-propose.md` | Modify | +XX行 |
| `.claude/commands/pipeline-reinforce.md` | Modify | +XX行 |
| `.claude/commands/pipeline-critique.md` | Modify | +XX行 |
| `.claude/commands/pipeline-history.md` | Modify | +XX行 |
| `.claude/commands/pipeline-integrate.md` | Modify | +XX行 |
| `.claude/commands/pipeline-run.md` | Modify | +XX行 |
| `.claude/commands/pipeline-research.md` | Modify | +XX行 |

### 検証結果
- エンフォースメントルール数: 5
- コマンド変更数: 8
- Gate Checkセクション追加: 7コマンド
- 出力検証セクション追加: 7コマンド
- 知的誠実性検証: Phase 1〜4 全4コマンドに適用

### 次のアクション
- E2E動作検証（エンフォースメント込み）
```

---
**発行日時**: 2026-02-25 21:17
**発行者**: Claude Code
