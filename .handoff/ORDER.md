# ORDER.md - SD003 Handoff Pack Standardization Plan

縺薙・謖・､ｺ譖ｸ縺ｯ縲ヾD003縺ｧ繝｢繝・Ν髱樔ｾ晏ｭ倥・蠑輔″邯吶℃驕狗畑繧堤｢ｺ遶九☆繧九◆繧√・螳溯｡瑚ｨ育判縺ｧ縺吶・

---

## 繧ｿ繧ｹ繧ｯ讎りｦ・

**菴輔ｒ縺吶ｋ縺・*
`.handoff/` 驟堺ｸ九↓蜈ｱ騾壹Ν繝ｼ繝ｫ縺ｨ繝・Φ繝励Ξ繝ｼ繝医ｒ謨ｴ蛯吶＠縲～CLAUDE.md` 縺九ｉ蜿ら・蜿ｯ閭ｽ縺ｪ迥ｶ諷九↓邨ｱ荳縺吶ｋ縲・

**蜆ｪ蜈磯・ｽ・*
- [x] High

**諡・ｽ薙Δ繝・Ν**
- [x] Codex
- [ ] Claude Code
- [ ] Gemini CLI
- [ ] Antigravity

---

## 菴懈･ｭ遽・峇

**蟇ｾ雎｡繝輔ぃ繧､繝ｫ/繝・ぅ繝ｬ繧ｯ繝医Μ**
```
.handoff/
CLAUDE.md
```

**譁ｰ隕丈ｽ懈・縺吶ｋ繧ゅ・**
- [x] `.handoff/RULES.md`
- [x] `.handoff/ORDER.template.md`
- [x] `.handoff/DONE.template.md`
- [x] `.handoff/AGENTS.md`
- [x] `.handoff/ORDER.md`・医％縺ｮ繝輔ぃ繧､繝ｫ・・

**譌｢蟄倥・螟画峩遖∵ｭ｢繝ｪ繧ｹ繝・*
- [x] `src/` 縺ｯ螟画峩縺励↑縺・
- [x] `.sd/specs/` 縺ｯ螟画峩縺励↑縺・
- [x] 譌｢蟄倥・讌ｭ蜍吶Ο繧ｸ繝・け縺ｯ螟画峩縺励↑縺・

---

## 螳滓命繧ｹ繝・ャ繝・

1. 迴ｾ蝨ｨ縺ｮ繝・Φ繝励Ξ繝ｼ繝域紛蛯咏憾豕√ｒ遒ｺ隱阪☆繧・
2. `CLAUDE.md` 縺ｫ `.handoff/RULES.md` 蜿ら・縺ｨ DONE 蜃ｺ蜉帙Ν繝ｼ繝ｫ繧貞渚譏縺吶ｋ
3. `.handoff/AGENTS.md` 縺ｮ4谿ｵ髫弱Ξ繝薙Η繝ｼ隕ｳ轤ｹ繧堤｢ｺ隱阪☆繧・
4. 驕狗畑讀懆ｨｼ繧貞ｮ滓命縺吶ｋ・亥ｭ伜惠遒ｺ隱阪・蜿ら・遒ｺ隱阪・蟾ｮ蛻・｢ｺ隱搾ｼ・
5. 蠢・ｦ√↑繧画枚險繧貞ｾｮ菫ｮ豁｣縺励∵怙邨ら憾諷九ｒ遒ｺ螳壹☆繧・

---

## 螳御ｺ・擅莉ｶ

**蠢・域擅莉ｶ**
- [x] `.handoff/` 驟堺ｸ九↓4繝輔ぃ繧､繝ｫ・・ULES/ORDER.template/DONE.template/AGENTS・峨′蟄伜惠縺吶ｋ
- [x] `CLAUDE.md` 縺・`.handoff/RULES.md` 繧貞盾辣ｧ縺励※縺・ｋ
- [x] `CLAUDE.md` 縺ｫ縲御ｽ懈･ｭ邨ゆｺ・凾縺ｯ DONE.md 繧貞・蜉帙阪・謖・､ｺ縺後≠繧・
- [x] 螟画峩轤ｹ縺・`git status` / `git diff` 縺ｧ霑ｽ霍｡蜿ｯ閭ｽ

**蜿励￠蜈･繧後ユ繧ｹ繝・*
```bash
# 蟄伜惠遒ｺ隱・
ls .handoff

# 蜿ら・遒ｺ隱・
rg "\.handoff/RULES\.md" CLAUDE.md
rg "DONE\.md" CLAUDE.md

# 蟾ｮ蛻・｢ｺ隱・
git status --short
git diff -- CLAUDE.md
```

---

## 蜿ら・諠・ｱ

**髢｢騾｣莉墓ｧ俶嶌**
- `.handoff/RULES.md`
- `.handoff/ORDER.template.md`
- `.handoff/DONE.template.md`
- `.handoff/AGENTS.md`

**髢｢騾｣繝輔ぃ繧､繝ｫ**
- `CLAUDE.md`
- `AGENTS.md`

---

## 繧・▲縺ｦ縺ｯ縺・￠縺ｪ縺・％縺ｨ

- [x] 繝励Ο繧ｸ繧ｧ繧ｯ繝医Ν繝ｼ繝育峩荳九↓譁ｰ隕上ヵ繧｡繧､繝ｫ繧剃ｽ懈・縺励↑縺・
- [x] `.sd/specs/` 縺ｮ莉墓ｧ俶嶌繧堤┌譁ｭ螟画峩縺励↑縺・
- [x] 螳溯｣・さ繝ｼ繝牙､画峩繧偵％縺ｮ繧ｿ繧ｹ繧ｯ縺ｫ豺ｷ蝨ｨ縺輔○縺ｪ縺・
- [x] DONE蝣ｱ蜻翫↑縺励〒菴懈･ｭ繧堤ｵゅ∴縺ｪ縺・

---

## 霑ｽ蜉繧ｳ繝ｳ繝・く繧ｹ繝・

- 譛ｬ繧ｿ繧ｹ繧ｯ縺ｯ縲後Δ繝・Ν萓晏ｭ倥・蛟句挨謖・､ｺ縲阪〒縺ｯ縺ｪ縺上悟・騾夐°逕ｨ蝓ｺ逶､縲阪・謨ｴ蛯吶ｒ逶ｮ逧・→縺吶ｋ縲・
- 驕狗畑髢句ｧ句ｾ後・縲∝推繝｢繝・Ν縺ｮ謖・､ｺ繝輔ぃ繧､繝ｫ縺ｧ `.handoff/RULES.md` 繧剃ｸ谺｡蜿ら・縺ｫ邨ｱ荳縺吶ｋ縲・
- `AGENTS.md` 縺ｨ `.handoff/AGENTS.md` 縺ｮ蠖ｹ蜑ｲ蟾ｮ蛻・・蠕檎ｶ壹ち繧ｹ繧ｯ縺ｧ謨ｴ逅・ｯｾ雎｡縺ｨ縺吶ｋ縲・

---
