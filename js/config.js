(function (root) {
  "use strict";

  root.CONFIG = {
    saveKey: "thaicong-truyen-thua-v1",
    start: {
      age: 16,
      lifespan: 74,
      stones: 50,
      atk: 12,
      def: 10,
      stam: 100,
      slots: 1,
      maxArts: 6,
    },
    costs: { cultivate: 20, explore: 24, break: 12, refresh: 22 },
    ranks: {
      1: { name: "Phàm phẩm", color: "#aa9261" },
      2: { name: "Linh phẩm", color: "#668479" },
      3: { name: "Thiên phẩm", color: "#8b7395" },
    },
    copy: {
      guideTitle: "Lời Thái Công",
      guide: "Từ nhỏ con đã sáng dạ, lại sớm thức tỉnh thiên phú. Hãy xem kỹ từng năng lực rồi chọn ba thiên phú để mang theo.",
      introTitle: "Lời sư phụ",
      intro: "Mỗi năm hãy chọn một việc.\n\nBế quan để tích tu vi. Thanh tu vi đầy thì đột phá.\nKỳ ngộ tìm linh thạch, công pháp, pháp bảo — và cả yêu thú.\nPhá cảnh mới kéo dài tuổi thọ. Hết thọ trước khi phi thăng thì đời này khép lại.",
    },
    talents: [
      { id: "can-hoc", name: "Cần học khổ luyện", desc: "Nhận thêm 20% tu vi.", rank: 1, tuVi: 0.2 },
      { id: "gia-tai", name: "Gia tài bạc triệu", desc: "Khởi đầu với thêm 1.000 linh thạch.", rank: 1, stones: 1000 },
      { id: "phu-luc", name: "Phù lục thế gia", desc: "Khởi đầu với thêm hai lá phù ngẫu nhiên.", rank: 1, talismans: 2 },
      { id: "di-ma", name: "Dị ma nhập thể", desc: "Tăng 20% sức tấn công, giảm 20 năm tuổi thọ.", rank: 1, atk: 0.2, lifespan: -20 },
      { id: "quy-tho", name: "Quy thọ", desc: "Tăng 20% phòng thủ và thêm 20 năm tuổi thọ.", rank: 1, def: 0.2, lifespan: 20 },
      { id: "tien-nhan", name: "Tiên nhân tri kỷ", desc: "Mở sớm một ô pháp bảo khi bắt đầu.", rank: 1, slots: 1 },
      { id: "menh-ngheo", name: "Mệnh nghèo", desc: "Bán đồ thu ít hơn 50% linh thạch. Học công pháp tốn ít hơn 50% linh thạch.", rank: 1, sell: 0.5, learn: 0.5 },
      { id: "tai-tao", name: "Tái tạo gân cốt", desc: "Tăng 10% sức tấn công, phòng thủ và thể lực.", rank: 1, atk: 0.1, def: 0.1, stam: 0.1 },
      { id: "tam-bao", name: "Tầm bảo", desc: "Tăng 5% cơ hội tìm được pháp bảo trong kỳ ngộ.", rank: 1, treasure: 0.05 },
      { id: "tam-phap", name: "Tầm pháp", desc: "Tăng 5% cơ hội tìm được công pháp trong kỳ ngộ.", rank: 1, manual: 0.05 },
      { id: "hoc-doi", name: "Học đi đôi với nghĩ", desc: "Tăng 10% hiệu quả của công pháp học được.", rank: 1, art: 1.1 },
      { id: "tinh-gian", name: "Tinh giản công pháp", desc: "Học công pháp tốn ít hơn 30% linh thạch, nhưng hiệu quả giảm 15%.", rank: 2, learn: 0.7, art: 0.85 },
      { id: "mot-mon", name: "Một môn tinh thông", desc: "Tăng 200% hiệu quả công pháp, nhưng chỉ học được ba môn.", rank: 3, art: 3, maxArts: 3 },
      { id: "quy-giap", name: "Quy giáp công", desc: "Tăng 15% phòng thủ và 10% thể lực.", rank: 1, def: 0.15, stam: 0.1 },
      { id: "kheo-dung", name: "Khéo dùng pháp bảo", desc: "Pháp bảo thu được có sức tấn công cao hơn 10%.", rank: 1, gearAtk: 1.1 },
    ],
    realms: [
      { id: "luyen-khi", name: "Luyện Khí", layers: 4, need: 78, gain: 26, life: 0, atk: 2, def: 1 },
      { id: "truc-co", name: "Trúc Cơ", layers: 3, need: 150, gain: 40, life: 16, atk: 4, def: 3 },
      { id: "kim-dan", name: "Kim Đan", layers: 3, need: 250, gain: 62, life: 20, atk: 6, def: 4 },
      { id: "nguyen-anh", name: "Nguyên Anh", layers: 2, need: 390, gain: 92, life: 22, atk: 9, def: 6 },
      { id: "do-kiep", name: "Độ Kiếp", layers: 1, need: 480, gain: 124, life: 14, atk: 12, def: 8, ascend: true },
    ],
    arts: [
      { id: "tam-phap", name: "Thái Công Tâm Pháp", cost: 140, desc: "Mỗi lần bế quan nhận thêm tu vi.", tuVi: 0.18 },
      { id: "liet-hoa", name: "Liệt Hỏa Chưởng", cost: 200, desc: "Đòn đánh gây thêm sát thương.", strike: 0.35 },
      { id: "huyen-giap", name: "Huyền Giáp Quyết", cost: 180, desc: "Tăng phòng thủ.", def: 0.25 },
      { id: "thao-moc", name: "Thảo Mộc Kinh", cost: 150, desc: "Nghỉ ngơi hồi nhiều sinh lực và thể lực hơn.", rest: 0.3 },
      { id: "kim-cang", name: "Kim Cang Phá", cost: 240, desc: "Tăng cơ hội đột phá.", break: 0.12 },
      { id: "an-tuc", name: "Ẩn Tức Thuật", cost: 170, desc: "Dễ thoát hiểm. Ra đòn trước mạnh hơn.", flee: 0.22, first: 0.15 },
      { id: "linh-nhan", name: "Linh Nhãn", cost: 170, desc: "Mua rẻ hơn và dễ gặp cơ duyên hơn.", discount: 0.15, find: 0.04 },
      { id: "van-tuong", name: "Vạn Tượng Quy Nhất", cost: 360, desc: "Tấn công, phòng thủ và tu vi đều tăng.", all: 0.08 },
    ],
    treasures: [
      { id: "moc-kiem", name: "Mộc kiếm", atk: 4, def: 0, price: 80, desc: "Kiếm gỗ khắc chú, vừa tay đệ tử mới." },
      { id: "huyen-phong", name: "Huyền Phong Nhẫn", atk: 9, def: 0, price: 220, desc: "Đao ngắn lạnh như sương đêm." },
      { id: "xich-viem", name: "Xích Viêm Kiếm", atk: 16, def: 1, price: 480, desc: "Lưỡi kiếm còn vương lửa." },
      { id: "thanh-than", name: "Thanh Thần Giáp", atk: 0, def: 8, price: 260, desc: "Áo giáp nhẹ, đỡ được móng yêu." },
      { id: "kim-ty", name: "Kim Ty Hộ Tâm", atk: 1, def: 14, price: 520, desc: "Gương hộ tâm dệt bằng tơ vàng." },
      { id: "luu-ly", name: "Lưu Ly Chung", atk: 6, def: 6, price: 400, desc: "Chuông nhỏ, công thủ đều có." },
      { id: "pha-quan", name: "Phá Quân Kích", atk: 22, def: 0, price: 760, desc: "Pháp bảo hậu kỳ, nặng và dữ." },
      { id: "cuu-chuyen", name: "Cửu Chuyển Bàn", atk: 8, def: 12, price: 840, desc: "Đĩa trận tự xoay quanh chủ." },
    ],
    talismans: [
      { id: "hoi-xuan", name: "Phù Hồi Xuân", desc: "Hồi 45% sinh lực.", heal: 0.45, price: 40 },
      { id: "loi-phu", name: "Phù Lôi", desc: "Trong chiến đấu, một đòn lôi gây sát thương lớn.", bolt: true, price: 55 },
      { id: "ho-the", name: "Phù Hộ Thể", desc: "Đòn kế của đối thủ chỉ còn 30% sức.", guard: 0.7, price: 50 },
      { id: "tang-tho", name: "Phù Tăng Thọ", desc: "Thêm 8 năm tuổi thọ.", life: 8, price: 120 },
      { id: "pha-kiep", name: "Phù Phá Kiếp", desc: "Lần đột phá kế tiếp thêm 30% cơ hội.", brk: 0.3, price: 90 },
    ],
    pills: [
      { id: "hoi-khi", name: "Hồi Khí Đan", desc: "Hồi 40 thể lực.", stam: 40, price: 28 },
      { id: "boi-nguyen", name: "Bồi Nguyên Đan", desc: "Hồi 40% sinh lực.", heal: 0.4, price: 36 },
      { id: "tuc-menh", name: "Tục Mệnh Đan", desc: "Thêm 6 năm tuổi thọ.", life: 6, price: 110 },
    ],
    beasts: [
      { id: "soi", name: "Sói xám", hp: 36, atk: 10, def: 3, stones: 20, tuVi: 9 },
      { id: "xa", name: "Xà yêu", hp: 32, atk: 13, def: 2, stones: 22, tuVi: 10 },
      { id: "dieu", name: "Hắc phong điêu", hp: 40, atk: 12, def: 4, stones: 24, tuVi: 11 },
      { id: "tru", name: "Thiết bì trư", hp: 56, atk: 11, def: 8, stones: 26, tuVi: 11 },
      { id: "linh", name: "U linh", hp: 42, atk: 14, def: 5, stones: 24, tuVi: 14 },
      { id: "hau", name: "Hỏa hầu", hp: 46, atk: 15, def: 4, stones: 28, tuVi: 13 },
    ],
    encounters: [
      {
        id: "linh-tuyen", cat: "story", title: "Linh tuyền",
        text: "Giữa khe đá có một mạch nước trong, thoảng mùi linh khí.",
        choices: [
          { id: "drink", label: "Uống", ops: [{ op: "heal", v: 0.32 }, { op: "tuVi", v: 12 }, { op: "log", v: "Nước lạnh thấm vào kinh mạch." }] },
          { id: "fill", label: "Lấy đầy bình", ops: [{ op: "stones", min: 28, max: 46 }, { op: "log", v: "Bạn đổi linh tuyền lấy linh thạch." }] },
        ],
      },
      {
        id: "dong-mon", cat: "story", title: "Đồng môn",
        text: "Một đệ tử cùng thế hệ chặn đường, muốn so tài hoặc trao đổi tâm đắc.",
        beastName: "Đồng môn", scale: 0.78, reward: 0.7,
        choices: [
          { id: "talk", label: "Trao đổi tâm đắc", ops: [{ op: "tuVi", v: 18 }, { op: "log", v: "Hai người ngồi đến chiều. Mỗi người giữ một phần ngộ." }] },
          { id: "spar", label: "Tỷ thí", ops: [{ op: "fight", gentle: true }] },
        ],
      },
      {
        id: "mo-tien-boi", cat: "story", title: "Mộ tiền bối",
        text: "Nấm mồ vô danh nằm dưới tùng cổ. Tro hương đã lạnh từ lâu.",
        choices: [
          { id: "bow", label: "Vái một lạy", ops: [{ op: "tuVi", v: 14 }, { op: "life", v: 1 }, { op: "log", v: "Gió dừng một nhịp, như có người gật đầu." }] },
          { id: "search", label: "Lục trong mộ", ops: [{ op: "treasure", p: 0.62, hurt: 0.22 }, { op: "life", v: -1 }] },
        ],
      },
      {
        id: "cao-nhan", cat: "story", title: "Cao nhân",
        text: "Một lão nhân ngồi câu bên suối. Ông ta nhìn bạn chỉ một cái, rồi hỏi muốn nghe điều gì.",
        choices: [
          { id: "edge", label: "Hỏi về chiến đấu", ops: [{ op: "grownAtk", v: 2 }, { op: "log", v: "Một câu chỉ điểm làm đường kiếm của bạn sắc hơn." }] },
          { id: "sit", label: "Hỏi về tu luyện", ops: [{ op: "tuVi", v: 36 }, { op: "log", v: "Bạn nghe đến khi hết nắng. Trong ngực có gì đó đã đặc lại." }] },
          { id: "life", label: "Hỏi về dưỡng thọ", ops: [{ op: "life", v: 3 }, { op: "log", v: "Lão nhân dạy cách thở. Thọ nguyên khẽ dài ra." }] },
        ],
      },
      {
        id: "loi-du", cat: "story", title: "Dư âm lôi kiếp",
        text: "Khoảnh đất này vẫn còn mùi sét. Ai đó đã phá cảnh ở đây, và thất bại.",
        choices: [
          { id: "sit", label: "Ngồi trong dư âm", ops: [{ op: "breakBuff", v: 0.16 }, { op: "hurt", v: 0.08 }, { op: "log", v: "Sét tàn chạy qua kinh mạch. Lần phá cảnh sau sẽ dễ hơn." }] },
          { id: "leave", label: "Đi vòng", ops: [{ op: "stones", n: 12 }, { op: "log", v: "Bạn không liều. Dọc đường vẫn nhặt được ít linh thạch." }] },
        ],
      },
      {
        id: "linh-thao", cat: "story", title: "Linh thảo",
        text: "Một cây lá bạc mọc bên vách đá, rễ bám vào kẽ có linh khí.",
        choices: [
          { id: "pick", label: "Hái lá", ops: [{ op: "heal", v: 0.5 }, { op: "log", v: "Lá đắng, nhưng sinh lực hồi lại rõ rệt." }] },
          { id: "meditate", label: "Tọa bên gốc", ops: [{ op: "tuVi", v: 24 }, { op: "log", v: "Bạn mượn linh khí của cây để tuần hoàn một vòng." }] },
        ],
      },
      {
        id: "chan-duong", cat: "combat", title: "Yêu thú chặn đường",
        text: "Bụi cây đổ ra. Một con yêu đói chồm tới, không có ý định nhường lối.",
        choices: [
          { id: "fight", label: "Giao đấu", ops: [{ op: "fight" }] },
          { id: "flee", label: "Rút lui", ops: [{ op: "flee" }] },
        ],
      },
      {
        id: "suong-mu", cat: "combat", title: "Sương mù yêu",
        text: "Sương đặc có mùi máu. Trong sương là một con yêu lớn hơn những lần trước.",
        scale: 1.2, reward: 1.4,
        choices: [
          { id: "fight", label: "Xông vào", ops: [{ op: "fight" }] },
          { id: "flee", label: "Lùi khỏi sương", ops: [{ op: "flee" }] },
        ],
      },
      {
        id: "ho-son", cat: "combat", title: "Hộ sơn thú",
        text: "Cửa hang bị một con thú già chặn. Sau lưng nó có ánh sáng của đồ vật bị bỏ quên.",
        beastName: "Hộ sơn thú", scale: 1.18, reward: 1.25,
        choices: [
          { id: "fight", label: "Đánh đuổi", ops: [{ op: "fight" }] },
          { id: "flee", label: "Để nó ngủ", ops: [{ op: "flee" }] },
        ],
      },
      {
        id: "hang-co", cat: "treasure", title: "Động phủ bỏ không",
        text: "Cửa đá hé mở. Bên trong tối, gió thở ra như có người.",
        choices: [
          { id: "enter", label: "Đi vào", ops: [{ op: "treasure", p: 0.7, hurt: 0.2 }] },
          { id: "leave", label: "Đi vòng", ops: [{ op: "stones", min: 14, max: 26 }, { op: "log", v: "Bạn không tham. Dọc đường vẫn có chút thu hoạch." }] },
        ],
      },
      {
        id: "pha-co", cat: "treasure", title: "Phế tích",
        text: "Nền gạch nứt, giữa sân còn một cái giá sắt chưa gỉ hết.",
        choices: [
          { id: "take", label: "Lấy đồ trên giá", ops: [{ op: "treasure", p: 0.8, hurt: 0.12 }] },
          { id: "skip", label: "Chỉ nhặt vụn", ops: [{ op: "stones", min: 18, max: 34 }, { op: "log", v: "Vụn linh thạch đủ đổi một bữa, không đủ chuốc họa." }] },
        ],
      },
      {
        id: "tan-quyen", cat: "manual", title: "Tàn quyển",
        text: "Dưới gốc tùng có một quyển sách cháy dở. Chữ còn đọc được.",
        choices: [
          { id: "take", label: "Thu quyển", ops: [{ op: "manual" }] },
          { id: "sell", label: "Bán dọc đường", ops: [{ op: "stones", min: 48, max: 74 }, { op: "log", v: "Người mua không hỏi xuất xứ." }] },
        ],
      },
      {
        id: "bi-kip", cat: "manual", title: "Hộp tre",
        text: "Trong hốc đá có một hộp tre bịt sáp. Bên trong là một môn công pháp chép tay.",
        choices: [
          { id: "open", label: "Mở hộp", ops: [{ op: "manual" }] },
          { id: "leave", label: "Để nguyên", ops: [{ op: "tuVi", v: 8 }, { op: "log", v: "Bạn không lấy của người đã khuất. Lòng nhẹ, tu vi cũng khẽ nhích." }] },
        ],
      },
      {
        id: "ham-linh", cat: "stones", title: "Hẻm linh thạch",
        text: "Vách đá lốm đốm những mạch sáng. Đào được, nhưng vách không chắc.",
        choices: [
          { id: "mine", label: "Đào vừa", ops: [{ op: "stones", min: 24, max: 42 }, { op: "log", v: "Bạn đục một mạch nông và dừng đúng lúc." }] },
          { id: "deep", label: "Đào sâu", ops: [{ op: "stones", min: 52, max: 88 }, { op: "hurt", v: 0.16 }, { op: "log", v: "Vách sập một mảng. Bạn vẫn ôm được linh thạch ra ngoài." }] },
        ],
      },
      {
        id: "khoang", cat: "stones", title: "Khoáng mạch lộ thiên",
        text: "Mưa vừa tạnh, những viên linh thạch nhỏ nổi lên trên bùn.",
        choices: [
          { id: "pick", label: "Nhặt", ops: [{ op: "stones", min: 16, max: 36 }, { op: "log", v: "Bùn lạnh, túi thì nặng hơn lúc sáng." }] },
          { id: "wash", label: "Rửa mặt rồi đi", ops: [{ op: "heal", v: 0.12 }, { op: "log", v: "Bạn bỏ qua của rơi. Nước mưa làm vết thương dịu lại." }] },
        ],
      },
      {
        id: "phu-cac", cat: "talisman", title: "Phù các đổ",
        text: "Một cái kệ mục nằm nghiêng. Vài lá phù còn ánh mực.",
        choices: [
          { id: "careful", label: "Gỡ từng lá", ops: [{ op: "talisman", n: 1 }, { op: "log", v: "Một lá phù còn dùng được." }] },
          { id: "rush", label: "Thu vét", ops: [{ op: "talisman", n: 2 }, { op: "hurt", v: 0.14 }, { op: "log", v: "Kệ đổ. Bạn thoát ra với nhiều phù hơn, và vài vết xước." }] },
        ],
      },
      {
        id: "phu-trai", cat: "talisman", title: "Túi phù rơi",
        text: "Bên vệ đường có một túi vải. Chủ nhân đã đi rất xa, hoặc không còn đi được.",
        choices: [
          { id: "open", label: "Mở túi", ops: [{ op: "talisman", n: 1 }] },
          { id: "bury", label: "Chôn lại", ops: [{ op: "life", v: 1 }, { op: "log", v: "Bạn chôn túi xuống. Một năm tuổi thọ đáp lại, rất khẽ." }] },
        ],
      },
    ],
    achievements: [
      { id: "nhap-mon", name: "Nhập môn", desc: "Khởi hành một đời tu tiên." },
      { id: "truc-co", name: "Trúc Cơ", desc: "Bước vào Trúc Cơ." },
      { id: "kim-dan", name: "Kim Đan", desc: "Kết thành kim đan." },
      { id: "nguyen-anh", name: "Nguyên Anh", desc: "Ngưng được nguyên anh." },
      { id: "do-kiep", name: "Độ Kiếp", desc: "Đứng trước lôi kiếp cuối." },
      { id: "phi-thang", name: "Phi thăng", desc: "Vượt khỏi vòng sinh tử." },
      { id: "het-tho", name: "Hết thọ", desc: "Thọ nguyên cạn trước khi phi thăng." },
      { id: "loi-kiep", name: "Gãy mạch", desc: "Lôi kiếp đánh nát kinh mạch." },
      { id: "dut-mach", name: "Đứt mạch", desc: "Một lựa chọn làm kinh mạch đứt lìa." },
      { id: "thu-tran", name: "Thủ trận", desc: "Thắng một trận giao đấu." },
      { id: "muoi-ky", name: "Mười kỳ ngộ", desc: "Xuống núi mười lần." },
      { id: "cong-phap", name: "Tâm pháp", desc: "Học công pháp đầu tiên." },
    ],
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
