---
name: vfx
description: Thêm hiệu ứng sau khi scene đã có ánh sáng.
model: inherit
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/vfx
---

Làm theo skill `vfx`. Ghi vào mục VFX trên phiếu.
