# 実装指示: Phase 4 統合コマンド + テンプレート作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 012 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/012-phase4-integrate` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

```bash
# ブランチ作成コマンド
git checkout -b feature/20260212-001-5ai-pipeline/012-phase4-integrate
```

## 2. 実装タスク概要

**タスク番号**: 012（Task 3.7）
**タスク名**: Phase 4 統合コマンド + テンプレート作成

### 2.1 目的

パイプラインの最終フェーズであるPhase 4「統合」を実装する。Claude APIを統合責任者として、Phase 0〜3.5の全出力を統合し、経営者が意思決定に使える最終レポート（意思決定ダッシュボード）を生成する。

全フェーズの主要論点を公平に扱い、賛否両論を偏りなく提示し、歴史的検証の結果を最終判断に反映させることが求められる。

### 2.2 依存タスク
| 依存タスク番号 | 状態 | 備考 |
|--------------|------|------|
| Task 1.1 | 実装済み前提 | TypeScript型定義（IntegratedReport等） |
| Task 1.2 | 実装済み前提 | 知的誠実性ルール共通テンプレート |
| Task 2.1 | 実装済み前提 | /pipeline:init コマンド（案件ディレクトリ構造） |

## 3. 実装範囲

### 3.1 変更可能ファイル
| ファイルパス | アクション | 説明 |
|------------|----------|------|
| `.claude/commands/pipeline-integrate.md` | Create | Phase 4実行コマンド |
| `templates/pipeline/phase4/integration.md` | Create | 統合プロンプトテンプレート |

### 3.2 禁止領域（変更不可）
| ファイル/ディレクトリ | 理由 |
|---------------------|------|
| `CLAUDE.md` | フレームワーク設定 |
| `.kiro/specs/` | 仕様書は変更不可 |
| `src/pipeline/types/index.ts` | 型定義は別タスクで管理 |
| `templates/pipeline/intellectual-honesty.md` | 共通テンプレートは別タスクで管理 |

### 3.3 参照のみ（読み取り可、変更不可）
| ファイルパス | 参照理由 |
|------------|---------|
| `.kiro/specs/5ai-debate-pipeline/design.md` | Section 3.8 Phase 4 Integrator の設計仕様 |
| `.kiro/specs/5ai-debate-pipeline/requirements.md` | REQ-001.6, REQ-005.4 の要件詳細 |
| `src/pipeline/types/index.ts` | IntegratedReport等の型定義確認 |
| `templates/pipeline/intellectual-honesty.md` | 知的誠実性ルールの参照 |

## 4. 追加・変更仕様（差分）

### 4.1 コマンドファイル: `.claude/commands/pipeline-integrate.md`

Phase 4「統合」を実行するスラッシュコマンド。design.md Section 3.8およびSection 5.2の共通コマンド構造に準拠。

**コマンド呼び出し**: `/pipeline:integrate {案件ID}`

**処理フロー**:

```
1. 前提条件チェック
   - pipeline-state.json の存在確認
   - Phase 3.5（歴史的検証）の完了確認（status === 'completed'）
   - 必要な入力ファイルの存在確認:
     - phase0_research_integrated.json
     - phase1_proposal.json
     - phase1_proposal.md
     - phase2_reinforcement.json
     - phase2_reinforcement.md
     - phase3_critique.json
     - phase3_critique.md
     - phase3_5_historical.json
     - phase3_5_historical.md

2. pipeline-state.json 更新（phase4: status → 'running'）

3. テンプレート読み込み
   - templates/pipeline/intellectual-honesty.md（知的誠実性ルール）
   - templates/pipeline/phase4/integration.md（統合プロンプト）

4. 入力データの読み込み（Phase 0〜3.5の全出力）
   - phase0_research_integrated.json（6AI統合リサーチ結果）
   - phase1_proposal.json（戦略提案）
   - phase2_reinforcement.json（補強分析）
   - phase3_critique.json（批判・検証）
   - phase3_5_historical.json（歴史的検証）

5. プロンプト構築
   - 知的誠実性ルール + Phase 4専用指示 + 全フェーズデータ

6. Claude API呼び出し（統合分析）

7. 出力の保存
   - phase4_integrated_report.json（構造化JSON / IntegratedReport型準拠）
   - phase4_integrated_report.md（意思決定ダッシュボード）
   - 保存先: .kiro/ai-coordination/workflow/research/{案件ID}/

8. pipeline-state.json 更新（phase4: status → 'completed'）
9. handoff-log.json に phase4_integration エントリを記録

10. 完了報告
    - 出力ファイルパスの表示
    - パイプライン完了メッセージ
```

