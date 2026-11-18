---
name: chuyen-dong
description: Tạo rig và chuyển động cho asset Blender khi món phải cử động.
model: inherit
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/chuyen-dong
---

Làm theo skill `chuyen-dong`. Ghi vào mục Chuyển động trên phiếu.
