# 繝輔ぃ繧､繝ｫ謨ｴ逅・Ν繝ｼ繝ｫ

## Materials Folder・亥盾閠・ｳ・侭繝ｻ謌先棡迚ｩ・・
繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ蜿り・ｳ・侭繧БI縺檎函謌舌＠縺滓・譫懃黄繧呈紛逅・ｿ晏ｭ倥☆繧九ヵ繧ｩ繝ｫ繝縲・髢狗匱逕ｨ荳譎ゅヵ繧｡繧､繝ｫ・・.sd/cleanup/`・峨→縺ｯ譏守｢ｺ縺ｫ蛻・屬縲・
### 讒矩
```
materials/
笏懌楳笏 csv/      # CSV繝輔ぃ繧､繝ｫ
笏懌楳笏 excel/    # Excel・・xlsx, .xls・・笏懌楳笏 pdf/      # PDF繝輔ぃ繧､繝ｫ
笏懌楳笏 images/   # 逕ｻ蜒擾ｼ・png, .jpg, .jpeg, .gif, .webp, .svg・・笏披楳笏 text/     # 繝・く繧ｹ繝茨ｼ・txt, 荳闊ｬ.md・・```

## AI繝輔ぃ繧､繝ｫ菫晏ｭ倥Ν繝ｼ繝ｫ・亥ｿ・茨ｼ・
**遖∵ｭ｢**: 繝励Ο繧ｸ繧ｧ繧ｯ繝医Ν繝ｼ繝育峩荳九∈縺ｮ繝輔ぃ繧､繝ｫ菴懈・

| 繝輔ぃ繧､繝ｫ遞ｮ蛻･ | 菫晏ｭ伜・ | 萓・|
|-------------|--------|-----|
| CSV/Excel謌先棡迚ｩ | `materials/csv/`, `materials/excel/` | `materials/csv/report.csv` |
| 逕ｻ蜒上・PDF | `materials/images/`, `materials/pdf/` | `materials/pdf/spec.pdf` |
| 繝・せ繝育畑荳譎ゅヵ繧｡繧､繝ｫ | `tests/fixtures/` | `tests/fixtures/sample.json` |
| 繝ｭ繧ｰ繝ｻ繝・ヰ繝・げ蜃ｺ蜉・| `logs/` 縺ｾ縺溘・ `.sd/` | `logs/debug.log` |

**驕募渚譎・*: `/cleanup` 繧ｳ繝槭Φ繝峨〒閾ｪ蜍墓紛逅・＆繧後ｋ

---

## Cleanup Tool

繝励Ο繧ｸ繧ｧ繧ｯ繝亥・縺ｮ謨｣繧峨°縺｣縺溘ヵ繧｡繧､繝ｫ繧但I蛻､譁ｭ縺ｧ螳牙・縺ｫ謨ｴ逅・☆繧九ヤ繝ｼ繝ｫ縲・
### 繧ｳ繝槭Φ繝・| 繧ｳ繝槭Φ繝・| 隱ｬ譏・|
|----------|------|
| `/cleanup` | AI蛻､譁ｭ莉倥″繝輔ぃ繧､繝ｫ謨ｴ逅・|
| `/cleanup --dry-run` | 繝励Ξ繝薙Η繝ｼ縺ｮ縺ｿ・育ｧｻ蜍輔↑縺暦ｼ・|
| `/cleanup:restore` | 繧｢繝ｼ繧ｫ繧､繝悶°繧峨ヵ繧｡繧､繝ｫ蠕ｩ蜈・|
| `/cleanup:history` | 驕主悉縺ｮcleanup繧ｻ繝・す繝ｧ繝ｳ荳隕ｧ |

### 蛻・｡槭き繝・ざ繝ｪ

**Category A: 蜿り・ｳ・侭繝ｻ謌先棡迚ｩ** 竊・`/materials/` 縺ｸ謨ｴ逅・- csv, xlsx, pdf, png, jpg, txt 縺ｪ縺ｩ

**Category B: AI髢狗匱逕ｨ荳譎ゅヵ繧｡繧､繝ｫ** 竊・`.sd/cleanup/archive/` 縺ｸ繧｢繝ｼ繧ｫ繧､繝・- test_*, temp_*, debug_*, *_backup.* 縺ｪ縺ｩ

### 菫晁ｭｷ蟇ｾ雎｡・育ｧｻ蜍輔＠縺ｪ縺・ｼ・- AI險ｭ螳壹ヵ繧｡繧､繝ｫ・・gents.md, CLAUDE.md, gemini.md・・- sd002繧ｳ繧｢繝輔ぃ繧､繝ｫ・・ackage.json, tsconfig.json遲会ｼ・- 繧ｳ繧｢繝・ぅ繝ｬ繧ｯ繝医Μ・・src, /tests, /.kiro遲会ｼ・- git螟画峩荳ｭ縺ｮ繝輔ぃ繧､繝ｫ

### 繧｢繝ｼ繧ｫ繧､繝匁ｧ矩
```
.sd/cleanup/archive/
笏披楳笏 cleanup-YYYYMMDD-HHMMSS/
    笏懌楳笏 files/          # 遘ｻ蜍輔ヵ繧｡繧､繝ｫ・亥・繝代せ讒矩邯ｭ謖・ｼ・    笏披楳笏 manifest.json   # 螻･豁ｴ・亥ｾｩ蜈・畑・・```
