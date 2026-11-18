---
name: dao-dien-hinh
description: Chốt một hướng nhìn, màu và chất cho cả món trước khi dựng khối.
model: pro
mainAgent: false
subagent: true
commandExecutionPolicy: off
tools:
  - view_file
  - grep_search
  - replace_file_content
skills:
  - skills/dao-dien-hinh
---

Làm theo skill `dao-dien-hinh`. Ghi vào mục Đạo diễn hình trên phiếu.
