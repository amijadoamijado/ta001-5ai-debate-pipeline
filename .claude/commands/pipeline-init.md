# /pipeline:init {slug}

## 讎りｦ・
5AI隴ｰ隲悶ヱ繧､繝励Λ繧､繝ｳ縺ｮ譁ｰ隕乗｡井ｻｶ繧貞・譛溷喧縺励∪縺吶よ｡井ｻｶID縺ｮ逕滓・縲√ョ繧｣繝ｬ繧ｯ繝医Μ菴懈・縲∫憾諷狗ｮ｡逅・ヵ繧｡繧､繝ｫ縺ｮ蛻晄悄蛹悶ｒ陦後＞縺ｾ縺吶・

## 蠑墓焚
- `slug`: 譯井ｻｶ縺ｮ遏ｭ邵ｮ蜷搾ｼ井ｾ・ `new-service-launch`・峨り恭謨ｰ蟄励→繝上う繝輔Φ縺ｮ縺ｿ縲・

## 蜑肴署譚｡莉ｶ
- `.sd/ai-coordination/` 繝・ぅ繝ｬ繧ｯ繝医Μ縺悟ｭ伜惠縺吶ｋ縺薙→縲・

## 螳溯｡梧焔鬆・

1. **蠑墓焚繝√ぉ繝・け**
   - `slug` 縺梧欠螳壹＆繧後※縺・ｋ縺狗｢ｺ隱阪＠縺ｦ縺上□縺輔＞縲よ悴謖・ｮ壹・蝣ｴ蜷医・繧ｨ繝ｩ繝ｼ繧定｡ｨ遉ｺ縺励※邨ゆｺ・＠縺ｾ縺吶・

2. **譯井ｻｶID縺ｮ逕滓・**
   - 迴ｾ蝨ｨ縺ｮ譌･莉假ｼ・YYYMMDD蠖｢蠑擾ｼ峨ｒ蜿門ｾ励＠縺ｾ縺吶・
   - `.sd/ai-coordination/workflow/research/` 驟堺ｸ九・譌｢蟄倥ョ繧｣繝ｬ繧ｯ繝医Μ繧堤｢ｺ隱阪＠縲∝ｽ捺律縺ｮ譛螟ｧ騾｣逡ｪ・・NN・峨ｒ迚ｹ螳壹＠縺ｾ縺吶・
   - 譁ｰ縺励＞ID `YYYYMMDD-NNN-{slug}` 繧堤函謌舌＠縺ｾ縺呻ｼ井ｾ・ `20260212-001-test`・峨・

3. **繝・ぅ繝ｬ繧ｯ繝医Μ縺ｮ菴懈・**
   - `.sd/ai-coordination/workflow/research/{譯井ｻｶID}/` 繧剃ｽ懈・縺励∪縺吶・

4. **繝ｪ繧ｵ繝ｼ繝√ヤ繝ｼ繝ｫ縺ｮ遒ｺ隱・*
   - 迺ｰ蠅・､画焚 `BRAVE_API_KEY`, `TAVILY_API_KEY`, `EXA_API_KEY` 縺ｮ險ｭ螳夂憾豕√ｒ遒ｺ隱阪＠縲∝推繝・・繝ｫ縺ｮ蛻ｩ逕ｨ蜿ｯ蜷ｦ繧貞愛螳壹＠縺ｾ縺吶・

5. **pipeline-state.json 縺ｮ蛻晄悄蛹・*
   - 莉･荳九・讒矩縺ｧ `.sd/ai-coordination/workflow/research/{譯井ｻｶID}/pipeline-state.json` 繧剃ｽ懈・縺励∪縺吶・
   ```json
   {
     "pipeline_id": "{譯井ｻｶID}",
     "slug": "{slug}",
     "case_type": null,
     "created_at": "{迴ｾ蝨ｨ譎ょ綾(ISO8601)}",
     "updated_at": "{迴ｾ蝨ｨ譎ょ綾(ISO8601)}",
     "current_phase": "phase0",
     "status": "initialized",
     "phases": {
       "phase0": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
       "phase1": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
       "phase2": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
       "phase3": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
       "phase3_5": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null },
       "phase4": { "status": "pending", "started_at": null, "completed_at": null, "output_files": [], "error": null }
     },
     "research_tools": {
       "brave": {brave_status},
       "tavily": {tavily_status},
       "exa": {exa_status}
     }
   }
   ```

6. **繝上Φ繝峨が繝輔Ο繧ｰ縺ｮ險倬鹸**
   - `.sd/ai-coordination/handoff/handoff-log.json`・亥ｭ伜惠縺励↑縺・ｴ蜷医・譁ｰ隕丈ｽ懈・・峨↓莉･荳九・繧ｨ繝ｳ繝医Μ繧定ｿｽ蜉縺励∪縺吶・
   ```json
   {
     "timestamp": "{迴ｾ蝨ｨ譎ょ綾(ISO8601)}",
     "type": "pipeline_init",
     "project_id": "{譯井ｻｶID}",
     "from": "Claude Code",
     "to": "Pipeline System",
     "file": "workflow/research/{譯井ｻｶID}/pipeline-state.json",
     "phase": "phase0",
     "note": "繝代う繝励Λ繧､繝ｳ譯井ｻｶ蛻晄悄蛹・ {slug}"
   }
   ```

## 蜃ｺ蜉・
蛻晄悄蛹門ｮ御ｺ・ｾ後∽ｻ･荳九・諠・ｱ繧定｡ｨ遉ｺ縺励※縺上□縺輔＞縲・
- **譯井ｻｶID**: `{譯井ｻｶID}`
- **菴懈･ｭ繝・ぅ繝ｬ繧ｯ繝医Μ**: `.sd/ai-coordination/workflow/research/{譯井ｻｶID}/`
- **繝ｪ繧ｵ繝ｼ繝√ヤ繝ｼ繝ｫ迥ｶ諷・*:
  - Brave: {OK/NG}
  - Tavily: {OK/NG}
  - Exa: {OK/NG}
- **谺｡縺ｮ繧ｹ繝・ャ繝・*:
  - `/pipeline:status {譯井ｻｶID}` 縺ｧ騾ｲ謐励ｒ遒ｺ隱阪〒縺阪∪縺吶・
  - `/pipeline:run {譯井ｻｶID}` 縺ｧ繝代う繝励Λ繧､繝ｳ繧帝幕蟋九＠縺ｦ縺上□縺輔＞縲・
