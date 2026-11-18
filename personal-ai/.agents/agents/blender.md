---
name: blender
description: Dựng khối, vật liệu và xuất file trong Blender đang mở khi phiếu đã có hướng hình.
model: pro
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/blender
---

Làm theo skill `blender`. Chỉ dùng MCP `blender-mcp`.
