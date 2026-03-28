# AI蜊碑ｪｿ菴灘宛

## 蟇ｾ蠢廣I・・遞ｮ鬘橸ｼ・
| AI | 蠖ｹ蜑ｲ | 繧ｳ繝槭Φ繝・|
|----|------|---------|
| Claude Code | 險育判繝ｻ蟾･遞狗ｮ｡逅・| `/workflow:init`, `/workflow:order`, `/workflow:request`, `/workflow:status` |
| Codex | 繝ｬ繝薙Η繝ｼ繝ｻ繝√ぉ繝・け | `/workflow:review`・郁・蜍暮｣骼厄ｼ・|
| Gemini CLI | 螳溯｣・| `/workflow:impl`・郁・蜍暮｣骼厄ｼ・|
| Antigravity | E2E繝・せ繝医・謗｢邏｢逧・ｪｿ譟ｻ繝ｻ譛ｬ逡ｪ遒ｺ隱・| `/workflow:test` |

**蟒・ｭ｢**: Cursor, Windsurf

## 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ繧ｳ繝槭Φ繝・
| 繧ｳ繝槭Φ繝・| 隱ｬ譏・|
|----------|------|
| `/workflow:init {slug}` | 譯井ｻｶ蛻晄悄蛹・|
| `/workflow:order {譯井ｻｶID}` | 逋ｺ豕ｨ譖ｸ菴懈・ |
| `/workflow:request {譯井ｻｶID} {逡ｪ蜿ｷ}` | 螳溯｣・欠遉ｺ菴懈・・・emini CLI蜷代￠・・|
| `/workflow:test {譯井ｻｶID} {逡ｪ蜿ｷ}` | 繝・せ繝井ｾ晞ｼ菴懈・・・ntigravity蜷代￠・・|
| `/workflow:status {譯井ｻｶID}` | 蟾･遞狗憾豕∫｢ｺ隱・|
| `/workflow:impl {譯井ｻｶID} {逡ｪ蜿ｷ}` | 螳溯｣・ｮ溯｡鯉ｼ・emini CLI・俄・ review閾ｪ蜍暮｣骼・|
| `/workflow:review {譯井ｻｶID} {逡ｪ蜿ｷ}` | 繝ｬ繝薙Η繝ｼ萓晞ｼ繝ｻ螳溯｡鯉ｼ・odex・榎

---

## 萓晞ｼ繝ｻ蝣ｱ蜻翫・菫晏ｭ倥Ν繝ｼ繝ｫ・亥ｿ・茨ｼ・

### 邨ｶ蟇ｾ繝ｫ繝ｼ繝ｫ
**蜈ｨAI縺ｸ縺ｮ萓晞ｼ繝ｻ蝣ｱ蜻翫・ `.sd/ai-coordination/` 驟堺ｸ九↓邨ｱ荳縺吶ｋ**

| 繝輔ぃ繧､繝ｫ遞ｮ蛻･ | 菫晏ｭ伜・ | 萓・|
|-------------|--------|-----|
| 逋ｺ豕ｨ譖ｸ | `workflow/spec/{譯井ｻｶID}/WORK_ORDER.md` | `workflow/spec/20260102-001-test/WORK_ORDER.md` |
| 螳溯｣・欠遉ｺ | `workflow/spec/{譯井ｻｶID}/IMPLEMENT_REQUEST_{NNN}.md` | `IMPLEMENT_REQUEST_001.md` |
| 繝・せ繝井ｾ晞ｼ | `workflow/spec/{譯井ｻｶID}/TEST_REQUEST_{NNN}.md` | `TEST_REQUEST_001.md` |
| 繝ｬ繝薙Η繝ｼ邨先棡 | `workflow/review/{譯井ｻｶID}/REVIEW_{遞ｮ蛻･}_{NNN}.md` | `REVIEW_IMPL_001.md` |
| 繝・せ繝亥ｱ蜻・| `workflow/review/{譯井ｻｶID}/TEST_REPORT_{NNN}.md` | `TEST_REPORT_001.md` |

### 遖∵ｭ｢莠矩・
| 遖∵ｭ｢ | 逅・罰 |
|------|------|
| `.antigravity/` 縺ｫ萓晞ｼ譖ｸ繧剃ｽ懈・ | 譯井ｻｶ縺ｨ邏蝉ｻ倥°縺ｪ縺・|
| 繝励Ο繧ｸ繧ｧ繧ｯ繝医Ν繝ｼ繝医↓萓晞ｼ譖ｸ繧剃ｽ懈・ | 謨｣繧峨°繧・|
| 繝・Φ繝励Ξ繝ｼ繝医↑縺励〒萓晞ｼ譖ｸ繧剃ｽ懈・ | 蠖｢蠑上′繝舌Λ繝舌Λ縺ｫ縺ｪ繧・|

