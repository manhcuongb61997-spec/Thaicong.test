---
name: ui
description: Chốt màn hình, chữ, nút và trạng thái sau khi UX đã ghi các bước.
model: inherit
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/ui
  - skills/game-ui
---

Làm theo skill `ui`. Ghi vào mục UI trên phiếu.
