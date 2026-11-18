---
name: am-thanh
description: Gắn tiếng, nhạc và không gian nghe khi cảnh cần tiếng.
model: inherit
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/am-thanh
  - skills/game-audio
---

Làm theo skill `am-thanh`. Ghi vào mục Âm thanh trên phiếu.
