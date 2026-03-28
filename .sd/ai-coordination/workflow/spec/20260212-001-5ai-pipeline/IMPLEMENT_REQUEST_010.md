# 実装指示: Phase 3 批判コマンド + テンプレート作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 010 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/010-phase3-critique` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

## 2. 実装タスク概要

Task 3.5に対応。Phase 3（批判・検証）のコマンドファイルとプロンプトテンプレートを作成する。

Phase 1の提案とPhase 2の補強分析に対して、Gemini APIが「批判者」として失敗シナリオの構築、定量的リスク評価、反証の提示を行う。Brave APIとExa APIで反証事例を検索し、提案の脆弱性を徹底的に検証する。

**重要**: これはプロンプト駆動のオーケストレーションシステムである。ランタイムコードではなくMarkdownコマンドとプロンプトテンプレートを作成する。

## 3. 実装範囲

### 3.1 作成ファイル一覧（2件）

| # | ファイルパス | 説明 |
|---|------------|------|
| 1 | `.claude/commands/pipeline-critique.md` | Phase 3実行コマンド |
| 2 | `templates/pipeline/phase3/critique.md` | 批判・検証プロンプトテンプレート |

### 3.2 依存タスク（実装済み前提）
- Task 1.1: TypeScript型定義（`src/pipeline/types/index.ts`）
- Task 1.2: 知的誠実性ルール（`templates/pipeline/intellectual-honesty.md`）
- Task 2.1: `/pipeline:init`コマンド（`.claude/commands/pipeline-init.md`）

## 4. 追加・変更仕様（差分）

### 4.1 コマンドファイル: `pipeline-critique.md`

design.md Section 5.2の共通パターンに準拠。

#### 4.1.1 前提条件チェック
```
1. pipeline-state.json の存在確認
2. 案件IDの妥当性検証
3. Phase 2の完了確認（phase2ステータスが completed であること）
4. phase1_proposal.json の存在確認
5. phase2_reinforcement.json の存在確認
```

#### 4.1.2 テンプレート読み込み
```
1. templates/pipeline/intellectual-honesty.md（知的誠実性ルール共通）
2. templates/pipeline/phase3/critique.md（Phase 3専用テンプレート）
```

#### 4.1.3 プロンプト構成（design.md Section 3.6準拠）
```
[知的誠実性ルール（共通）]
+
[Phase 3専用指示]
+
[Phase 1提案データ（phase1_proposal.json）]
+
[Phase 2補強データ（phase2_reinforcement.json）]
```

#### 4.1.4 実行
- Gemini APIを使用して批判・検証分析を生成
- 入力: `phase1_proposal.json` + `phase2_reinforcement.json`
- 処理: Gemini API呼び出し + Brave/Exa APIでの反証事例検索

#### 4.1.5 リサーチツール使用（REQ-010.2）

| ツール | 用途 | フォールバック |
|--------|------|-------------|
| Brave API | 反証事例・失敗事例の広範検索 | WebSearchツールで代替 |
| Exa API | 類似戦略の失敗事例のセマンティック検索 | WebSearchツールで代替 |

**フォールバック動作**:
```
1. BRAVE_API_KEY / EXA_API_KEY 環境変数を確認
2. 設定済み → 各APIで反証検索
3. 未設定 → WebSearchツール（Claude Code組み込み）で代替
4. ログに使用ツールと未設定ツールの警告を記録
```

**ツール使い分けルール（REQ-010.3）**:
| 検索目的 | 最適ツール | 理由 |
|---------|-----------|------|
| 「○○業界 失敗 原因 事例」 | Brave | Googleと異なるインデックスで死角を補完 |
| 「この戦略に似た失敗事例」 | Exa | 意味ベース検索で表層的なキーワード一致を超える |
| 反証となるニュース・プレスリリース | Brave | ニュース検索モードで最新情報を取得 |

#### 4.1.6 出力
| ファイル | 形式 | 説明 |
|---------|------|------|
| `phase3_critique.json` | 構造化JSON | 機械処理用の批判分析データ |
| `phase3_critique.md` | Markdown | 人間可読の批判・検証レポート |

