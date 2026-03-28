# SD003繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ螻暮幕繧ｹ繧ｭ繝ｫ v2.3.0

## 菴ｿ逕ｨ譁ｹ豕・

```
/sd:deploy <target-project-path>
```

## 螻暮幕謇矩・

### Step 1: 蟇ｾ雎｡繝励Ο繧ｸ繧ｧ繧ｯ繝域､懆ｨｼ

```bash
TARGET_PROJECT="$1"
if [ ! -d "$TARGET_PROJECT" ]; then
    echo "繧ｨ繝ｩ繝ｼ: 蟇ｾ雎｡繝励Ο繧ｸ繧ｧ繧ｯ繝・'$TARGET_PROJECT' 縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ"
    exit 1
fi
echo "蟇ｾ雎｡繝励Ο繧ｸ繧ｧ繧ｯ繝育｢ｺ隱・ $TARGET_PROJECT"
```

### Step 2: 譌｢蟄倩ｨｭ螳壹ヰ繝・け繧｢繝・・

```bash
BACKUP_DIR="$TARGET_PROJECT/.sd003-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 譌｢蟄倥ヵ繧｡繧､繝ｫ繧偵ヰ繝・け繧｢繝・・
[ -f "$TARGET_PROJECT/CLAUDE.md" ] && cp "$TARGET_PROJECT/CLAUDE.md" "$BACKUP_DIR/"
[ -d "$TARGET_PROJECT/.claude" ] && cp -r "$TARGET_PROJECT/.claude" "$BACKUP_DIR/"
[ -d "$TARGET_PROJECT/.gemini" ] && cp -r "$TARGET_PROJECT/.gemini" "$BACKUP_DIR/"
[ -d "$TARGET_PROJECT/.kiro" ] && cp -r "$TARGET_PROJECT/.kiro" "$BACKUP_DIR/"
```

### Step 3: 繝輔か繝ｫ繝讒矩菴懈・

```bash
# Claude Code
mkdir -p "$TARGET_PROJECT/.claude/commands"
mkdir -p "$TARGET_PROJECT/.claude/commands/kiro"  # v2.7.0霑ｽ蜉
mkdir -p "$TARGET_PROJECT/.claude/rules/global"
mkdir -p "$TARGET_PROJECT/.claude/rules/troubleshooting"
mkdir -p "$TARGET_PROJECT/.claude/skills/dialogue-resolution"

# Gemini CLI
mkdir -p "$TARGET_PROJECT/.gemini/commands"

# SD
mkdir -p "$TARGET_PROJECT/.sd/specs"
mkdir -p "$TARGET_PROJECT/.sd/steering"
mkdir -p "$TARGET_PROJECT/.sd/sessions"
mkdir -p "$TARGET_PROJECT/.sd/settings/templates"
mkdir -p "$TARGET_PROJECT/.sd/settings/rules"
mkdir -p "$TARGET_PROJECT/.sd/ai-coordination/workflow/templates"
mkdir -p "$TARGET_PROJECT/.sd/ai-coordination/workflow/spec"
mkdir -p "$TARGET_PROJECT/.sd/ai-coordination/workflow/review"
mkdir -p "$TARGET_PROJECT/.sd/ai-coordination/workflow/log"
mkdir -p "$TARGET_PROJECT/.sd/ai-coordination/handoff"
mkdir -p "$TARGET_PROJECT/.sd/ids"
mkdir -p "$TARGET_PROJECT/.sd/traceability"

# Docs
mkdir -p "$TARGET_PROJECT/docs/troubleshooting"
```

### Step 4: 繧ｳ繝ｳ繝昴・繝阪Φ繝医さ繝斐・

SD003繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ縺九ｉ莉･荳九ｒ繧ｳ繝斐・:

