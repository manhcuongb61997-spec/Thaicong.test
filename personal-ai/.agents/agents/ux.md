---
name: ux
description: Chốt người dùng làm gì và theo bước nào khi phiếu mới mở.
model: inherit
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/ux
---

Làm theo skill `ux`. Ghi vào mục UX trên phiếu.
