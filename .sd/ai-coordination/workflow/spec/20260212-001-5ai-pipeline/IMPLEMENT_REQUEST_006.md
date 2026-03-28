# 実装指示: Phase 0 リサーチコマンド + テンプレート作成

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 006 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/006-phase0-research` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

## 2. 実装タスク概要

Task 3.1に対応。パイプラインの中核であるPhase 0（5AI Deep Research）のコマンドファイルと、6つのAI別リサーチテンプレートを作成する。

本タスクはXLサイズの最大タスクであり、以下を含む:
- `/pipeline:research` コマンドファイル（Chrome MCP自動化フロー全体の定義）
- 6つのAI別リサーチプロンプトテンプレート
- Research Collector統合ロジック
- エラーハンドリング定義

**重要**: これはプロンプト駆動のオーケストレーションシステムである。ランタイムコードではなく、Markdownコマンドとプロンプトテンプレートを作成する。

## 3. 実装範囲

### 3.1 作成ファイル一覧（7件）

| # | ファイルパス | 説明 |
|---|------------|------|
| 1 | `.claude/commands/pipeline-research.md` | Phase 0実行コマンド |
| 2 | `templates/pipeline/phase0/claude-research.md` | Claude Deep Research指示テンプレート |
| 3 | `templates/pipeline/phase0/chatgpt-research.md` | ChatGPT Deep Research指示テンプレート |
| 4 | `templates/pipeline/phase0/gemini-research.md` | Gemini Deep Research指示テンプレート |
| 5 | `templates/pipeline/phase0/grok-research.md` | Grok調査指示テンプレート |
| 6 | `templates/pipeline/phase0/perplexity-research.md` | Perplexityファクトチェック指示テンプレート |
| 7 | `templates/pipeline/phase0/codex-research.md` | Codex技術調査指示テンプレート |

### 3.2 依存タスク（実装済み前提）
- Task 1.1: TypeScript型定義（`src/pipeline/types/index.ts`）
- Task 1.2: 知的誠実性ルール（`templates/pipeline/intellectual-honesty.md`）
- Task 2.1: `/pipeline:init`コマンド（`.claude/commands/pipeline-init.md`）

## 4. 追加・変更仕様（差分）

### 4.1 コマンドファイル: `pipeline-research.md`

design.md Section 5.2の共通パターンに準拠しつつ、Phase 0固有のChrome MCP自動化フローを含める。

#### 4.1.1 前提条件チェック
```
1. pipeline-state.json の存在確認
2. 案件IDの妥当性検証
3. caseType引数（A|B|C|D）の検証
4. Chrome MCP拡張の利用可能性確認
```

#### 4.1.2 Chrome MCP操作フロー（design.md Section 3.2準拠）

各AIに対して以下の共通フローを実行:

```
1. Chrome MCPでタブを開く / 既存タブに切り替え
2. ページのスナップショットを取得
3. プロンプト入力欄を特定
4. テンプレートから生成した指示を入力
5. Deep Research / 調査を起動
6. 完了を待機（ポーリング or 手動確認）
7. 結果テキストをコピー
8. ローカルファイルに保存（共通JSON形式に変換）
```

AI別実行順序とURL:

| 順序 | AI | URL | 操作上の注意 |
|------|-----|-----|-------------|
| 1 | ChatGPT | chat.openai.com | Deep Researchボタンの位置がUI更新で変わる可能性 |
| 2 | Gemini | gemini.google.com | Deep Researchモードの明示的な選択が必要 |
| 3 | Perplexity | perplexity.ai | Pro Searchモードを選択 |
| 4 | Grok | x.com/i/grok | Xアカウントログイン状態が前提 |
| 5 | Claude | claude.ai | Deep Researchモードの選択 |
| 6 | Codex | CLI実行 | Chrome MCP不要、Codex CLIで直接実行 |

#### 4.1.3 Research Collector統合ロジック（design.md Section 3.3準拠）

6件の個別リサーチJSON取得後、以下の統合処理を実行:

```
1. 6件の個別リサーチJSONを読み込み
2. Perplexityのclaim_verificationsで他AIデータの信頼度を調整（REQ-005.1）
   - verified: true → confidence +0.1〜+0.2
   - verified: false → confidence -0.2〜-0.3
   - verified: partial → 注意フラグ付き（confidence変更なし）
