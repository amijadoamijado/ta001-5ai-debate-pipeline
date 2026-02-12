# 実装指示: Codexレビュー Must指摘修正（M-001〜M-008）

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 016 |
| 発行日時 | 2026-02-12 18:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| レビュー元 | `workflow/review/20260212-001-5ai-pipeline/REVIEW_IMPL_001.md` |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260209-001-table-ocr/001-project-foundation`（現在のブランチで修正） |
| ベースブランチ | 同上 |

## 2. 修正概要

Codexレビュー（REVIEW_IMPL_001）で指摘されたMust 8件 + Should 3件を修正する。
**Must修正はすべて必須。Should修正も可能な限り対応すること。**

---

## 3. Must指摘修正（8件）

### M-001: case_type → テンプレートルーティング未接続
**対象**: `.claude/commands/pipeline-research.md`
**問題**: `case_type`引数を受け取るが、案件タイプ別テンプレート（`typeA/B/C/D`）の選択手順がない
**修正**:
1. `case_type`引数から`templates/pipeline/phase0/case-types/type{X}-*.md`を選択するルーティング手順を追加
2. 選択されたテンプレートの内容を6AI各テンプレートに注入する手順を明記
3. 以下のルーティングロジックを記述:
```
case_type引数 → テンプレート選択:
  A → templates/pipeline/phase0/case-types/typeA-new-business.md
  B → templates/pipeline/phase0/case-types/typeB-improvement.md
  C → templates/pipeline/phase0/case-types/typeC-dx.md
  D → templates/pipeline/phase0/case-types/typeD-crisis.md
```
4. 選択したテンプレートのAI別セクションを、各AIリサーチテンプレートに組み合わせる手順を追加

### M-002: Phase 0 異常系ハンドリング不足
**対象**: `.claude/commands/pipeline-research.md`（65行付近）
**問題**: タイムアウトのみ定義、「ページロード失敗」「ログイン切れ」未定義
**修正**: 以下のエラーハンドリングを追加
```markdown
## エラーハンドリング

### タイムアウト（既存）
- 10分待機後、ユーザーに手動介入を要求

### ページロード失敗（追加）
- 1回リトライ後、該当AIをスキップ
- pipeline-state.jsonにスキップ情報を記録
- phase0_research_integrated.jsonのresearch_quality.coverage_scoreを下方修正
- blind_spotsにスキップされたAIの担当領域を追加

### ログイン切れ（追加）
- パイプラインを一時停止
- ユーザーにログイン再要求のメッセージを表示
- ログイン確認後、該当AIから再開
```

### M-003: リサーチツール4段階フォールバック未実装
**対象**: `.claude/commands/pipeline-reinforce.md`, `.claude/commands/pipeline-critique.md`, `.claude/commands/pipeline-history.md`
**問題**: APIキー有無→WebSearch止まりで、MCP→REST→WebSearch→訓練データの4段階が未達
**修正**: Phase 2, 3, 3.5の各コマンドに以下のフォールバック手順を追加
```markdown
## リサーチツールフォールバック（4段階）

利用可能性チェック:
1. MCP経由で接続試行 → 成功ならMCP使用
2. 失敗 → REST API直接呼び出し（環境変数にキーあれば）
3. 失敗 → WebSearchツール（Claude Code組み込み）で代替
4. 全失敗 → 訓練データの知識のみで続行

※ フォールバック発生時は必ず以下を記録:
- pipeline-state.jsonに「{ツール名} → {フォールバック先}」を記録
- ログに「⚠️ {ツール名} APIキー未設定、{フォールバック先}で代替」を出力
- パイプラインは停止しない（Graceful Degradation）
```

### M-004: pipeline-init の case_type 初期値不整合
**対象**: `.claude/commands/pipeline-init.md`（34行付近）, `src/pipeline/types/index.ts`
**問題**: 初期`case_type`が空文字で`PipelineState.case_type: 'A'|'B'|'C'|'D'`と矛盾
**修正**:
1. `src/pipeline/types/index.ts`の`PipelineState.case_type`を`'A' | 'B' | 'C' | 'D' | null`に変更
2. `.claude/commands/pipeline-init.md`の初期値を`null`に変更
3. `/pipeline:research`実行時に`case_type`が必須引数となり、その時点でpipeline-state.jsonを更新する旨を明記

### M-005: PipelineHandoffType に pipeline_init 未定義
**対象**: `src/pipeline/types/index.ts`（329行付近）, `.claude/commands/pipeline-init.md`（60行付近）
**問題**: `pipeline_init`を記録するが型定義に未定義
**修正**: `PipelineHandoffType`に`pipeline_init`を追加
```typescript
type PipelineHandoffType =
  | 'pipeline_init'          // ← 追加
  | 'phase0_research_start'
  | 'phase0_research_complete'
  | 'phase1_proposal'
  | 'phase2_reinforcement'
  | 'phase3_critique'
  | 'phase3_5_historical'
  | 'phase4_integration'
  | 'pipeline_complete';