#### 4-1. Claude Commands・医そ繝・す繝ｧ繝ｳ邂｡逅・- 蠢・茨ｼ・
```bash
SOURCE="path/to/sd003"

# 笞・・繧ｻ繝・す繝ｧ繝ｳ邂｡逅・ｼ育怐逡･遖∵ｭ｢・・
cp "$SOURCE/.claude/commands/sessionread.md" "$TARGET_PROJECT/.claude/commands/"
cp "$SOURCE/.claude/commands/sessionwrite.md" "$TARGET_PROJECT/.claude/commands/"
cp "$SOURCE/.claude/commands/sessionhistory.md" "$TARGET_PROJECT/.claude/commands/"

# 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ
cp "$SOURCE/.claude/commands/workflow-init.md" "$TARGET_PROJECT/.claude/commands/"
cp "$SOURCE/.claude/commands/workflow-order.md" "$TARGET_PROJECT/.claude/commands/"
cp "$SOURCE/.claude/commands/workflow-request.md" "$TARGET_PROJECT/.claude/commands/"
cp "$SOURCE/.claude/commands/workflow-status.md" "$TARGET_PROJECT/.claude/commands/"

# 繝・ヰ繝・げ繝・・繝ｫ・・髫主ｱ､・・
cp "$SOURCE/.claude/commands/bug-quick.md" "$TARGET_PROJECT/.claude/commands/"
cp "$SOURCE/.claude/commands/bug-trace.md" "$TARGET_PROJECT/.claude/commands/"
cp "$SOURCE/.claude/commands/dialogue-resolution.md" "$TARGET_PROJECT/.claude/commands/"
```

#### 4-1b. SD繧ｳ繝槭Φ繝会ｼ井ｻ墓ｧ俶嶌鬧・虚 - 蠢・茨ｼ・
```bash
# 笞・・SD繧ｳ繝槭Φ繝会ｼ育怐逡･遖∵ｭ｢ - v2.7.0霑ｽ蜉・・
mkdir -p "$TARGET_PROJECT/.claude/commands/kiro"
cp -r "$SOURCE/.claude/commands/kiro/"* "$TARGET_PROJECT/.claude/commands/kiro/"

# 蛟句挨繧ｳ繝斐・縺吶ｋ蝣ｴ蜷・
# cp "$SOURCE/.claude/commands/kiro/spec-init.md" "$TARGET_PROJECT/.claude/commands/kiro/"
# cp "$SOURCE/.claude/commands/kiro/spec-requirements.md" "$TARGET_PROJECT/.claude/commands/kiro/"
# cp "$SOURCE/.claude/commands/kiro/spec-design.md" "$TARGET_PROJECT/.claude/commands/kiro/"
# cp "$SOURCE/.claude/commands/kiro/spec-tasks.md" "$TARGET_PROJECT/.claude/commands/kiro/"
# cp "$SOURCE/.claude/commands/kiro/spec-impl.md" "$TARGET_PROJECT/.claude/commands/kiro/"
# cp "$SOURCE/.claude/commands/kiro/spec-status.md" "$TARGET_PROJECT/.claude/commands/kiro/"
# cp "$SOURCE/.claude/commands/kiro/steering.md" "$TARGET_PROJECT/.claude/commands/kiro/"
# cp "$SOURCE/.claude/commands/kiro/steering-custom.md" "$TARGET_PROJECT/.claude/commands/kiro/"
# cp "$SOURCE/.claude/commands/kiro/validate-design.md" "$TARGET_PROJECT/.claude/commands/kiro/"
# cp "$SOURCE/.claude/commands/kiro/validate-gap.md" "$TARGET_PROJECT/.claude/commands/kiro/"
```

#### 4-2. Claude Skills
```bash
cp "$SOURCE/.claude/skills/dialogue-resolution/SKILL.md" "$TARGET_PROJECT/.claude/skills/dialogue-resolution/"
cp "$SOURCE/.claude/skills/dialogue-resolution/README.md" "$TARGET_PROJECT/.claude/skills/dialogue-resolution/"
```

#### 4-3. Claude Rules
```bash
cp -r "$SOURCE/.claude/rules/global/" "$TARGET_PROJECT/.claude/rules/"
cp -r "$SOURCE/.claude/rules/troubleshooting/" "$TARGET_PROJECT/.claude/rules/"
cp -r "$SOURCE/.claude/rules/session/" "$TARGET_PROJECT/.claude/rules/"
```

#### 4-3b. 繝・ヰ繝・げ繝峨く繝･繝｡繝ｳ繝・
```bash
cp "$SOURCE/docs/troubleshooting/bug-quick-patterns.md" "$TARGET_PROJECT/docs/troubleshooting/"
```