3. contradiction_flagsを抽出し矛盾リストを構築（REQ-005.2）
4. Codexの技術実現性をリスクフラグとして反映（REQ-005.3）
5. Grokの感情データを参考情報として付与（REQ-005.5）
   - 風評リスク「高」の場合のみ意思決定要因に格上げ
6. 全AI欠落視点をblind_spotsとして記録（REQ-005.6）
7. phase0_research_integrated.json を生成
```

#### 4.1.4 エラーハンドリング（design.md Section 8.1-8.2準拠）

| エラー種別 | 対応 |
|-----------|------|
| タイムアウト | 10分待機後、ユーザーに手動介入を要求 |
| ページロード失敗 | 1回リトライ後スキップ、ログに記録 |
| ログイン切れ | ユーザーにログイン再要求し一時停止 |
| 出力フォーマット不正 | パース試行 → 失敗時はraw保存 + 警告 |

#### 4.1.5 部分完了ハンドリング（design.md Section 8.2準拠）

一部AIがスキップされた場合:
```
1. 取得済みの結果のみで統合レポートを生成
2. research_quality.coverage_score を下方修正
3. blind_spots にスキップされたAIの担当領域を追加
4. pipeline-state.json にスキップ情報を記録
5. Phase 1以降は正常に続行
```

#### 4.1.6 完了処理
```
1. pipeline-state.json の phase0 ステータスを completed に更新
2. output_files に生成ファイルパスを記録
3. handoff-log.json に phase0_research_complete を記録
4. 次フェーズ（Phase 1）の案内を表示
```

### 4.2 AI別リサーチテンプレート

各テンプレートは以下の共通構造を持つ:

```markdown
# {AI名} リサーチ指示

## あなたの役割
{役割名と担当領域の説明}

## 調査テーマ
{案件テーマ}: $ARGUMENTS

## 案件タイプ別指示
{case-typesテンプレートからのインクルード指示}

## 出力フォーマット
{ResearchOutput型に準拠したJSON構造の指示}

