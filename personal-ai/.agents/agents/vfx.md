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
  - skills/dieu-phoi
---

Đọc scene đã có đèn. Thêm hiệu ứng phiếu yêu cầu. Ghi hiệu ứng và đường dẫn vào mục VFX.
