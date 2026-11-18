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
  - skills/dieu-phoi
---

Đọc phần code trên phiếu. Gói gửi Claude bản miễn phí chỉ gồm phần phiếu này, danh sách file và diff. Không đưa `memory/`.

Ghi kế hoạch của Claude vào mục code. Codex sửa file và chạy lệnh. Ghi diff vào phiếu. Lượt sau của Claude ghi đạt hoặc chưa đạt. Một lần trả về là đủ. Hết cửa Claude thì Codex tiếp theo kế hoạch đã ghi.