#### 4-4. Gemini Commands
```bash
cp "$SOURCE/.gemini/commands/sd-spec-init.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-spec-requirements.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-spec-design.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-spec-tasks.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-spec-impl.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-spec-status.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-validate-design.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-validate-gap.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-validate-impl.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-steering.toml" "$TARGET_PROJECT/.gemini/commands/"
cp "$SOURCE/.gemini/commands/sd-steering-custom.toml" "$TARGET_PROJECT/.gemini/commands/"
```

#### 4-5. SD Settings & Templates
```bash
cp "$SOURCE/.sd/settings/quality-gates.yaml" "$TARGET_PROJECT/.sd/settings/"
cp -r "$SOURCE/.sd/settings/templates/" "$TARGET_PROJECT/.sd/settings/"
cp -r "$SOURCE/.sd/settings/rules/" "$TARGET_PROJECT/.sd/settings/"
cp "$SOURCE/.sd/sessions/session-template.md" "$TARGET_PROJECT/.sd/sessions/"

# 笞・・繧ｻ繝・す繝ｧ繝ｳ蛻晄悄蛹厄ｼ亥ｿ・・- 繧ｳ繝斐・縺ｧ縺ｯ縺ｪ縺乗眠隕丈ｽ懈・・・
cat > "$TARGET_PROJECT/.sd/sessions/session-current.md" << EOF
# Session Record

## Session Info
- **Date**: $(date +%Y-%m-%d) (Initial Setup)
- **Project**: $(basename "$TARGET_PROJECT")
- **Branch**: (not yet checked)
- **Latest Commit**: (not yet checked)

## Progress Summary

### Completed
1. SD003 Framework installed

### In Progress
- None

### Next Session Tasks

#### P0 (Urgent)
- None

#### P1 (Important)
- Configure project-specific settings

### Notes
Initial session setup from SD003 framework.
EOF

cat > "$TARGET_PROJECT/.sd/sessions/TIMELINE.md" << EOF
# $(basename "$TARGET_PROJECT") Project Timeline

> Auto-generated - Updated on /sessionwrite execution

---

## $(date +%Y)

### $(date +%B)

| Date | Main Work | Commit | Details |
|------|-----------|--------|---------|
| $(date +%m-%d) | SD003 Framework Setup | - | [Details](session-current.md) |

---

## Statistics

- Total Sessions: 1
- First Session: $(date +%Y-%m-%d)
- Latest Session: $(date +%Y-%m-%d)
EOF
```

#### 4-6. AI Coordination Workflow
```bash
cp "$SOURCE/.sd/ai-coordination/workflow/README.md" "$TARGET_PROJECT/.sd/ai-coordination/workflow/"
cp "$SOURCE/.sd/ai-coordination/workflow/CODEX_GUIDE.md" "$TARGET_PROJECT/.sd/ai-coordination/workflow/"
cp -r "$SOURCE/.sd/ai-coordination/workflow/templates/" "$TARGET_PROJECT/.sd/ai-coordination/workflow/"
```

#### 4-7. Docs
```bash
cp "$SOURCE/docs/troubleshooting/RESOLUTION_LOG.md" "$TARGET_PROJECT/docs/troubleshooting/"
cp "$SOURCE/docs/quality-gates.md" "$TARGET_PROJECT/docs/" 2>/dev/null || true
```

### Step 5: CLAUDE.md逕滓・

3繝輔ぉ繝ｼ繧ｺ髢狗匱謌ｦ逡･繧貞渚譏縺励◆CLAUDE.md繧堤函謌・

