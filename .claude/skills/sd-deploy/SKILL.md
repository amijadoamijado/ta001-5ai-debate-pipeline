---
name: sd-deploy
description: |
  SD003繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ繧呈眠隕上・繝ｭ繧ｸ繧ｧ繧ｯ繝医↓螻暮幕縲・
  Use when: 繝ｦ繝ｼ繧ｶ繝ｼ縺後郡D003蟆主・縲阪後ヵ繝ｬ繝ｼ繝繝ｯ繝ｼ繧ｯ螻暮幕縲阪慧eploy縲阪→險蜿翫＠縺溷ｴ蜷医・
allowed-tools: Read, Write, Bash, Glob
---

# SD003繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ螻暮幕繧ｹ繧ｭ繝ｫ v3.0.0

## 讎りｦ・

SD003繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ・・2.11.0・峨ｒ譁ｰ隕上・繝ｭ繧ｸ繧ｧ繧ｯ繝医↓螻暮幕縺吶ｋ縲・
**繝・ぅ繝ｬ繧ｯ繝医Μ蜊倅ｽ阪・蜍慕噪繧ｳ繝斐・**縺ｫ繧医ｊ縲√ヵ繧｡繧､繝ｫ霑ｽ蜉譎ゅ↓繧ｹ繧ｯ繝ｪ繝励ヨ菫ｮ豁｣縺ｯ荳崎ｦ√・

## 菴ｿ逕ｨ譁ｹ豕・

```
/sd:deploy <target-project-path>
```

## 螳溯｡梧焔鬆・

### Windows・域耳螂ｨ・・
```powershell
powershell -ExecutionPolicy Bypass -File .claude/skills/sd-deploy/deploy.ps1 <target-project-path>
```

### Linux/Mac
```bash
bash .claude/skills/sd-deploy/deploy.sh <target-project-path>
```

## 繧ｹ繧ｯ繝ｪ繝励ヨ縺ｮ7繝輔ぉ繝ｼ繧ｺ

| Phase | 蜀・ｮｹ |
|-------|------|
| 1 | 繧ｿ繝ｼ繧ｲ繝・ヨ蟄伜惠遒ｺ隱・|
| 2 | 譌｢蟄倩ｨｭ螳壹・繝舌ャ繧ｯ繧｢繝・・ |
| 3 | 繝・ぅ繝ｬ繧ｯ繝医Μ讒矩菴懈・ |
| 4 | **蜍慕噪繧ｳ繝斐・**・医ョ繧｣繝ｬ繧ｯ繝医Μ蜊倅ｽ阪√ワ繝ｼ繝峨さ繝ｼ繝峨↑縺暦ｼ・|
| 5 | 逕滓・繝輔ぃ繧､繝ｫ菴懈・・・LAUDE.md, gemini.md, session遲会ｼ・|
| 6 | 讀懆ｨｼ・医た繝ｼ繧ｹvs繧ｿ繝ｼ繧ｲ繝・ヨ縺ｮ繝輔ぃ繧､繝ｫ謨ｰ豈碑ｼ・ｼ・|
| 7 | 繝ｬ繝昴・繝亥・蜉・|

## 蜍慕噪繧ｳ繝斐・蟇ｾ雎｡

| # | 繧ｽ繝ｼ繧ｹ | 繧ｳ繝斐・譁ｹ蠑・|
|---|--------|-----------|
| 1 | `.claude/commands/*.md` | 繝輔Λ繝・ヨ繧ｳ繝斐・ |
| 2 | `.claude/commands/kiro/*.md` | 繝輔Λ繝・ヨ繧ｳ繝斐・ |
| 3 | `.claude/rules/` | 繝・Μ繝ｼ繧ｳ繝斐・ |
| 4 | `.claude/skills/` | 繝・Μ繝ｼ繧ｳ繝斐・ |
| 5 | `.claude/hooks/` | 繝・Μ繝ｼ繧ｳ繝斐・ |
| 6 | `.gemini/commands/*.toml` | 繝輔Λ繝・ヨ繧ｳ繝斐・ |
| 7 | `.antigravity/` | 繝・Μ繝ｼ繧ｳ繝斐・ |
| 8 | `.sd/settings/` | 繝・Μ繝ｼ繧ｳ繝斐・ |
| 9 | `.sd/sessions/session-template.md` | 蜊倅ｽ薙さ繝斐・ |
| 10 | `.sd/ai-coordination/workflow/{README,CODEX_GUIDE,templates/}` | 驕ｸ謚槭さ繝斐・ |
| 11 | `docs/troubleshooting/` | 繝・Μ繝ｼ繧ｳ繝斐・ |
| 12 | `docs/quality-gates.md` | 蜊倅ｽ薙さ繝斐・ |
| 13 | `.handoff/` | 繝・Μ繝ｼ繧ｳ繝斐・ |
| 14 | `scripts/sync-codex-prompts.js` | 蜊倅ｽ薙さ繝斐・ |
| 15 | `scripts/sync-gemini-features.js` | 蜊倅ｽ薙さ繝斐・ |
| 16 | `AGENTS.md` | 蜊倅ｽ薙さ繝斐・ |
| 17 | `.sd/ralph/` | 繝・Μ繝ｼ繧ｳ繝斐・ |
| 18 | `.sd/steering/` | 繝・Μ繝ｼ繧ｳ繝斐・ |
| 19 | `.sd/refactor/config.json` | 蜊倅ｽ薙さ繝斐・ |