#### 4.1.7 完了処理
```
1. pipeline-state.json の phase3 ステータスを completed に更新
2. output_files に生成ファイルパスを記録
3. handoff-log.json に phase3_critique を記録
4. 次フェーズ（Phase 3.5 歴史的検証）の案内を表示
```

### 4.2 プロンプトテンプレート: `critique.md`

design.md Section 3.6およびSection 6.3に準拠。

#### 4.2.1 役割定義

```
あなたは「批判者」です。
Phase 1で提示された戦略提案とPhase 2の補強分析に対して、
徹底的な批判と検証を行ってください。
あなたの仕事は提案を改善することではなく、
提案の脆弱性を暴き出し、経営者が見落としがちなリスクを可視化することです。
```

#### 4.2.2 批判の3軸（design.md Section 3.6）

**軸1: 失敗シナリオの構築（3つ以上必須）**
- 各提案オプションに対して、最低3つの具体的な失敗シナリオを構築
- 各シナリオには以下を含める:
  - シナリオ名
  - 発生条件（トリガー）
  - 進行プロセス（どのように悪化するか）
  - 最悪の結果
  - 発生確率の推定
  - 検知シグナル（早期警告指標）

**軸2: 定量的リスク評価**
- 各リスクに対して以下を定量化:
  - 発生確率（1-5スケール）
  - 影響度（1-5スケール）
  - 財務インパクトの推定（可能な範囲で金額換算）
  - 対応コスト
- リスクヒートマップの素材となるデータを出力

**軸3: 反証の提示（具体的根拠付き）**
- Phase 1の各主要主張に対して反証を試みる
- 反証には以下を含める:
  - 反証対象の主張
  - 反証の内容
  - 反証の根拠（Brave/Exa APIで取得した具体的事例・データ）
  - 反証の強度（convincing / moderate / weak）
- 反証できなかった主張についても「反証を試みたが根拠を見つけられなかった」と明記

#### 4.2.3 Brave/Exa API反証検索指示（REQ-010.2）

```
以下の観点でBrave APIとExa APIを使用して反証事例を検索してください:

## Brave API（広範検索）
- 提案と類似の戦略で失敗した企業の事例
- 提案が依拠する市場予測の外れた事例
- 競合の動向で提案を無効化する可能性のある情報

## Exa API（セマンティック検索）
- 「この戦略に似たアプローチで失敗した事例」
- 「この業界で類似の施策が頓挫した理由」
- 提案の論理構造に類似した失敗パターン

APIが利用できない場合はWebSearchで代替してください。
検索結果はsources[]に出典を記録してください。
```

#### 4.2.4 知的誠実性ルールの組み込み（REQ-004.1, REQ-004.2）

Phase 3では特に以下の点を強調:
- **同意の前に弱点を特定せよ**: Phase 2の補強に安易に同意しない
- **「妥当」は結論であり出発点ではない**: Phase 2が裏付けた数値でも独自に検証する
- **迎合は合意ではない**: Phase 1・Phase 2の結論を追認するだけでは批判者の役割を果たしていない
- **早すぎる収束は思考の放棄**: 「全体として妥当」という結論を急がない

#### 4.2.5 必須出力フィールド（REQ-004.2）

```json
{
  "weakest_point_identified": {
    "target_phase": "phase1 | phase2",
    "claim": "Phase 1またはPhase 2の中で最も弱いと判断した主張",
    "weakness": "その弱点の具体的説明",
    "severity": "critical | major | minor"
  },
  "disagreements": [
    {
      "target_claim": "異なる見解を持つ主張",
      "target_phase": "phase1 | phase2",
      "alternative_view": "代替的な見解",
      "evidence": ["反証根拠1", "反証根拠2"],
      "confidence_in_alternative": 0.7
    }
  ],
  "verification_method": {
    "approach": "検証に使用したアプローチ",
    "tools_used": ["Brave API", "Exa API"],
    "limitations": "検証の限界"
  }
}
```