### AI蛻･險ｭ螳壹ヵ繧ｩ繝ｫ繝縺ｮ逕ｨ騾・
| 繝輔か繝ｫ繝 | 逕ｨ騾・| 萓晞ｼ譖ｸ繧堤ｽｮ縺擾ｼ・|
|---------|------|--------------|
| `.antigravity/` | Antigravity縺ｮ蜍穂ｽ懊Ν繝ｼ繝ｫ險ｭ螳・| **NO** |
| `.claude/` | Claude Code縺ｮ蜍穂ｽ懊Ν繝ｼ繝ｫ險ｭ螳・| **NO** |
| `.sd/ai-coordination/` | 萓晞ｼ繝ｻ蝣ｱ蜻翫・繝ｭ繧ｰ縺ｮ髮・ｴ・| **YES** |

---

## 驕狗畑繝輔Ο繝ｼ・・谿ｵ髫・+ 繝・せ繝医ヵ繧ｧ繝ｼ繧ｺ・・

```
Phase 1: 逋ｺ豕ｨ譖ｸ菴懈・ (Claude Code)
    竊・
Phase 2: 逋ｺ豕ｨ譖ｸ繝ｬ繝薙Η繝ｼ (Codex)
    竊・Approve
Phase 3: 螳溯｣・欠遉ｺ菴懈・ (Claude Code)
    竊・笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏・
    竊・笘・閾ｪ蜍暮｣骼悶メ繧ｧ繝ｼ繝ｳ・・workflow:request 縺ｧ荳諡ｬ螳溯｡鯉ｼ・
    竊・笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏≫煤笏・
Phase 4: 螳溯｣・(Gemini CLI)          竊・/workflow:impl 縺瑚・蜍募ｮ溯｡・
    竊・
Phase 5: 螳溯｣・Ξ繝薙Η繝ｼ (Codex)       竊・/workflow:review 縺瑚・蜍募ｮ溯｡・
    竊・Approve / Request Changes 竊・Phase 6
Phase 6: 菫ｮ豁｣蟇ｾ蠢・(Gemini CLI)
    竊・Approve
Phase 7: E2E繝・せ繝・(Antigravity) 笘・
    竊・Pass
Phase 8: 蟾･遞句ｮ御ｺ・(Claude Code)
```

## 閾ｪ蜍暮｣骼悶Ν繝ｼ繝ｫ・育怐逡･遖∵ｭ｢・・

**繧ｳ繝槭Φ繝蛾俣縺ｮ閾ｪ蜍暮｣骼悶・莉慕ｵ・∩縺ｨ縺励※蠑ｷ蛻ｶ縺輔ｌ繧九・I縺ｮ縲梧ｰ怜・縲阪〒逵∫払縺吶ｋ縺薙→縺ｯ荳榊庄縲・*

| 繝医Μ繧ｬ繝ｼ | 閾ｪ蜍募ｮ溯｡・| 隱ｬ譏・|
|---------|---------|------|
| `/workflow:request` 螳御ｺ・| 竊・`/workflow:impl` | 謖・､ｺ譖ｸ菴懈・蠕後；emini CLI螳溯｡後・蠢・・|
| `/workflow:impl` 螳御ｺ・| 竊・`/workflow:review` | Gemini螳溯｣・ｾ後，odex繝ｬ繝薙Η繝ｼ萓晞ｼ縺ｯ蠢・・|

### 騾｣骼悶ヵ繝ｭ繝ｼ蝗ｳ
```
/workflow:request {ID} {N}
  笏懌楳笏 Step 1-7: 螳溯｣・欠遉ｺ譖ｸ菴懈・ + handoff險倬鹸
  笏披楳笏 Step 8: /workflow:impl {ID} {N} 繧定・蜍募ｮ溯｡・
        笏懌楳笏 Step 1-8: Gemini CLI螳溯｡・竊・讀懆ｨｼ 竊・繧ｳ繝溘ャ繝・竊・handoff險倬鹸
        笏披楳笏 Step 9: /workflow:review {ID} {N} 繧定・蜍募ｮ溯｡・
              笏懌楳笏 Step 1-5: 繝ｬ繝薙Η繝ｼ萓晞ｼ菴懈・ 竊・Codex螳溯｡・竊・邨先棡菫晏ｭ・
              笏披楳笏 Step 6-8: handoff險倬鹸 竊・螳御ｺ・ｱ蜻・
```

