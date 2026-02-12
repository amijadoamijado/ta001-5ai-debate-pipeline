# 実装指示: Phase 3.5 歴史的検証コマンド + テンプレート作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 011 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/011-phase3-5-history` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

```bash
# ブランチ作成コマンド
git checkout -b feature/20260212-001-5ai-pipeline/011-phase3-5-history
```

## 2. 実装タスク概要

**タスク番号**: 011（Task 3.6）
**タスク名**: Phase 3.5 歴史的検証コマンド + テンプレート作成

### 2.1 目的

パイプラインの最大の差別化要素であるPhase 3.5「歴史的検証」を実装する。「愚者は経験に学び、賢者は歴史に学ぶ」（ビスマルク）の原則に基づき、Claude Codeが歴史参謀として、提案された戦略を古今東西の歴史的事例と照合し検証する。

このフェーズはClaude Codeがローカルで実行するため、**追加APIコストがゼロ**であることが大きな特徴。訓練データの知識に加え、Brave/Tavily/Exa APIの3つのリサーチツールを活用して最新の事例データで裏取りを行う。

### 2.2 依存タスク
| 依存タスク番号 | 状態 | 備考 |
|--------------|------|------|
| Task 1.1 | 実装済み前提 | TypeScript型定義（HistoricalValidationOutput等） |
| Task 1.2 | 実装済み前提 | 知的誠実性ルール共通テンプレート |
| Task 2.1 | 実装済み前提 | /pipeline:init コマンド（案件ディレクトリ構造） |

## 3. 実装範囲

### 3.1 変更可能ファイル
| ファイルパス | アクション | 説明 |
|------------|----------|------|
| `.claude/commands/pipeline-history.md` | Create | Phase 3.5実行コマンド |
| `templates/pipeline/phase3_5/historical.md` | Create | 歴史的検証プロンプトテンプレート |

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
| `.kiro/specs/5ai-debate-pipeline/design.md` | Section 3.7 Phase 3.5 Historical Validator の設計仕様 |
| `.kiro/specs/5ai-debate-pipeline/requirements.md` | REQ-001.5 の要件詳細 |
| `src/pipeline/types/index.ts` | HistoricalValidationOutput等の型定義確認 |
| `templates/pipeline/intellectual-honesty.md` | 知的誠実性ルールの参照 |

## 4. 追加・変更仕様（差分）

### 4.1 コマンドファイル: `.claude/commands/pipeline-history.md`

Phase 3.5「歴史的検証」を実行するスラッシュコマンド。design.md Section 3.7およびSection 5.2の共通コマンド構造に準拠。

**コマンド呼び出し**: `/pipeline:history {案件ID}`

**処理フロー**:

```
1. 前提条件チェック
   - pipeline-state.json の存在確認
   - Phase 3（批判）の完了確認（status === 'completed'）
   - 必要な入力ファイルの存在確認:
     - phase1_proposal.json
     - phase2_reinforcement.json
     - phase3_critique.json

2. pipeline-state.json 更新（phase3_5: status → 'running'）

3. テンプレート読み込み
   - templates/pipeline/intellectual-honesty.md（知的誠実性ルール）
   - templates/pipeline/phase3_5/historical.md（歴史的検証プロンプト）

4. 入力データの読み込み
   - phase1_proposal.json（提案内容）
   - phase2_reinforcement.json（補強分析結果）
   - phase3_critique.json（批判・検証結果）

5. リサーチツール利用可否チェック
   - Brave API: BRAVE_API_KEY 環境変数 or MCP
   - Tavily API: TAVILY_API_KEY 環境変数 or MCP
   - Exa API: EXA_API_KEY 環境変数 or MCP
   - いずれも未設定 → WebSearchツールにフォールバック

6. 歴史的検証の実行（Claude Codeローカル実行）
   a. 提案の核心戦略を抽出
   b. 訓練データから類似の歴史的事例を想起
   c. Brave APIで企業史・倒産事例を広範検索
   d. Tavily APIで構造化されたビジネス分析を取得
   e. Exa APIで意味ベースの類似パターンを発見
   f. 6つの検証観点で分析実行
   g. 成功パターン・失敗警告・回復プレイブックを構築
   h. 適用可能な戦略理論・改善哲学を選定（ポーター/アンゾフ/BCG/フォード/トヨタTPS/マスクを優先検討）
   i. 時代の転換点との類似性を分析
   j. history_verdict（歴史の総合判定）を下す

7. 出力の保存
   - phase3_5_historical.json（構造化JSON / HistoricalValidationOutput型準拠）
   - phase3_5_historical.md（人間可読マークダウン）
   - 保存先: .kiro/ai-coordination/workflow/research/{案件ID}/

8. pipeline-state.json 更新（phase3_5: status → 'completed'）
9. handoff-log.json に phase3_5_historical エントリを記録

10. 完了報告
    - 出力ファイルパスの表示
    - 次フェーズ（Phase 4 統合）の案内
```

