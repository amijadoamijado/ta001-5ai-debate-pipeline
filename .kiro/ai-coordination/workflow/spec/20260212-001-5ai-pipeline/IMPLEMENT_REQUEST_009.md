# 実装指示: Phase 2 補強コマンド + テンプレート作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 009 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/009-phase2-reinforce` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

## 2. 実装タスク概要

Task 3.4に対応。Phase 2（補強分析）のコマンドファイルとプロンプトテンプレートを作成する。

Phase 1の提案に対して、Codex APIが「分析官」として数字的裏付けとロジック検証を行う。Tavily APIでの数値データ裏取りを含め、提案の弱い前提を特定し、代替シナリオを提示する。

**重要**: これはプロンプト駆動のオーケストレーションシステムである。ランタイムコードではなくMarkdownコマンドとプロンプトテンプレートを作成する。

## 3. 実装範囲

### 3.1 作成ファイル一覧（2件）

| # | ファイルパス | 説明 |
|---|------------|------|
| 1 | `.claude/commands/pipeline-reinforce.md` | Phase 2実行コマンド |
| 2 | `templates/pipeline/phase2/reinforcement.md` | 補強分析プロンプトテンプレート |

### 3.2 依存タスク（実装済み前提）
- Task 1.1: TypeScript型定義（`src/pipeline/types/index.ts`）
- Task 1.2: 知的誠実性ルール（`templates/pipeline/intellectual-honesty.md`）
- Task 2.1: `/pipeline:init`コマンド（`.claude/commands/pipeline-init.md`）

## 4. 追加・変更仕様（差分）

### 4.1 コマンドファイル: `pipeline-reinforce.md`

design.md Section 5.2の共通パターンに準拠。

#### 4.1.1 前提条件チェック
```
1. pipeline-state.json の存在確認
2. 案件IDの妥当性検証
3. Phase 1の完了確認（phase1ステータスが completed であること）
4. phase1_proposal.json の存在確認
5. phase0_codex_research.json の存在確認
```

#### 4.1.2 テンプレート読み込み
```
1. templates/pipeline/intellectual-honesty.md（知的誠実性ルール共通）
2. templates/pipeline/phase2/reinforcement.md（Phase 2専用テンプレート）
```

#### 4.1.3 プロンプト構成（design.md Section 3.5準拠）
```
[知的誠実性ルール（共通）]
+
[Phase 2専用指示]
+
[Phase 1提案データ（phase1_proposal.json）]
+
[Phase 0 Codex技術調査（phase0_codex_research.json）]
```

#### 4.1.4 実行
- Codex APIを使用して補強分析を生成
- 入力: `phase1_proposal.json` + `phase0_codex_research.json`
- 処理: Codex API呼び出し + Tavily APIでの数値データ裏取り

#### 4.1.5 リサーチツール使用（REQ-010.2）

| ツール | 用途 | フォールバック |
|--------|------|-------------|
| Tavily API | 数値データ・統計の裏取り | WebSearchツールで代替 |

**フォールバック動作**:
```
1. TAVILY_API_KEY 環境変数を確認
2. 設定済み → Tavily APIで裏取り検索
3. 未設定 → WebSearchツール（Claude Code組み込み）で代替
4. ログに使用ツールを記録
```

#### 4.1.6 出力
| ファイル | 形式 | 説明 |
|---------|------|------|
| `phase2_reinforcement.json` | 構造化JSON | 機械処理用の補強分析データ |
| `phase2_reinforcement.md` | Markdown | 人間可読の補強分析レポート |

#### 4.1.7 完了処理
```
1. pipeline-state.json の phase2 ステータスを completed に更新
2. output_files に生成ファイルパスを記録
3. handoff-log.json に phase2_reinforcement を記録
4. 次フェーズ（Phase 3）の案内を表示
```

### 4.2 プロンプトテンプレート: `reinforcement.md`

design.md Section 3.5およびSection 6.3に準拠。

#### 4.2.1 役割定義

```
あなたは「分析官」です。
Phase 1で提示された戦略提案に対して、数字的裏付けとロジック検証を行い、
提案の強度を補強すると同時に弱い前提を特定してください。
```

#### 4.2.2 補強分析の4観点（design.md Section 3.5）

1. **定量データの裏付け**: 市場規模、成長率、顧客数等の数値をTavily APIで裏取り
2. **前提条件のロジック検証**: 提案の論理構造に飛躍や循環論法がないか確認
3. **弱い前提の特定と代替シナリオ**: 最も脆弱な前提を特定し、その前提が崩れた場合の代替シナリオを提示
4. **技術実現性の深掘り**: Phase 0のCodex調査との照合。技術的課題の実現可能性を再評価

#### 4.2.3 知的誠実性ルールの組み込み（REQ-004.1, REQ-004.2）