**驕募渚繝代ち繝ｼ繝ｳ・育ｦ∵ｭ｢・・*:
- 謖・､ｺ譖ｸ繧剃ｽ懊▲縺溘□縺代〒豁｢縺ｾ繧・
- Gemini螳溯｣・′邨ゅｏ縺｣縺溘□縺代〒豁｢縺ｾ繧・
- 縲梧ｬ｡縺ｮ繧ｹ繝・ャ繝励阪ｒ譯亥・縺励※邨ゅｏ繧具ｼ域｡亥・縺ｧ縺ｯ縺ｪ縺丞ｮ溯｡後○繧茨ｼ・

---

## Antigravity繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ

### 蠖ｹ蜑ｲ縺ｮ隧ｳ邏ｰ
| 蠖ｹ蜑ｲ | 隱ｬ譏・|
|------|------|
| E2E繝・せ繝・| 譛ｬ逡ｪ/繧ｹ繝・・繧ｸ繝ｳ繧ｰ迺ｰ蠅・〒縺ｮUI遒ｺ隱・|
| 謗｢邏｢逧・ユ繧ｹ繝・| 莉墓ｧ伜､悶・蜍穂ｽ懃｢ｺ隱阪ゞX讀懆ｨｼ |
| 繧ｹ繧ｯ繝ｪ繝ｼ繝ｳ繧ｷ繝ｧ繝・ヨ蜿門ｾ・| 險ｼ霍｡蜿朱寔・医ユ繧ｹ繝亥ｱ蜻翫↓豺ｻ莉假ｼ・|
| 譛ｬ逡ｪ遒ｺ隱・| 繝・・繝ｭ繧､蠕後・蜍穂ｽ懃｢ｺ隱・|

### 繝・せ繝井ｾ晞ｼ繝輔Ο繝ｼ

```
1. Claude Code: TEST_REQUEST_{NNN}.md 繧剃ｽ懈・
   竊・菫晏ｭ伜・: .sd/ai-coordination/workflow/spec/{譯井ｻｶID}/
   竊・handoff-log.json 縺ｫ險倬鹸

2. Antigravity: 繝・せ繝亥ｮ溯｡・
   竊・TEST_REQUEST 繧貞盾辣ｧ
   竊・繧ｹ繧ｯ繝ｪ繝ｼ繝ｳ繧ｷ繝ｧ繝・ヨ蜿門ｾ・

3. Antigravity: TEST_REPORT_{NNN}.md 繧剃ｽ懈・
   竊・菫晏ｭ伜・: .sd/ai-coordination/workflow/review/{譯井ｻｶID}/
   竊・handoff-log.json 縺ｫ險倬鹸

4. Claude Code: 蝣ｱ蜻翫ｒ遒ｺ隱阪＠谺｡縺ｮ繧｢繧ｯ繧ｷ繝ｧ繝ｳ繧呈ｱｺ螳・
```

### 繝・Φ繝励Ξ繝ｼ繝・
| 繝・Φ繝励Ξ繝ｼ繝・| 逕ｨ騾・|
|-------------|------|
| `templates/TEST_REQUEST.md` | Antigravity縺ｸ縺ｮ繝・せ繝井ｾ晞ｼ |
| `templates/TEST_REPORT.md` | Antigravity縺九ｉ縺ｮ繝・せ繝亥ｱ蜻・|

---

## handoff-log.json 縺ｮ險倬鹸・亥ｿ・茨ｼ・

**萓晞ｼ繝ｻ蝣ｱ蜻翫ｒ逋ｺ陦後＠縺溘ｉ蠢・★ handoff-log.json 縺ｫ險倬鹸縺吶ｋ**

