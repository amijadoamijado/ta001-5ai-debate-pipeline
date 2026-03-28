# Session Management

## Two-Layer Memory Structure

| Layer | File | Purpose |
|-------|------|---------|
| Long-term | `.sd/sessions/TIMELINE.md` | Project history (timeline) |
| Short-term | `.sd/sessions/session-current.md` | Current session details |

## Commands

| Command | Description |
|---------|-------------|
| `/sessionread` | **Full session load** (4 files) |
| `/sessionwrite` | Save session (history + current + timeline) |
| `/sessionhistory` | View timeline only |

## /sessionread - Complete Session Load

**Reads 4 files in order:**

| Order | File | Purpose |
|-------|------|---------|
| 1 | `D:\claudecode\CLAUDE.md` | Global settings (UTF-8 constraints) |
| 2 | `./CLAUDE.md` | Project settings |
| 3 | `.sd/sessions/session-current.md` | Current session (short-term) |
| 4 | `.sd/sessions/TIMELINE.md` | Project history (long-term) |

**Use at session start to load all context automatically.**

## File Locations

- **History**: `.sd/sessions/session-YYYYMMDD-HHMMSS.md`
- **Latest**: `.sd/sessions/session-current.md`
- **Timeline**: `.sd/sessions/TIMELINE.md`

## Saved Information

- Date, project, branch, latest commit
- Completed items, in-progress items, unresolved issues
- Created/modified files list
- Next session tasks (P0/P1/P2 priority)
- Notes and handoff items

## Session Lifecycle

1. **Start**: Run `/sessionread` (loads all 4 files)
2. **Working**: Checkpoint as needed
3. **End**: `/sessionwrite` for handoff

## Crash Recovery Procedure

When Claude Code crashes unexpectedly:

```bash
# Step 1: Resume conversation context
claude --continue

# Step 2: Load all session context
/sessionread
```

**Important**:
- `--continue` restores conversation context (unsaved work may be visible)
- `/sessionread` loads global + project settings + last saved session + history
- Work done after last `/sessionwrite` requires manual review from `--continue` context

### Recovery Flow

```
Crash occurs
    竊・
claude --continue   竊・Restores conversation (may include unsaved work)
    竊・
/sessionread        竊・Loads all 4 files (global, project, session, timeline)
    竊・
Compare and determine what was lost
    竊・
Continue work
```

## Record Format

```markdown
# Session Record

## Session Info
- **Date**: [YYYY-MM-DD HH:MM:SS]
- **Project**: [path]
- **Branch**: [branch name]
- **Latest Commit**: [hash]

## Progress Summary

### Completed
### In Progress
### Unresolved Issues
### Created/Modified Files

### Next Session Tasks
- P0 (Urgent)
- P1 (Important)
- P2 (Normal)

### Notes
```

## Deployment to New Projects・遺國・・逵∫払遖∵ｭ｢・・

SD002繧呈眠隕上・繝ｭ繧ｸ繧ｧ繧ｯ繝医↓螻暮幕縺吶ｋ髫帙√そ繝・す繝ｧ繝ｳ邂｡逅・・**蠢・医さ繝ｳ繝昴・繝阪Φ繝・*縲・

### 蠢・医ヵ繧｡繧､繝ｫ繝√ぉ繝・け繝ｪ繧ｹ繝・

| # | 繝輔ぃ繧､繝ｫ | 遞ｮ蛻･ | 遒ｺ隱・|
|---|---------|------|------|
| 1 | `.claude/commands/sessionread.md` | 繧ｳ繝斐・ | 笘・|
| 2 | `.claude/commands/sessionwrite.md` | 繧ｳ繝斐・ | 笘・|
| 3 | `.claude/commands/sessionhistory.md` | 繧ｳ繝斐・ | 笘・|
| 4 | `.claude/rules/session/session-management.md` | 繧ｳ繝斐・ | 笘・|
| 5 | `.sd/sessions/session-template.md` | 繧ｳ繝斐・ | 笘・|
| 6 | `.sd/sessions/session-current.md` | **譁ｰ隕丈ｽ懈・** | 笘・|
| 7 | `.sd/sessions/TIMELINE.md` | **譁ｰ隕丈ｽ懈・** | 笘・|

### 豕ｨ諢丈ｺ矩・

- **session-current.md 縺ｨ TIMELINE.md 縺ｯ繧ｳ繝斐・縺ｧ縺ｯ縺ｪ縺乗眠隕丈ｽ懈・縺吶ｋ**・医・繝ｭ繧ｸ繧ｧ繧ｯ繝亥崋譛峨・蛻晄悄蜀・ｮｹ・・
- 螻暮幕蠕後☆縺舌↓ `/sessionread` 縺ｧ蜍穂ｽ懃｢ｺ隱・
- 螟ｱ謨励＠縺溷ｴ蜷・ 荳願ｨ・繝輔ぃ繧､繝ｫ縺ｮ蟄伜惠繧堤｢ｺ隱・

### 螻暮幕繧ｳ繝槭Φ繝・

```bash
/sd:deploy <target-project-path>
```

隧ｳ邏ｰ謇矩・ `.claude/skills/sd-deploy/README.md`
