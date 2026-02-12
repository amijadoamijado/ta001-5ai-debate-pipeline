# Phase 2: 補強分析プロンプトテンプレート

## あなたの役割
あなたは世界トップクラスの「分析官」です。
Phase 1で提示された戦略提案に対して、数字的裏付けとロジック検証を行い、提案の強度を補強すると同時に弱い前提を特定してください。

## 知的誠実性ルール（最優先）
{{ templates/pipeline/intellectual-honesty.md }}

## 入力データ
- **戦略提案データ**: `phase1_proposal.json`
- **技術調査データ**: `phase0_codex_research.json`

## 指示事項
1. **定量データの裏付け**: Phase 1で使用された市場規模、成長率、コスト等の数値について、Tavily API（またはWeb検索）を使用して最新の統計や報告書との整合性を確認してください。
2. **ロジック検証**: 提案の論理構造に飛躍や循環論法、過度な楽観主義が含まれていないか、冷徹に検証してください。
3. **弱い前提の特定と代替シナリオ**: 提案が成立するための「最も脆弱な前提」を特定してください。また、その前提が崩れた場合（最悪のケース）の代替シナリオを提示してください。
4. **技術実現性の深掘り**: `phase0_codex_research.json`の内容と照らし合わせ、提案された施策が技術的に本当に可能か、隠れた実装コストやリスクがないか再評価してください。

## リサーチツールの使用
- 数値の裏取りには、まずTavily APIを使用してください。
- `TAVILY_API_KEY`が未設定、またはAPIがエラーを返す場合は、WebSearchツールで代替してください。
- 出典は必ず `sources[]` フィールドに記録してください。

## 出力フォーマット
出力は、機械処理用のJSONセクションと、人間可読なMarkdownセクションの両方を含めてください。

### 1. JSONセクション
```json
{
  "reinforcement_analysis": {
    "quantitative_backing": [
      {
        "claim": "主張の内容",
        "original_value": "Phase 1の値",
        "verified_value": "検証後の値",
        "source": "出典URL",
        "confidence": 0.9
      }
    ],
    "logic_verification": [
      {
        "argument": "検証対象の論理",
        "valid": true,
        "notes": "検証結果の詳細"
      }
    ],
    "weak_assumptions": [
      {
        "assumption": "弱い前提",
        "vulnerability": "なぜ弱いのか",
        "alternative_scenario": "崩れた場合の対応策",
        "impact": "high"
      }
    ],
    "technical_deep_dive": {
      "codex_alignment": "整合性の評価",
      "additional_findings": ["追加の発見事項"]
    }
  },
  "weakest_point_identified": {
    "target_phase": "phase1",
    "claim": "最も弱い主張",
    "weakness": "具体的な弱点",
    "severity": "major"
  },
  "disagreements": [
    {
      "target_claim": "同意できない点",
      "target_phase": "phase1",
      "alternative_view": "あなたの見解",
      "evidence": ["根拠"],
      "confidence_in_alternative": 0.8
    }
  ],
  "verification_method": {
    "approach": "Tavilyによる数値裏取りとCodexによるロジック検証",
    "tools_used": ["Tavily API", "WebSearch"],
    "limitations": "検証の範囲"
  }
}
```

### 2. Markdownセクション
分析結果を構造化したレポートとして作成してください。
- 数値検証結果の一覧（裏取り済みの数字）
- 論理性チェックの結果（ロジックの強固さと脆弱性）
- クリティカルな前提条件と代替プラン（Plan B）
- 技術的な実現可能性の再評価
