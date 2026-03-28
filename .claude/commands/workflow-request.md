---
description: AI蜊碑ｪｿ繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ - 螳溯｣・欠遉ｺ・・MPLEMENT_REQUEST・我ｽ懈・
allowed-tools: Bash, Write, Read, Glob, Grep
---

# 螳溯｣・欠遉ｺ菴懈・: /workflow:request

## 讎りｦ・迚ｹ螳壹ち繧ｹ繧ｯ縺ｮ螳溯｣・欠遉ｺ・・MPLEMENT_REQUEST.md・峨ｒ菴懈・縺励∪縺吶・
## 菴ｿ逕ｨ譁ｹ豕・```
/workflow:request {譯井ｻｶID} {繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ}
```

## 蠑墓焚
- `譯井ｻｶID`: 蟇ｾ雎｡譯井ｻｶ縺ｮID
- `繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ`: WORK_ORDER.md 縺ｧ螳夂ｾｩ縺励◆繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ・・譯・ 001, 002, ...・・
## 蜑肴署譚｡莉ｶ
- WORK_ORDER.md 縺悟ｭ伜惠縺吶ｋ縺薙→
- 逋ｺ豕ｨ譖ｸ繝ｬ繝薙Η繝ｼ縺・Approve 縺輔ｌ縺ｦ縺・ｋ縺薙→
- 萓晏ｭ倥ち繧ｹ繧ｯ縺悟ｮ御ｺ・＠縺ｦ縺・ｋ縺薙→・郁ｩｲ蠖薙☆繧句ｴ蜷茨ｼ・
## 螳溯｡梧焔鬆・
### 1. 逋ｺ豕ｨ譖ｸ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ
```
.sd/ai-coordination/workflow/spec/{譯井ｻｶID}/WORK_ORDER.md
```
縺九ｉ隧ｲ蠖薙ち繧ｹ繧ｯ縺ｮ隧ｳ邏ｰ繧呈歓蜃ｺ縲・
### 2. 繝ｬ繝薙Η繝ｼ邨先棡縺ｮ遒ｺ隱・```
.sd/ai-coordination/workflow/review/{譯井ｻｶID}/REVIEW_WORK_ORDER.md
```
縺悟ｭ伜惠縺励∝愛螳壹′ Approve 縺ｧ縺ゅｋ縺薙→繧堤｢ｺ隱阪・
### 3. 萓晏ｭ倥ち繧ｹ繧ｯ縺ｮ迥ｶ諷狗｢ｺ隱・WORK_ORDER.md 縺ｮ繧ｿ繧ｹ繧ｯ荳隕ｧ縺九ｉ萓晏ｭ倥ち繧ｹ繧ｯ繧堤音螳壹＠縲・PROJECT_STATUS.md 縺ｧ螳御ｺ・憾諷九ｒ遒ｺ隱阪・
### 4. 螳溯｣・欠遉ｺ縺ｮ隧ｳ邏ｰ逕滓・
繝・Φ繝励Ξ繝ｼ繝医ｒ菴ｿ逕ｨ縺励※螳溯｣・欠遉ｺ繧剃ｽ懈・:
- 繝・Φ繝励Ξ繝ｼ繝・ `.sd/ai-coordination/workflow/templates/IMPLEMENT_REQUEST.md`

莉･荳九ｒ蜈ｷ菴灘喧:
- **繝悶Λ繝ｳ繝∝錐**: `feature/{譯井ｻｶID}/{繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ}-{slug}`
- **螟画峩蜿ｯ閭ｽ繝輔ぃ繧､繝ｫ**: 逋ｺ豕ｨ譖ｸ縺九ｉ迚ｹ螳・- **遖∵ｭ｢鬆伜沺**: 繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ繝輔ぃ繧､繝ｫ縲∽ｻ墓ｧ俶嶌遲・- **繝・せ繝医こ繝ｼ繧ｹ**: 逋ｺ豕ｨ譖ｸ縺ｮ繝・せ繝郁ｦ∽ｻｶ縺九ｉ螻暮幕
- **繧ｳ繝溘ャ繝域婿驥・*: 讓呎ｺ門ｽ｢蠑上ｒ驕ｩ逕ｨ

### 5. IMPLEMENT_REQUEST_{繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ}.md 菴懈・
菫晏ｭ伜・: `.sd/ai-coordination/workflow/spec/{譯井ｻｶID}/IMPLEMENT_REQUEST_{繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ}.md`

### 6. PROJECT_STATUS.md 譖ｴ譁ｰ
- 繝輔ぉ繝ｼ繧ｺ3・亥ｮ溯｣・欠遉ｺ菴懈・・牙ｮ御ｺ・√ヵ繧ｧ繝ｼ繧ｺ4・亥ｮ溯｣・ｼ峨∈
- 隧ｲ蠖薙ち繧ｹ繧ｯ繧偵碁ｲ陦御ｸｭ縲阪↓譖ｴ譁ｰ
- 繧ｿ繧､繝繝ｩ繧､繝ｳ縺ｫ險倬鹸霑ｽ蜉

### 7. handoff-log.json 譖ｴ譁ｰ
```json
{
  "handoff_history": [
    {
      "id": "HO-{騾｣逡ｪ}",
      "project_id": "{譯井ｻｶID}",
      "from": "Claude Code",
      "to": "Gemini CLI",
      "type": "implement_request",
      "artifact": ".sd/ai-coordination/workflow/spec/{譯井ｻｶID}/IMPLEMENT_REQUEST_{繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ}.md",
      "timestamp": "{迴ｾ蝨ｨ譌･譎・SO蠖｢蠑殉",
      "status": "pending",
      "result": null
    }
  ]
}
```

### 8. Gemini CLI 閾ｪ蜍募ｮ溯｡鯉ｼ育怐逡･遖∵ｭ｢・・**謖・､ｺ譖ｸ菴懈・蠕後∝ｿ・★ `/workflow:impl {譯井ｻｶID} {繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ}` 繧貞ｮ溯｡後☆繧九・*
謖・､ｺ譖ｸ繧剃ｽ懊▲縺溘□縺代〒豁｢縺ｾ繧九％縺ｨ縺ｯ遖∵ｭ｢縲ょｮ溯｣・ｮ溯｡後∪縺ｧ蜷ｫ繧√※1縺､縺ｮ繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ縲・
### 9. 螳御ｺ・ｱ蜻・```
## 螳溯｣・欠遉ｺ菴懈・ 竊・Gemini螳溯｡悟ｮ御ｺ・
- **譯井ｻｶID**: {譯井ｻｶID}
- **繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ**: {繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ}
- **螳溯｣・欠遉ｺ**: .sd/ai-coordination/workflow/spec/{譯井ｻｶID}/IMPLEMENT_REQUEST_{繧ｿ繧ｹ繧ｯ逡ｪ蜿ｷ}.md
- **Gemini螳溯｡檎ｵ先棡**: {繝代せ/螟ｱ謨抑
- **繧ｳ繝溘ャ繝・*: {繝上ャ繧ｷ繝･}
```

## 繝ｦ繝ｼ繧ｶ繝ｼ蜈･蜉・$ARGUMENTS

---

**螳溯｡碁幕蟋・*: 荳願ｨ俶焔鬆・↓蠕薙▲縺ｦ螳溯｣・欠遉ｺ繧剃ｽ懈・縺励※縺上□縺輔＞縲ら匱豕ｨ譖ｸ縺ｮ隧ｲ蠖薙ち繧ｹ繧ｯ繧定ｩｳ邏ｰ縺ｫ螻暮幕縺励；emini CLI縺瑚ｿｷ繧上★螳溯｣・〒縺阪ｋ蜈ｷ菴鍋噪縺ｪ謖・､ｺ繧剃ｽ懈・縺吶ｋ縺薙→縲・