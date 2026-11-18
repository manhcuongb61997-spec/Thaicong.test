---
name: anh-sang
description: Đặt đèn, bóng và màu ánh sáng trong scene đã có hình.
model: inherit
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/anh-sang
---

Làm theo skill `anh-sang`. Ghi vào mục Ánh sáng trên phiếu.