```markdown
# {PROJECT_NAME} - SD003繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ

## 髢狗匱繝輔ぉ繝ｼ繧ｺ謌ｦ逡･

### 蠎冗乢: 險育判繝輔ぉ繝ｼ繧ｺ
**莉墓ｧ俶嶌繝輔ぃ繝ｼ繧ｹ繝・* + **繝輔Ο繝ｳ繝医お繝ｳ繝蛾ｧ・虚**

- 隕∽ｻｶ螳夂ｾｩ 竊・險ｭ險・竊・繧ｿ繧ｹ繧ｯ蛻・ｧ｣ 縺ｮ鬆・ｺ丞宍螳・
- UI繝｢繝・け/繝ｯ繧､繝､繝ｼ繝輔Ξ繝ｼ繝繧貞・縺ｫ蝗ｺ繧√ｋ
- 繝ｦ繝ｼ繧ｶ繝ｼ菴馴ｨ薙ｒ襍ｷ轤ｹ縺ｫ繝舌ャ繧ｯ繧ｨ繝ｳ繝峨ｒ險ｭ險・

**繧ｳ繝槭Φ繝・**
- `/sd:spec-init {feature}` - 莉墓ｧ俶嶌蛻晄悄蛹・
- `/sd:spec-requirements {feature}` - 隕∽ｻｶ螳夂ｾｩ
- `/sd:spec-design {feature}` - 謚陦楢ｨｭ險・

### 荳ｭ逶､: 螳溯｣・ヵ繧ｧ繝ｼ繧ｺ
**AI蜊碑ｪｿ繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ** + **鬮倬溘う繝・Ξ繝ｼ繧ｷ繝ｧ繝ｳ**

- Claude Code: 險育判繝ｻ蟾･遞狗ｮ｡逅・
- Codex: 繝ｬ繝薙Η繝ｼ繝ｻ蜩∬ｳｪ繝√ぉ繝・け
- Gemini CLI: 鬮倬溷ｮ溯｣・
- 90%騾溷ｺｦ蜆ｪ蜈医∫ｴｰ縺九＞菫ｮ豁｣縺ｯ蠕後〒

**繧ｳ繝槭Φ繝・**
- `/workflow:init {slug}` - 譯井ｻｶ蛻晄悄蛹・
- `/workflow:order {譯井ｻｶID}` - 逋ｺ豕ｨ譖ｸ菴懈・
- `/workflow:request {譯井ｻｶID} {逡ｪ蜿ｷ}` - 螳溯｣・欠遉ｺ

### 邨ら乢: 螳梧・繝輔ぉ繝ｼ繧ｺ
**蟇ｾ隧ｱ蝙玖ｧ｣豎ｺ豕・* + **譛ｬ逡ｪ繝｢繝ｼ繝・*

- 繧ｨ繝ｩ繝ｼ蜿取據縺励↑縺・竊・`/dialogue-resolution`
- 縲梧悽逡ｪ縲阪く繝ｼ繝ｯ繝ｼ繝峨〒蜩∬ｳｪ繧ｲ繝ｼ繝亥・騾夐℃蠢・・
- 蜚ｯ荳縺ｮ謌仙粥蝓ｺ貅・縲悟ｿ・★蜍輔￥縲・

**繧ｳ繝槭Φ繝・**
- `/dialogue-resolution {繧ｨ繝ｩ繝ｼ蜀・ｮｹ}` - 蟇ｾ隧ｱ蝙句撫鬘瑚ｧ｣豎ｺ
- `/sd:validate-impl {feature}` - 螳溯｣・､懆ｨｼ

## 繧ｻ繝・す繝ｧ繝ｳ邂｡逅・
- `/sessionread` - 蜑榊屓繧ｻ繝・す繝ｧ繝ｳ隱ｭ霎ｼ
- `/sessionwrite` - 繧ｻ繝・す繝ｧ繝ｳ菫晏ｭ・

## 隧ｳ邏ｰ繝峨く繝･繝｡繝ｳ繝・
蠢・ｦ∵凾縺ｮ縺ｿ蜿ら・: `docs/` 驟堺ｸ・

---
SD003 v2.3.0 | 蟆主・譌･: {DATE}
```

### Step 6: gemini.md逕滓・

```markdown
# {PROJECT_NAME} - Gemini CLI險ｭ螳・

## 蛻ｩ逕ｨ蜿ｯ閭ｽ繧ｳ繝槭Φ繝・

### 莉墓ｧ俶嶌鬧・虚髢狗匱
- `/sd:spec-init` - 莉墓ｧ俶嶌蛻晄悄蛹・
- `/sd:spec-requirements` - 隕∽ｻｶ螳夂ｾｩ
- `/sd:spec-design` - 謚陦楢ｨｭ險・
- `/sd:spec-tasks` - 繧ｿ繧ｹ繧ｯ蛻・ｧ｣
- `/sd:spec-impl` - TDD螳溯｣・
- `/sd:spec-status` - 騾ｲ謐礼｢ｺ隱・

### 讀懆ｨｼ
- `/sd:validate-design` - 險ｭ險域､懆ｨｼ
- `/sd:validate-gap` - 繧ｮ繝｣繝・・蛻・梵
- `/sd:validate-impl` - 螳溯｣・､懆ｨｼ

### 繧ｹ繝・い繝ｪ繝ｳ繧ｰ
- `/sd:steering` - 繧ｹ繝・い繝ｪ繝ｳ繧ｰ譁・嶌菴懈・
- `/sd:steering-custom` - 繧ｫ繧ｹ繧ｿ繝繧ｹ繝・い繝ｪ繝ｳ繧ｰ

---
SD003 v2.3.0
```

