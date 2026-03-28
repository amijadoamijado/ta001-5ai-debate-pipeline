---
description: Generate detailed execution plan from analysis
allowed-tools: Task, Read, Write, Bash, Glob, Grep, TodoWrite
---

# /refactor:plan

蛻・梵繝ｬ繝昴・繝医°繧芽ｩｳ邏ｰ縺ｪ繝舌ャ繝∝ｮ溯｡瑚ｨ育判繧堤函謌舌☆繧九・
## Usage

```
/refactor:plan [session-id]
```

**Arguments:**
- `session-id`: ・医が繝励す繝ｧ繝ｳ・・refactor:init縺ｧ逕滓・縺輔ｌ縺溘そ繝・す繝ｧ繝ｳID縲ら怐逡･譎ゅ・譛譁ｰ繧剃ｽｿ逕ｨ縲・
## Prerequisites

- `/refactor:init`縺梧ｭ｣蟶ｸ縺ｫ螳御ｺ・＠縺ｦ縺・ｋ縺薙→
- 蛻・梵繝ｬ繝昴・繝医′`.sd/refactor/plans/{session-id}/analysis-report.md`縺ｫ蟄伜惠縺吶ｋ縺薙→

## Execution Steps

### Step 1: Load Analysis

Read analysis report and extract:
- File list with dependencies
- Risk assessment
- Pattern guidelines

### Step 2: Batch Optimization

Using Plan agent, create optimal batch order:

```
Prompt: Create batch execution plan for refactoring.

Input:
- Analysis report: {analysis_content}
- Max batch size: 15 files
- Priority: Minimize risk, maximize independence

Output:
- Ordered batch list
- Dependency constraints
- Checkpoint strategy
```

### Step 3: Generate Batch Manifest

Create batch manifest JSON:

```json
{
  "session_id": "refactor-20260101-160000",
  "scope": "rename getUserById to fetchUser",
  "total_files": 15,
  "total_batches": 3,
  "batches": [
    {
      "id": "batch-001",
      "name": "Core interfaces",
      "files": [
        "src/interfaces/IUser.ts",
        "src/types/user.ts"
      ],
      "dependencies": [],
      "checkpoint_required": true,
      "test_scope": "unit",
      "estimated_changes": 5
    },
    {
      "id": "batch-002",
      "name": "Service layer",
      "files": [
        "src/services/user-service.ts",
        "src/services/auth-service.ts"
      ],
      "dependencies": ["batch-001"],
      "checkpoint_required": true,
      "test_scope": "unit,integration",
      "estimated_changes": 12
    },
    {
      "id": "batch-003",
      "name": "Handler layer",
      "files": [
        "src/handlers/user-handler.ts",
        "src/handlers/api-handler.ts"
      ],
      "dependencies": ["batch-002"],
      "checkpoint_required": true,
      "test_scope": "all",
      "estimated_changes": 8
    }
  ],
  "quality_gates": {
    "after_each_batch": ["lint", "type"],
    "after_all_batches": ["test", "build"]
  },
  "rollback_strategy": "checkpoint-per-batch"
}
```

Save to: `.sd/refactor/plans/{session-id}/batch-manifest.json`

### Step 4: Generate Execution Plan Document

Create human-readable plan:

```markdown
# Refactoring Execution Plan

## Session: {session-id}
## Scope: {scope}

## Batch Schedule

### Batch 1: Core interfaces
**Files:** 2
**Risk:** Low
**Checkpoint:** Yes

| File | Changes |
|------|---------|
| src/interfaces/IUser.ts | Rename interface method |
| src/types/user.ts | Update type references |

**Tests:** Unit tests only
**Rollback:** checkpoint-001

---

### Batch 2: Service layer
**Files:** 2
**Risk:** Medium
**Checkpoint:** Yes
**Depends on:** Batch 1

| File | Changes |
|------|---------|
| src/services/user-service.ts | Update method calls |
| src/services/auth-service.ts | Update imports |

**Tests:** Unit + Integration
**Rollback:** checkpoint-002

---

### Batch 3: Handler layer
**Files:** 2
**Risk:** Medium
**Checkpoint:** Yes
**Depends on:** Batch 2

| File | Changes |
|------|---------|
| src/handlers/user-handler.ts | Update API calls |
| src/handlers/api-handler.ts | Update route handlers |

**Tests:** Full test suite
**Rollback:** checkpoint-003

---

## Quality Gates

| After | Gates |
|-------|-------|
| Each batch | ESLint, TypeScript |
| All batches | Full test suite, Build |

## Estimated Timeline

- Batch 1: ~5 min
- Batch 2: ~8 min
- Batch 3: ~10 min
- Quality verification: ~5 min
- **Total: ~28 min**

## Recovery Plan

If any batch fails:
1. Session auto-saved by session-autosave skill
2. rollback-guard proposes recovery options
3. Use `/refactor:rollback checkpoint-{N}` to restore
```

Save to: `.sd/refactor/plans/{session-id}/execution-plan.md`

### Step 5: Update Todo List

Create TodoWrite entries for each batch:

```
1. [pending] Execute Batch 1: Core interfaces (2 files)
2. [pending] Execute Batch 2: Service layer (2 files)
3. [pending] Execute Batch 3: Handler layer (2 files)
4. [pending] Run final quality gates
5. [pending] Complete refactoring session
```

### Step 6: Confirmation

Output:

```
REFACTOR_PLAN_COMPLETE

Execution plan generated:
- Batches: 3
- Total files: 6
- Estimated time: 28 min

Plan saved to: .sd/refactor/plans/{session-id}/

Next step: /refactor:batch to start execution
```

## Output Markers

| Marker | Meaning |
|--------|---------|
| `REFACTOR_PLAN_COMPLETE` | Plan generated successfully |
| `REFACTOR_PLAN_FAILED` | Plan generation failed |

## Files Created

```
.sd/refactor/plans/{session-id}/
笏懌楳笏 analysis-report.md (from /refactor:init)
笏懌楳笏 batch-manifest.json (NEW)
笏披楳笏 execution-plan.md (NEW)
```

## Batch Ordering Rules

1. **Leaf files first**: Files with no dependents
2. **Interface before implementation**: Type definitions first
3. **Core before edge**: Central modules before peripheral
4. **Test files last**: Update tests after source

## Error Handling

| Error | Action |
|-------|--------|
| No analysis found | Suggest running /refactor:init first |
| Circular dependency | Merge affected files into single batch |
| Too many files | Increase batch count, reduce size |