- Phase 1の提案に対する弱点特定
- Phase 1の結論をそのまま追認する「迎合」の排除
- 独自検証を経た同意のみ許容
- 検証なしの「妥当」判断の禁止

#### 4.2.4 Tavily API裏取り指示（REQ-010.2）

```
以下のデータについてTavily APIで裏取りを実施してください:
- Phase 1で使用された市場規模データ
- 成長率予測の根拠
- 競合情報の正確性
- コスト見積もりの妥当性

Tavily APIが利用できない場合はWebSearchで代替してください。
裏取り結果はsources[]に出典を記録してください。
```

#### 4.2.5 必須出力フィールド（REQ-004.2）

```json
{
  "weakest_point_identified": {
    "target_phase": "phase1",
    "claim": "Phase 1の中で最も弱いと判断した主張",
    "weakness": "その弱点の具体的説明",
    "severity": "critical | major | minor"
  },
  "disagreements": [
    {
      "target_claim": "異なる見解を持つPhase 1の主張",
      "target_phase": "phase1",
      "alternative_view": "代替的な見解",
      "evidence": ["根拠1", "根拠2"],
      "confidence_in_alternative": 0.7
    }
  ],
  "verification_method": {
    "approach": "検証に使用したアプローチ",
    "tools_used": ["Tavily API", "Codex知識ベース"],
    "limitations": "検証の限界"
  }
}
```

#### 4.2.6 出力フォーマット指示

```json
{
  "reinforcement_analysis": {
    "quantitative_backing": [
      {
        "claim": "裏付けた主張",
        "original_value": "Phase 1の値",
        "verified_value": "裏取り後の値",
        "source": "出典",
        "confidence": 0.85
      }
    ],
    "logic_verification": [
      {
        "argument": "検証した論理",
        "valid": true,
        "notes": "検証メモ"
      }
    ],
    "weak_assumptions": [
      {
        "assumption": "弱い前提",
        "vulnerability": "脆弱性の説明",
        "alternative_scenario": "前提が崩れた場合のシナリオ",
        "impact": "high | medium | low"
      }
    ],
    "technical_deep_dive": {
      "codex_alignment": "Phase 0 Codex調査との整合度",
      "additional_findings": ["追加の技術的発見"]
    }
  },
  "weakest_point_identified": { ... },
  "disagreements": [ ... ],
  "verification_method": { ... }
}
```

## 5. 受け入れテスト

- [ ] `phase1_proposal.json` + `phase0_codex_research.json`を入力として読み込む指示があること（REQ-001.3）
- [ ] 知的誠実性ルールが組み込まれていること（REQ-004.1, REQ-004.2）
- [ ] 数字的裏付け、ロジック検証、弱い前提の特定が指示されていること
- [ ] Tavily APIでの数値データ裏取り指示が含まれること（REQ-010.2）
- [ ] Tavily API未設定時のWebSearchフォールバック指示があること
- [ ] `phase2_reinforcement.json` + `phase2_reinforcement.md`が生成される指示があること
- [ ] pipeline-state.json とhandoff-log.json が更新される指示があること
- [ ] 前提条件チェック（Phase 1完了確認）が含まれていること

## 6. コミット方針

| # | コミット内容 | コミットメッセージ |
|---|------------|-----------------|
| 1 | Phase 2コマンド + テンプレート作成 | `feat(pipeline): add Phase 2 reinforcement command and template` |

```
feat(pipeline): add Phase 2 reinforcement command and template

- Codex API as analytical officer
- Tavily API for quantitative data verification (REQ-010.2)
- 4-perspective reinforcement analysis
- Intellectual honesty rules integration
```

## 7. 注意事項

1. **プロンプト駆動システム**: ランタイムコードではなくMarkdownファイルを作成する
2. **Codex APIの使用**: Phase 2はCodex API（従量課金）を使用する
3. **Tavily APIの指示**: データ裏取りにTavily APIを使用する指示を含める。環境変数`TAVILY_API_KEY`の確認とフォールバックも記述する
4. **Phase 0 Codex調査の参照**: `phase0_codex_research.json`を追加入力として参照する。Phase 1の提案だけでなくPhase 0の技術調査も照合する
5. **知的誠実性ルールの参照**: `templates/pipeline/intellectual-honesty.md`をインクルードする形式とする
6. **出力の二重形式**: JSON（機械処理用）とMarkdown（人間可読用）の両方を生成する指示を含める

## 8. 完了報告フォーマット

```markdown
## 完了報告: Task 3.4 Phase 2 補強コマンド + テンプレート作成

### 実施内容
- [ ] `.claude/commands/pipeline-reinforce.md` を作成
- [ ] `templates/pipeline/phase2/reinforcement.md` を作成

### コミット情報
- ハッシュ: {commit_hash}
- メッセージ: {commit_message}

### 受け入れテスト結果
{各テスト項目の合否}

### 特記事項
{実装時の判断や注意点}
```
