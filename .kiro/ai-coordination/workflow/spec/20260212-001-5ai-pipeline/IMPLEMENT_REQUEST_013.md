# 実装指示: handoff-log.json パイプライン用拡張

## メタデータ
| 項目 | 値 |
|------|-----|
| 案件ID | 20260212-001-5ai-pipeline |
| タスク番号 | 013 |
| 発行日時 | 2026-02-12 16:00 |
| 発行者 | Claude Code |
| 宛先 | Gemini CLI |
| ステータス | Pending |

## 1. 対象ブランチ
| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/20260212-001-5ai-pipeline/013-handoff-extension` |
| ベースブランチ | `feature/20260209-001-table-ocr/001-project-foundation` |

```bash
# ブランチ作成コマンド
git checkout -b feature/20260212-001-5ai-pipeline/013-handoff-extension
```

## 2. 実装タスク概要

**タスク番号**: 013（Task 4.1）
**タスク名**: handoff-log.json パイプライン用拡張

### 2.1 目的

既存のsd003ハンドオフログ（`.kiro/ai-coordination/handoff/handoff-log.json`）を拡張し、5AIパイプライン用のハンドオフタイプ（PipelineHandoffType）をサポートする。既存のsd003エントリとの後方互換性を維持しつつ、パイプライン固有のフェーズ情報を記録できるようにする。

### 2.2 依存タスク
| 依存タスク番号 | 状態 | 備考 |
|--------------|------|------|
| Task 2.1 | 実装済み前提 | /pipeline:init コマンド（案件ディレクトリ構造） |

## 3. 実装範囲

### 3.1 変更可能ファイル
| ファイルパス | アクション | 説明 |
|------------|----------|------|
| `.kiro/ai-coordination/handoff/handoff-log.json` | Modify | パイプライン用エントリ形式の追加対応 |

### 3.2 禁止領域（変更不可）
| ファイル/ディレクトリ | 理由 |
|---------------------|------|
| `CLAUDE.md` | フレームワーク設定 |
| `.kiro/specs/` | 仕様書は変更不可 |
| `src/pipeline/types/index.ts` | 型定義は別タスクで管理 |

### 3.3 参照のみ（読み取り可、変更不可）
| ファイルパス | 参照理由 |
|------------|---------|
| `.kiro/specs/5ai-debate-pipeline/design.md` | Section 3.10 Handoff Logger、Section 4.7 PipelineHandoffEntry型 |
| `.kiro/specs/5ai-debate-pipeline/requirements.md` | REQ-008.2 ハンドオフプロトコル |
| `src/pipeline/types/index.ts` | PipelineHandoffEntry, PipelineHandoffType型定義の確認 |
| `.claude/rules/workflow/ai-coordination.md` | 既存handoff-log.jsonの記録フォーマット確認 |

## 4. 追加・変更仕様（差分）

### 4.1 既存handoff-log.jsonの構造確認

現在のhandoff-log.jsonは以下の形式のエントリを持つ:

```json
{
  "timestamp": "2026-01-02T10:00:00+09:00",
  "type": "implement_request",
  "project_id": "20260102-001-test",
  "from": "Claude Code",
  "to": "Gemini CLI",
  "file": "workflow/spec/20260102-001-test/IMPLEMENT_REQUEST_001.md",
  "note": "実装指示の発行"
}
```

### 4.2 パイプライン用エントリの追加形式

既存形式を壊さず、パイプライン用エントリに`phase`フィールドを追加する:

```json
{
  "timestamp": "2026-02-12T16:00:00+09:00",
  "type": "phase0_research_start",
  "project_id": "20260212-001-market-analysis",
  "from": "Claude Code",
  "to": "Chrome Automation",
  "file": "workflow/research/20260212-001-market-analysis/pipeline-state.json",
  "phase": "phase0",
  "note": "5AIリサーチ開始"
}
```

### 4.3 サポートするPipelineHandoffType（8種類）

design.md Section 4.7に定義された8つのタイプ:

| type | 説明 | from | to | phase |
|------|------|------|-----|-------|
| `phase0_research_start` | リサーチ開始 | Claude Code | Chrome Automation | phase0 |
| `phase0_research_complete` | リサーチ完了・統合 | Chrome Automation | Claude Code | phase0 |
| `phase1_proposal` | 提案生成 | Claude Code | Claude API | phase1 |
| `phase2_reinforcement` | 補強分析 | Claude Code | Codex API | phase2 |
| `phase3_critique` | 批判・検証 | Claude Code | Gemini API | phase3 |
| `phase3_5_historical` | 歴史的検証 | Claude Code | Claude Code（ローカル） | phase3_5 |
| `phase4_integration` | 統合 | Claude Code | Claude API | phase4 |
| `pipeline_complete` | パイプライン完了 | Claude Code | User | phase4 |

### 4.4 後方互換性の要件

- **既存エントリは変更しない**: 既にhandoff-log.jsonに存在するsd003のエントリ（`implement_request`, `work_order_review`, `review_complete`等）はそのまま保持
- **`phase`フィールドは任意**: 既存のsd003エントリには`phase`フィールドが不要。パイプライン用エントリにのみ付与
- **`type`フィールドの拡張**: 既存のtype値に加え、上記8つのパイプライン用typeを新規追加。既存typeとの衝突なし（命名規則が異なる）
- **JSONファイル構造**: 配列形式（`[]`）を維持。新規エントリは配列末尾に追加

### 4.5 実装方法

handoff-log.jsonは純粋なJSONファイルであり、各コマンドが実行時にエントリを追加する形式。このタスクでは:

1. **既存ファイルの確認**: 現在のhandoff-log.jsonの内容を確認し、既存エントリが壊れないことを確認
2. **サンプルエントリの追加**: パイプライン用のサンプルエントリ（`pipeline_init`相当）をコメント的に追加し、形式を明示

**注意**: 各フェーズコマンド（pipeline-research.md, pipeline-propose.md等）が実行時に動的にエントリを追加するため、このタスクでは「形式の定義と互換性の確認」が主目的。全8タイプのエントリを事前に追加する必要はない。

### 4.6 エントリ追加時のルール（各コマンドへの指示）

各パイプラインコマンドがhandoff-log.jsonにエントリを追加する際のルール:

```
1. handoff-log.json を読み込む
2. JSON配列の末尾に新規エントリを追加
3. エントリには以下のフィールドを必須で含める:
   - timestamp: ISO8601形式（タイムゾーン付き）
   - type: PipelineHandoffType の値
   - project_id: 案件ID
   - from: 送信元AI
   - to: 送信先AI
   - file: 関連ファイルパス（相対パス）
   - phase: PhaseName の値
   - note: 簡潔な説明
