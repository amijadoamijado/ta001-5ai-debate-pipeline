# コードレビュー依頼: 5AI議論パイプライン 修正版（M-001~M-008対応）

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| レビュー種別 | IMPL-REVIEW（修正版） |
| 発行日時 | 2026-02-12 19:00 |
| 発行者 | Claude Code |
| 宛先 | Codex |
| 実装者 | Gemini CLI |
| 対象コミット | （修正完了後） |
| 対象ブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |
| ステータス | Pending |

---

## 1. レビュー背景

### 1.1 前回レビュー結果
**REVIEW_IMPL_001.md** の判定的概要:

| 判定 | Must | Should | Could |
|------|-------|---------|---------|
| **Request Changes** | 8件 | 3件 | 2件 |

### 1.2 今回修正対象（Must 8件 + Should 3件）

| ID | カテゴリ | 指摘内容 |
|----|---------|-----------|
| **M-001** | case_typeルーティング | `/pipeline:run` で case_type 引数をテンプレート選択に接続していない |
| **M-002** | 異常系ハンドリング | Phase 0 Chrome操作でページロード失敗・ログイン切れの処理未実装 |
| **M-003** | フォールバック | 4段階フォールバック（MCP→REST→WebSearch→訓練データ）が未実装 |
| **M-004** | 型定義 | `case_type` 初期値が `""` だが、型定義で `null` を許容していない |
| **M-005** | Handoff型 | `PipelineHandoffType` に `pipeline_init` が定義されていない |
| **M-006** | Enum整合性 | `historical.md` で `severity: "medium"` 使用、型は `major` |
| **M-007** | Enum整合性 | `grok-research.md` で `impact: "critical"` 使用、型は `high` |
| **M-008** | Handoff記録 | Phase 4完了時に `phase4_integration` handoff未記録 |
| **S-001** | 歴史参謀 | 件数要件（成功3件以上/失敗3件以上）が明示されていない |
| **S-002** | Five Forces | ポーターの5 Forcesが明示されていない |
| **S-003** | サンプルエントリ | handoff-logにPipelineエントリと研究エントリが混在している |

---

## 2. レビュー観点（重点確認項目）

### 2.1 Must指摘修正確認（最重要）

#### M-001: case_type → テンプレートルーティング
**期待される修正**:
```typescript
// .claude/commands/pipeline-run.md または実行ロジックで
// case_type 引数を受け取り、対応するテンプレートを選択
if (case_type === 'A') {
  template = 'typeA-new-business.md';
} else if (case_type === 'B') {
  template = 'typeB-improvement.md';
} else if (case_type === 'C') {
  template = 'typeC-dx.md';
} else if (case_type === 'D') {
  template = 'typeD-crisis.md';
}
```

**確認ポイント**:
- [ ] `/pipeline:run` コマンドが case_type をテンプレート選択に使用している
- [ ] A/B/C/D 各タイプに対応するテンプレートパスが正しい
- [ ] case_type 未指定時のデフォルト動作が定義されている

#### M-002: Phase 0 異常系ハンドリング
**期待される修正**:
- [ ] ページロード失敗時のリトライ/エラー処理
- [ ] ログイン切れ（セッション期限切れ）の検出・再ログイン処理
- [ ] Chrome MCP操作での `try-catch` またはエラーフィールド追加

**確認ファイル**:
- [ ] `templates/pipeline/phase0/claude-research.md`
- [ ] `templates/pipeline/phase0/chatgpt-research.md`
- [ ] `templates/pipeline/phase0/gemini-research.md`
- [ ] `templates/pipeline/phase0/grok-research.md`

#### M-003: 4段階フォールバック実装
**期待される修正**:

| フェーズ | MCP | REST API | WebSearch | 訓練データのみ |
|---------|-----|-----------|-----------|----------------|
| Phase 2 | Tavily MCP → Tavily REST → `search` コマンド | OK | OK | OK |
| Phase 3 | Brave/Exa MCP → Brave/Exa REST → `search` コマンド | OK | OK | OK |
| Phase 3.5 | 全3ツールMCP → REST → `search` | OK | OK | OK |

**確認ポイント**:
- [ ] Phase 2/3/3.5 の各コマンドにフォールバック記述がある
- [ ] "MCP未利用可能ならREST API、REST失敗ならWebSearch、WebSearch失敗なら訓練データのみ"の記述
- [ ] グレースフルデグラデーション: APIキー未設定でもパイプライン停止しない

#### M-004: case_type 初期値型修正
**期待される修正**:
```typescript
// src/pipeline/types/index.ts
export interface PipelineState {
  case_type: string | null;  // null許容
  // または
  case_type?: string;        // オプショナル
}
```

