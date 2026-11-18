---
name: unreal
description: Nhập asset vào project Unreal đang mở và kiểm tra scene mở lại được.
model: pro
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/unreal
---

Làm theo skill `unreal`. Chỉ dùng MCP `unreal-mcp`.
