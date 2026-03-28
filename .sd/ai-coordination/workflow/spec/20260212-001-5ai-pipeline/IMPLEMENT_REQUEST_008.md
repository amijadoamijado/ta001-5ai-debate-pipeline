# 実装指示: Phase 1 提案コマンド + テンプレート作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 008 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/008-phase1-propose` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

## 2. 実装タスク概要

Task 3.3に対応。Phase 1（提案）のコマンドファイルとプロンプトテンプレートを作成する。

Phase 0の統合リサーチデータを入力として、Claude APIが「戦略参謀」として経営戦略の提案を生成する。知的誠実性ルールを組み込み、複数の選択肢を提示し、Codexの技術実現性評価を反映する義務を持つ。

**重要**: これはプロンプト駆動のオーケストレーションシステムである。ランタイムコードではなくMarkdownコマンドとプロンプトテンプレートを作成する。

## 3. 実装範囲

### 3.1 作成ファイル一覧（2件）

| # | ファイルパス | 説明 |
|---|------------|------|
| 1 | `.claude/commands/pipeline-propose.md` | Phase 1実行コマンド |
| 2 | `templates/pipeline/phase1/proposal.md` | 戦略提案プロンプトテンプレート |

### 3.2 依存タスク（実装済み前提）
- Task 1.1: TypeScript型定義（`src/pipeline/types/index.ts`）
- Task 1.2: 知的誠実性ルール（`templates/pipeline/intellectual-honesty.md`）
- Task 2.1: `/pipeline:init`コマンド（`.claude/commands/pipeline-init.md`）

## 4. 追加・変更仕様（差分）

### 4.1 コマンドファイル: `pipeline-propose.md`

design.md Section 5.2の共通パターンに準拠。

#### 4.1.1 前提条件チェック
```
1. pipeline-state.json の存在確認
2. 案件IDの妥当性検証
3. Phase 0の完了確認（phase0ステータスが completed であること）
4. phase0_research_integrated.json の存在確認
```

#### 4.1.2 テンプレート読み込み
```
1. templates/pipeline/intellectual-honesty.md（知的誠実性ルール共通）
2. templates/pipeline/phase1/proposal.md（Phase 1専用テンプレート）
```

#### 4.1.3 プロンプト構成（design.md Section 3.4準拠）
```
[知的誠実性ルール（共通）]
+
[Phase 1専用指示]
+
[案件タイプ別コンテキスト]
+
[Phase 0統合リサーチデータ（phase0_research_integrated.json）]
```

#### 4.1.4 実行
- Claude APIを使用して戦略提案を生成
- 入力: `phase0_research_integrated.json`
- 処理: Claude API呼び出し（構築したプロンプトを送信）

#### 4.1.5 出力
| ファイル | 形式 | 説明 |
|---------|------|------|
| `phase1_proposal.json` | 構造化JSON | 機械処理用の提案データ |
| `phase1_proposal.md` | Markdown | 人間可読の提案書 |

#### 4.1.6 完了処理
```
1. pipeline-state.json の phase1 ステータスを completed に更新
2. output_files に生成ファイルパスを記録
3. handoff-log.json に phase1_proposal を記録
4. 次フェーズ（Phase 2）の案内を表示
```

### 4.2 プロンプトテンプレート: `proposal.md`

design.md Section 3.4およびSection 6.3に準拠。

#### 4.2.1 役割定義

```
あなたは「戦略参謀」です。
Phase 0で収集された6つのAIによる多角的リサーチデータを基に、
経営戦略のビジョンと具体的な選択肢を構築してください。
```

#### 4.2.2 主要指示内容

1. **複数選択肢の提示**: 単一の提案ではなく、2〜4つの戦略オプションを提示すること
2. **各選択肢の構造**:
   - 戦略名・概要
   - 根拠（Phase 0のどのデータに基づくか）
   - 期待される効果（定量的に可能な限り）
   - リスクと前提条件
   - 実行タイムライン
   - 推定コスト
3. **Codex技術実現性の反映義務**（REQ-005.3）:
   - `phase0_codex_research.json`の評価を明示的に参照
   - Codexが「実現困難」と判断した施策はリスクとして明示する義務