**確認ポイント**:
- [ ] `PipelineState.case_type` が `null` を許容する型定義になっている
- [ ] 初期化時に `case_type: null` が設定されている

#### M-005: PipelineHandoffType に pipeline_init 追加
**期待される修正**:
```typescript
// src/pipeline/types/index.ts
export type PipelineHandoffType =
  | "phase0_research"
  | "phase1_proposal"
  | "phase2_reinforcement"
  | "phase3_critique"
  | "phase3_5_historical"
  | "phase4_integration"
  | "pipeline_init";  // 追加
```

**確認ポイント**:
- [ ] 型定義に `"pipeline_init"` が含まれている
- [ ] `/pipeline:init` 実行時に `pipeline_init` handoffが記録される

#### M-006: historical.md severity enum修正
**期待される修正**:
```markdown
<!-- templates/pipeline/phase3_5/historical.md -->
severity: "major"  <!-- "medium" → "major" -->
```

**確認ポイント**:
- [ ] `historical.md` 内の `severity` 値が `"major"`（または他の正しいenum値）
- [ ] 型定義 `ProblemSeverity` のenum値と一致している

#### M-007: grok-research.md impact enum修正
**期待される修正**:
```markdown
<!-- templates/pipeline/phase0/grok-research.md -->
impact: "high"  <!-- "critical" → "high" -->
```

**確認ポイント**:
- [ ] `grok-research.md` 内の `impact` 値が `"high"`（または他の正しいenum値）
- [ ] 型定義 `ProblemImpact` のenum値と一致している
- [ ] （追加点）全テンプレートでenum値の整合性チェック済み

#### M-008: Phase 4 handoff記録追加
**期待される修正**:
```typescript
// Phase 4完了時に以下のhandoffを記録
{
  type: "phase4_integration",
  timestamp: new Date().toISOString(),
  from: "Claude API",
  to: "pipeline_complete",
  result: "integrated_report_generated"
}
```

**確認ポイント**:
- [ ] `.claude/commands/pipeline-integrate.md` に `phase4_integration` handoff記述がある
- [ ] または統合レポート出力後にhandoff記録処理がある

### 2.2 Should指摘対応確認

| ID | 期待される対応 |
|----|---------------|
| S-001 | `historical.md` に「成功事例3件以上/失敗事例3件以上」の出力要件を明示 |
| S-002 | Five Forces（売手/買手/代替品/新規参入/業界競争）がプロンプトに明示されている |
| S-003 | handoff-log.jsonからサンプルエントリを削除・分離 |

### 2.3 新規問題の有無

**確認項目**:
- [ ] 修正により新たなバグが導入されていないか
- [ ] 修正範囲外の予期せぬ動作変更がないか

---

## 3. レビュー手順

### Step 1: 修正ファイルの確認
```bash
# 修正対象ファイルを一覧確認
git diff 7604b1c1 HEAD --stat
```

### Step 2: M-001〜M-008 個別確認
各Must項目について「期待される修正」の通り実装されているか確認

### Step 3: 型定義の整合性再確認
```bash
# src/pipeline/types/index.ts
# enum値が全テンプレートで正しく使用されているか
```

### Step 4: 全体 regression チェック
- [ ] 修正前の動作（特に正しく動いていた部分）が壊れていないか

---

## 4. 参照ドキュメント

| ドキュメント | パス | 用途 |
|-------------|------|------|
| 前回レビュー結果 | `.kiro/ai-coordination/workflow/review/20260212-001-5ai-pipeline/REVIEW_IMPL_001.md` | Must指摘8件の詳細 |
| 修正指示書 | `.kiro/ai-coordination/workflow/spec/20260212-001-5ai-pipeline/IMPLEMENT_REQUEST_016.md` | 修正内容の詳細指示 |
| 要件定義書 | `.kiro/specs/5ai-debate-pipeline/requirements.md` | 機能要件の照合 |
| 技術設計書 | `.kiro/specs/5ai-debate-pipeline/design.md` | アーキテクチャ照合 |

---

## 5. 出力形式

レビュー結果は以下のファイルに出力してください:

```
.kiro/ai-coordination/workflow/review/20260212-001-5ai-pipeline/REVIEW_IMPL_002.md
```

REVIEW_REPORTテンプレートに従って記述してください。

### 判定基準
| 判定 | 条件 |
|------|------|
| **Approve** | Must指摘 M-001〜M-008 全件修正完了、新規Must問題なし |
| **Request Changes** | Must 1件以上の未修正、または新規Must問題発見 |
| **Reject** | 修正で設計を壊している、または重大な後退 |

### Should項目の扱い
- Should全件対応済み: 特に記載
- Should一部未対応: Approve可能だがコメントに記載

---

**発行日時**: 2026-02-12 19:00
**発行者**: Claude Code
