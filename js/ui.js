(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dialog = $("modal");
  let run = null;
  let hand = ["can-hoc", "gia-tai", "di-ma", "menh-ngheo", "tinh-gian", "mot-mon"];
  let chosen = new Set();
  let uiLock = false;
  let lastLog = "";

  function wait(ms) {
    if (reduce) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function num(n) { return Math.round(n).toLocaleString("vi-VN"); }
  function el(tag, attrs, kids) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((key) => {
        const value = attrs[key];
        if (value == null || value === false) return;
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key === "disabled") node.disabled = !!value;
        else node.setAttribute(key, value === true ? "" : String(value));
      });
    }
    (kids || []).forEach((kid) => {
      if (kid == null) return;
      node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
    return node;
  }
  function clear(node) { node.replaceChildren(); }
  function say(text) { $("live").textContent = text || ""; }
  function notice(text) {
    const node = $("path").hidden ? $("notice") : $("path-notice");
    node.textContent = text || "";
  }
  function save() {
    if (!run) return;
    try { localStorage.setItem(CONFIG.saveKey, Rules.serialize(run)); } catch (err) { notice("Không ghi được hành trình trên máy này."); }
  }
  function readSave() {
    try { return Rules.hydrate(localStorage.getItem(CONFIG.saveKey)); } catch (err) { return null; }
  }
  function forget() {
    try { localStorage.removeItem(CONFIG.saveKey); } catch (err) { /* bỏ qua */ }
  }
  function show(id) {
    ["awaken", "path", "end"].forEach((name) => { $(name).hidden = name !== id; });
    if (run && id === "path") document.title = "Thái Công · " + Rules.present(run).realmName;
    else document.title = id === "end" ? "Thái Công · Kết" : "Thái Công · Chọn thiên phú";
  }
  function float(text, bad, stay) {
    if (!text) return;
    const node = el("div", { class: "floater" + (bad ? " bad" : "") + (stay ? " stay" : ""), text });
    $("floaters").append(node);
    setTimeout(() => node.remove(), stay ? 2400 : 1000);
  }
  function paintFx(fx) {
    (fx || []).forEach((item) => {
      if (item.type === "tuVi" || item.type === "stones" || item.type === "life" || item.type === "stam") float(item.text, false);
      if (item.type === "hp") float(item.text, item.n < 0);
      if (item.type === "achievement") float(item.text, false, true);
    });
  }

  function draw() {
    const box = $("cards");
    clear(box);
    hand.forEach((id) => {
      const talent = CONFIG.talents.find((item) => item.id === id);
      const rank = CONFIG.ranks[talent.rank];
      const on = chosen.has(id);
      const card = el("button", {
        type: "button",
        class: "card",
        "aria-pressed": String(on),
      });
      card.style.setProperty("--trim", rank.color);
      card.append(
        el("b", { text: talent.name }),
        el("small", { text: talent.desc }),
        el("span", { class: "rank", text: rank.name }),
        el("span", { class: "check", text: on ? "Đã chọn" : "" })
      );
      card.addEventListener("click", () => toggle(id));
      box.append(card);
    });
    $("count").textContent = chosen.size + " / 3";
    $("confirm").disabled = chosen.size !== 3;
  }
  function toggle(id) {
    notice("");
    if (chosen.has(id)) chosen.delete(id);
    else if (chosen.size < 3) chosen.add(id);
    else notice("Đã đủ ba. Hãy bỏ một thiên phú trước.");
    draw();
  }
  function shuffle(rng) {
    const ids = CONFIG.talents.map((talent) => talent.id);
    for (let i = ids.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      const swap = ids[i];
      ids[i] = ids[j];
      ids[j] = swap;
    }
    hand = ids.slice(0, 6);
    chosen = new Set();
    draw();
  }

  function fillBar(id, pct) {
    $(id).style.width = Math.max(0, Math.min(100, pct * 100)) + "%";
  }
  function renderPath() {
    const view = Rules.present(run);
    $("path-name").textContent = view.name;
    $("path-year").textContent = view.year === 0 ? "Mới nhập môn · " + view.age + " tuổi" : "Năm " + view.year + " · " + view.age + " tuổi";
    $("realm-name").textContent = view.realmName;
    $("realm-layer").textContent = "Tầng " + view.layer + " / " + view.layers;
    const dots = $("dots");
    clear(dots);
    for (let i = 1; i <= view.layers; i += 1) {
      dots.append(el("i", { class: i < view.layer ? "on" : (i === view.layer ? "on now" : "") }));
    }
    $("tuvi-label").textContent = num(view.tuVi) + " / " + num(view.need);
    fillBar("tuvi-bar", view.tuViPct);
    $("hp-label").textContent = num(view.hp) + " / " + num(view.hpMax);
    fillBar("hp-bar", view.hpPct);
    $("stam-label").textContent = num(view.stamina) + " / " + num(view.stamMax);
    fillBar("stam-bar", view.stamPct);
    $("life-label").textContent = "còn " + num(view.remaining) + " năm";
    fillBar("life-bar", view.lifespan ? view.remaining / view.lifespan : 0);
    $("life-card").classList.toggle("danger", view.warning);
    $("stat-line").textContent = "Công " + num(view.atk) + "  ·  Thủ " + num(view.def) + "  ·  " + num(view.stones) + " linh thạch";
    $("path-notice").textContent = view.hint || "";
    const buttons = {
      "btn-cultivate": view.actions.cultivate,
      "btn-explore": view.actions.explore,
      "btn-rest": view.actions.rest,
      "btn-break": view.actions.breakthrough,
    };
    Object.keys(buttons).forEach((id) => {
      const button = $(id);
      button.disabled = !buttons[id].enabled;
      button.title = buttons[id].enabled ? "" : buttons[id].reason;
    });
    const br = view.actions.breakthrough;
    $("break-label").textContent = br.label;
    $("break-sub").textContent = br.enabled
      ? (br.kind === "layer" ? "Không mất năm" : Math.round(br.chance * 100) + "% cơ hội")
      : (view.tuVi < view.need ? "Thiếu tu vi" : "Chưa thể");
    $("btn-break").classList.toggle("ready", br.enabled);
    $("btn-break").classList.toggle("wall", br.enabled && br.kind !== "layer");
    const log = $("log");
    clear(log);
    const top = view.log[0] ? view.log[0].year + "|" + view.log[0].text : "";
    const fresh = top !== lastLog;
    lastLog = top;
    view.log.forEach((entry, index) => {
      log.append(el("li", { class: index === 0 && fresh ? "fresh" : "" }, [
        el("span", { text: entry.year === 0 ? "Mở đầu" : "Năm " + entry.year }),
        el("p", { text: entry.text }),
      ]));
    });
    if (view.log[0]) say(view.log[0].text);
  }
  function renderEnd() {
    const view = Rules.present(run).ending;
    $("end-kicker").textContent = view.name + " · " + view.age + " tuổi";
    $("end-title").textContent = view.title;
    $("end-text").textContent = view.text;
    const stats = $("end-stats");
    clear(stats);
    const rows = [
      ["Cảnh giới", view.realm],
      ["Thiên phú", view.talents.join(", ") || "—"],
      ["Công pháp", view.arts.join(", ") || "Chưa học"],
      ["Kỳ ngộ", String(view.explores)],
      ["Trận thắng", String(view.wins)],
      ["Đột phá", String(view.breaks)],
      ["Linh thạch", num(view.stones)],
      ["Thành tựu", view.achievements.join(", ") || "—"],
    ];
    rows.forEach((row) => {
      stats.append(el("div", null, [el("dt", { text: row[0] }), el("dd", { text: row[1] })]));
    });
  }

  function openModal(mode, title) {
    dialog.dataset.mode = mode;
    $("modal-title").textContent = title;
    $("modal-x").hidden = mode === "combat" || mode === "event" || mode === "rite";
    if (!dialog.open) dialog.showModal();
  }
  function closeModal() {
    if (dialog.open) dialog.close();
  }
  function setBody(node) {
    const body = $("modal-body");
    clear(body);
    body.append(node);
  }
  function setActions(nodes) {
    const box = $("modal-actions");
    clear(box);
    nodes.forEach((node) => box.append(node));
  }
  function button(label, on, primary) {
    const node = el("button", { type: "button", class: "btn" + (primary ? " primary" : ""), text: label });
    node.addEventListener("click", on);
    return node;
  }

  function showGuide() {
    openModal("guide", CONFIG.copy.guideTitle);
    setBody(el("p", { text: CONFIG.copy.guide }));
    setActions([button("Đã nghe", closeModal, true)]);
  }
  function showIntro() {
    openModal("intro", CONFIG.copy.introTitle);
    setBody(el("p", { text: CONFIG.copy.intro }));
    setActions([button("Đi thôi", () => {
      Rules.dismissIntro(run);
      save();
      closeModal();
    }, true)]);
  }
  function showEvent() {
    const pending = Rules.present(run).pending;
    if (!pending || pending.kind !== "event") return;
    openModal("event", pending.title);
    setBody(el("p", { text: pending.text }));
    setActions(pending.choices.map((choice, index) => button(choice.label, () => {
      if (uiLock) return;
      settle(Rules.choose(run, choice.id, Math.random));
    }, index === 0)));
  }
  function showCombat() {
    const pending = Rules.present(run).pending;
    if (!pending || pending.kind !== "combat") return;
    openModal("combat", pending.enemy.name);
    const enemyPct = pending.enemy.maxHp ? pending.enemy.hp / pending.enemy.maxHp : 0;
    const youPct = pending.you.maxHp ? pending.you.hp / pending.you.maxHp : 0;
    const body = el("div");
    body.append(
      el("div", { class: "fight-name" }, [el("span", { text: "Đối thủ" }), el("span", { text: num(pending.enemy.hp) + " / " + num(pending.enemy.maxHp) })]),
      track(enemyPct, "#8d3b32"),
      el("p", { class: "status", text: pending.enemy.intent + " · khoảng " + pending.threat + (pending.guard ? " · đòn này bị giảm" : "") }),
      el("div", { class: "fight-name" }, [el("span", { text: "Bạn" }), el("span", { text: num(pending.you.hp) + " / " + num(pending.you.maxHp) })]),
      track(youPct, "#3e6b54"),
      el("p", { class: "status", text: "Đòn của bạn khoảng " + pending.preview })
    );
    const log = el("ul", { class: "fight-log" });
    pending.lines.forEach((line) => log.append(el("li", { text: line })));
    body.append(log);
    setBody(body);
    const actions = [
      button("Đánh", () => settle(Rules.combatAct(run, "strike", Math.random)), true),
      button("Thủ", () => settle(Rules.combatAct(run, "guard", Math.random)), false),
      button("Rút lui", () => settle(Rules.combatAct(run, "flee", Math.random)), false),
    ];
    pending.talismans.forEach((item) => {
      actions.push(button(item.name, () => settle(Rules.combatAct(run, "talisman:" + item.uid, Math.random)), false));
    });
    setActions(actions);
  }
  function track(pct, color) {
    const bar = el("i");
    bar.style.width = Math.max(0, Math.min(100, pct * 100)) + "%";
    bar.style.background = color;
    return el("div", { class: "track" }, [bar]);
  }

  function sheetButton(title, detail, on, onState) {
    const node = el("button", { type: "button", class: "item" + (onState ? " on" : "") }, [
      el("b", { text: title }),
      el("small", { text: detail }),
    ]);
    node.addEventListener("click", on);
    return node;
  }
  function showBag() {
    const view = Rules.present(run);
    openModal("bag", "Hành trang");
    const body = el("div");
    body.append(el("div", { class: "sheet-block" }, [
      el("h3", { text: "Công pháp · " + view.arts.length + "/" + view.maxArts }),
      view.arts.length ? null : el("p", { class: "status", text: "Chưa học công pháp." }),
      ...view.arts.map((art) => el("div", { class: "item" }, [el("b", { text: art.name }), el("small", { text: art.effect })])),
      ...view.manuals.map((art) => sheetButton(art.name + " · " + num(art.cost), art.effect + (art.afford ? "" : " · chưa học được"), () => settle(Rules.learnManual(run, art.id)))),
    ].filter(Boolean)));
    body.append(el("div", { class: "sheet-block" }, [
      el("h3", { text: "Pháp bảo · " + view.bag.filter((g) => g.equipped).length + "/" + view.slots }),
      view.bag.length ? null : el("p", { class: "status", text: "Chưa có pháp bảo." }),
      ...view.bag.map((gear) => {
        const row = el("div", { class: "item" + (gear.equipped ? " on" : "") });
        row.append(el("b", { text: gear.name + (gear.equipped ? " · đang dùng" : "") }), el("small", { text: gear.desc + " Công +" + gear.atk + " · Thủ +" + gear.def }));
        const line = el("div", { class: "row" });
        line.append(button(gear.equipped ? "Gỡ" : "Dùng", () => settle(Rules.toggleEquip(run, gear.uid)), false));
        if (!gear.equipped) line.append(button("Bán " + num(gear.sell), () => settle(Rules.sellGear(run, gear.uid)), false));
        row.append(line);
        return row;
      }),
    ].filter(Boolean)));
    body.append(el("div", { class: "sheet-block" }, [
      el("h3", { text: "Phù lục" }),
      view.talismans.length ? null : el("p", { class: "status", text: "Không có phù." }),
      ...view.talismans.map((item) => sheetButton(item.name, item.desc, () => {
        if (!item.field) { warn("Chỉ dùng khi giao đấu."); return; }
        settle(Rules.useTalisman(run, item.uid));
      })),
    ].filter(Boolean)));
    setBody(body);
    setActions([button("Đóng", closeModal, true)]);
  }
  function showShop() {
    const view = Rules.present(run);
    openModal("shop", "Chợ");
    const body = el("div");
    if (!view.shop.length) body.append(el("p", { text: "Sạp trống. Hãy đổi hàng." }));
    view.shop.forEach((offer) => {
      body.append(sheetButton(offer.name + " · " + num(offer.price), offer.desc + (offer.afford ? "" : " " + offer.reason), () => {
        const result = Rules.buy(run, offer.index);
        if (!result.ok) { warn(result.reason); return; }
        settle(result);
        if (dialog.dataset.mode === "shop") showShop();
      }));
    });
    setBody(body);
    const refresh = button("Đổi hàng · " + num(view.refreshCost), () => {
      const result = Rules.refreshShop(run, Math.random);
      if (!result.ok) { warn(result.reason); return; }
      settle(result);
      showShop();
    }, true);
    refresh.disabled = !view.canRefresh;
    setActions([refresh, button("Đóng", closeModal, false)]);
  }
  function showTalents() {
    const view = Rules.present(run);
    openModal("talents", "Thiên phú");
    const body = el("div");
    body.append(el("p", { class: "status", text: "Hiệu quả công pháp: " + Math.round(view.artPower * 100) + "%." }));
    view.talents.forEach((talent) => {
      const rank = CONFIG.ranks[talent.rank];
      body.append(el("div", { class: "item" }, [el("b", { text: talent.name }), el("small", { text: rank.name + " · " + talent.desc })]));
    });
    const names = view.achievements.map((item) => item.name);
    body.append(el("p", { class: "status", text: names.length ? "Thành tựu: " + names.join(", ") + "." : "Chưa có thành tựu." }));
    setBody(body);
    setActions([
      button("Tu lại từ đầu", confirmRestart, false),
      button("Đóng", closeModal, true),
    ]);
  }
  function showBreak() {
    const view = Rules.present(run);
    const br = view.actions.breakthrough;
    if (!br.enabled) { notice(br.reason); return; }
    if (br.kind === "layer") {
      settle(Rules.breakthrough(run, Math.random));
      $("realm-card").classList.remove("pulse");
      void $("realm-card").offsetWidth;
      $("realm-card").classList.add("pulse");
      return;
    }
    openModal("rite", br.label);
    const death = br.death > 0
      ? "Thất bại có " + Math.round(br.death * 100) + "% khả năng đoạt mạng, và làm thọ ngắn lại."
      : "Thất bại làm tán tu vi và tổn thọ, chưa đến mức đoạt mạng.";
    const next = br.kind === "ascend" ? "Thành công là phi thăng." : "Thành công sẽ sang cảnh giới mới và tăng thọ.";
    const tired = Rules.present(run).stamina < 30 ? "\nThể lực đang thấp, cơ hội bị giảm. Nghỉ rồi hãy phá." : "";
    setBody(el("p", { text: "Cơ hội hiện tại " + Math.round(br.chance * 100) + "%.\n" + next + "\n" + death + tired }));
    const actions = [button(br.label, () => rite(null), true)];
    if (br.talisman) {
      actions.push(button(br.talisman.name + " · " + Math.round(br.talisman.chance * 100) + "%", () => rite(br.talisman.uid), false));
    }
    actions.push(button("Để sau", closeModal, false));
    setActions(actions);
  }
  async function rite(talismanUid) {
    if (uiLock) return;
    uiLock = true;
    dialog.dataset.mode = "rite";
    $("modal-x").hidden = true;
    setActions([]);
    setBody(el("p", { text: "Mây kéo kín đỉnh đầu." }));
    await wait(680);
    setBody(el("p", { text: "Một đạo lôi quang rơi xuống." }));
    await wait(760);
    const result = Rules.breakthrough(run, Math.random, { talismanUid });
    save();
    renderPath();
    const text = (result.fx || []).map((item) => item.text).filter(Boolean).join("\n");
    setBody(el("p", { text: text || result.reason || "" }));
    dialog.dataset.mode = "rite-done";
    $("modal-x").hidden = false;
    setActions([button(run.ending ? "Xem kết cục" : "Tiếp tục", () => {
      closeModal();
      if (run.ending) showEnd();
    }, true)]);
    uiLock = false;
    say(text);
  }

  function warn(text) {
    notice(text);
    if (!dialog.open) return;
    let node = $("modal-warn");
    if (!node) {
      node = el("p", { id: "modal-warn", class: "status" });
      $("modal-body").prepend(node);
    }
    node.textContent = text || "";
  }
  function settle(result) {
    if (uiLock) return;
    if (!result || !result.ok) { warn(result && result.reason); return; }
    save();
    paintFx(result.fx);
    if (result.open === "ending" || (run.ending && result.open !== "combat" && result.open !== "event")) {
      renderPath();
      closeModal();
      showEnd();
      return;
    }
    renderPath();
    if (result.open === "event") { showEvent(); return; }
    if (result.open === "combat") { showCombat(); return; }
    if (dialog.open && (dialog.dataset.mode === "combat" || dialog.dataset.mode === "event")) closeModal();
    else if (dialog.open && dialog.dataset.mode === "bag") showBag();
  }
  function showEnd() {
    closeModal();
    renderEnd();
    show("end");
  }
  let toastStart = false;
  function celebrateStart() {
    if (!toastStart || !run) return;
    toastStart = false;
    const ach = CONFIG.achievements.find((item) => item.id === "nhap-mon");
    if (ach) float("Thành tựu · " + ach.name, false, true);
  }
  function leave() {
    if (run && !run.ending) save();
    openModal("confirm", "Thoát game?");
    setBody(el("p", { text: "Hành trình đã được ghi lại trên máy này. Đóng cửa sổ là thoát." }));
    setActions([
      button("Thoát", () => {
        closeModal();
        window.close();
        setTimeout(() => {
          const text = "Cửa sổ vẫn mở. Hãy đóng cửa sổ game để thoát.";
          notice(text);
          if (run && !$("path").hidden) $("path-notice").textContent = text;
        }, 240);
      }, true),
      button("Ở lại", closeModal, false),
    ]);
  }
  function begin(name, ids) {
    run = Rules.createRun({ name, talentIds: ids, rng: Math.random });
    toastStart = true;
    save();
    show("path");
    renderPath();
    if (run.intro) showIntro();
  }
  function confirmRestart() {
    openModal("confirm", "Tu lại từ đầu?");
    setBody(el("p", { text: "Hành trình hiện tại sẽ bị xóa khỏi máy này." }));
    setActions([
      button("Xóa và chọn lại", () => {
        forget();
        run = null;
        closeModal();
        show("awaken");
        shuffle(Math.random);
        $("resume").hidden = true;
        notice("");
      }, true),
      button("Ở lại", () => { if (run) showTalents(); else closeModal(); }, false),
    ]);
  }
  function resume(saved) {
    run = saved;
    if (run.ending) { showEnd(); return; }
    show("path");
    renderPath();
    const pending = Rules.present(run).pending;
    if (run.intro) showIntro();
    else if (pending && pending.kind === "event") showEvent();
    else if (pending && pending.kind === "combat") showCombat();
  }

  $("guide").addEventListener("click", showGuide);
  $("path-guide").addEventListener("click", showGuide);
  $("quit").addEventListener("click", leave);
  $("path-quit").addEventListener("click", leave);
  $("end-quit").addEventListener("click", leave);
  $("roll").addEventListener("click", () => {
    shuffle(Math.random);
    notice("Đã đổi sáu thiên phú.");
  });
  $("confirm").addEventListener("click", () => {
    if (chosen.size !== 3) return;
    const ids = Array.from(chosen);
    const name = $("dao").value;
    const saved = readSave();
    if (saved && !saved.ending) {
      openModal("confirm", "Bắt đầu đời mới?");
      setBody(el("p", { text: "Máy này còn một hành trình dở. Bắt đầu mới sẽ xóa hành trình đó." }));
      setActions([
        button("Bắt đầu mới", () => { closeModal(); begin(name, ids); }, true),
        button("Tiếp tục đời cũ", () => { closeModal(); resume(saved); }, false),
      ]);
      return;
    }
    begin(name, ids);
  });
  $("resume").addEventListener("click", () => {
    const saved = readSave();
    if (saved) resume(saved);
  });
  $("btn-cultivate").addEventListener("click", () => settle(Rules.cultivate(run, Math.random)));
  $("btn-explore").addEventListener("click", () => settle(Rules.explore(run, Math.random)));
  $("btn-rest").addEventListener("click", () => settle(Rules.rest(run, Math.random)));
  $("btn-break").addEventListener("click", showBreak);
  $("dock-bag").addEventListener("click", showBag);
  $("dock-shop").addEventListener("click", showShop);
  $("dock-talent").addEventListener("click", showTalents);
  $("modal-x").addEventListener("click", closeModal);
  $("end-again").addEventListener("click", () => {
    forget();
    run = null;
    show("awaken");
    shuffle(Math.random);
    $("resume").hidden = true;
  });
  dialog.addEventListener("cancel", (event) => {
    const mode = dialog.dataset.mode;
    if (mode === "combat" || mode === "event" || mode === "rite") event.preventDefault();
    if (mode === "intro" && run) {
      Rules.dismissIntro(run);
      save();
    }
  });
  dialog.addEventListener("close", () => {
    const mode = dialog.dataset.mode;
    dialog.dataset.mode = "";
    if (mode === "intro") celebrateStart();
    if (mode === "rite-done" && run && run.ending) showEnd();
  });
  window.addEventListener("keydown", (event) => {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target && event.target.matches && event.target.matches("input, textarea")) return;
    if ($("path").hidden || dialog.open || !run || run.ending) return;
    const key = { Digit1: "btn-cultivate", Digit2: "btn-explore", Digit3: "btn-rest", Digit4: "btn-break", Numpad1: "btn-cultivate", Numpad2: "btn-explore", Numpad3: "btn-rest", Numpad4: "btn-break" }[event.code];
    if (!key || $(key).disabled) return;
    event.preventDefault();
    $(key).click();
  });

  draw();
  const saved = readSave();
  $("resume").hidden = !saved;
  if (saved && !saved.ending) resume(saved);
})();