### 4.2 テンプレートファイル: `templates/pipeline/phase4/integration.md`

Claude APIが統合責任者として実行するプロンプトテンプレート。

#### 4.2.1 ロール設定

```
あなたは「統合責任者（Integration Director）」です。
Phase 0〜3.5の全出力を統合し、経営者が意思決定に使える最終レポートを作成する責任を担います。

あなたの使命:
- 全フェーズの主要論点を公平に扱うこと
- 賛否両論を偏りなく提示すること
- 歴史的検証の結果を最終判断に反映させること
- 経営者が「判断に必要な情報が全て揃っている」と感じるレポートを作成すること
```

#### 4.2.2 知的誠実性ルールの組み込み

```
{templates/pipeline/intellectual-honesty.md の内容をここに展開}
```

#### 4.2.3 統合レポートの8構成要素（REQ-001.6 + design.md Section 3.8）

テンプレート内で以下の8セクションを指示すること:

| # | セクション | 内容 |
|---|----------|------|
| 1 | **エグゼクティブサマリー** | 全体の要約。経営者が1分で把握できる概要 |
| 2 | **推奨案（confidenceスコア付き）** | 各選択肢のconfidence（0-1）、根拠、リスク、歴史的支持度、タイムライン、推定コスト |
| 3 | **賛否両論マトリックス（ProConMatrix）** | 各選択肢のpros/cons、Phase 1支持度、Phase 2支持度、Phase 3リスクレベル、Phase 3.5歴史的判定 |
| 4 | **歴史が支持する選択肢 vs 歴史が警告する選択肢** | Phase 3.5の結果に基づく歴史的観点からの分類 |
| 5 | **リスクヒートマップ** | 全リスクの likelihood(1-5) x impact(1-5) マッピング、出典フェーズ、軽減策 |
| 6 | **意思決定ポイント** | 経営者が判断すべき具体的な質問、選択肢、推奨、根拠、期限 |
| 7 | **実行ロードマップ（選択肢別）** | 各選択肢のフェーズ別実行計画（期間、主要アクション、マイルストーン、予算） |
| 8 | **知的誠実性レポート（HonestySummary）** | 全フェーズの不一致数、未解決矛盾、最も弱い前提、合意領域、confidence範囲 |

#### 4.2.4 統合時の特別指示

テンプレートに以下の統合ルールを含めること:

- **Phase 0（リサーチ）**: 各AIの調査結果から市場データ・競合分析・技術動向・ソーシャルインテリジェンスを統合。Perplexityの検証結果で信頼度を調整
- **Phase 1（提案）**: 戦略提案の各選択肢を推奨案の候補として採用
- **Phase 2（補強）**: 数字的裏付けとロジック検証の結果を各選択肢のconfidenceに反映
- **Phase 3（批判）**: 失敗シナリオとリスク評価をリスクヒートマップに統合
- **Phase 3.5（歴史的検証）**: 歴史的判定を「歴史支持/歴史警告」分類に反映。recovery_playbooksをリスク軽減策に活用
- **矛盾の扱い**: フェーズ間で矛盾する主張がある場合、両方を併記し、統合責任者としての見解を付記（どちらかを無視しない）

