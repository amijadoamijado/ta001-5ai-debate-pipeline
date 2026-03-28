---
description: Show cleanup session history
allowed-tools: Read, Bash, Glob
---

# /cleanup:history

驕主悉縺ｮcleanup繧ｻ繝・す繝ｧ繝ｳ螻･豁ｴ繧定｡ｨ遉ｺ縺吶ｋ縲・
## Usage

```
/cleanup:history              # 蜈ｨ螻･豁ｴ繧定｡ｨ遉ｺ
/cleanup:history --limit 5    # 譛譁ｰ5莉ｶ縺ｮ縺ｿ
/cleanup:history {session-id} # 迚ｹ螳壹そ繝・す繝ｧ繝ｳ縺ｮ隧ｳ邏ｰ
```

## Execution Flow

### Step 1: 繧｢繝ｼ繧ｫ繧､繝悶ョ繧｣繝ｬ繧ｯ繝医Μ繧ｹ繧ｭ繝｣繝ｳ

```bash
# 繧｢繝ｼ繧ｫ繧､繝悶そ繝・す繝ｧ繝ｳ荳隕ｧ
ls -lt .sd/cleanup/archive/ | head -20
```

### Step 2: 蜷・そ繝・す繝ｧ繝ｳ縺ｮmanifest.json隱ｭ縺ｿ霎ｼ縺ｿ

蜷・そ繝・す繝ｧ繝ｳ縺ｮ繧ｵ繝槭Μ繝ｼ繧貞庶髮・
- 繧ｻ繝・す繝ｧ繝ｳID
- 螳溯｡梧律譎・- 繝輔ぃ繧､繝ｫ謨ｰ
- 蜷郁ｨ医し繧､繧ｺ

### Step 3: 螻･豁ｴ荳隕ｧ陦ｨ遉ｺ

```markdown
## Cleanup螻･豁ｴ

| Session ID | 譌･譎・| 繝輔ぃ繧､繝ｫ謨ｰ | 繧ｵ繧､繧ｺ |
|------------|------|-----------|--------|
| cleanup-20260102-150000 | 2026-01-02 15:00 | 8 | 45.2KB |
| cleanup-20260101-093000 | 2026-01-01 09:30 | 3 | 12.1KB |
| cleanup-20251231-180000 | 2025-12-31 18:00 | 15 | 128.5KB |

蜷郁ｨ・ 3繧ｻ繝・す繝ｧ繝ｳ, 26繝輔ぃ繧､繝ｫ, 185.8KB

### 蠕ｩ蜈・さ繝槭Φ繝・/cleanup:restore {session-id}
```

### 隧ｳ邏ｰ陦ｨ遉ｺ・医そ繝・す繝ｧ繝ｳID謖・ｮ壽凾・・
```markdown
## Session: cleanup-20260102-150000

- **螳溯｡梧律譎・*: 2026-01-02 15:00:00
- **繝輔ぃ繧､繝ｫ謨ｰ**: 8
- **蜷郁ｨ医し繧､繧ｺ**: 45.2KB

### 繧｢繝ｼ繧ｫ繧､繝悶ヵ繧｡繧､繝ｫ荳隕ｧ

| 繝輔ぃ繧､繝ｫ | 蜈・ヱ繧ｹ | 繧ｵ繧､繧ｺ | 逅・罰 |
|----------|--------|--------|------|
| test_parser.js | ./test_parser.js | 1.2KB | 繝・せ繝育畑荳譎ゅヵ繧｡繧､繝ｫ |
| debug_log.txt | ./logs/debug_log.txt | 0.5KB | 繝・ヰ繝・げ繝ｭ繧ｰ |

### 蠕ｩ蜈・さ繝槭Φ繝・/cleanup:restore cleanup-20260102-150000
```

## Output Format

螻･豁ｴ縺後↑縺・ｴ蜷・
```markdown
## Cleanup螻･豁ｴ

繧｢繝ｼ繧ｫ繧､繝悶そ繝・す繝ｧ繝ｳ縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲・
/cleanup 繧貞ｮ溯｡後☆繧九→繝輔ぃ繧､繝ｫ縺後い繝ｼ繧ｫ繧､繝悶＆繧後∪縺吶・```

## Arguments
$ARGUMENTS