### 險倬鹸縺吶∋縺紘andoff_type
| type | 隱ｬ譏・| from | to |
|------|------|------|-----|
| `work_order_review` | 逋ｺ豕ｨ譖ｸ繝ｬ繝薙Η繝ｼ萓晞ｼ | Claude Code | Codex |
| `implement_request` | 螳溯｣・欠遉ｺ逋ｺ陦・| Claude Code | Gemini CLI |
| `implement_complete` | 螳溯｣・ｮ御ｺ・・繝ｬ繝薙Η繝ｼ萓晞ｼ | Gemini CLI | Codex |
| `review_complete` | 繝ｬ繝薙Η繝ｼ螳御ｺ・| Codex | Claude Code |
| `test_request` | 繝・せ繝井ｾ晞ｼ逋ｺ陦・| Claude Code | Antigravity |
| `test_report` | 繝・せ繝亥ｮ御ｺ・ｱ蜻・| Antigravity | Claude Code |
| `exploration_request` | 謗｢邏｢逧・ｪｿ譟ｻ萓晞ｼ | Claude Code | Antigravity |
| `exploration_report` | 謗｢邏｢逧・ｪｿ譟ｻ蝣ｱ蜻・| Antigravity | Claude Code |

### 險倬鹸繝輔か繝ｼ繝槭ャ繝・
```json
{
  "timestamp": "2026-01-02T10:00:00+09:00",
  "type": "test_request",
  "project_id": "20260102-001-test",
  "from": "Claude Code",
  "to": "Antigravity",
  "file": "workflow/spec/20260102-001-test/TEST_REQUEST_001.md",
  "note": "formatMonth菫ｮ豁｣縺ｮ譛ｬ逡ｪ遒ｺ隱・
}
```

---

## 繝・ぅ繝ｬ繧ｯ繝医Μ讒矩

```
.sd/ai-coordination/
笏懌楳笏 handoff/handoff-log.json    # 蠑輔″邯吶℃繝ｭ繧ｰ・・2.0.0・・
笏懌楳笏 sessions/                   # AI蛻･繧ｻ繝・す繝ｧ繝ｳ險倬鹸
笏・  笏懌楳笏 antigravity/            # Antigravity縺ｮ繧ｻ繝・す繝ｧ繝ｳ
笏・  笏懌楳笏 claude-code/            # Claude Code縺ｮ繧ｻ繝・す繝ｧ繝ｳ
笏・  笏懌楳笏 codex/                  # Codex縺ｮ繧ｻ繝・す繝ｧ繝ｳ
笏・  笏披楳笏 gemini/                 # Gemini CLI縺ｮ繧ｻ繝・す繝ｧ繝ｳ
笏懌楳笏 workflow/
笏・  笏懌楳笏 README.md               # 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ隱ｬ譏・
笏・  笏懌楳笏 CODEX_GUIDE.md          # Codex繝ｬ繝薙Η繝ｼ驕狗畑繧ｬ繧､繝・
笏・  笏懌楳笏 templates/              # 繝・Φ繝励Ξ繝ｼ繝・
笏・  笏・  笏懌楳笏 WORK_ORDER.md
笏・  笏・  笏懌楳笏 IMPLEMENT_REQUEST.md
笏・  笏・  笏懌楳笏 REVIEW_REPORT.md
笏・  笏・  笏懌楳笏 PROJECT_STATUS.md
笏・  笏・  笏懌楳笏 TEST_REQUEST.md
笏・  笏・  笏披楳笏 TEST_REPORT.md
笏・  笏懌楳笏 spec/{譯井ｻｶID}/          # 譯井ｻｶ蛻･逋ｺ豕ｨ譖ｸ繝ｻ螳溯｣・欠遉ｺ繝ｻ繝・せ繝井ｾ晞ｼ
笏・  笏懌楳笏 review/{譯井ｻｶID}/        # 譯井ｻｶ蛻･繝ｬ繝薙Η繝ｼ邨先棡繝ｻ繝・せ繝亥ｱ蜻・
笏・  笏披楳笏 log/{譯井ｻｶID}/           # 譯井ｻｶ蛻･蟾･遞九Ο繧ｰ
```

### AI蛻･險倬鹸蝣ｴ謇

| AI | 繧ｻ繝・す繝ｧ繝ｳ | 萓晞ｼ譖ｸ蜿嶺ｿ｡ | 蝣ｱ蜻頑嶌菴懈・ |
|----|-----------|-----------|-----------|
| Claude Code | `sessions/claude-code/` | - | `workflow/spec/` |
| Codex | `sessions/codex/` | `workflow/spec/` | `workflow/review/` |
| Gemini CLI | `sessions/gemini/` | `workflow/spec/` | `workflow/review/` |
| Antigravity | `sessions/antigravity/` | `workflow/spec/` | `workflow/review/` |

