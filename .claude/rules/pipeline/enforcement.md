# パイプラインエンフォースメントルール

## 適用範囲

このルールは `/pipeline:*` コマンド実行時に**自動適用**される。
パイプライン品質を保証するための5つの強制ルール。

---

## Rule 1: Phase Gate（フェーズ関門）

### 1.1 フェーズ順序制約

パイプラインのフェーズは以下の順序でのみ実行可能。**スキップ・逆走は禁止**。

| 実行フェーズ | 必須完了フェーズ | 必須入力ファイル |
|------------|---------------|----------------|
| Phase 0 | (なし) | `pipeline-state.json` |
| Phase 1 | Phase 0 | `phase0_research_integrated.json` |
| Phase 2 | Phase 1 | `phase1_proposal.json`, `phase0_codex_research.json` |
| Phase 3 | Phase 2 | `phase1_proposal.json`, `phase2_reinforcement.json` |
| Phase 3.5 | Phase 3 | `phase1_proposal.json`, `phase2_reinforcement.json`, `phase3_critique.json` |
| Phase 4 | Phase 3.5 | Phase 0〜3.5 全JSON |

### 1.2 Gate Check 手順（各コマンド実行前に必須）

1. `pipeline-state.json` を読み込む
2. 必須完了フェーズの `status` が `completed` であることを確認
3. 必須入力ファイルが全て存在し、サイズ > 0 であることを確認
4. 前フェーズの出力JSONが有効なJSONであることを確認（パース試行）

**不合格時**:
- **実行を中止**する（次に進まない）
- 不合格理由を明示的にユーザーに報告
- 解決方法を案内（例: 「先に `/pipeline:propose` を実行してください」）

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

| チェック項目 | 基準 | 不合格時 |
|------------|------|---------|
| JSONパース成功 | 有効なJSON | **BLOCK**: Phase 1に進まない |
| `contradictions` | 配列であること | WARN + 続行 |
| `blind_spots` | 配列であること | WARN + 続行 |
| `research_quality` | オブジェクトであること | WARN + 続行 |

### 2.2 Phase 1〜4 共通出力検証

各フェーズの `.json` 出力に対して:

| チェック項目 | 基準 | 不合格時 |
|------------|------|---------|
| JSONパース成功 | 有効なJSON | **BLOCK**: 次フェーズに進まない |
| `weakest_point_identified` | 非null、全サブフィールド非空 | **BLOCK**: 知的誠実性違反 |
| `disagreements` | 配列であること | **BLOCK**: 知的誠実性違反 |
| `verification_method` | 非null、全サブフィールド非空 | **BLOCK**: 知的誠実性違反 |
| `.md` ファイル存在 | 人間可読版が生成されていること | WARN + 続行 |

### 2.3 Phase 3 固有検証

| チェック項目 | 基準 | REQ |
|------------|------|-----|
| 失敗シナリオ数 | 3件以上 | REQ-001.4 |
| リスク定量評価 | likelihood × impact 含む | REQ-001.4 |
| 反証 | 1件以上の具体的根拠 | REQ-001.4 |

### 2.4 Phase 3.5 固有検証

| チェック項目 | 基準 | REQ |
|------------|------|-----|
| `historical_parallels` | 1件以上 | REQ-001.5 |
| `success_patterns` | 成功事例3件以上 | REQ-001.5 |
| `failure_warnings` | 失敗事例3件以上 | REQ-001.5 |
| `recovery_playbooks` | 1件以上 | REQ-001.5 |
| `strategic_frameworks` | 3件以上 | REQ-001.5 |
| `history_verdict.judgment` | support/caution/against のいずれか | REQ-001.5 |

### 2.5 Phase 4 固有検証

| チェック項目 | 基準 | REQ |
|------------|------|-----|
| `executive_summary` | 非空文字列 | REQ-001.6 |
| `recommendations` | 1件以上、各項目に `confidence` (0-1) | REQ-001.6 |
| `history_supported_options` | 配列 | REQ-001.6 |
| `history_warned_options` | 配列 | REQ-001.6 |
| `decision_points` | 1件以上 | REQ-001.6 |

---

## Rule 3: 知的誠実性エンフォースメント

### 3.1 必須フィールド検証（Phase 1〜4 全出力）

以下の3フィールドが**全て**存在し、**非空**であること:

1. **`weakest_point_identified`**: オブジェクト型
   - `target_phase`: 非空文字列
   - `claim`: 非空文字列
   - `weakness`: 非空文字列
   - `severity`: `"critical"` | `"major"` | `"minor"` のいずれか

2. **`disagreements`**: 配列型
   - 空配列の場合: 出力内に「0件である理由」の明記が**必須**（REQ-004.2）
   - 非空の場合: 各要素に `target_claim`, `alternative_view`, `evidence[]` が必須

3. **`verification_method`**: オブジェクト型
   - `approach`: 非空文字列
   - `tools_used`: 非空配列
   - `limitations`: 非空文字列

### 3.2 違反時の判定

| 重大度 | 条件 | アクション |
|--------|------|---------|
| **BLOCK** | 3フィールドのいずれかが完全欠落 | 次フェーズ進行禁止。再生成を要求 |
| **WARN** | フィールド存在するが一部サブフィールドが空 | 警告表示。ユーザー確認後、続行可 |
| **INFO** | `disagreements` が空配列（理由明記あり） | 情報表示のみ。正常 |

---

## Rule 4: handoff-log.json 記録強制

### 4.1 記録必須タイミング

| イベント | type値 |
|---------|--------|
| パイプライン初期化 | `pipeline_init` |
| Phase 0 完了 | `phase0_research_complete` |
| Phase 1 完了 | `phase1_proposal` |
| Phase 2 完了 | `phase2_reinforcement` |
| Phase 3 完了 | `phase3_critique` |
| Phase 3.5 完了 | `phase3_5_historical` |
| Phase 4 完了 | `phase4_integration` |
| パイプライン完了 | `pipeline_complete` |

### 4.2 強制チェック

各コマンド完了時に `handoff-log.json` のエントリ数を確認。
前回記録以降にエントリが追加されていなければ**警告**。

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

- 停止時: `pipeline-state.json` に失敗フェーズとエラー内容を記録
- 再開: `/pipeline:status` で確認後、個別コマンドで再開可能
- 再開時も同一バリデーションゲートを適用
