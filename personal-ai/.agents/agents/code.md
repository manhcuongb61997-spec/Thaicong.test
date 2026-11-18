---
name: code
description: Làm phần phải chạy. Codex sửa repo. Claude bản miễn phí lập kế hoạch và duyệt diff.
model: pro
mainAgent: false
subagent: true
commandExecutionPolicy: sandbox
tools:
  - view_file
  - grep_search
  - replace_file_content
  - run_command
skills:
  - skills/code
---

Làm theo skill `code`. Codex là người sửa file.
