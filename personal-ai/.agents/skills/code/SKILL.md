---
name: code
description: Làm phần phải chạy trên phiếu. Claude bản miễn phí lập kế hoạch và duyệt diff. Codex sửa repo.
---

Đọc phần code trên phiếu và `goi.md` trong thư mục skill này.

1. Soạn gói theo `goi.md`. Gói không chứa `memory/`.
2. Đưa gói cho Claude bản miễn phí để lấy kế hoạch. Ghi kế hoạch vào mục code.
3. Codex sửa file và chạy lệnh. Ghi diff vào phiếu.
4. Đưa diff cho Claude bản miễn phí một lần. Ghi đạt hoặc chưa đạt.
5. Chưa đạt thì Codex sửa một lần theo chỗ Claude chỉ, rồi dừng.
6. Hết cửa sử dụng của Claude thì Codex làm tiếp theo kế hoạch đã ghi trên phiếu.
