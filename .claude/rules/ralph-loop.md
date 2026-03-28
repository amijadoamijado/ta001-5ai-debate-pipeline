# Ralph Loop Operation Rules

## Phase-Based Application

| Phase | Ralph Loop | Completion Condition |
|-------|------------|---------------------|
| Early (Phase 1) | Not used | - |
| Midpoint (Phase 2-3) | **Active** | All tests pass |
| Endgame (Phase 4-5) | Max 2 attempts | Same error 2x -> dialogue-resolution |

## Commands

### Primary (Midpoint Phase)
```bash
/sd002:loop-test    # Loop until all tests pass
```

### Supplementary
```bash
/sd002:loop-lint    # Loop until ESLint 0 errors
/sd002:loop-type    # Loop until TypeScript strict passes
```

## Escalation Protocol

### Midpoint Phase
- Use Ralph Loop freely
- No escalation limit
- Stop when tests pass or max iterations reached

### Endgame Phase
```
Same error pattern 1st time -> Ralph auto-fix
Same error pattern 2nd time -> Stop, escalate to /dialogue-resolution
```

## Stop Hooks

| Hook | Phase | Purpose |
|------|-------|---------|
| `sd002-stop-hook.sh` | Midpoint | Loop until completion promise |
| `sd002-stop-hook-endgame.sh` | Endgame | Track error patterns, escalate on 2nd occurrence |

## Environment Variables

```bash
SD002_MAX_ITERATIONS=20       # Max loop iterations
SD002_COMPLETION_PROMISE="ALL_TESTS_PASS"  # Success marker
```

## Integration with SD002 Philosophy

This implements the SD002 error learning principle:

1. **1st error occurrence**: Allowed, auto-fix attempted
2. **2nd same error**: Warning, final Ralph attempt
3. **3rd same error**: Escalate to human collaboration

The Ralph Loop automates steps 1-2. Step 3 requires `/dialogue-resolution`.

## Best Practices

1. **Set clear completion promises** - Use specific markers like `ALL_TESTS_PASS`
2. **Use appropriate phase hooks** - Midpoint vs Endgame
3. **Don't over-iterate** - Set reasonable `max-iterations`
4. **Escalate when stuck** - Use `/dialogue-resolution` for persistent issues

---

## Night Mode (Ralph Wiggum)

螟憺俣閾ｪ蠕句ｮ溯｡檎畑縺ｮ諡｡蠑ｵ繧ｷ繧ｹ繝・Β縲りｩｳ邏ｰ: `.sd/ralph/README.md`

### Two-Layer Architecture

| 鬆・岼 | 譌･荳ｭ・・d002-loop-*・・| 螟憺俣・・alph Wiggum・・|
|------|---------------------|---------------------|
| 繧ｳ繝槭Φ繝・| `/sd002:loop-*` | `/ralph-wiggum:*` |
| max-iterations | 15-20 | 60 |
| 迺ｰ蠅・､画焚 | `SD002_*` | `RALPH_*` |
| 螳御ｺ・・繝ｼ繧ｫ繝ｼ | `ALL_TESTS_PASS` | `RALPH_NIGHTLY_COMPLETE` |
| 繝ｪ繧ｫ繝舌Μ繝ｼ | dialogue-resolution | 7繝代ち繝ｼ繝ｳ閾ｪ蜍・|
| 莠ｺ髢謎ｻ句・ | 髫乗凾蜿ｯ閭ｽ | 繝悶Ο繝・け譎ゅ・縺ｿ |

### Night Mode Commands

```bash
/ralph-wiggum:run     # 螟憺俣繧ｭ繝･繝ｼ螳溯｡・/ralph-wiggum:status  # 螳溯｡檎憾豕∫｢ｺ隱・/ralph-wiggum:plan    # 騾ｱ谺｡險育判菴懈・
```

### Night Mode Environment Variables

```bash
RALPH_MAX_ITERATIONS=60
RALPH_COMPLETION_PROMISE="RALPH_NIGHTLY_COMPLETE"
RALPH_BLOCKED_PROMISE="RALPH_NIGHTLY_BLOCKED"
```

### 7 Recovery Patterns (Night Mode)

| Pattern | Description |
|---------|-------------|
| 1 | Build Error - 蝙九お繝ｩ繝ｼ閾ｪ蜍穂ｿｮ豁｣ |
| 2 | Test Failure - 螳溯｣・繝・せ繝井ｿｮ豁｣ |
| 3 | Lint Error - --fix + 謇句虚菫ｮ豁｣ |
| 4 | Infinite Loop - 驕ｩ蠢懃噪讀懃衍 + 繧ｹ繧ｭ繝・・ |
| 5 | External Dependency - 繧ｵ繝ｼ繧ｭ繝・ヨ繝悶Ξ繝ｼ繧ｫ繝ｼ |
| 6 | Unexpected - graceful-exit・亥・髢句庄閭ｽ・・|
| 7 | Recovery Exhaustion - 繧ｹ繧ｭ繝・・ + 繧ｨ繧ｹ繧ｫ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ |

### Specification

- Requirements: `.sd/specs/ralph-wiggum/requirements.md`
- Design: `.sd/specs/ralph-wiggum/design.md`