4. ファイルを上書き保存
```

## 5. 受け入れテスト

### 5.1 後方互換性テスト
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| BC-013-001 | 既存のsd003エントリが変更されていないこと | 既存エントリの内容が完全に保持 |
| BC-013-002 | 既存エントリのtype値が変更されていないこと | implement_request等が維持 |
| BC-013-003 | JSON配列構造が維持されていること | ファイル全体が有効なJSON配列 |

### 5.2 パイプライン対応テスト
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| PL-013-001 | PipelineHandoffType 8種類の形式が文書化されていること | 8タイプ全ての形式が明記 |
| PL-013-002 | パイプライン用エントリに`phase`フィールドが含まれること | phaseフィールドの定義が明記 |
| PL-013-003 | 既存typeとパイプライン用typeが衝突しないこと | 命名規則の確認 |

### 5.3 JSON検証
| 確認ID | 確認内容 | 期待結果 |
|--------|---------|---------|
| JV-013-001 | handoff-log.json が有効なJSONであること | JSONパースエラーなし |
| JV-013-002 | 配列形式が維持されていること | トップレベルが `[]` |

## 6. コミット方針

### 6.1 コミットメッセージ形式
```
feat(pipeline): extend handoff-log.json for pipeline handoff types

- Add PipelineHandoffType support (8 types)
- Maintain backward compatibility with existing sd003 entries
- Add phase field for pipeline-specific entries

Refs: 20260212-001-5ai-pipeline#013
```

### 6.2 コミット粒度
- handoff-log.jsonの変更は1コミットに含める

## 7. 注意事項

### 7.1 プロジェクト特性
- [ ] これはプロンプト駆動のオーケストレーションシステムであり、従来のソフトウェアアプリケーションではない
- [ ] handoff-log.jsonは既存のsd003ワークフローでも使用されているため、既存機能を壊さないことが最重要

### 7.2 品質基準
- [ ] JSONファイルが有効な形式であること
- [ ] 既存エントリが一切変更されていないこと
- [ ] パイプライン用エントリ形式がPipelineHandoffEntry型に準拠していること

### 7.3 特記事項
- このタスクは「形式の定義と互換性の確認」が主目的。実際のパイプラインエントリは各フェーズコマンドが動的に追加する
- handoff-log.jsonは既に他の案件のエントリを含んでいる可能性がある。既存データを絶対に破壊しないこと
- タスクの工数は小（S）。過剰な実装は不要
- `phase`フィールドは既存sd003エントリには追加しない（後方互換性のため）

## 8. 完了報告フォーマット

実装完了時、以下の形式で報告:

```markdown
## 実装完了報告

### 変更ファイル
| ファイル | アクション | 行数 |
|---------|----------|------|
| `.kiro/ai-coordination/handoff/handoff-log.json` | Modify | XX行（追加分） |

### 検証結果
- [ ] 既存エントリが変更されていないこと
- [ ] JSON形式が有効であること
- [ ] PipelineHandoffType 8種類の形式が定義されていること
- [ ] パイプライン用エントリにphaseフィールドが含まれること

### 次のアクション
- Codexレビュー依頼
```

---
**発行日時**: 2026-02-12 16:00
**発行者**: Claude Code