#### 4.2.6 出力フォーマット指示

```json
{
  "critique_analysis": {
    "failure_scenarios": [
      {
        "scenario_name": "失敗シナリオ名",
        "target_option": "対象提案オプション",
        "trigger": "発生条件",
        "progression": "悪化プロセス",
        "worst_case": "最悪の結果",
        "probability": "high | medium | low",
        "early_warning_signals": ["検知シグナル1"]
      }
    ],
    "risk_assessment": [
      {
        "risk": "リスク名",
        "likelihood": 3,
        "impact": 4,
        "financial_impact": "推定金額",
        "mitigation_cost": "対応コスト",
        "source_phase": "phase1 | phase2"
      }
    ],
    "counter_evidence": [
      {
        "target_claim": "反証対象の主張",
        "counter_argument": "反証内容",
        "evidence": ["具体的根拠"],
        "sources": ["出典URL"],
        "strength": "convincing | moderate | weak"
      }
    ]
  },
  "weakest_point_identified": { ... },
  "disagreements": [ ... ],
  "verification_method": { ... }
}
```

## 5. 受け入れテスト

- [ ] `phase1_proposal.json` + `phase2_reinforcement.json`を入力として読み込む指示があること（REQ-001.4）
- [ ] 知的誠実性ルールが組み込まれていること（REQ-004.1, REQ-004.2）
- [ ] 少なくとも3つの失敗シナリオ構築が指示されていること
- [ ] 定量的リスク評価と反証提示（具体的根拠付き）が指示されていること
- [ ] Brave/Exa APIでの反証事例検索指示が含まれること（REQ-010.2）
- [ ] API未設定時のWebSearchフォールバック指示があること
- [ ] `phase3_critique.json` + `phase3_critique.md`が生成される指示があること
- [ ] pipeline-state.json とhandoff-log.json が更新される指示があること
- [ ] 前提条件チェック（Phase 2完了確認）が含まれていること

## 6. コミット方針

| # | コミット内容 | コミットメッセージ |
|---|------------|-----------------|
| 1 | Phase 3コマンド + テンプレート作成 | `feat(pipeline): add Phase 3 critique command and template` |

```
feat(pipeline): add Phase 3 critique command and template

- Gemini API as critic
- 3-axis critique: failure scenarios, risk assessment, counter-evidence
- Brave/Exa API for counter-evidence search (REQ-010.2)
- Minimum 3 failure scenarios required
- Intellectual honesty rules integration
```

## 7. 注意事項

1. **プロンプト駆動システム**: ランタイムコードではなくMarkdownファイルを作成する
2. **Gemini APIの使用**: Phase 3はGemini API（従量課金）を使用する
3. **批判者の立場の明確化**: テンプレートでは「改善提案」ではなく「脆弱性の暴露」が目的であることを明確にする
4. **失敗シナリオ3つ以上**: requirements.mdで「少なくとも3つ」と明記されている。テンプレートにこの最低数を明記すること
5. **Brave/Exa APIの指示**: 反証事例検索にBrave APIとExa APIを使用する指示を含める。環境変数確認とフォールバックも記述する
6. **知的誠実性ルールの参照**: `templates/pipeline/intellectual-honesty.md`をインクルードする形式とする
7. **出力の二重形式**: JSON（機械処理用）とMarkdown（人間可読用）の両方を生成する指示を含める
8. **Phase 4への接続**: Phase 3の出力はPhase 3.5（歴史的検証）とPhase 4（統合）の両方で使用される

## 8. 完了報告フォーマット

```markdown
## 完了報告: Task 3.5 Phase 3 批判コマンド + テンプレート作成

### 実施内容
- [ ] `.claude/commands/pipeline-critique.md` を作成
- [ ] `templates/pipeline/phase3/critique.md` を作成

### コミット情報
- ハッシュ: {commit_hash}
- メッセージ: {commit_message}

### 受け入れテスト結果
{各テスト項目の合否}

### 特記事項
{実装時の判断や注意点}
```