4. **知的誠実性ルールの組み込み**（REQ-004.1, REQ-004.2）:
   - Phase 0データに対する弱点特定
   - 検証なしの「妥当」判断の禁止
   - Phase 0データをそのまま追認する「迎合」の排除

#### 4.2.3 必須出力フィールド（REQ-004.2）

テンプレートは以下のフィールドを必ず出力するよう指示を含める:

```json
{
  "weakest_point_identified": {
    "target_phase": "phase0",
    "claim": "Phase 0の中で最も弱いと判断した主張",
    "weakness": "その弱点の具体的説明",
    "severity": "critical | major | minor"
  },
  "disagreements": [
    {
      "target_claim": "異なる見解を持つPhase 0の主張",
      "target_phase": "phase0",
      "alternative_view": "代替的な見解",
      "evidence": ["根拠1", "根拠2"],
      "confidence_in_alternative": 0.7
    }
  ],
  "verification_method": {
    "approach": "検証に使用したアプローチ",
    "tools_used": ["使用ツール"],
    "limitations": "検証の限界"
  }
}
```

#### 4.2.4 出力フォーマット指示

JSON出力はdesign.md Section 4.5のIntegratedReportの一部（Recommendation型）に準拠する:

```json
{
  "recommendations": [
    {
      "option": "戦略オプション名",
      "confidence": 0.75,
      "rationale": "根拠",
      "risks": ["リスク1"],
      "history_support": "moderate",
      "timeline": "実行タイムライン",
      "estimated_cost": "推定コスト"
    }
  ],
  "weakest_point_identified": { ... },
  "disagreements": [ ... ],
  "verification_method": { ... }
}
```

## 5. 受け入れテスト

- [ ] `phase0_research_integrated.json`を入力として読み込む指示があること（REQ-001.2）
- [ ] 知的誠実性ルールが組み込まれていること（REQ-004.1, REQ-004.2）
- [ ] 複数の選択肢が提示される指示が含まれること
- [ ] Codexの技術実現性評価の反映義務が記述されていること（REQ-005.3）
- [ ] 出力にweakest_point_identified, disagreements[], verification_methodが必須であること
- [ ] `phase1_proposal.json` + `phase1_proposal.md`が生成される指示があること
- [ ] pipeline-state.json とhandoff-log.json が更新される指示があること
- [ ] 前提条件チェック（Phase 0完了確認）が含まれていること

## 6. コミット方針

| # | コミット内容 | コミットメッセージ |
|---|------------|-----------------|
| 1 | Phase 1コマンド + テンプレート作成 | `feat(pipeline): add Phase 1 proposal command and template` |

```
feat(pipeline): add Phase 1 proposal command and template

- Claude API as strategic advisor
- Intellectual honesty rules integration
- Multiple strategy options with confidence scores
- Codex technical feasibility reflection (REQ-005.3)
```

## 7. 注意事項

1. **プロンプト駆動システム**: ランタイムコードではなくMarkdownファイルを作成する
2. **Claude APIの使用**: Phase 1はClaude API（従量課金）を使用する。Web版Claudeではない
3. **知的誠実性ルールの参照**: `templates/pipeline/intellectual-honesty.md`をインクルードする形式とする。内容を重複して記述しない
4. **Phase 0データの参照方法**: `phase0_research_integrated.json`の内容をプロンプトに添付する形式を明記する
5. **出力の二重形式**: JSON（機械処理用）とMarkdown（人間可読用）の両方を生成する指示を含める
6. **Codex技術実現性の明示的参照**: Phase 0のCodexリサーチ結果を特別に参照する指示を含める（REQ-005.3）

## 8. 完了報告フォーマット

```markdown
## 完了報告: Task 3.3 Phase 1 提案コマンド + テンプレート作成

### 実施内容
- [ ] `.claude/commands/pipeline-propose.md` を作成
- [ ] `templates/pipeline/phase1/proposal.md` を作成

### コミット情報
- ハッシュ: {commit_hash}
- メッセージ: {commit_message}

### 受け入れテスト結果
{各テスト項目の合否}

### 特記事項
{実装時の判断や注意点}
```
