# 実装指示: Phase 0 案件タイプ別テンプレート作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 007 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/007-phase0-case-types` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

## 2. 実装タスク概要

Task 3.2に対応。Phase 0のリサーチ指示を案件タイプ（A〜D）ごとにカスタマイズする4つのテンプレートを作成する。

各テンプレートは、案件の性質に応じて6つのAI（Claude/ChatGPT/Gemini/Grok/Perplexity/Codex）それぞれに異なるリサーチ指示を与える。requirements.md REQ-006.1〜006.4の指示表を正確にテンプレートへ展開する。

**重要**: これはプロンプト駆動のオーケストレーションシステムである。ランタイムコードではなくMarkdownテンプレートを作成する。

## 3. 実装範囲

### 3.1 作成ファイル一覧（4件）

| # | ファイルパス | 説明 |
|---|------------|------|
| 1 | `templates/pipeline/phase0/case-types/typeA-new-business.md` | Type A: 新規サービス・新規事業 |
| 2 | `templates/pipeline/phase0/case-types/typeB-improvement.md` | Type B: 既存事業改善・収益性向上 |
| 3 | `templates/pipeline/phase0/case-types/typeC-dx.md` | Type C: DX・業務改革 |
| 4 | `templates/pipeline/phase0/case-types/typeD-crisis.md` | Type D: リスク・危機対応 |

### 3.2 依存タスク（実装済み前提）
- Task 3.1: Phase 0リサーチコマンド + テンプレート（`IMPLEMENT_REQUEST_006`）
  - 各AI別リサーチテンプレート（`templates/pipeline/phase0/*.md`）が存在すること
  - コマンドファイル（`.claude/commands/pipeline-research.md`）がcase-types参照ロジックを含むこと

## 4. 追加・変更仕様（差分）

### 4.1 テンプレート共通構造

各案件タイプテンプレートは以下の構造を持つ:

```markdown
# {案件タイプ名} リサーチ指示

## 案件タイプ概要
{このタイプの特性と重点ポイント}

## AI別リサーチ指示

### Claude（マーケットストラテジスト）
{Type固有のリサーチ指示}

### ChatGPT（マーケットアナリスト）
{Type固有のリサーチ指示}

### Gemini（マーケットスカウト）
{Type固有のリサーチ指示}

### Grok（ソーシャルリスニングアナリスト）
{Type固有のリサーチ指示}

### Perplexity（リサーチバリデーター）
{Type固有のリサーチ指示}

### Codex（テクニカルリサーチャー）
{Type固有のリサーチ指示}
```

### 4.2 Type A: 新規サービス・新規事業（REQ-006.1）

| AI | リサーチ指示 |
|----|------------|
| Claude | 対象市場の構造分析、競合ポジショニング、類似サービスの成功・失敗パターン |
| ChatGPT | 市場規模・成長率の定量データ、価格帯ベンチマーク、ターゲット顧客の行動データ |
| Gemini | Google Trends需要動向、海外先行事例、関連規制・許認可要件 |
| Grok | 新サービスに対するX上の期待・懐疑の声、類似サービスのローンチ反応 |
| Perplexity | 他4AIが出した市場規模・成長率データのソース検証、最新プレスリリース収集 |
| Codex | 提案される技術スタックの実現性検証、必要API・ツールの比較、実装コスト概算 |

### 4.3 Type B: 既存事業の改善・収益性向上（REQ-006.2）

| AI | リサーチ指示 |
|----|------------|
| Claude | 同業他社の収益改善事例、ビジネスモデル変革パターン、顧客LTV向上戦略 |
| ChatGPT | 業界平均収益指標・原価構造・価格戦略データ、技術導入ROI事例 |
| Gemini | 税制改正・補助金情報、市場環境変化要因、海外同業の収益モデル |
| Grok | 競合ブランドへの不満・乗り換え意向、業界の価格感度に関する生の声 |
| Perplexity | 収益指標データの出典検証、補助金情報の最新性確認 |
| Codex | 改善施策に必要なシステム改修の技術的難易度、既存システムとの統合可能性 |

### 4.4 Type C: DX・業務改革（REQ-006.3）

