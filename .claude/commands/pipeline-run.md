# /pipeline:run {project_id} {case_type}

## 讎りｦ・
5AI隴ｰ隲悶ヱ繧､繝励Λ繧､繝ｳ縺ｮ蜈ｨ繝輔ぉ繝ｼ繧ｺ・・hase 0縲・・峨ｒ荳諡ｬ螳溯｡後＠縺ｾ縺吶ょ推繝輔ぉ繝ｼ繧ｺ繧定・蜍慕噪縺ｫ繝√ぉ繝ｼ繝ｳ縺励∝､ｱ謨玲凾縺ｫ縺ｯ迥ｶ諷九ｒ菫晏ｭ倥＠縺ｦ蛛懈ｭ｢縺励∪縺吶・

## 蠑墓焚
- `project_id`: 譯井ｻｶID縲・
- `case_type`: 譯井ｻｶ繧ｿ繧､繝暦ｼ・A`: 譁ｰ隕上～B`: 譌｢蟄俶隼蝟・～C`: DX縲～D`: 蜊ｱ讖溷ｯｾ蠢懶ｼ峨・

## 蜑肴署譚｡莉ｶ
- `/pipeline:init` 縺ｫ繧医ｊ譯井ｻｶ縺悟・譛溷喧縺輔ｌ縺ｦ縺・ｋ縺薙→縲・
- `pipeline-state.json` 縺悟ｭ伜惠縺吶ｋ縺薙→縲・
- 繧ｹ繝・・繧ｿ繧ｹ縺・`initialized`, `paused`, 縺ｾ縺溘・ `failed` 縺ｧ縺ゅｋ縺薙→縲・

## 螳溯｡梧焔鬆・

1. **蠑墓焚繝ｻ迥ｶ諷九メ繧ｧ繝・け**
   - `project_id` 縺ｨ `case_type` (A/B/C/D) 縺梧ｭ｣縺励￥謖・ｮ壹＆繧後※縺・ｋ縺狗｢ｺ隱阪＠縺ｾ縺吶・
   - `pipeline-state.json` 繧定ｪｭ縺ｿ霎ｼ縺ｿ縲∫樟蝨ｨ縺ｮ繧ｹ繝・・繧ｿ繧ｹ繧堤｢ｺ隱阪＠縺ｾ縺吶・

2. **繧ｹ繝・・繧ｿ繧ｹ譖ｴ譁ｰ**
   - `pipeline-state.json` 縺ｮ `case_type` 繧定ｨｭ螳壹＠縲～status` 繧・`running` 縺ｫ譖ｴ譁ｰ縺励∪縺吶・

3. **閾ｪ蜍輔メ繧ｧ繝ｼ繝ｳ螳溯｡・(Phase 0 縲・4)**
   莉･荳九・鬆・ｺ上〒蜷・ヵ繧ｧ繝ｼ繧ｺ縺ｮ繧ｳ繝槭Φ繝峨ｒ蜻ｼ縺ｳ蜃ｺ縺励∪縺吶ょ推繝輔ぉ繝ｼ繧ｺ螳御ｺ・ｾ後～pipeline-state.json` 繧堤｢ｺ隱阪＠縲∵・蜉溘＠縺ｦ縺・ｌ縺ｰ谺｡縺ｸ騾ｲ縺ｿ縺ｾ縺吶よ里縺ｫ `completed` 縺ｫ縺ｪ縺｣縺ｦ縺・ｋ繝輔ぉ繝ｼ繧ｺ縺ｯ繧ｹ繧ｭ繝・・縺励∪縺吶・

   - **Phase 0 (Research)**: `/pipeline:research {project_id} {case_type}`
   - **Phase 1 (Proposal)**: `/pipeline:propose {project_id}`
   - **Phase 2 (Reinforcement)**: `/pipeline:reinforce {project_id}`
   - **Phase 3 (Critique)**: `/pipeline:critique {project_id}`
   - **Phase 3.5 (Historical)**: `/pipeline:history {project_id}`
   - **Phase 4 (Integration)**: `/pipeline:integrate {project_id}`

4. **螳御ｺ・・逅・*
   - 蜈ｨ繝輔ぉ繝ｼ繧ｺ縺梧ｭ｣蟶ｸ邨ゆｺ・＠縺溷ｴ蜷茨ｼ・
     - `pipeline-state.json` 縺ｮ `status` 繧・`completed` 縺ｫ譖ｴ譁ｰ縺励∪縺吶・
     - `handoff-log.json` 縺ｫ `pipeline_complete` 繧定ｨ倬鹸縺励∪縺吶・
     - 譛邨ゅΞ繝昴・繝医∈縺ｮ繝ｪ繝ｳ繧ｯ繧貞性繧螳御ｺ・Γ繝・そ繝ｼ繧ｸ繧定｡ｨ遉ｺ縺励∪縺吶・

5. **繧ｨ繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ**
   - 縺・★繧後°縺ｮ繝輔ぉ繝ｼ繧ｺ縺ｧ螟ｱ謨暦ｼ・failed`・峨＠縺溷ｴ蜷茨ｼ・
     - `pipeline-state.json` 縺ｮ `status` 繧・`failed` 縺ｫ譖ｴ譁ｰ縺励∪縺吶・
     - 螟ｱ謨励＠縺溘ヵ繧ｧ繝ｼ繧ｺ蜷阪→繧ｨ繝ｩ繝ｼ蜀・ｮｹ繧偵Θ繝ｼ繧ｶ繝ｼ縺ｫ蝣ｱ蜻翫＠縺ｾ縺吶・
     - 蜀埼幕譁ｹ豕包ｼ亥次蝗隗｣豸亥ｾ後↓蜀榊ｺｦ `/pipeline:run`・峨ｒ譯亥・縺励※蛛懈ｭ｢縺励∪縺吶・

## 蜃ｺ蜉帙ヵ繧ｩ繝ｼ繝槭ャ繝・

### 螳溯｡檎ｵ先棡
| 繝輔ぉ繝ｼ繧ｺ | 迥ｶ諷・| 蛯呵・|
|---------|------|------|
| Phase 0 | {p0_status} | |
| Phase 1 | {p1_status} | |
| Phase 2 | {p2_status} | |
| Phase 3 | {p3_status} | |
| Phase 3.5 | {p35_status} | |
| Phase 4 | {p4_status} | |

### 譛邨よ・譫懃黄・域・蜉滓凾・・
- 繝ｬ繝昴・繝・ `.sd/ai-coordination/workflow/research/{project_id}/phase4_integrated_report.md`

### 繧ｨ繝ｩ繝ｼ諠・ｱ・亥､ｱ謨玲凾・・
- 繝輔ぉ繝ｼ繧ｺ: {failed_phase}
- 蜀・ｮｹ: {error_message}