## 蜻ｽ蜷崎ｦ丞援
| 隕∫ｴ | 隕丞援 | 萓・|
|------|------|-----|
| 譯井ｻｶID | `YYYYMMDD-NNN-slug` | `20251230-001-auth` |
| 逋ｺ豕ｨ譖ｸ | `WORK_ORDER.md` | 蝗ｺ螳・|
| 螳溯｣・欠遉ｺ | `IMPLEMENT_REQUEST_NNN.md` | `IMPLEMENT_REQUEST_001.md` |
| 繝・せ繝井ｾ晞ｼ | `TEST_REQUEST_NNN.md` | `TEST_REQUEST_001.md` |
| 繝ｬ繝薙Η繝ｼ邨先棡 | `REVIEW_{遞ｮ蛻･}_NNN.md` | `REVIEW_IMPL_001.md` |
| 繝・せ繝亥ｱ蜻・| `TEST_REPORT_NNN.md` | `TEST_REPORT_001.md` |

---

## Trigger Words (AUTO-EXECUTE)

**IMPORTANT: BEFORE creating any request/report document, FIRST initialize the project with `/workflow:init`**

### Workflow Initialization

When user mentions a task or feature, FIRST ask or determine:
1. Is this a new project? 竊・`/workflow:init {slug}`
2. Existing project? 竊・Get the project ID (e.g., `20260102-001-test`)

### Trigger Keywords by AI

| AI | Trigger Keywords | Auto Action |
|----|-----------------|-------------|
| Claude Code | "create work order", "create request", "assign to" | Create document using template, save to spec folder |
| Claude Code | "check on Antigravity", "test request to Antigravity" | Create TEST_REQUEST, record handoff |
| Gemini CLI | "implementation complete", "done implementing" | Report to Codex for review |
| Antigravity | "test request", "execute test" | Read TEST_REQUEST, execute, create TEST_REPORT |
| Codex | "review complete", "approved", "request changes" | Create REVIEW_REPORT |

### Japanese Trigger Keywords

| Keyword | AI | Action |
|---------|-----|--------|
| "...縺ｫ萓晞ｼ", "...繧剃ｾ晞ｼ" | Claude Code | Create request document for target AI |
| "謖・､ｺ譖ｸ繧剃ｽ懈・", "菴懈･ｭ謖・､ｺ" | Claude Code | Create IMPLEMENT_REQUEST or TEST_REQUEST |
| "繝・せ繝医ｒ萓晞ｼ" | Claude Code | Create TEST_REQUEST for Antigravity |
| "繧｢繝ｳ繝√げ繝ｩ繝薙ユ繧｣縺ｫ萓晞ｼ", "繧｢繝ｳ繝√げ繝ｩ繝薙ユ繧｣縺ｫ" | Claude Code | Create TEST_REQUEST for Antigravity |
| "螳溯｣・ｮ御ｺ・, "菴懈･ｭ螳御ｺ・ | Gemini CLI | Report completion, request review |
| "繝・せ繝育ｵ先棡", "蝣ｱ蜻・ | Antigravity | Create TEST_REPORT |
| "繝ｬ繝薙Η繝ｼ螳御ｺ・ | Codex | Create REVIEW_REPORT |

### Antigravity Aliases (ALL trigger same action)

The following keywords ALL refer to Antigravity and trigger TEST_REQUEST creation:
- `Antigravity` (豁｣蠑丞錐)
- `antigravity` (蟆乗枚蟄・
- `繧｢繝ｳ繝√げ繝ｩ繝薙ユ繧｣` (譌･譛ｬ隱・

### Auto-Execution Flow

```
User: "Antigravity縺ｫ繝・せ繝医ｒ萓晞ｼ縺励※"
         竊・
Claude Code (auto-detect):
  1. Check: Is project initialized?
     竊・NO: Ask user or auto-init with /workflow:init
     竊・YES: Get project ID
  2. Create TEST_REQUEST using template
  3. Save to: .sd/ai-coordination/workflow/spec/{projectID}/
  4. Record in handoff-log.json
  5. Notify user with file path
```

### Enforcement Rules

| Rule | Enforcement |
|------|-------------|
| All requests/reports in `.sd/ai-coordination/` | MANDATORY |
| Use template for document creation | MANDATORY |
| Record in handoff-log.json | MANDATORY |
| Initialize project before first document | MANDATORY |

---

## 隧ｳ邏ｰ繝峨く繝･繝｡繝ｳ繝・
- `.sd/ai-coordination/workflow/README.md`
- `.sd/ai-coordination/workflow/CODEX_GUIDE.md`