| AI | リサーチ指示 |
|----|------------|
| Claude | 同規模組織のDX成功事例、業務プロセス改革フレームワーク、失敗要因パターン |
| ChatGPT | DXツール比較・価格・ROIデータ、技術トレンドの最新動向 |
| Gemini | 電子帳簿保存法等の規制動向、世界の会計DX事例 |
| Grok | DXツールに対する実務者の生の声、「DX疲れ」の実態、導入後の現場反応 |
| Perplexity | DXツールの公式価格・機能比較の裏取り、法改正情報の最新性確認 |
| Codex | 候補ツールのAPI仕様・連携可能性、既存業務システムとの統合難易度 |

### 4.5 Type D: リスク・危機対応（REQ-006.4）

| AI | リサーチ指示 |
|----|------------|
| Claude | 類似危機事例の対応パターン、ステークホルダー分析 |
| ChatGPT | 財務影響の定量シミュレーション、保険・補償データ、雇用法規制 |
| Gemini | 最新判例・行政処分、法令改正、海外の危機対応ベストプラクティス |
| Grok | 風評被害のリアルタイム監視、炎上予兆の検知、消費者の怒り・不安の拡散状況 |
| Perplexity | 判例・法令情報の正確性検証、類似事例の報道ソース追跡 |
| Codex | システム障害時の技術的復旧手順、セキュリティ対策の技術的選択肢 |

### 4.6 Case Type Routerとの連携

design.md Section 3.11のCase Type Routerが、`/pipeline:research`コマンド実行時に案件タイプ引数（A|B|C|D）に応じて適切なテンプレートを選択する。

```
入力: caseType (A | B | C | D)
  ↓
Phase 0テンプレート選択:
  → templates/pipeline/phase0/case-types/type{X}-*.md
  ↓
各AI用のリサーチ指示を案件タイプに応じて生成
```

テンプレート内の指示は、各AI別リサーチテンプレート（`claude-research.md`等）の「案件タイプ別指示」セクションに挿入される形式とする。

## 5. 受け入れテスト

- [ ] 4つの案件タイプテンプレートが作成されていること（REQ-006.1〜006.4）
- [ ] 各テンプレートにAI別（Claude/ChatGPT/Gemini/Grok/Perplexity/Codex）のリサーチ指示が含まれること
- [ ] REQ-006の指示表の内容が正確に反映されていること
- [ ] 各テンプレートの構造が統一されていること
- [ ] Case Type Router（design.md Section 3.11）による選択が可能な命名規則であること
- [ ] AI別リサーチテンプレート（Task 3.1）との組み合わせが整合的であること

## 6. コミット方針

| # | コミット内容 | コミットメッセージ |
|---|------------|-----------------|
| 1 | 4つの案件タイプ別テンプレート作成 | `feat(pipeline): add 4 case type templates for Phase 0 research` |

```
feat(pipeline): add 4 case type templates for Phase 0 research

- Type A: new business (REQ-006.1)
- Type B: improvement (REQ-006.2)
- Type C: DX/reform (REQ-006.3)
- Type D: crisis response (REQ-006.4)
- Each template includes 6 AI-specific research instructions
```

## 7. 注意事項

1. **プロンプト駆動システム**: ランタイムコードではなくMarkdownテンプレートを作成する
2. **REQ-006準拠の厳守**: requirements.mdのREQ-006.1〜006.4の指示表を正確に反映すること。内容の改変・最適化は禁止
3. **テンプレート間の整合性**: 4テンプレートの構造（セクション名、AI順序等）を統一すること
4. **AI別テンプレートとの連携**: Task 3.1で作成されるAI別テンプレートから参照される形式にすること
5. **対象組織の特性**: 税理士法人スリーエスが対象であることを踏まえ、テンプレートの指示内容が一般的なビジネスに適用可能であることを確認

## 8. 完了報告フォーマット

```markdown
## 完了報告: Task 3.2 Phase 0 案件タイプ別テンプレート作成

### 実施内容
- [ ] `templates/pipeline/phase0/case-types/typeA-new-business.md` を作成
- [ ] `templates/pipeline/phase0/case-types/typeB-improvement.md` を作成
- [ ] `templates/pipeline/phase0/case-types/typeC-dx.md` を作成
- [ ] `templates/pipeline/phase0/case-types/typeD-crisis.md` を作成

### コミット情報
- ハッシュ: {commit_hash}
- メッセージ: {commit_message}

### 受け入れテスト結果
{各テスト項目の合否}

### 特記事項
{実装時の判断や注意点}
```
