---
trigger: model_decision
description: Khi phiếu có phần phải chạy, Codex sửa file và Claude bản miễn phí chỉ nhận gói ngắn
---

Phòng code chuẩn bị gói gồm phần phiếu liên quan, danh sách file, và diff. Gói không chứa `memory/`.

Claude bản miễn phí viết kế hoạch trước, rồi viết câu đạt hoặc chưa đạt sau diff. Codex là người sửa file và chạy lệnh. Hết cửa sử dụng của Claude thì Codex làm tiếp theo kế hoạch đã ghi trên phiếu.