### 4.2 テンプレートファイル: `templates/pipeline/phase3_5/historical.md`

Claude Codeが歴史参謀として実行するプロンプトテンプレート。以下の構成要素を含むこと。

#### 4.2.1 ロール設定

```
あなたは「歴史参謀」です。
古今東西のビジネス史・戦略史・経済史に精通し、
提案された戦略を歴史的事例と照合して検証する役割を担います。

「愚者は経験に学び、賢者は歴史に学ぶ」— オットー・フォン・ビスマルク
```

#### 4.2.2 知的誠実性ルールの組み込み

```
{templates/pipeline/intellectual-honesty.md の内容をここに展開}
```

#### 4.2.3 歴史参謀の行動規範5か条（REQ-001.5より）

以下の5か条をテンプレートに含めること:

1. **「歴史は韻を踏む」** — 完全な一致ではなくパターンの類似性に着目せよ
2. **生存者バイアスを排除せよ** — 成功事例だけでなく、同時期に同じ戦略で消えた企業も分析
3. **時代背景の差異を明示せよ** — 歴史的事例と現在の環境差を必ず注記
4. **「この戦略は歴史上、何回試みられ、何回成功したか」を定量化せよ**
5. **訓練データの知識だけに頼るな** — Brave/Tavily/Exaで最新の事例・データを裏取りせよ

#### 4.2.4 6つの検証観点（REQ-001.5より）

テンプレート内で以下の6観点を明示し、それぞれについて分析を指示すること:

| # | 検証観点 | 具体的な分析内容 |
|---|---------|----------------|
| 1 | 大成した企業・戦略 | 提案と類似の戦略で成功した歴史的事例。何が成功要因だったか |
| 2 | 失敗した企業・戦略 | 提案と類似の戦略で失敗した事例。何が致命的だったか |
| 3 | 回復した企業 | 一度失敗したが復活した事例。転換点は何だったか |
| 4 | 古今東西の戦略・戦術・改善哲学 | **ポーターの競争戦略**（Five Forces + コストリーダーシップ/価格戦略・差別化戦略・集中/ニッチ戦略）、**アンゾフの成長マトリックス**（市場浸透・市場開拓・製品開発・多角化）、**BCG PPM**（花形・金のなる木・問題児・負け犬）、**ヘンリー・フォードの改善**（大量生産・流れ作業・垂直統合・標準化）、**トヨタの改善/TPS**（カイゼン・JIT・自働化・ムダ排除・現地現物・なぜなぜ5回）、**イーロン・マスクの改善**（第一原理思考・高速イテレーション・垂直統合・物理法則以外は変更可能）、孫子の兵法、ランチェスター戦略、ブルーオーシャン等 |
| 5 | 時代の転換点との類似性 | 現在の状況が過去のどの転換点に類似するか（産業革命、IT革命、規制変更等） |
| 6 | 歴史が示す落とし穴 | 「歴史は繰り返す」パターン。提案が陥りやすい歴史的な罠 |

#### 4.2.5 リサーチツール使い分け指示

テンプレートに以下のツール使い分けルールを含めること:

