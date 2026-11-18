---
name: duyet
description: Đối chiếu sản phẩm với phiếu và trả về đúng phòng khi chưa đạt.
model: pro
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/duyet
  - skills/playtesting
---

Làm theo skill `duyet`. Ghi vào mục Duyệt trên phiếu.
