# 繝ｪ繝輔ぃ繧ｯ繧ｿ繝ｪ繝ｳ繧ｰ繧ｷ繧ｹ繝・Β

## 讎りｦ・Context-efficient refactoring with autonomous session management and proposal-based rollback.

## Autonomy Levels
| Function | Level | Description |
|----------|-------|-------------|
| Context management | **Auto** | 70% compact, 85% clear |
| Session persistence | **Auto** | Auto-save on batch complete |
| Rollback | **Proposal** | User confirmation required |

## 繧ｳ繝槭Φ繝・| 繧ｳ繝槭Φ繝・| 隱ｬ譏・|
|----------|------|
| `/refactor:init {scope}` | 3-agent荳ｦ蛻怜・譫舌〒蛻晄悄蛹・|
| `/refactor:plan` | 繝舌ャ繝∝ｮ溯｡瑚ｨ育判繧堤函謌・|
| `/refactor:batch` | 繝√ぉ繝・け繝昴う繝ｳ繝井ｻ倥″縺ｧ繝舌ャ繝∝ｮ溯｡・|
| `/refactor:rollback [target]` | 繝√ぉ繝・け繝昴う繝ｳ繝医↓蠕ｩ蜈・|
| `/refactor:complete` | 繧ｻ繝・す繝ｧ繝ｳ邨ゆｺ・|

## 繝ｯ繝ｼ繧ｯ繝輔Ο繝ｼ

```
/refactor:init
    笏懌楳笏 [Parallel] Scope Agent
    笏懌楳笏 [Parallel] Pattern Agent
    笏披楳笏 [Parallel] Risk Agent
         笏・         笆ｼ
    /refactor:plan
         笏・    笏娯楳笏笏笏笏ｴ笏笏笏笏笏・    笆ｼ         笆ｼ
[Batch N]  [Failure]
    笏・        笏・    笏懌楳 Auto checkpoint
    笏懌楳 Transform      笏披楳 rollback-guard
    笏懌楳 Quality gates      (proposal)
    笏懌楳 Ralph Loop
    笏披楳 Auto sessionwrite
         笏・         笆ｼ
    /refactor:complete
```

## 繧ｹ繧ｭ繝ｫ騾｣謳ｺ
| Skill | Purpose | Trigger |
|-------|---------|---------|
| `context-autonomy` | Auto compact/clear | 70%/85% threshold |
| `session-autosave` | Auto save | Batch complete |
| `rollback-guard` | Propose rollback | Test failure |

## 險ｭ螳・`.sd/refactor/config.json`

## 螟夜Κ繝ｪ繧ｽ繝ｼ繧ｹ
- **LSP**: `ENABLE_LSP_TOOLS=1` or cclsp MCP
- **Batch refactoring**: claude-skills-marketplace