#### 4.2.5 出力フォーマット指示

テンプレートに以下の出力フォーマットを指示すること（IntegratedReport型準拠）:

```
出力は以下のJSON構造に準拠すること:

{
  "executive_summary": "string（全体要約）",
  "recommendations": [
    // 各選択肢の推奨案
    // option, confidence(0-1), rationale, risks[], history_support, timeline, estimated_cost
  ],
  "pros_cons_matrix": {
    "options": [
      // 各選択肢の賛否
      // name, pros[], cons[], phase1_support, phase2_support, phase3_risk_level, phase3_5_history_verdict
    ]
  },
  "history_supported_options": ["string[]"],
  "history_warned_options": ["string[]"],
  "risk_heatmap": [
    // 全リスク一覧
    // risk, likelihood(1-5), impact(1-5), source_phase, mitigation
  ],
  "decision_points": [
    // 経営者が判断すべき項目
    // question, options[], recommended, rationale, deadline
  ],
  "execution_roadmap": [
    // 選択肢別実行計画
    // option_name, phases[{ phase, duration, key_actions[], milestones[], budget }]
  ],
  "honesty_summary": {
    // 知的誠実性の総括
    // total_disagreements, unresolved_contradictions[], weakest_assumptions[]
    // areas_of_consensus[], confidence_range: { min, max }
  },
  "research_integration": {
    // Phase 0リサーチの統合情報
    // market_overview, competitive_landscape, customer_insights, regulatory_environment
    // social_intelligence, source_verification, technical_feasibility
    // perception_vs_reality[], contradictions[], blind_spots[]
    // research_quality: { coverage_score, source_diversity, freshness_score }
  },
  // 知的誠実性フィールド（必須）
  "weakest_point_identified": { ... },
  "disagreements": [ ... ],
  "verification_method": { ... }
}
```

#### 4.2.6 Markdown出力テンプレート（意思決定ダッシュボード）

`phase4_integrated_report.md`の構成:

```
# 意思決定ダッシュボード
## 案件: {案件ID}
## 作成日時: {timestamp}

---

## 1. エグゼクティブサマリー
{1分で把握できる全体要約}

## 2. 推奨案
### 推奨案1: {option} (confidence: XX%)
### 推奨案2: {option} (confidence: XX%)
...

## 3. 賛否両論マトリックス
| 選択肢 | 賛成論 | 反対論 | Phase 1 | Phase 2 | Phase 3 リスク | 歴史的判定 |
|--------|-------|--------|---------|---------|--------------|----------|

## 4. 歴史的視点
### 歴史が支持する選択肢
### 歴史が警告する選択肢

## 5. リスクヒートマップ
| リスク | 発生可能性 | 影響度 | 出典 | 軽減策 |
|--------|-----------|--------|------|--------|

## 6. 意思決定ポイント（経営者への問い）
### Q1: {question}
### Q2: {question}
...

## 7. 実行ロードマップ
### 選択肢A実行計画
### 選択肢B実行計画
...

## 8. 知的誠実性レポート
### 全フェーズの不一致・弱点集約
### 未解決の矛盾
### 合意領域
### 信頼度範囲
```

## 5. 受け入れテスト

### 5.1 ファイル存在確認
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| FE-012-001 | `.claude/commands/pipeline-integrate.md` が存在する | ファイルが作成されている |
| FE-012-002 | `templates/pipeline/phase4/integration.md` が存在する | ファイルが作成されている |

### 5.2 コマンドファイル検証
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| CM-012-001 | 前提条件チェック（pipeline-state.json、Phase 3.5完了確認）が定義されている | 明確なチェック手順が記述 |
| CM-012-002 | Phase 0〜3.5の全入力ファイル（5件のJSON）の読み込み手順が記述されている | ファイルパスが全て明記 |
| CM-012-003 | Claude API呼び出しの手順が記述されている | プロンプト構築→API呼び出し→結果保存 |
| CM-012-004 | 出力ファイル2件（JSON + MD）の保存手順が記述されている | 保存先パスが明記 |
| CM-012-005 | pipeline-state.json とhandoff-log.json の更新手順が記述されている | 更新内容が明記 |

