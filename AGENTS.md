# AGENTS.md - Codex CLI Configuration (SD003)

## 蠖ｹ蜑ｲ縺ｮ譏守｢ｺ蛹・
縺薙・繝輔ぃ繧､繝ｫ縺ｯ**Codex CLI蜈ｨ菴薙・險ｭ螳・*繧貞ｮ夂ｾｩ縺励∪縺吶・
繧ｳ繝ｼ繝峨Ξ繝薙Η繝ｼ譎ゅ・隧ｳ邏ｰ縺ｪ謇矩・・ `.handoff/AGENTS.md` 繧貞盾辣ｧ縺励※縺上□縺輔＞縲・
| 繝輔ぃ繧､繝ｫ | 蠖ｹ蜑ｲ |
|---------|------|
| `AGENTS.md`・医％縺ｮ繝輔ぃ繧､繝ｫ・・| Codex蜈ｨ菴薙・險ｭ螳壹・AI Coordination繝ｻWork Order Review |
| `.handoff/AGENTS.md` | 繧ｳ繝ｼ繝峨Ξ繝薙Η繝ｼ蟆ら畑縺ｮ4谿ｵ髫取焔鬆・|

---

## CRITICAL: AI Coordination Workflow

**Detailed rules: `.claude/rules/workflow/ai-coordination.md`**

### Codex's Role
| Role | Description |
|------|-------------|
| Code Review | Review implementation quality |
| Work Order Review | Approve/reject work orders |
| Quality Gate Check | Verify all gates pass |

### Trigger Keywords (AUTO-EXECUTE)

| Keyword | Action |
|---------|--------|
| "review", "check" | Read request, create REVIEW_REPORT |
| "approved", "approve" | Create approval report |
| "request changes" | Create change request report |

### File Location Rules

**ALL documents in `.sd/ai-coordination/`**

| Read From | Write To |
|-----------|----------|
| `workflow/spec/{projectID}/` | `workflow/review/{projectID}/` |

**PROHIBITED**: Creating files in project root

---

## Task Completion Reporting (MANDATORY)

Every task must end with a report:
```
## Task Completion Report

### Summary
[Completion summary]

### Changes Made
| File | Action | Description |

### Verification Commands
npm test && npm run lint

### Next Steps
- [ ] Next action
```

---

## Development Guidelines

### Core Principles
1. **Spec-Driven Development**: Requirements -> Design -> Tasks -> Implementation
2. **Env Interface Pattern**: GAS API abstraction
3. **8-Stage Quality Gates**: All gates must pass

### Critical Rules
- No Node.js APIs (`fs`, `path`, `process`)
- GAS API via Env Interface only
- Test coverage >=80%
- ESLint errors = 0
- TypeScript strict mode

---

## Workflow Commands

### Specification
```
/prompts:sd-spec-init "description"
/prompts:sd-spec-requirements {feature}
/prompts:sd-spec-design {feature}
/prompts:sd-spec-tasks {feature}
```

### Implementation
```
/prompts:sd-spec-impl {feature}
/prompts:sd-validate-impl {feature}
```

### Claude莠呈鋤繧ｳ繝槭Φ繝牙酔譛・- Source: `.claude/commands/**/*.md`
- Target: `~/.codex/prompts/`
- Sync command: `npm run sync:codex-prompts`
- 繧ｳ繝槭Φ繝牙ｮ溯｡・ `/prompts:<name>`
- 繧ｳ繝槭Φ繝牙呵｣懆｡ｨ遉ｺ: `/` 繧貞・蜉帙＠縺ｦ `prompts:` 縺ｧ邨槭ｊ霎ｼ縺ｿ

萓・
- Claude `/bug-quick` -> Codex `/prompts:bug-quick`
- Claude `/sd:spec-init` -> Codex `/prompts:sd-spec-init` 縺ｾ縺溘・ `/prompts:kiro/spec-init`

---

## Reference
- **AI Coordination**: `.claude/rules/workflow/ai-coordination.md`
- **Quality Gates**: `docs/quality-gates.md`
- **Templates**: `.sd/ai-coordination/workflow/templates/`

---
SD003 Framework v2.11.0 | Updated: 2026-02-11