```

### M-006: historical.md の severity 値が型定義外
**対象**: `templates/pipeline/phase3_5/historical.md`（72行付近）
**問題**: `severity: "medium"`は型定義`critical|major|minor`に存在しない
**修正**: `"medium"`を`"major"`に変更。テンプレート内の全サンプルJSONで型定義のenum値と一致するか再確認

### M-007: grok-research.md の impact 値が型定義外
**対象**: `templates/pipeline/phase0/grok-research.md`（60行付近）
**問題**: `impact: "critical"`は型定義`high|medium|low`に存在しない
**修正**: `"critical"`を`"high"`に変更。**全テンプレートのサンプルJSONを横断チェックし、以下のenum値のみ使用されていることを確認**:
- `severity`: `critical` | `major` | `minor`
- `impact`: `high` | `medium` | `low`
- `likelihood`: `high` | `medium` | `low`
- `direction`: `up` | `down` | `stable` | `emerging`
- `reliability`: `high` | `medium` | `low`
- `judgment`: `support` | `caution` | `against`
- `history_support`: `strong` | `moderate` | `weak` | `against`

### M-008: Phase 4 の handoff 記録欠落
**対象**: `.claude/commands/pipeline-integrate.md`（38行付近）
**問題**: `phase4_integration`のhandoff記録がなく、`pipeline_complete`のみ
**修正**: Phase 4完了時に2つのhandoffエントリを記録:
```
1. phase4_integration（Phase 4実行完了時）
2. pipeline_complete（パイプライン全体完了時）
```

---

## 4. Should指摘修正（3件）

### S-001: 歴史参謀の成功/失敗件数要件の明示
**対象**: `templates/pipeline/phase3_5/historical.md`（23行付近）
**修正**: JSON出力条件に以下を明記
```
出力必須条件:
- success_patterns: 3件以上
- failure_warnings: 3件以上
- historical_parallels: 成功・失敗・回復各カテゴリ1件以上
```

### S-002: ポーター Five Forcesの明示
**対象**: `templates/pipeline/phase3_5/historical.md`（28行付近）
**修正**: ポーターの競争戦略セクションにFive Forces（5つの競争要因）を明示:
```
ポーターの競争戦略:
- Five Forces（5つの競争要因）: 新規参入の脅威、代替品の脅威、買い手の交渉力、売り手の交渉力、既存競合の競争激化度
- 3つの基本戦略: コストリーダーシップ（価格戦略）、差別化戦略、集中（ニッチ）戦略
```

### S-003: handoff-log.json のサンプルエントリ分離
**対象**: `.kiro/ai-coordination/handoff/handoff-log.json`
**修正**: Gemini実装時に追加されたサンプル `pipeline_init` エントリがあれば、実運用エントリと分離するか削除

---

## 5. 禁止領域（変更不可）
| ファイル/ディレクトリ | 理由 |
|---------------------|------|
| `CLAUDE.md` | フレームワーク設定 |
| `.kiro/specs/` | 仕様書は変更不可 |
| `.kiro/ai-coordination/workflow/review/` | レビュー結果は変更不可 |

## 6. 参照のみ
| ファイルパス | 参照理由 |
|------------|---------|
| `.kiro/specs/5ai-debate-pipeline/design.md` | Section 3.9, 7.3（フォールバック設計） |
| `.kiro/specs/5ai-debate-pipeline/requirements.md` | REQ-002.1, REQ-006, REQ-008.2, REQ-010 |
| `.kiro/ai-coordination/workflow/review/20260212-001-5ai-pipeline/REVIEW_IMPL_001.md` | レビュー指摘内容 |

## 7. コミット方針

### コミットメッセージ形式
```
fix(pipeline): resolve Codex review M-001~M-008

- M-001: Add case_type routing to pipeline-research
- M-002: Add page load failure and login expiry handling
- M-003: Implement 4-level research tool fallback
- M-004: Fix case_type initial value type mismatch
- M-005: Add pipeline_init to PipelineHandoffType
- M-006: Fix severity enum value in historical template
- M-007: Fix impact enum value in grok template
- M-008: Add phase4_integration handoff entry

Refs: 20260212-001-5ai-pipeline#016
```

### コミット粒度
- **1コミットで全Must修正をまとめてよい**（全件が同一レビュー起因のため）
- Should修正は同一コミットに含めてよい

## 8. 完了報告フォーマット

```markdown
## 修正完了報告

### 対応結果
| 指摘ID | 対応 | 変更ファイル |
|--------|------|------------|
| M-001 | Fixed | pipeline-research.md |
| M-002 | Fixed | pipeline-research.md |
| M-003 | Fixed | pipeline-reinforce.md, pipeline-critique.md, pipeline-history.md |
| M-004 | Fixed | pipeline-init.md, src/pipeline/types/index.ts |
| M-005 | Fixed | src/pipeline/types/index.ts |
| M-006 | Fixed | templates/pipeline/phase3_5/historical.md |
| M-007 | Fixed | templates/pipeline/phase0/grok-research.md |
| M-008 | Fixed | pipeline-integrate.md |
| S-001 | Fixed | templates/pipeline/phase3_5/historical.md |
| S-002 | Fixed | templates/pipeline/phase3_5/historical.md |
| S-003 | Fixed/Skipped | handoff-log.json |

### enum整合チェック結果
全テンプレートのサンプルJSON横断チェック: Pass/Fail

### 次のアクション
- 再レビュー依頼（REVIEW_REQUEST_IMPL_002.md）
```

---
**発行日時**: 2026-02-12 18:00
**発行者**: Claude Code
