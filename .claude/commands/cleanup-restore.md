---
description: Restore files from cleanup archive
allowed-tools: Read, Write, Bash, Glob, AskUserQuestion
---

# /cleanup:restore

繧｢繝ｼ繧ｫ繧､繝悶＆繧後◆繝輔ぃ繧､繝ｫ繧貞・縺ｮ蝣ｴ謇縺ｫ蠕ｩ蜈・☆繧九・
## Usage

```
/cleanup:restore                    # 繧ｻ繝・す繝ｧ繝ｳ驕ｸ謚朸I
/cleanup:restore {session-id}       # 迚ｹ螳壹そ繝・す繝ｧ繝ｳ繧貞ｾｩ蜈・/cleanup:restore --all              # 蜈ｨ繝輔ぃ繧､繝ｫ蠕ｩ蜈・/cleanup:restore --select           # 繝輔ぃ繧､繝ｫ蛟句挨驕ｸ謚・```

## Execution Flow

### Step 1: 繧ｻ繝・す繝ｧ繝ｳ荳隕ｧ蜿門ｾ・
```bash
# 繧｢繝ｼ繧ｫ繧､繝悶そ繝・す繝ｧ繝ｳ荳隕ｧ
ls -la .sd/cleanup/archive/
```

繧ｻ繝・す繝ｧ繝ｳ縺梧欠螳壹＆繧後※縺・↑縺・ｴ蜷医、skUserQuestion縺ｧ驕ｸ謚・

```yaml
Question: "蠕ｩ蜈・☆繧九そ繝・す繝ｧ繝ｳ繧帝∈謚槭＠縺ｦ縺上□縺輔＞"
Header: "繧ｻ繝・す繝ｧ繝ｳ"
Options:
  - label: "cleanup-20260102-150000 (8繝輔ぃ繧､繝ｫ, 45.2KB)"
    description: "2026-01-02 15:00縺ｫ螳溯｡・
  - label: "cleanup-20260101-093000 (3繝輔ぃ繧､繝ｫ, 12.1KB)"
    description: "2026-01-01 09:30縺ｫ螳溯｡・
```

### Step 2: manifest.json隱ｭ縺ｿ霎ｼ縺ｿ

```bash
cat .sd/cleanup/archive/{session-id}/manifest.json
```

蠕ｩ蜈・ｯｾ雎｡繝輔ぃ繧､繝ｫ荳隕ｧ繧定｡ｨ遉ｺ:

```markdown
## 蠕ｩ蜈・ｯｾ雎｡繝輔ぃ繧､繝ｫ

| 蜈・ヱ繧ｹ | 繧ｵ繧､繧ｺ | 繧｢繝ｼ繧ｫ繧､繝也炊逕ｱ |
|--------|--------|----------------|
| test_parser.js | 1.2KB | 繝・せ繝育畑荳譎ゅヵ繧｡繧､繝ｫ |
| debug_log.txt | 0.5KB | 繝・ヰ繝・げ繝ｭ繧ｰ |
```

### Step 3: 蠕ｩ蜈・｢ｺ隱・
AskUserQuestion縺ｧ遒ｺ隱・

```yaml
Question: "蠕ｩ蜈・ｒ螳溯｡後＠縺ｾ縺吶°・・
Header: "蠕ｩ蜈・｢ｺ隱・
Options:
  - label: "蜈ｨ繝輔ぃ繧､繝ｫ繧貞ｾｩ蜈・
    description: "8繝輔ぃ繧､繝ｫ繧貞・縺ｮ蝣ｴ謇縺ｫ蠕ｩ蜈・
  - label: "繝輔ぃ繧､繝ｫ繧帝∈謚槭＠縺ｦ蠕ｩ蜈・
    description: "蠕ｩ蜈・☆繧九ヵ繧｡繧､繝ｫ繧貞句挨驕ｸ謚・
  - label: "繧ｭ繝｣繝ｳ繧ｻ繝ｫ"
    description: "菴輔ｂ縺励↑縺・
```

### Step 4: 蠕ｩ蜈・ｮ溯｡・
```bash
# 蜷・ヵ繧｡繧､繝ｫ繧貞・縺ｮ蝣ｴ謇縺ｫ蠕ｩ蜈・mv .sd/cleanup/archive/{session-id}/files/test_parser.js ./test_parser.js
```

### Step 5: 繧｢繝ｼ繧ｫ繧､繝悶ヵ繧ｩ繝ｫ繝蜑企勁謠先｡・
AskUserQuestion縺ｧ遒ｺ隱・

```yaml
Question: "蠕ｩ蜈・ｮ御ｺ・ゅい繝ｼ繧ｫ繧､繝悶ヵ繧ｩ繝ｫ繝繧貞炎髯､縺励∪縺吶°・・
Header: "蜑企勁遒ｺ隱・
Options:
  - label: "蜑企勁縺吶ｋ"
    description: ".sd/cleanup/archive/{session-id}/ 繧貞炎髯､"
  - label: "谿九☆"
    description: "繧｢繝ｼ繧ｫ繧､繝悶ヵ繧ｩ繝ｫ繝繧剃ｿ晄戟"
```

### Step 6: 螳御ｺ・ｱ蜻・
```markdown
## 蠕ｩ蜈・ｮ御ｺ・
- Session: cleanup-20260102-150000
- Restored: 8繝輔ぃ繧､繝ｫ
- Archive: 蜑企勁貂医∩ / 菫晄戟
```

## Error Handling

| Error | Action |
|-------|--------|
| Session not found | 蛻ｩ逕ｨ蜿ｯ閭ｽ縺ｪ繧ｻ繝・す繝ｧ繝ｳ荳隕ｧ繧定｡ｨ遉ｺ |
| File conflict | 荳頑嶌縺咲｢ｺ隱阪ｒ豎ゅａ繧・|
| Permission error | 繧ｨ繝ｩ繝ｼ隧ｳ邏ｰ繧定｡ｨ遉ｺ |

## Output Markers

| Marker | Meaning |
|--------|---------|
| `RESTORE_COMPLETE` | 蠕ｩ蜈・ｮ御ｺ・|
| `RESTORE_CANCELLED` | 繧ｭ繝｣繝ｳ繧ｻ繝ｫ |
| `RESTORE_ERROR` | 繧ｨ繝ｩ繝ｼ逋ｺ逕・|

## Arguments
$ARGUMENTS
