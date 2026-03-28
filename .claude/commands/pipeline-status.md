# /pipeline:status {project_id}

## 讎りｦ・
5AI隴ｰ隲悶ヱ繧､繝励Λ繧､繝ｳ譯井ｻｶ縺ｮ騾ｲ謐礼憾豕√√ヵ繧ｧ繝ｼ繧ｺ縺斐→縺ｮ繧ｹ繝・・繧ｿ繧ｹ縲√♀繧医・蜃ｺ蜉帙ヵ繧｡繧､繝ｫ縺ｮ蟄伜惠繧堤｢ｺ隱阪＠縺ｾ縺吶・

## 蠑墓焚
- `project_id`: 譯井ｻｶID・井ｾ・ `20260212-001-new-service-launch`・峨・

## 蜑肴署譚｡莉ｶ
- 謖・ｮ壹＆繧後◆譯井ｻｶ縺ｮ `pipeline-state.json` 縺悟ｭ伜惠縺吶ｋ縺薙→縲・

## 螳溯｡梧焔鬆・

1. **蠑墓焚繝√ぉ繝・け**
   - `project_id` 縺梧欠螳壹＆繧後※縺・ｋ縺狗｢ｺ隱阪＠縺ｦ縺上□縺輔＞縲よ悴謖・ｮ壹・蝣ｴ蜷医・繧ｨ繝ｩ繝ｼ繧定｡ｨ遉ｺ縺励※邨ゆｺ・＠縺ｾ縺吶・

2. **pipeline-state.json 縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ**
   - `.sd/ai-coordination/workflow/research/{project_id}/pipeline-state.json` 繧定ｪｭ縺ｿ霎ｼ縺ｿ縺ｾ縺吶・
   - 繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺励↑縺・ｴ蜷医・縲√梧｡井ｻｶ ID {project_id} 縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲阪→陦ｨ遉ｺ縺励※邨ゆｺ・＠縺ｾ縺吶・

3. **蜃ｺ蜉帙ヵ繧｡繧､繝ｫ縺ｮ蟄伜惠遒ｺ隱・*
   - 蜷・ヵ繧ｧ繝ｼ繧ｺ縺ｮ譛溷ｾ・＆繧後ｋ蜃ｺ蜉帙ヵ繧｡繧､繝ｫ縺・`.sd/ai-coordination/workflow/research/{project_id}/` 驟堺ｸ九↓蟄伜惠縺吶ｋ縺狗｢ｺ隱阪＠縺ｾ縺吶・
   - **譛溷ｾ・＆繧後ｋ繝輔ぃ繧､繝ｫ荳隕ｧ:**
     - Phase 0: `phase0_claude_research.json`, `phase0_chatgpt_research.json`, `phase0_gemini_research.json`, `phase0_grok_research.json`, `phase0_perplexity_research.json`, `phase0_codex_research.json`, `phase0_research_integrated.json`
     - Phase 1: `phase1_proposal.json`, `phase1_proposal.md`
     - Phase 2: `phase2_reinforcement.json`, `phase2_reinforcement.md`
     - Phase 3: `phase3_critique.json`, `phase3_critique.md`
     - Phase 3.5: `phase3_5_historical.json`, `phase3_5_historical.md`
     - Phase 4: `phase4_integrated_report.json`, `phase4_integrated_report.md`

4. **諠・ｱ縺ｮ謨ｴ逅・→陦ｨ遉ｺ**
   - 莉･荳九・繝輔か繝ｼ繝槭ャ繝医↓蠕薙▲縺ｦ迴ｾ蝨ｨ縺ｮ迥ｶ諷九ｒ陦ｨ遉ｺ縺励※縺上□縺輔＞縲・

## 蜃ｺ蜉帙ヵ繧ｩ繝ｼ繝槭ャ繝・

### 蝓ｺ譛ｬ諠・ｱ
| 鬆・岼 | 蛟､ |
|------|-----|
| 譯井ｻｶID | {pipeline_id} |
| 譯井ｻｶ繧ｿ繧､繝・| {case_type} |
| 繧ｹ繝・・繧ｿ繧ｹ | {status} |
| 菴懈・譌･譎・| {created_at} |
| 譛邨よ峩譁ｰ | {updated_at} |
| 迴ｾ蝨ｨ繝輔ぉ繝ｼ繧ｺ | {current_phase} |

### 繝輔ぉ繝ｼ繧ｺ騾ｲ謐・
| 繝輔ぉ繝ｼ繧ｺ | 迥ｶ諷・| 髢句ｧ・| 螳御ｺ・| 蜃ｺ蜉・|
|---------|------|------|------|------|
| Phase 0 (Research) | {p0_status} | {p0_start} | {p0_end} | {p0_file_check} |
| Phase 1 (Proposal) | {p1_status} | {p1_start} | {p1_end} | {p1_file_check} |
| Phase 2 (Reinforce) | {p2_status} | {p2_start} | {p2_end} | {p2_file_check} |
| Phase 3 (Critique) | {p3_status} | {p3_start} | {p3_end} | {p3_file_check} |
| Phase 3.5 (History) | {p35_status} | {p35_start} | {p35_end} | {p35_file_check} |
| Phase 4 (Integrate) | {p4_status} | {p4_start} | {p4_end} | {p4_file_check} |

窶ｻ 蜃ｺ蜉帛・: 笳・(蜈ｨ繝輔ぃ繧､繝ｫ蟄伜惠), 笆ｳ (荳驛ｨ蟄伜惠), 笨・(縺ｪ縺・

### 繝ｪ繧ｵ繝ｼ繝√ヤ繝ｼ繝ｫ
| 繝・・繝ｫ | 蛻ｩ逕ｨ蜿ｯ蜷ｦ |
|--------|---------|
| Brave Search API | {brave} |
| Tavily API | {tavily} |
| Exa API | {exa} |

### 繧ｨ繝ｩ繝ｼ諠・ｱ
{繧ゅ＠繧ｨ繝ｩ繝ｼ縺後≠繧後・陦ｨ蠖｢蠑上〒陦ｨ遉ｺ縲ゅ↑縺代ｌ縺ｰ縲・繧ｨ繝ｩ繝ｼ縺ｪ縺・縲阪ｒ陦ｨ遉ｺ}

---
### 谺｡縺ｮ繧ｹ繝・ャ繝・
- 繝代う繝励Λ繧､繝ｳ螳溯｡・ `/pipeline:run {project_id}`
- 迚ｹ螳壹ヵ繧ｧ繝ｼ繧ｺ蜀埼幕: `/pipeline:{phase_name} {project_id}`
