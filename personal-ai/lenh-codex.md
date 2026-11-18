# Lệnh Codex

Làm trong `personal-ai/` trên nhánh `cursor/personal-ai-infrastructure-4a13`. Trả lời tiếng Việt. Sửa file, rồi dừng.

Giữ nguyên game: `index.html`, `js/`, `css/`, `test/`, `assets/`. Không commit `memory/` và phiếu thật trong `jobs/`. Không bật MCP. Không viết hướng dẫn cài Blender hay Unreal. Không thêm phòng mới. Mười hai phòng đã có.

Thêm ba đường trên phiếu cho app, tool, web, video và phim.

## 1. Mẫu phiếu

Trong `jobs/_mau.md`, mục File, thêm dòng:

- Mở được:

App, tool và web ghi URL hoặc lệnh chạy vào dòng này.

Thêm mục Phân cảnh. Đạo diễn hình điền trước chữ ký hướng hình:

- Cảnh:
- Thời lượng:

Thêm mục Dựng. Điền khi việc là video hoặc phim:

- Thứ tự đã ghép:
- Đường dẫn video:
- Kết quả mở lại file:

## 2. Đạo diễn hình

Trong `.agents/skills/dao-dien-hinh/SKILL.md` và `checklist.md`: với video hoặc phim, ghi thứ tự cảnh và thời lượng vào mục Phân cảnh, rồi mới dừng chờ chữ ký hướng hình.

## 3. Điều phối

Trong `.agents/skills/dieu-phoi/SKILL.md`:

- App, tool, web: điều kiện xong gồm dòng Mở được.
- Video, phim: Đạo diễn hình ghi Phân cảnh trước chữ ký. Sau các cảnh, ghi mục Dựng và mở lại file video.
- Âm thanh của cả bản ghi vào file video đó.

## 4. Duyệt

Trong `.agents/skills/duyet/SKILL.md`:

- App, tool, web đạt khi dòng Mở được có địa chỉ hoặc lệnh, và mở ra đúng việc trên phiếu.
- Video, phim đạt khi file video mở lại đúng thứ tự trên mục Dựng.

## 5. Luật và trợ lý

Trong `.agents/rules/chu-ky.md` và `GEMINI.md`, thêm một câu: app, tool và web xong khi dòng Mở được có kết quả. Video và phim xong khi file ở mục Dựng mở lại đúng.

## 6. Âm thanh

Trong `.agents/skills/am-thanh/SKILL.md`: khi phiếu có mục Dựng, chỗ gắn tiếng là file video đó.

## Xong

Đọc lại mẫu phiếu và sáu file trên. Mẫu phiếu có đủ Mở được, Phân cảnh và Dựng. Dừng.

Chưa chạy `link.ps1` nếu `%USERPROFILE%\.gemini\config\mcp_config.json` đang có server khác. File đó trống thì chạy `personal-ai/link.ps1`. Giữ `blender-mcp` và `unreal-mcp` ở trạng thái `disabled`.