### Step 7: 繝・・繧ｿ繧ｹ繝医い蛻晄悄蛹・

```bash
# ID Registry
cat > "$TARGET_PROJECT/.sd/ids/registry.json" << EOF
{
  "version": "1.0.0",
  "created": "$(date -Iseconds)",
  "project": "$(basename "$TARGET_PROJECT")",
  "requirements": {},
  "specifications": {},
  "last_updated": "$(date -Iseconds)"
}
EOF

# Handoff Log
cat > "$TARGET_PROJECT/.sd/ai-coordination/handoff/handoff-log.json" << EOF
{
  "version": "2.0.0",
  "entries": []
}
EOF
```

### Step 8: 讀懆ｨｼ

```bash
# 蠢・医ョ繧｣繝ｬ繧ｯ繝医Μ遒ｺ隱・
REQUIRED_DIRS=(
    ".claude/commands"
    ".claude/skills/dialogue-resolution"
    ".claude/rules"
    ".gemini/commands"
    ".sd/specs"
    ".sd/steering"
    ".sd/sessions"
    ".sd/settings"
    ".sd/ai-coordination/workflow"
    "docs/troubleshooting"
)

# 蠢・医ヵ繧｡繧､繝ｫ遒ｺ隱・
REQUIRED_FILES=(
    # 蝓ｺ譛ｬ險ｭ螳・
    "CLAUDE.md"
    "gemini.md"

    # 笞・・繧ｻ繝・す繝ｧ繝ｳ邂｡逅・ｼ育怐逡･遖∵ｭ｢・・
    ".claude/commands/sessionread.md"
    ".claude/commands/sessionwrite.md"
    ".claude/commands/sessionhistory.md"
    ".sd/sessions/session-current.md"
    ".sd/sessions/session-template.md"
    ".sd/sessions/TIMELINE.md"
    ".claude/rules/session/session-management.md"

    # 笞・・SD繧ｳ繝槭Φ繝会ｼ育怐逡･遖∵ｭ｢ - v2.7.0霑ｽ蜉・・
    ".claude/commands/kiro/spec-init.md"
    ".claude/commands/kiro/spec-requirements.md"
    ".claude/commands/kiro/spec-design.md"
    ".claude/commands/kiro/spec-tasks.md"
    ".claude/commands/kiro/spec-impl.md"
    ".claude/commands/kiro/spec-status.md"
    ".claude/commands/kiro/spec-quick.md"
    ".claude/commands/kiro/steering.md"
    ".claude/commands/kiro/steering-custom.md"
    ".claude/commands/kiro/validate-design.md"
    ".claude/commands/kiro/validate-gap.md"
    ".claude/commands/kiro/validate-impl.md"
    ".claude/commands/kiro/ai-report.md"
    ".claude/commands/kiro/ai-request.md"
    ".claude/commands/kiro/deploy.md"

    # 繝・ヰ繝・げ繝・・繝ｫ・・髫主ｱ､・・
    ".claude/commands/bug-quick.md"
    ".claude/commands/bug-trace.md"
    ".claude/commands/dialogue-resolution.md"
    ".claude/rules/troubleshooting/bug-quick.md"
    "docs/troubleshooting/bug-quick-patterns.md"

    # 繧ｹ繧ｭ繝ｫ繝ｻ縺昴・莉・
    ".claude/skills/dialogue-resolution/SKILL.md"
    ".sd/settings/quality-gates.yaml"
    "docs/troubleshooting/RESOLUTION_LOG.md"
)
```

## 螻暮幕繝ｬ繝昴・繝・