## 逕滓・繝輔ぃ繧､繝ｫ

| 繝輔ぃ繧､繝ｫ | 逕滓・譁ｹ豕・|
|---------|---------|
| `CLAUDE.md` | 繝・Φ繝励Ξ繝ｼ繝医°繧臥函謌・|
| `gemini.md` | 繝・Φ繝励Ξ繝ｼ繝医°繧臥函謌・|
| `.sd/sessions/session-current.md` | 譁ｰ隕冗函謌・|
| `.sd/sessions/TIMELINE.md` | 譁ｰ隕冗函謌・|
| `.claude/settings.json` | OS讀懷・縺励※逕滓・ |
| `.sd/ids/registry.json` | 譁ｰ隕冗函謌・|
| `.sd/ai-coordination/handoff/handoff-log.json` | 譁ｰ隕冗函謌・|

## 蠢・郁ｨｭ螳・

### Tool Search・・CP譛驕ｩ蛹厄ｼ・

繝・・繝ｭ繧､蜈医〒莉･荳九・險ｭ螳壹ｒ霑ｽ蜉縺吶ｋ・医せ繧ｯ繝ｪ繝励ヨ縺瑚・蜍慕函謌撰ｼ会ｼ・

**`.claude/settings.local.json`**
```json
{
  "env": {
    "ENABLE_TOOL_SEARCH": "true"
  }
}
```

## 繝・・繝ｭ繧､蠕後・讀懆ｨｼ

繧ｹ繧ｯ繝ｪ繝励ヨ縺訓hase 6縺ｧ閾ｪ蜍墓､懆ｨｼ繧貞ｮ溯｡後☆繧九よ焔蜍慕｢ｺ隱阪☆繧句ｴ蜷茨ｼ・

### Windows
```powershell
# 繝輔ぃ繧､繝ｫ謨ｰ遒ｺ隱・
(Get-ChildItem .claude/commands/*.md).Count        # Commands逶ｴ荳・
(Get-ChildItem .claude/commands/kiro/*.md).Count    # Commands/kiro
(Get-ChildItem .claude/rules -Recurse -Filter *.md).Count  # Rules
(Get-ChildItem .claude/skills -Recurse -File).Count # Skills
(Get-ChildItem .claude/hooks -Recurse -File).Count  # Hooks
```

### Linux/Mac
```bash
ls -1 .claude/commands/*.md | wc -l           # Commands逶ｴ荳・
ls -1 .claude/commands/kiro/*.md | wc -l      # Commands/kiro
find .claude/rules -name '*.md' | wc -l       # Rules
find .claude/skills -type f | wc -l           # Skills
find .claude/hooks -type f | wc -l            # Hooks
```

## 譁ｰ隕上ヵ繧｡繧､繝ｫ霑ｽ蜉譎・

**v3.0.0縺ｮ譛螟ｧ縺ｮ謾ｹ蝟・せ**: 繝輔ぃ繧､繝ｫ繧定ｿｽ蜉縺励※繧・deploy 繧ｹ繧ｯ繝ｪ繝励ヨ縺ｮ菫ｮ豁｣縺ｯ荳崎ｦ√・

| 霑ｽ蜉蜈・| 蠢・ｦ√↑謫堺ｽ・|
|--------|-----------|
| `.claude/commands/` | 繝輔ぃ繧､繝ｫ繧堤ｽｮ縺上□縺・|
| `.claude/commands/kiro/` | 繝輔ぃ繧､繝ｫ繧堤ｽｮ縺上□縺・|
| `.claude/rules/` | 繝輔ぃ繧､繝ｫ繧堤ｽｮ縺上□縺・|
| `.claude/skills/` | 繝・ぅ繝ｬ繧ｯ繝医Μ+繝輔ぃ繧､繝ｫ繧剃ｽ懈・縺吶ｋ縺縺・|
| `.claude/hooks/` | 繝輔ぃ繧､繝ｫ繧堤ｽｮ縺上□縺・|
| `.gemini/commands/` | 繝輔ぃ繧､繝ｫ繧堤ｽｮ縺上□縺・|

## 隧ｳ邏ｰ謇矩・

README.md 繧貞盾辣ｧ縲・