| ツール | 最適な用途 | 検索例 |
|--------|----------|--------|
| **Brave Search** | 一般的な企業史・倒産事例の広範検索 | 「○○業界 倒産 原因 事例」「○○戦略 失敗 企業」 |
| **Tavily** | 構造化されたビジネス分析の取得 | 企業の戦略転換事例のレポート、業界分析レポート |
| **Exa** | 類似パターンのセマンティック発見 | 「この戦略に似た歴史的成功/失敗」「類似ビジネスモデルの変遷」 |

**重要**: 3ツール全てを活用すること。1つのツールに偏らず、それぞれの強みを活かした検索を行う。

**フォールバック**: APIキー未設定のツールがある場合はWebSearchツール（Claude Code組み込み）で代替。全ツール未設定でも訓練データの知識で続行（ログに警告を記録）。

#### 4.2.6 出力フォーマット指示

テンプレートに以下の出力フォーマットを指示すること（HistoricalValidationOutput型準拠）:

```
出力は以下のJSON構造に準拠すること:

{
  "historical_parallels": [
    // 提案と類似の歴史的事例（成功・失敗・回復別）
    // 各事例に category, entity, era, region, industry, strategy, outcome, lesson, relevance_to_proposal, sources を含む
    // 最低6件以上（成功3件+、失敗3件+）
  ],
  "success_patterns": [
    // 成功事例から抽出したパターン
    // pattern_name, examples[], key_factors[], applicability_to_proposal, confidence
  ],
  "failure_warnings": [
    // 失敗事例から抽出した警告
    // warning, historical_examples[], fatal_factor, proposal_risk_level, mitigation_suggestion
  ],
  "recovery_playbooks": [
    // 回復事例から抽出した「もし失敗した場合」のプレイブック
    // scenario, historical_recovery, turning_point, steps[], timeline
  ],
  "strategic_frameworks": [
    // 適用可能な戦略理論・改善哲学（3つ以上、ポーター/アンゾフ/BCG/フォード/トヨタTPS/マスクを優先検討）
    // name, author, era, applicable_principle, application_to_proposal
  ],
  "era_similarity": {
    // 現在の状況と過去の時代転換点との類似度分析
    // current_era_characteristics[], most_similar_historical_era, similarity_score, key_parallels[], key_differences[]
  },
  "history_verdict": {
    // 歴史の観点からの総合判定
    // judgment: 'support' | 'caution' | 'against'
    // confidence, rationale, historical_success_rate
    // do_list[], dont_list[]
  },
  // 知的誠実性フィールド（必須）
  "weakest_point_identified": { ... },
  "disagreements": [ ... ],
  "verification_method": { ... }
}
```

#### 4.2.7 Markdown出力テンプレート

`phase3_5_historical.md`の構成:

```
# Phase 3.5: 歴史的検証レポート
## 案件: {案件ID}
## 実行日時: {timestamp}

### 歴史参謀の総合判定 (History Verdict)
{judgment + rationale + historical_success_rate}

### Do / Don't リスト
#### やるべきこと (Do)
#### やってはいけないこと (Don't)

### 歴史的類似事例
#### 成功事例
#### 失敗事例
#### 回復事例

### 成功パターン分析
### 失敗警告
### 回復プレイブック
### 適用可能な戦略理論・改善哲学（3つ以上、ポーター/アンゾフ/BCG/フォード/トヨタTPS/マスクを優先検討）
### 時代の転換点との類似性分析

### 知的誠実性レポート
#### 最も弱い主張の特定
#### 異論・対立見解
#### 検証方法
```

## 5. 受け入れテスト

### 5.1 ファイル存在確認
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| FE-011-001 | `.claude/commands/pipeline-history.md` が存在する | ファイルが作成されている |
| FE-011-002 | `templates/pipeline/phase3_5/historical.md` が存在する | ファイルが作成されている |