```
=== SD003繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ螻暮幕螳御ｺ・(v2.10.0) ===

縲仙ｱ暮幕縺輔ｌ縺溘さ繝ｳ繝昴・繝阪Φ繝医・

笆 Claude Commands: 10蛟・+ SD繧ｳ繝槭Φ繝・7蛟・
  笏懌楳 繧ｻ繝・す繝ｧ繝ｳ邂｡逅・ｼ亥ｿ・茨ｼ・
  笏・  笏懌楳 sessionread
  笏・  笏懌楳 sessionwrite
  笏・  笏披楳 sessionhistory
  笏懌楳 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ
  笏・  笏懌楳 workflow-init
  笏・  笏懌楳 workflow-order
  笏・  笏懌楳 workflow-request
  笏・  笏披楳 workflow-status
  笏懌楳 繝・ヰ繝・げ繝・・繝ｫ・・髫主ｱ､・・
  笏・  笏懌楳 bug-quick       (5-15蛻・
  笏・  笏懌楳 bug-trace       (30-60蛻・
  笏・  笏披楳 dialogue-resolution
  笏披楳 SD繧ｳ繝槭Φ繝会ｼ・2.7.0霑ｽ蜉 - 蠢・茨ｼ・
      笏懌楳 spec-init, spec-requirements, spec-design
      笏懌楳 spec-tasks, spec-impl, spec-status, spec-quick
      笏懌楳 steering, steering-custom
      笏懌楳 validate-design, validate-gap, validate-impl
      笏披楳 ai-report, ai-request, deploy

笆 Claude Rules: 3繧ｫ繝・ざ繝ｪ
  笏懌楳 global/
  笏懌楳 troubleshooting/
  笏披楳 session/  竊・繧ｻ繝・す繝ｧ繝ｳ邂｡逅・Ν繝ｼ繝ｫ

笆 Claude Skills: 1蛟・
  笏披楳 dialogue-resolution

笆 繧ｻ繝・す繝ｧ繝ｳ繝輔ぃ繧､繝ｫ・亥ｿ・医・蛻晄悄蛹匁ｸ医∩・・
  笏懌楳 .sd/sessions/session-current.md  竊・譁ｰ隕丈ｽ懈・
  笏懌楳 .sd/sessions/TIMELINE.md         竊・譁ｰ隕丈ｽ懈・
  笏披楳 .sd/sessions/session-template.md

笆 Gemini Commands: 11蛟・
  笏披楳 sd-spec-*, sd-validate-*, sd-steering*

笆 SD Settings:
  笏懌楳 quality-gates.yaml
  笏懌楳 templates/, rules/
  笏披楳 sessions/

笆 AI Coordination:
  笏披楳 workflow/, handoff/

笆 Docs:
  笏懌楳 troubleshooting/RESOLUTION_LOG.md
  笏披楳 troubleshooting/bug-quick-patterns.md

縲・繝輔ぉ繝ｼ繧ｺ髢狗匱謌ｦ逡･縲・
蠎冗乢: 莉墓ｧ俶嶌繝輔ぃ繝ｼ繧ｹ繝・+ 繝輔Ο繝ｳ繝医お繝ｳ繝蛾ｧ・虚
荳ｭ逶､: AI蜊碑ｪｿ繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ + 鬮倬溘う繝・Ξ繝ｼ繧ｷ繝ｧ繝ｳ
邨ら乢: 蟇ｾ隧ｱ蝙玖ｧ｣豎ｺ豕・+ 譛ｬ逡ｪ繝｢繝ｼ繝・
```

## 繝医Λ繝悶Ν繧ｷ繝･繝ｼ繝・ぅ繝ｳ繧ｰ

### 繧ｳ繝槭Φ繝峨′隱崎ｭ倥＆繧後↑縺・
1. Claude Code繧貞・襍ｷ蜍・
2. `.claude/commands/` 驟堺ｸ九↓繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺吶ｋ縺狗｢ｺ隱・

### 繧ｹ繧ｭ繝ｫ縺瑚ｪ崎ｭ倥＆繧後↑縺・
1. `.claude/skills/` 驟堺ｸ九↓ `SKILL.md` 縺悟ｭ伜惠縺吶ｋ縺狗｢ｺ隱・
2. YAML frontmatter縺ｮ蠖｢蠑上ｒ遒ｺ隱・

### Gemini繧ｳ繝槭Φ繝峨′蜍穂ｽ懊＠縺ｪ縺・
1. `.gemini/commands/` 驟堺ｸ九↓ `.toml` 繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺吶ｋ縺狗｢ｺ隱・
2. Gemini CLI繧貞・襍ｷ蜍・