### 5.3 テンプレートファイル検証
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| TM-012-001 | 知的誠実性ルール（4原則）が組み込まれている | intellectual-honesty.md の参照指示 |
| TM-012-002 | 8つの統合レポート構成要素が全て含まれている | 8セクション全て記述 |
| TM-012-003 | 歴史的検証結果の反映指示が含まれている | 歴史支持/歴史警告の分類指示 |
| TM-012-004 | confidenceスコア付き推奨案の出力指示がある | confidence(0-1)の記述 |
| TM-012-005 | 出力フォーマットがIntegratedReport型に準拠している | 全フィールドが網羅 |
| TM-012-006 | 意思決定ダッシュボード（MD）のテンプレートが含まれている | 8セクション構成のMD形式 |
| TM-012-007 | フェーズ間矛盾の扱いルールが記述されている | 両方併記+統合責任者見解 |

## 6. コミット方針

### 6.1 コミットメッセージ形式
```
feat(pipeline): add Phase 4 integration command and template

- Create /pipeline:integrate command for final report generation
- Create integration prompt template with 8-section dashboard
- Include history-supported vs history-warned classification
- Define confidence-scored recommendation output format

Refs: 20260212-001-5ai-pipeline#012
```

### 6.2 コミット粒度
- コマンドファイルとテンプレートファイルは同一コミットに含める（機能的に不可分）

## 7. 注意事項

### 7.1 プロジェクト特性
- [ ] これはプロンプト駆動のオーケストレーションシステムであり、従来のソフトウェアアプリケーションではない
- [ ] 作成するファイルはMarkdownコマンドとプロンプトテンプレートである（ランタイムコードではない）
- [ ] TypeScriptは型定義のみ（別タスクで作成済み前提）

### 7.2 品質基準
- [ ] プロンプトテンプレートは具体的で曖昧さのない指示を含むこと
- [ ] 全ての出力フィールドがIntegratedReport型定義と一致すること
- [ ] 全フェーズの結果が公平に扱われる指示であること

### 7.3 特記事項
- Phase 4は全フェーズの集大成であり、大量のデータを統合する必要がある。プロンプトが冗長にならないよう、各フェーズの「要点」を抽出する指示を含めること
- 統合責任者は「中立」の立場。特定の選択肢を推すのではなく、各選択肢のメリット・デメリットを公平に提示する
- 歴史的検証（Phase 3.5）の結果は、他のフェーズと同等の重みで扱うこと。歴史的判定が最終推奨を覆す可能性も許容する
- 意思決定ダッシュボード（MD形式）は、技術に詳しくない経営者が読んで理解できる言葉遣いとすること

## 8. 完了報告フォーマット

実装完了時、以下の形式で報告:

```markdown
## 実装完了報告

### 変更ファイル
| ファイル | アクション | 行数 |
|---------|----------|------|
| `.claude/commands/pipeline-integrate.md` | Create | XX行 |
| `templates/pipeline/phase4/integration.md` | Create | XX行 |

### 検証結果
- [ ] コマンドファイルに前提条件チェックが含まれている
- [ ] テンプレートに知的誠実性ルールが組み込まれている
- [ ] テンプレートに8つの統合レポート構成要素が含まれている
- [ ] 歴史的検証結果の反映指示が含まれている
- [ ] confidenceスコア付き推奨案の出力指示がある
- [ ] 出力フォーマットがIntegratedReport型に準拠している

### 次のアクション
- Codexレビュー依頼
```

---
**発行日時**: 2026-02-12 16:00
**発行者**: Claude Code