## 注意事項
{AI固有の注意事項}
```

#### 4.2.1 Claude（`claude-research.md`）
- 役割: マーケットストラテジスト
- 担当: 業界構造分析・ポジショニング・成功/失敗パターン
- 特性: 構造化・体系化型

#### 4.2.2 ChatGPT（`chatgpt-research.md`）
- 役割: マーケットアナリスト
- 担当: 市場規模・価格帯ベンチマーク・技術動向
- 特性: データ駆動・定量分析型

#### 4.2.3 Gemini（`gemini-research.md`）
- 役割: マーケットスカウト
- 担当: 規制環境・Google Trends需要予測・海外事例
- 特性: 広範探索・トレンド発見型

#### 4.2.4 Grok（`grok-research.md`）
- 役割: ソーシャルリスニングアナリスト
- 担当: X世論・インフルエンサー・風評リスク予兆
- 特性: リアルタイムソーシャル型

#### 4.2.5 Perplexity（`perplexity-research.md`）
- 役割: リサーチバリデーター
- 担当: ソース検証・ファクトチェック・矛盾検出
- 特性: ソース検証・引用付き型
- **固有フィールド（REQ-003.1）**:
  - `claim_verifications[]`: 他AIの主要claim（5件以上）に対するソース付き独立検証
  - `source_registry[]`: 使用ソースの信頼性レジストリ（url, title, date, reliability_score, used_by_claims）
  - `contradiction_flags[]`: 矛盾する情報の検出（claim_a, source_a, claim_b, source_b, resolution, severity）
  - `data_freshness`: データ鮮度情報（oldest_source_date, newest_source_date, staleness_risk）

#### 4.2.6 Codex（`codex-research.md`）
- 役割: テクニカルリサーチャー
- 担当: 技術的実現可能性・API比較・コスト概算
- 特性: CLI Web検索・技術調査型
- Chrome MCP不使用（Codex CLIで直接実行）

### 4.3 出力ファイル

全ファイルの保存先: `.kiro/ai-coordination/workflow/research/{案件ID}/`

| ファイル名 | 生成元 |
|-----------|-------|
| `phase0_claude_research.json` | Claude Deep Research |
| `phase0_chatgpt_research.json` | ChatGPT Deep Research |
| `phase0_gemini_research.json` | Gemini Deep Research |
| `phase0_grok_research.json` | Grok |
| `phase0_perplexity_research.json` | Perplexity Deep Research |
| `phase0_codex_research.json` | Codex CLI |
| `phase0_research_integrated.json` | 統合処理 |

## 5. 受け入れテスト

- [ ] 6件のAI別リサーチテンプレートが作成されていること（REQ-001.1）
- [ ] Chrome MCP操作フロー（タブ操作→入力→起動→待機→取得→保存）がコマンドに定義されていること（REQ-002.1）
- [ ] 各AIの出力が共通リサーチフォーマット（ResearchOutput）に準拠する指示が含まれること（REQ-002.3）
- [ ] Perplexityテンプレートにclaim_verifications, source_registry, contradiction_flags, data_freshnessの指示が含まれること（REQ-003.1）
- [ ] 6件の個別リサーチJSONが所定ディレクトリに保存される指示があること（REQ-002.2）
- [ ] 統合処理（Perplexity信頼度調整、矛盾検出、技術実現性反映、感情データ付与、死角チェック）が定義されていること（REQ-005.1〜005.6）
- [ ] phase0_research_integrated.json が生成される指示があること
- [ ] エラーハンドリング（タイムアウト、ページロード失敗、ログイン切れ）が定義されていること
- [ ] pipeline-state.json とhandoff-log.json が更新される指示があること
- [ ] 案件タイプ別テンプレート（case-types/）の参照指示が含まれること

## 6. コミット方針

| # | コミット内容 | コミットメッセージ |
|---|------------|-----------------|
| 1 | コマンドファイル作成 | `feat(pipeline): add Phase 0 research command with Chrome MCP flow` |
| 2 | 6つのAI別テンプレート作成 | `feat(pipeline): add 6 AI research prompt templates for Phase 0` |

または、まとめて1コミットでも可:
```
feat(pipeline): add Phase 0 research command and 6 AI templates

- Chrome MCP automation flow for 5 AIs + Codex CLI
- Research Collector integration logic
- Perplexity-specific fields (claim_verifications, etc.)
- Error handling and partial completion handling
```

## 7. 注意事項

1. **プロンプト駆動システム**: ランタイムコードではなくMarkdownファイルを作成する。TypeScriptはTask 1.1の型定義のみ
2. **Chrome MCP操作**: 実際のUI操作はClaude in Chrome MCPが行う。テンプレートはその操作手順と入力プロンプトを定義する
3. **テンプレート変数**: `$ARGUMENTS`（案件テーマ）、`{案件ID}`などのプレースホルダーを使用する
4. **ResearchOutput型準拠**: 各AIテンプレートの出力指示はdesign.md Section 4.1の型定義に厳密に準拠すること
5. **Perplexity固有フィールド**: design.md Section 4.2のPerplexityResearchOutput型に準拠した追加フィールドを必ず含める
6. **Codexは別フロー**: 他5AIはChrome MCP経由だが、CodexはCLI直接実行。この違いをコマンドに明記する
7. **既存ファイルとの整合**: `templates/pipeline/intellectual-honesty.md`（Task 1.2）からの参照指示を含める

## 8. 完了報告フォーマット

```markdown
## 完了報告: Task 3.1 Phase 0 リサーチコマンド + テンプレート作成

### 実施内容
- [ ] `.claude/commands/pipeline-research.md` を作成
- [ ] `templates/pipeline/phase0/claude-research.md` を作成
- [ ] `templates/pipeline/phase0/chatgpt-research.md` を作成
- [ ] `templates/pipeline/phase0/gemini-research.md` を作成
- [ ] `templates/pipeline/phase0/grok-research.md` を作成
- [ ] `templates/pipeline/phase0/perplexity-research.md` を作成
- [ ] `templates/pipeline/phase0/codex-research.md` を作成

### コミット情報
- ハッシュ: {commit_hash}
- メッセージ: {commit_message}

### 受け入れテスト結果
{各テスト項目の合否}

### 特記事項
{実装時の判断や注意点}
```