### 5.2 コマンドファイル検証
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| CM-011-001 | 前提条件チェック（pipeline-state.json、Phase 3完了確認）が定義されている | 明確なチェック手順が記述されている |
| CM-011-002 | 入力ファイル3件（phase1, phase2, phase3）の読み込み手順が記述されている | ファイルパスと読み込み順序が明記 |
| CM-011-003 | リサーチツール利用可否チェックが定義されている | Brave/Tavily/Exa + フォールバック手順 |
| CM-011-004 | 歴史的検証の実行手順が段階的に記述されている | 10ステップ以上の処理フロー |
| CM-011-005 | 出力ファイル2件（JSON + MD）の保存手順が記述されている | 保存先パスが明記 |
| CM-011-006 | pipeline-state.json とhandoff-log.json の更新手順が記述されている | 更新内容が明記 |

### 5.3 テンプレートファイル検証
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| TM-011-001 | 知的誠実性ルール（4原則）が組み込まれている | intellectual-honesty.md の参照指示 |
| TM-011-002 | 歴史参謀の行動規範5か条が含まれている | 5つの規範が正確に記述 |
| TM-011-003 | 6つの検証観点が全て含まれている | 大成企業、失敗企業、回復企業、戦略理論、時代転換点、歴史の落とし穴 |
| TM-011-004 | Brave/Tavily/Exa全3ツールの使い分け指示が含まれている | 各ツールの用途と検索例が明記 |
| TM-011-005 | 出力フォーマットがHistoricalValidationOutput型に準拠している | 全フィールドが網羅 |
| TM-011-006 | 成功事例3件以上、失敗事例3件以上の出力指示がある | 最低件数が明記 |
| TM-011-007 | 戦略理論・改善哲学が3つ以上適用される指示がある（ポーター/アンゾフ/BCG/フォード/トヨタTPS/マスクを優先検討） | 最低数が明記 |
| TM-011-008 | history_verdictに明確な根拠を求める指示がある | judgment + rationale + do/dont リスト |

## 6. コミット方針

### 6.1 コミットメッセージ形式
```
feat(pipeline): add Phase 3.5 historical validation command and template

- Create /pipeline:history command for historical validation
- Create historical verification prompt template with 6 perspectives
- Include 5 behavioral principles for history advisor role
- Integrate Brave/Tavily/Exa research tool instructions

Refs: 20260212-001-5ai-pipeline#011
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
- [ ] 全ての出力フィールドがHistoricalValidationOutput型定義と一致すること
- [ ] リサーチツールのフォールバック手順が明確に記述されていること

### 7.3 特記事項
- **このフェーズがパイプライン最大の差別化要素**。Phase 3.5は他のAIパイプラインにはない独自の付加価値を提供する。テンプレートの品質が最終出力の品質を直接決定するため、特に丁寧に作成すること
- Claude Codeがローカルで実行するため、APIキーやエンドポイントの設定は不要（リサーチツールのAPIキーのみ任意）
- 歴史的事例は「完全な一致」ではなく「パターンの類似性」に着目する点を強調すること
- テンプレート内で具体的な検索クエリの例を複数示すこと（実行者が迷わないように）
- 日本の事例だけでなく、世界中の事例を対象とすること（「古今東西」の原則）

## 8. 完了報告フォーマット

実装完了時、以下の形式で報告:

```markdown
## 実装完了報告

### 変更ファイル
| ファイル | アクション | 行数 |
|---------|----------|------|
| `.claude/commands/pipeline-history.md` | Create | XX行 |
| `templates/pipeline/phase3_5/historical.md` | Create | XX行 |

### 検証結果
- [ ] コマンドファイルに前提条件チェックが含まれている
- [ ] テンプレートに知的誠実性ルールが組み込まれている
- [ ] テンプレートに行動規範5か条が含まれている
- [ ] テンプレートに6つの検証観点が含まれている
- [ ] テンプレートに3ツール使い分け指示が含まれている
- [ ] 出力フォーマットがHistoricalValidationOutput型に準拠している

### 次のアクション
- Codexレビュー依頼
```

---
**発行日時**: 2026-02-12 16:00
**発行者**: Claude Code
