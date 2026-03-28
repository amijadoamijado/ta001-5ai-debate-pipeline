---
description: "SD001繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ縺ｮ繝励Ο繧ｸ繧ｧ繧ｯ繝亥ｱ暮幕"
---

# SD001繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ螻暮幕繧ｷ繧ｹ繝・Β

## 菴ｿ逕ｨ譁ｹ豕・
`/sd:deploy <target-project-path>`

## 1. 蟇ｾ雎｡繝励Ο繧ｸ繧ｧ繧ｯ繝域､懆ｨｼ
{{#exec}}
TARGET_PROJECT="${1:-../rf002}"
echo "=== 蟇ｾ雎｡繝励Ο繧ｸ繧ｧ繧ｯ繝・ $TARGET_PROJECT ==="

if [ ! -d "$TARGET_PROJECT" ]; then
    echo "笶・繧ｨ繝ｩ繝ｼ: 蟇ｾ雎｡繝励Ο繧ｸ繧ｧ繧ｯ繝・'$TARGET_PROJECT' 縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ"
    exit 1
fi

echo "笨・蟇ｾ雎｡繝励Ο繧ｸ繧ｧ繧ｯ繝育｢ｺ隱・ $TARGET_PROJECT"
{{/exec}}

## 2. 譌｢蟄倩ｨｭ螳壹ヰ繝・け繧｢繝・・
{{#exec}}
TARGET_PROJECT="${1:-../rf002}"
BACKUP_DIR="$TARGET_PROJECT/.sd001-backup-$(date +%Y%m%d_%H%M%S)"

echo "=== 繝舌ャ繧ｯ繧｢繝・・菴懈・: $BACKUP_DIR ==="
mkdir -p "$BACKUP_DIR"

# 譌｢蟄倩ｨｭ螳壹ヵ繧｡繧､繝ｫ縺ｮ繝舌ャ繧ｯ繧｢繝・・
[ -f "$TARGET_PROJECT/agents.md" ] && cp "$TARGET_PROJECT/agents.md" "$BACKUP_DIR/"
[ -f "$TARGET_PROJECT/gemini.md" ] && cp "$TARGET_PROJECT/gemini.md" "$BACKUP_DIR/"
[ -f "$TARGET_PROJECT/CLAUDE.md" ] && cp "$TARGET_PROJECT/CLAUDE.md" "$BACKUP_DIR/"
[ -d "$TARGET_PROJECT/.agents" ] && cp -r "$TARGET_PROJECT/.agents" "$BACKUP_DIR/"
[ -d "$TARGET_PROJECT/.claude" ] && cp -r "$TARGET_PROJECT/.claude" "$BACKUP_DIR/"
[ -d "$TARGET_PROJECT/.gemini" ] && cp -r "$TARGET_PROJECT/.gemini" "$BACKUP_DIR/"
[ -d "$TARGET_PROJECT/.kiro" ] && cp -r "$TARGET_PROJECT/.kiro" "$BACKUP_DIR/"

echo "笨・繝舌ャ繧ｯ繧｢繝・・螳御ｺ・ $BACKUP_DIR"
{{/exec}}

## 3. 繝輔か繝ｫ繝讒矩菴懈・
{{#exec}}
TARGET_PROJECT="${1:-../rf002}"

echo "=== 繝輔か繝ｫ繝讒矩菴懈・ ==="
mkdir -p "$TARGET_PROJECT/.agents/reports"
mkdir -p "$TARGET_PROJECT/.claude/commands/kiro"
mkdir -p "$TARGET_PROJECT/.gemini/handoffs"
mkdir -p "$TARGET_PROJECT/.sd/specs"
mkdir -p "$TARGET_PROJECT/.sd/ids"
mkdir -p "$TARGET_PROJECT/.sd/_frozen"
mkdir -p "$TARGET_PROJECT/.sd/sync-reports"
mkdir -p "$TARGET_PROJECT/.sd/traceability"

echo "笨・繝輔か繝ｫ繝讒矩菴懈・螳御ｺ・
{{/exec}}

## 4. 險ｭ螳壹ヵ繧｡繧､繝ｫ繧ｳ繝斐・
{{#exec}}
TARGET_PROJECT="${1:-../rf002}"
SOURCE_PROJECT="."

echo "=== 險ｭ螳壹ヵ繧｡繧､繝ｫ繧ｳ繝斐・ ==="

# 繝ｫ繝ｼ繝医Ξ繝吶Ν險ｭ螳壹ヵ繧｡繧､繝ｫ
cp "$SOURCE_PROJECT/agents.md" "$TARGET_PROJECT/"
cp "$SOURCE_PROJECT/gemini.md" "$TARGET_PROJECT/"

# Claude繧ｳ繝槭Φ繝峨ヵ繧｡繧､繝ｫ
cp "$SOURCE_PROJECT/.claude/commands/cc-vibe-detect.md" "$TARGET_PROJECT/.claude/commands/"
cp "$SOURCE_PROJECT/.claude/commands/cc-vibe-sync.md" "$TARGET_PROJECT/.claude/commands/"
cp "$SOURCE_PROJECT/.claude/commands/cc-vibe-update.md" "$TARGET_PROJECT/.claude/commands/"
cp -r "$SOURCE_PROJECT/.claude/commands/kiro/" "$TARGET_PROJECT/.claude/commands/"

echo "笨・險ｭ螳壹ヵ繧｡繧､繝ｫ繧ｳ繝斐・螳御ｺ・
{{/exec}}

## 5. 繝・・繧ｿ繧ｹ繝医い蛻晄悄蛹・
{{#exec}}
TARGET_PROJECT="${1:-../rf002}"

echo "=== 繝・・繧ｿ繧ｹ繝医い蛻晄悄蛹・==="

# ID 繝ｬ繧ｸ繧ｹ繝医Μ蛻晄悄蛹・
cat > "$TARGET_PROJECT/.sd/ids/registry.json" << EOF
{
  "version": "1.0.0",
  "created": "$(date -Iseconds)",
  "project": "$(basename "$TARGET_PROJECT")",
  "requirements": {},
  "specifications": {},
  "acceptance_criteria": {},
  "last_updated": "$(date -Iseconds)"
}
EOF

# Frozen隕∽ｻｶ蛻晄悄繝・Φ繝励Ξ繝ｼ繝・
cat > "$TARGET_PROJECT/.sd/_frozen/requirements.lock.md" << EOF
# $(basename "$TARGET_PROJECT") 蜃咲ｵ占ｦ∽ｻｶ螳夂ｾｩ譖ｸ

**蜃咲ｵ先律譎・*: $(date -Iseconds)
**繝励Ο繧ｸ繧ｧ繧ｯ繝・*: $(basename "$TARGET_PROJECT")
**繝舌・繧ｸ繝ｧ繝ｳ**: 1.0.0

## 蜃咲ｵ舌＆繧後◆隕∽ｻｶ

### 蛻晄悄險ｭ螳壼ｮ御ｺ・
- **蜆ｪ蜈亥ｺｦ**: High
- **繧ｹ繝・・繧ｿ繧ｹ**: 蛻晄悄蛹匁ｸ医∩
- **謇ｿ隱崎・*: 繧ｷ繧ｹ繝・Β
- **謇ｿ隱肴律**: $(date +%Y-%m-%d)

**讎りｦ・*: SD001繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ縺ｮ蛻晄悄蟆主・縺悟ｮ御ｺ・＠縺ｾ縺励◆

## 螟画峩謇ｿ隱阪・繝ｭ繧ｻ繧ｹ
1. 蜃咲ｵ占ｦ∽ｻｶ縺ｮ螟画峩縺ｯ **繝励Ο繝繧ｯ繝医が繝ｼ繝翫・謇ｿ隱・* 縺悟ｿ・ｦ・
2. 螟画峩蠖ｱ髻ｿ蛻・梵縺ｮ螳滓命縺悟ｿ・ｦ・

## 逶｣譟ｻ繝ｭ繧ｰ
- $(date +%Y-%m-%d): SD001繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ蛻晄悄蟆主・
EOF

echo "笨・繝・・繧ｿ繧ｹ繝医い蛻晄悄蛹門ｮ御ｺ・
{{/exec}}

## 6. CLAUDE.md譖ｴ譁ｰ
{{#exec}}
TARGET_PROJECT="${1:-../rf002}"

echo "=== CLAUDE.md譖ｴ譁ｰ ==="

if [ -f "$TARGET_PROJECT/CLAUDE.md" ]; then
    # 譌｢蟄呂LAUDE.md縺ｫ霑ｽ險・
    echo "" >> "$TARGET_PROJECT/CLAUDE.md"
    echo "## SD001繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ邨ｱ蜷・ >> "$TARGET_PROJECT/CLAUDE.md"
    echo "- **蟆主・譌･**: $(date +%Y-%m-%d)" >> "$TARGET_PROJECT/CLAUDE.md"
    echo "- **繝舌・繧ｸ繝ｧ繝ｳ**: v2.0" >> "$TARGET_PROJECT/CLAUDE.md"
    echo "- **蛻ｩ逕ｨ蜿ｯ閭ｽ繧ｳ繝槭Φ繝・*: /cc-vibe-detect, /cc-vibe-sync, /cc-vibe-update" >> "$TARGET_PROJECT/CLAUDE.md"
    echo "" >> "$TARGET_PROJECT/CLAUDE.md"
else
    # 譁ｰ隕修LAUDE.md菴懈・
    cat > "$TARGET_PROJECT/CLAUDE.md" << EOF
# $(basename "$TARGET_PROJECT") - SD001繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ邨ｱ蜷・

## SD001繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ邨ｱ蜷・
- **蟆主・譌･**: $(date +%Y-%m-%d)
- **繝舌・繧ｸ繝ｧ繝ｳ**: v2.0
- **蛻ｩ逕ｨ蜿ｯ閭ｽ繧ｳ繝槭Φ繝・*: /cc-vibe-detect, /cc-vibe-sync, /cc-vibe-update

## 菴ｿ逕ｨ髢句ｧ区焔鬆・
1. \`/cc-vibe-detect\` 縺ｧ螟画峩讀懷・繝・せ繝・
2. \`/cc-vibe-sync\` 縺ｧ莉墓ｧ俶嶌蜷梧悄螳溯｡・
3. \`.sd/specs/\` 縺ｫ莉墓ｧ俶嶌繧定ｿｽ蜉
EOF
fi

echo "笨・CLAUDE.md譖ｴ譁ｰ螳御ｺ・
{{/exec}}

## 7. 繧ｻ繝・ヨ繧｢繝・・讀懆ｨｼ
{{#exec}}
TARGET_PROJECT="${1:-../rf002}"

echo "=== 繧ｻ繝・ヨ繧｢繝・・讀懆ｨｼ ==="

# 蠢・医ョ繧｣繝ｬ繧ｯ繝医Μ遒ｺ隱・
REQUIRED_DIRS=(
    "$TARGET_PROJECT/.agents/reports"
    "$TARGET_PROJECT/.claude/commands"
    "$TARGET_PROJECT/.gemini/handoffs"
    "$TARGET_PROJECT/.sd/specs"
    "$TARGET_PROJECT/.sd/ids"
    "$TARGET_PROJECT/.sd/_frozen"
)

ERROR_COUNT=0
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "笶・谺關ｽ: $dir"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    else
        echo "笨・遒ｺ隱・ $dir"
    fi
done

# 蠢・医ヵ繧｡繧､繝ｫ遒ｺ隱・
REQUIRED_FILES=(
    "$TARGET_PROJECT/agents.md"
    "$TARGET_PROJECT/gemini.md"
    "$TARGET_PROJECT/.claude/commands/cc-vibe-detect.md"
    "$TARGET_PROJECT/.sd/ids/registry.json"
    "$TARGET_PROJECT/.sd/_frozen/requirements.lock.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "笶・谺關ｽ: $file"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    else
        echo "笨・遒ｺ隱・ $file"
    fi
done

if [ $ERROR_COUNT -eq 0 ]; then
    echo "笨・繧ｻ繝・ヨ繧｢繝・・讀懆ｨｼ謌仙粥"
else
    echo "笶・繧ｻ繝・ヨ繧｢繝・・讀懆ｨｼ螟ｱ謨・ $ERROR_COUNT 蛟九・繧ｨ繝ｩ繝ｼ"
fi
{{/exec}}

## 8. 螻暮幕繝ｬ繝昴・繝育函謌・
{{#exec}}
TARGET_PROJECT="${1:-../rf002}"

echo "=== SD001繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ螻暮幕螳御ｺ・Ξ繝昴・繝・==="
echo "螻暮幕蜈・ $TARGET_PROJECT"
echo "螳溯｡梧凾蛻ｻ: $(date)"
echo ""
echo "縲仙ｱ暮幕縺輔ｌ縺滓ｩ溯・縲・
echo "- 笨・繧ｨ繝ｼ繧ｸ繧ｧ繝ｳ繝亥鵠隱ｿ繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ (agents.md)"
echo "- 笨・Gemini CLI邨ｱ蜷・(gemini.md)"
echo "- 笨・Claude Code繧ｹ繝ｩ繝・す繝･繧ｳ繝槭Φ繝・(/cc-vibe-*)"
echo "- 笨・SD繧ｹ繝壹ャ繧ｯ鬧・虚髢狗匱繧ｷ繧ｹ繝・Β"
echo "- 笨・隕∽ｻｶ繝医Ξ繝ｼ繧ｵ繝薙Μ繝・ぅ繧ｷ繧ｹ繝・Β"
echo "- 笨・蜃咲ｵ占ｦ∽ｻｶ邂｡逅・す繧ｹ繝・Β"
echo ""
echo "縲先ｬ｡縺ｮ謇矩・・
echo "1. cd $TARGET_PROJECT"
echo "2. /cc-vibe-detect 縺ｧ繧ｷ繧ｹ繝・Β蜍穂ｽ懃｢ｺ隱・
echo "3. .sd/specs/ 縺ｫ莉墓ｧ俶嶌霑ｽ蜉"
echo "4. /cc-vibe-sync 縺ｧ蜷梧悄髢句ｧ・
echo ""
echo "脂 SD001繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ螻暮幕螳御ｺ・ｼ・
{{/exec}}