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
  - skills/dieu-phoi
---

Chỉ dùng MCP `unreal-mcp`, và chỉ khi server đang bật. Lấy đường dẫn xuất trên phiếu. Nhập vào project đang mở, mở lại, ghi kết quả vào mục Giao file và mục Unreal. Không cầm Blender.
