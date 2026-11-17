(function (root) {
  "use strict";

  const C = () => root.CONFIG;

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function irange(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }
  function talent(id) { return C().talents.find((t) => t.id === id); }
  function artDef(id) { return C().arts.find((a) => a.id === id); }
  function gearDef(id) { return C().treasures.find((g) => g.id === id); }
  function talismanDef(id) { return C().talismans.find((t) => t.id === id); }
  function pillDef(id) { return C().pills.find((p) => p.id === id); }
  function realmDef(i) { return C().realms[i]; }
  function encounter(id) { return C().encounters.find((e) => e.id === id); }
  function has(state, id) { return state.talents.includes(id); }
  function cleanName(name) {
    const text = String(name || "").replace(/\s+/g, " ").trim().slice(0, 16);
    return text || "Đệ tử";
  }
  function uid(state) {
    state.seq += 1;
    return "u" + state.seq;
  }
  function pushLog(state, text) {
    state.log.unshift({ year: state.year, text });
    if (state.log.length > 48) state.log.pop();
  }
  function pct(n) { return Math.round(n * 100) + "%"; }

  function artPower(state) {
    let p = 1;
    for (const id of state.talents) {
      const t = talent(id);
      if (t && t.art) p *= t.art;
    }
    return p;
  }
  function learnMult(state) {
    let p = 1;
    for (const id of state.talents) {
      const t = talent(id);
      if (t && t.learn) p *= t.learn;
    }
    return p;
  }
  function sellMult(state) {
    let p = 1;
    for (const id of state.talents) {
      const t = talent(id);
      if (t && t.sell) p *= t.sell;
    }
    return p;
  }
  function maxArts(state) {
    let m = C().start.maxArts;
    for (const id of state.talents) {
      const t = talent(id);
      if (t && t.maxArts) m = Math.min(m, t.maxArts);
    }
    return m;
  }
  function slotCount(state) {
    let s = C().start.slots;
    for (const id of state.talents) {
      const t = talent(id);
      if (t && t.slots) s += t.slots;
    }
    return s;
  }

  function derived(state) {
    const start = C().start;
    let atkM = 1, defM = 1, stamM = 1, tuVi = 0, treasurePp = 0, manualPp = 0;
    for (const id of state.talents) {
      const t = talent(id);
      if (!t) continue;
      if (t.atk) atkM *= 1 + t.atk;
      if (t.def) defM *= 1 + t.def;
      if (t.stam) stamM *= 1 + t.stam;
      if (t.tuVi) tuVi += t.tuVi;
      if (t.treasure) treasurePp += t.treasure;
      if (t.manual) manualPp += t.manual;
    }
    const power = artPower(state);
    let bonusAtk = 0, bonusDef = 0, bonusTu = 0, bonusBreak = 0, bonusStrike = 0;
    let bonusFirst = 0, bonusFlee = 0, bonusRest = 0, bonusDiscount = 0, bonusFind = 0;
    for (const id of state.arts) {
      const a = artDef(id);
      if (!a) continue;
      if (a.all) {
        bonusAtk += a.all * power;
        bonusDef += a.all * power;
        bonusTu += a.all * power;
      }
      if (a.tuVi) bonusTu += a.tuVi * power;
      if (a.def) bonusDef += a.def * power;
      if (a.break) bonusBreak += a.break * power;
      if (a.strike) bonusStrike += a.strike * power;
      if (a.first) bonusFirst += a.first * power;
      if (a.flee) bonusFlee += a.flee * power;
      if (a.rest) bonusRest += a.rest * power;
      if (a.discount) bonusDiscount += a.discount * power;
      if (a.find) bonusFind += a.find * power;
    }
    let gearAtk = 0, gearArm = 0;
    for (const id of state.equipped) {
      const g = state.bag.find((b) => b.uid === id);
      if (!g) continue;
      gearAtk += g.atk;
      gearArm += g.def;
    }
    const atk = (start.atk + state.grown.atk + gearAtk) * atkM * (1 + bonusAtk);
    const def = (start.def + state.grown.def + gearArm) * defM * (1 + bonusDef);
    const stamMax = Math.round(start.stam * stamM);
    const hpMax = Math.round(78 + def * 2.1);
    return {
      atk, def, stamMax, hpMax,
      tuViBonus: tuVi + bonusTu,
      breakBonus: bonusBreak,
      strike: bonusStrike,
      first: bonusFirst,
      fleeChance: Math.min(0.88, 0.42 + bonusFlee),
      rest: bonusRest,
      discount: Math.min(0.55, bonusDiscount),
      treasurePp: treasurePp + bonusFind,
      manualPp: manualPp + bonusFind,
      artPower: power,
      learnMult: learnMult(state),
      sellMult: sellMult(state),
      maxArts: maxArts(state),
      slots: slotCount(state),
    };
  }

  function needOf(state) { return realmDef(state.realm).need; }
  function isWall(state) { return state.layer >= realmDef(state.realm).layers; }
  function breakKind(state) {
    if (!isWall(state)) return "layer";
    return realmDef(state.realm).ascend ? "ascend" : "wall";
  }
  function deathChance(state) {
    if (!isWall(state)) return 0;
    if (state.realm <= 0) return 0;
    if (state.realm === 1) return 0.06;
    if (state.realm === 2) return 0.12;
    if (state.realm === 3) return 0.18;
    return 0.32;
  }
  function breakChance(state) {
    const wall = isWall(state);
    let p = wall ? 0.74 : 0.9;
    p += derived(state).breakBonus + (state.buffs.break || 0);
    if (state.stamina < 30) p -= 0.1;
    return clamp(p, 0.08, 0.95);
  }

  function strikeDamage(atk, def, variance) {
    const raw = atk * 0.86 - def * 0.36;
    const min = atk * 0.24;
    return Math.max(1, Math.round(Math.max(min, raw) * variance));
  }

  function gainTuVi(state, base) {
    const d = derived(state);
    let n = base * (1 + d.tuViBonus);
    if (state.buffs.injury > 0) n *= 0.82;
    n = Math.max(0, Math.round(n));
    state.tuVi += n;
    return n;
  }

  function sync(state) {
    const d = derived(state);
    state.hp = clamp(state.hp, 1, d.hpMax);
    state.stamina = clamp(state.stamina, 0, d.stamMax);
    return d;
  }

  function grant(state, id, fx) {
    if (!Array.isArray(state.achievements)) state.achievements = [];
    if (state.achievements.indexOf(id) !== -1) return;
    const def = (C().achievements || []).find((item) => item.id === id);
    if (!def) return;
    state.achievements.push(id);
    if (fx) fx.push({ type: "achievement", text: "Thành tựu · " + def.name });
  }

  function passYear(state, rng, fx, holdDeath) {
    state.year += 1;
    state.age += 1;
    if (state.buffs.injury > 0) state.buffs.injury -= 1;
    const era = Math.floor(state.year / 4);
    if (era !== state.shopStamp) {
      state.shop = rollShop(state, rng);
      state.shopStamp = era;
    }
    if (!holdDeath && !state.ending && state.age >= state.lifespan) {
      state.ending = { kind: "death", reason: "hết thọ" };
      grant(state, "het-tho", fx);
    }
  }

  function busy(state) {
    if (state.ending) return "Hành trình này đã khép.";
    if (state.pending) return "Hãy giải quyết việc trước mắt.";
    return "";
  }

  function effectLine(state, art) {
    const p = artPower(state);
    const bits = [];
    if (art.all) bits.push("công, thủ, tu vi +" + pct(art.all * p));
    if (art.tuVi) bits.push("tu vi +" + pct(art.tuVi * p));
    if (art.strike) bits.push("đòn đánh +" + pct(art.strike * p));
    if (art.def) bits.push("phòng thủ +" + pct(art.def * p));
    if (art.break) bits.push("đột phá +" + pct(art.break * p));
    if (art.flee) bits.push("thoát hiểm +" + pct(art.flee * p));
    if (art.first) bits.push("đòn đầu +" + pct(art.first * p));
    if (art.rest) bits.push("nghỉ ngơi +" + pct(art.rest * p));
    if (art.discount) bits.push("giá mua -" + pct(art.discount * p));
    if (art.find) bits.push("cơ duyên +" + pct(art.find * p));
    return bits.join(" · ");
  }

  function learnCost(state, artId) {
    const art = artDef(artId);
    const d = derived(state);
    return Math.max(1, Math.round(art.cost * d.learnMult * (1 - d.discount)));
  }
  function sellValue(state, price) {
    return Math.max(1, Math.round(price * 0.55 * derived(state).sellMult));
  }
  function priceOf(state, offer) {
    const d = derived(state);
    let base = 0;
    if (offer.kind === "art") base = artDef(offer.id).cost * d.learnMult;
    else if (offer.kind === "gear") base = gearDef(offer.id).price;
    else if (offer.kind === "pill") base = pillDef(offer.id).price;
    else if (offer.kind === "talisman") base = talismanDef(offer.id).price;
    return Math.max(1, Math.round(base * (1 - d.discount)));
  }

  function offerName(offer) {
    if (offer.kind === "art") return artDef(offer.id).name;
    if (offer.kind === "gear") return gearDef(offer.id).name;
    if (offer.kind === "pill") return pillDef(offer.id).name;
    return talismanDef(offer.id).name;
  }
  function offerDesc(state, offer) {
    if (offer.kind === "art") {
      const art = artDef(offer.id);
      return art.desc + " Hiện tại: " + effectLine(state, art) + ".";
    }
    if (offer.kind === "gear") {
      const g = gearDef(offer.id);
      const atk = previewGearAtk(state, g);
      return g.desc + " Công +" + atk + " · Thủ +" + g.def + ".";
    }
    if (offer.kind === "pill") return pillDef(offer.id).desc;
    return talismanDef(offer.id).desc;
  }
  function previewGearAtk(state, g) {
    if (has(state, "kheo-dung") && g.atk > 0) return Math.max(g.atk + 1, Math.round(g.atk * 1.1));
    return g.atk;
  }

  function rollShop(state, rng) {
    const arts = C().arts.filter((a) => !state.arts.includes(a.id));
    const gears = C().treasures.filter((t) => !state.bag.some((b) => b.id === t.id));
    const offers = [];
    if (arts.length) offers.push({ kind: "art", id: pick(rng, arts).id });
    if (gears.length) offers.push({ kind: "gear", id: pick(rng, gears).id });
    offers.push({ kind: "pill", id: pick(rng, C().pills).id });
    offers.push({ kind: "talisman", id: pick(rng, C().talismans).id });
    return offers;
  }

  function mintGear(state, def) {
    return {
      uid: uid(state),
      id: def.id,
      name: def.name,
      atk: previewGearAtk(state, def),
      def: def.def,
      price: def.price,
      desc: def.desc,
    };
  }

  function giveGear(state, rng, fx) {
    if (state.bag.length >= 6) {
      const stones = sellValue(state, 160);
      state.stones += stones;
      fx.push({ type: "stones", n: stones, text: "Hành trang đầy, đổi pháp bảo lấy " + stones + " linh thạch." });
      return;
    }
    const pool = C().treasures.filter((t) => !state.bag.some((b) => b.id === t.id));
    const def = pool.length ? pick(rng, pool) : null;
    if (!def) {
      const stones = sellValue(state, 200);
      state.stones += stones;
      fx.push({ type: "stones", n: stones, text: "Không còn pháp bảo lạ. Đổi được " + stones + " linh thạch." });
      return;
    }
    const gear = mintGear(state, def);
    state.bag.push(gear);
    const d = derived(state);
    if (state.equipped.length < d.slots) state.equipped.push(gear.uid);
    fx.push({ type: "gear", text: "Nhận " + gear.name + "." });
  }

  function giveManual(state, rng, fx) {
    const pool = C().arts.filter((a) => !state.arts.includes(a.id) && !state.manuals.includes(a.id));
    if (!pool.length) {
      const stones = sellValue(state, 120);
      state.stones += stones;
      fx.push({ type: "stones", n: stones, text: "Công pháp này bạn đã biết. Đổi được " + stones + " linh thạch." });
      return;
    }
    const art = pick(rng, pool);
    state.manuals.push(art.id);
    fx.push({ type: "manual", text: "Nhặt được bí kíp " + art.name + "." });
  }

  function giveTalisman(state, rng, fx) {
    if (state.talismans.length >= 8) {
      fx.push({ type: "log", text: "Túi phù đã đầy." });
      return;
    }
    const def = pick(rng, C().talismans);
    state.talismans.push({ uid: uid(state), id: def.id });
    fx.push({ type: "item", text: "Nhận " + def.name + "." });
  }

  function makeBeast(state, rng, enc, rewardScale) {
    const base = pick(rng, C().beasts);
    const scale = (1 + state.realm * 0.7) * ((enc && enc.scale) || 1);
    const reward = ((enc && enc.reward) || 1) * (rewardScale || 1);
    const wobble = 0.9 + rng() * 0.2;
    return {
      name: (enc && enc.beastName) || base.name,
      hp: Math.max(1, Math.round(base.hp * scale)),
      maxHp: Math.max(1, Math.round(base.hp * scale)),
      atk: Math.max(1, Math.round(base.atk * scale)),
      def: Math.max(0, Math.round(base.def * scale * 0.92)),
      rewardStones: Math.max(1, Math.round(base.stones * scale * reward * wobble)),
      rewardTuVi: Math.max(1, Math.round(base.tuVi * (1 + state.realm * 0.3) * reward)),
    };
  }

  function startCombat(state, rng, enc, gentle, rewardScale) {
    const enemy = state.pending && state.pending.beast ? state.pending.beast : makeBeast(state, rng, enc, rewardScale);
    state.pending = {
      kind: "combat",
      enemy,
      gentle: !!gentle,
      guard: 0,
      round: 0,
      lines: [enemy.name + " chặn đường."],
    };
  }

  function categoryWeights(state) {
    const d = derived(state);
    let weights = { combat: 22, treasure: 13, manual: 13, stones: 16, talisman: 10, story: 26 };
    weights = shift(weights, "treasure", d.treasurePp);
    weights = shift(weights, "manual", d.manualPp);
    return weights;
  }
  function shift(weights, key, pp) {
    if (!pp) return weights;
    const total = Object.values(weights).reduce((s, n) => s + n, 0);
    const p = weights[key] / total;
    const next = Math.min(0.85, p + pp);
    const others = total - weights[key];
    return Object.assign({}, weights, { [key]: (next * others) / (1 - next) });
  }
  function odds(state) {
    const weights = categoryWeights(state);
    const total = Object.values(weights).reduce((s, n) => s + n, 0);
    const out = {};
    for (const key of Object.keys(weights)) out[key] = weights[key] / total;
    return out;
  }
  function rollCategory(state, rng) {
    const weights = categoryWeights(state);
    let ticket = rng() * Object.values(weights).reduce((s, n) => s + n, 0);
    for (const key of Object.keys(weights)) {
      ticket -= weights[key];
      if (ticket <= 0) return key;
    }
    return "story";
  }

  function applyOp(state, op, rng, fx, enc) {
    if (op.op === "log") {
      fx.push({ type: "log", text: op.v });
      return;
    }
    if (op.op === "heal") {
      const d = derived(state);
      const before = state.hp;
      state.hp = Math.min(d.hpMax, state.hp + Math.round(d.hpMax * op.v));
      fx.push({ type: "hp", n: state.hp - before, text: "Sinh lực +" + (state.hp - before) });
      return;
    }
    if (op.op === "hurt") {
      const d = derived(state);
      const loss = Math.max(1, Math.round(d.hpMax * op.v));
      state.hp = Math.max(1, state.hp - loss);
      fx.push({ type: "hp", n: -loss, text: "Sinh lực -" + loss });
      return;
    }
    if (op.op === "tuVi") {
      const n = gainTuVi(state, op.v);
      fx.push({ type: "tuVi", n, text: "Tu vi +" + n });
      return;
    }
    if (op.op === "stones") {
      const n = op.n != null ? op.n : irange(rng, op.min, op.max);
      state.stones += n;
      fx.push({ type: "stones", n, text: "Linh thạch +" + n });
      return;
    }
    if (op.op === "life") {
      state.lifespan += op.v;
      if (op.v < 0 && state.lifespan <= state.age) {
        state.ending = { kind: "death", reason: "kinh mạch" };
        grant(state, "dut-mach", fx);
      }
      fx.push({ type: "life", n: op.v, text: (op.v > 0 ? "Tuổi thọ +" : "Tuổi thọ ") + op.v });
      return;
    }
    if (op.op === "grownAtk") {
      state.grown.atk += op.v;
      fx.push({ type: "log", text: "Tấn công +" + op.v });
      return;
    }
    if (op.op === "breakBuff") {
      state.buffs.break = clamp((state.buffs.break || 0) + op.v, 0, 0.45);
      return;
    }
    if (op.op === "treasure") {
      if (rng() < op.p) giveGear(state, rng, fx);
      else {
        const d = derived(state);
        const loss = Math.max(1, Math.round(d.hpMax * (op.hurt || 0.15)));
        state.hp = Math.max(1, state.hp - loss);
        fx.push({ type: "hp", n: -loss, text: "Cơ quan bật. Sinh lực -" + loss });
      }
      return;
    }
    if (op.op === "manual") {
      giveManual(state, rng, fx);
      return;
    }
    if (op.op === "talisman") {
      for (let i = 0; i < (op.n || 1); i++) giveTalisman(state, rng, fx);
      return;
    }
    if (op.op === "fight") {
      startCombat(state, rng, enc, op.gentle, enc && enc.reward);
      return { open: "combat" };
    }
    if (op.op === "flee") {
      const d = derived(state);
      if (rng() < d.fleeChance) {
        state.pending = null;
        fx.push({ type: "log", text: "Bạn rút lui kịp lúc." });
        return { open: null, fled: true };
      }
      fx.push({ type: "log", text: "Không thoát được." });
      startCombat(state, rng, enc, false, enc && enc.reward);
      enemyStrike(state, rng, fx);
      return { open: "combat" };
    }
  }

  function enemyStrike(state, rng, fx) {
    const fight = state.pending;
    if (!fight || fight.kind !== "combat" || fight.enemy.hp <= 0) return;
    const heavy = fight.round % 2 === 0;
    const variance = (0.9 + rng() * 0.2) * (heavy ? 1.22 : 0.82);
    let dmg = strikeDamage(fight.enemy.atk, derived(state).def, variance);
    if (fight.guard) {
      dmg = Math.max(1, Math.round(dmg * (1 - fight.guard)));
      fight.guard = 0;
    }
    state.hp -= dmg;
    const word = heavy ? "đánh mạnh" : "đánh nhẹ";
    const line = fight.enemy.name + " " + word + ", -" + dmg + ".";
    fight.lines.unshift(line);
    fx.push({ type: "hit", n: -dmg, text: line });
    fight.round += 1;
    if (state.hp <= 0) finishCombat(state, false, fx);
  }

  function finishCombat(state, win, fx) {
    const fight = state.pending;
    if (!fight || fight.kind !== "combat") return;
    const name = fight.enemy.name;
    if (win) {
      state.stones += fight.enemy.rewardStones;
      const tu = gainTuVi(state, fight.enemy.rewardTuVi);
      state.stats.wins += 1;
      if (state.stats.wins === 1) grant(state, "thu-tran", fx);
      const text = "Thắng " + name + ". Linh thạch +" + fight.enemy.rewardStones + ", tu vi +" + tu + ".";
      pushLog(state, text);
      fx.push({ type: "stones", n: fight.enemy.rewardStones, text: "Linh thạch +" + fight.enemy.rewardStones });
      fx.push({ type: "tuVi", n: tu, text: "Tu vi +" + tu });
    } else if (fight.gentle) {
      const d = derived(state);
      state.hp = Math.max(Math.round(d.hpMax * 0.55), 1);
      const text = "Tỷ thí thua " + name + ". Cả hai thu kiếm.";
      pushLog(state, text);
      fx.push({ type: "log", text: text });
    } else {
      const d = derived(state);
      state.hp = Math.max(1, Math.round(d.hpMax * 0.28));
      const lost = Math.min(state.stones, Math.round(state.stones * 0.12));
      state.stones -= lost;
      state.buffs.injury = Math.max(state.buffs.injury, 2);
      const text = "Thua " + name + ". Bạn thoát thân, mất " + lost + " linh thạch.";
      pushLog(state, text);
      fx.push({ type: "log", text: text });
    }
    state.pending = null;
    sync(state);
  }

  function createRun(opts) {
    const rng = opts.rng || Math.random;
    const ids = opts.talentIds.slice();
    if (new Set(ids).size !== 3 || ids.some((id) => !talent(id))) {
      throw new Error("Cần đúng ba thiên phú.");
    }
    const start = C().start;
    const state = {
      v: 1,
      name: cleanName(opts.name),
      talents: ids,
      age: start.age,
      lifespan: start.lifespan,
      year: 0,
      stones: start.stones,
      tuVi: 0,
      realm: 0,
      layer: 1,
      grown: { atk: 0, def: 0 },
      hp: 1,
      stamina: 0,
      arts: [],
      manuals: [],
      bag: [],
      equipped: [],
      talismans: [],
      buffs: { break: 0, injury: 0 },
      log: [],
      stats: { explores: 0, wins: 0, breaks: 0 },
      pending: null,
      ending: null,
      shop: [],
      shopStamp: 0,
      seq: 1,
      intro: true,
      achievements: [],
    };
    grant(state, "nhap-mon");
    for (const id of ids) {
      const t = talent(id);
      if (t.lifespan) state.lifespan += t.lifespan;
      if (t.stones) state.stones += t.stones;
    }
    state.lifespan = Math.max(state.age + 8, state.lifespan);
    if (has(state, "phu-luc")) {
      const pool = C().talismans.slice();
      for (let i = 0; i < 2 && pool.length; i++) {
        const def = pool.splice(Math.floor(rng() * pool.length), 1)[0];
        state.talismans.push({ uid: uid(state), id: def.id });
      }
    }
    const d = sync(state);
    state.hp = d.hpMax;
    state.stamina = d.stamMax;
    state.shop = rollShop(state, rng);
    pushLog(state, "Sư phụ gật đầu. Ba thiên phú đã khắc vào mệnh con.");
    return state;
  }

  function cultivate(state, rng) {
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    const d = derived(state);
    if (state.tuVi >= needOf(state)) return { ok: false, reason: "Tu vi đã đầy. Hãy đột phá.", fx: [] };
    if (state.stamina < C().costs.cultivate) return { ok: false, reason: "Thể lực không đủ để bế quan.", fx: [] };
    state.stamina -= C().costs.cultivate;
    const realm = realmDef(state.realm);
    const base = realm.gain * (1 + (state.layer - 1) * 0.06) * (0.92 + rng() * 0.16);
    const n = gainTuVi(state, base);
    const fx = [{ type: "tuVi", n, text: "Tu vi +" + n }];
    let line = "Bế quan một năm. Tu vi +" + n + ".";
    if (state.buffs.injury > 0) line = "Kinh mạch còn tổn. Tu vi +" + n + ".";
    if (rng() < 0.08) {
      const extra = gainTuVi(state, realm.gain * 0.28);
      fx.push({ type: "tuVi", n: extra, text: "Tâm đắc +" + extra });
      line += " Có một chút tâm đắc.";
    }
    passYear(state, rng, fx);
    pushLog(state, line);
    fx.push({ type: "log", text: line });
    return { ok: true, fx, open: state.ending ? "ending" : null };
  }

  function rest(state, rng) {
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    const d = derived(state);
    if (state.stamina >= d.stamMax && state.hp >= d.hpMax) {
      return { ok: false, reason: "Thể lực và sinh lực đã đầy.", fx: [] };
    }
    const heal = Math.round(d.hpMax * 0.38 * (1 + d.rest));
    const stam = Math.round(d.stamMax * 0.72 * (1 + d.rest));
    const beforeHp = state.hp;
    const beforeSt = state.stamina;
    state.hp = Math.min(d.hpMax, state.hp + heal);
    state.stamina = Math.min(d.stamMax, state.stamina + stam);
    const fx = [];
    passYear(state, rng, fx);
    const parts = [];
    if (state.hp - beforeHp > 0) parts.push("Sinh lực +" + (state.hp - beforeHp));
    if (state.stamina - beforeSt > 0) parts.push("Thể lực +" + (state.stamina - beforeSt));
    const text = "Nghỉ ngơi" + (parts.length ? ". " + parts.join(", ") + "." : ".");
    pushLog(state, text);
    fx.push(
      { type: "hp", n: state.hp - beforeHp, text: "Sinh lực +" + (state.hp - beforeHp) },
      { type: "stam", n: state.stamina - beforeSt, text: "Thể lực +" + (state.stamina - beforeSt) },
      { type: "log", text }
    );
    return { ok: true, fx, open: state.ending ? "ending" : null };
  }

  function explore(state, rng) {
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    if (state.stamina < C().costs.explore) return { ok: false, reason: "Thể lực không đủ để xuống núi.", fx: [] };
    state.stamina -= C().costs.explore;
    state.stats.explores += 1;
    const fx = [];
    passYear(state, rng, fx);
    if (state.stats.explores === 10) grant(state, "muoi-ky", fx);
    if (state.ending) {
      pushLog(state, "Thọ nguyên đứt trên đường xuống núi.");
      fx.push({ type: "log", text: "Thọ nguyên đứt trên đường xuống núi." });
      return { ok: true, fx, open: "ending" };
    }
    const cat = rollCategory(state, rng);
    const pool = C().encounters.filter((e) => e.cat === cat);
    const enc = pick(rng, pool);
    const beast = enc.cat === "combat" || enc.beastName ? makeBeast(state, rng, enc, 1) : null;
    state.pending = { kind: "event", eventId: enc.id, beast };
    pushLog(state, "Kỳ ngộ: " + enc.title + ".");
    return { ok: true, fx, open: "event" };
  }

  function choose(state, choiceId, rng) {
    if (state.ending) return { ok: false, reason: "Hành trình này đã khép.", fx: [] };
    if (!state.pending || state.pending.kind !== "event") return { ok: false, reason: "Không có việc để chọn.", fx: [] };
    const enc = encounter(state.pending.eventId);
    const choice = enc.choices.find((c) => c.id === choiceId);
    if (!choice) return { ok: false, reason: "Không có lựa chọn này.", fx: [] };
    const fx = [];
    let open = null;
    for (const op of choice.ops) {
      const result = applyOp(state, op, rng, fx, enc);
      if (result && result.open) open = result.open;
      if (result && result.fled) open = null;
    }
    if (state.pending && state.pending.kind === "event") state.pending = null;
    for (const item of fx) {
      if (item.text) pushLog(state, item.text);
    }
    if (state.ending) open = "ending";
    sync(state);
    return { ok: true, fx, open };
  }

  function combatAct(state, action, rng) {
    if (state.ending) return { ok: false, reason: "Hành trình này đã khép.", fx: [] };
    const fight = state.pending;
    if (!fight || fight.kind !== "combat") return { ok: false, reason: "Không trong trận.", fx: [] };
    const fx = [];
    const d = derived(state);
    if (action === "strike") {
      let atk = d.atk * (1 + d.strike);
      if (fight.round === 0) atk *= 1 + d.first;
      const dmg = strikeDamage(atk, fight.enemy.def, 0.9 + rng() * 0.2);
      fight.enemy.hp -= dmg;
      const line = "Bạn đánh, -" + dmg + ".";
      fight.lines.unshift(line);
      fx.push({ type: "hit", n: dmg, text: line });
      if (fight.enemy.hp <= 0) {
        finishCombat(state, true, fx);
        return { ok: true, fx, open: state.ending ? "ending" : null };
      }
      enemyStrike(state, rng, fx);
      return { ok: true, fx, open: state.pending ? "combat" : (state.ending ? "ending" : null) };
    }
    if (action === "guard") {
      fight.guard = 0.5;
      state.stamina = Math.min(d.stamMax, state.stamina + 8);
      fight.lines.unshift("Bạn thủ thế.");
      fx.push({ type: "log", text: "Bạn thủ thế." });
      enemyStrike(state, rng, fx);
      return { ok: true, fx, open: state.pending ? "combat" : null };
    }
    if (action === "flee") {
      if (rng() < d.fleeChance) {
        pushLog(state, "Bạn thoát khỏi " + fight.enemy.name + ".");
        state.pending = null;
        fx.push({ type: "log", text: "Bạn thoát được." });
        return { ok: true, fx, open: null };
      }
      fight.lines.unshift("Không thoát được.");
      fx.push({ type: "log", text: "Không thoát được." });
      enemyStrike(state, rng, fx);
      return { ok: true, fx, open: state.pending ? "combat" : null };
    }
    if (action && action.indexOf("talisman:") === 0) {
      const id = action.slice("talisman:".length);
      const item = state.talismans.find((t) => t.uid === id);
      if (!item) return { ok: false, reason: "Không còn lá phù đó.", fx: [] };
      const def = talismanDef(item.id);
      if (!def.heal && !def.bolt && !def.guard) return { ok: false, reason: "Phù này không dùng trong trận.", fx: [] };
      state.talismans = state.talismans.filter((t) => t.uid !== id);
      if (def.heal) {
        const gain = Math.round(d.hpMax * def.heal);
        state.hp = Math.min(d.hpMax, state.hp + gain);
        fight.lines.unshift(def.name + ". Sinh lực +" + gain + ".");
        fx.push({ type: "hp", n: gain, text: "Sinh lực +" + gain });
      } else if (def.guard) {
        fight.guard = Math.max(fight.guard, def.guard);
        fight.lines.unshift(def.name + " bọc lấy người.");
        fx.push({ type: "log", text: def.name + " đã kích." });
      } else if (def.bolt) {
        const dmg = Math.max(1, Math.round((20 + d.atk * 0.62) * (0.92 + rng() * 0.16)));
        fight.enemy.hp -= dmg;
        fight.lines.unshift(def.name + " giáng xuống, -" + dmg + ".");
        fx.push({ type: "hit", n: dmg, text: "Lôi phù -" + dmg });
        if (fight.enemy.hp <= 0) {
          finishCombat(state, true, fx);
          return { ok: true, fx, open: null };
        }
      }
      enemyStrike(state, rng, fx);
      return { ok: true, fx, open: state.pending ? "combat" : null };
    }
    return { ok: false, reason: "Không có hành động này.", fx: [] };
  }

  function takeTalisman(state, uid) {
    const item = state.talismans.find((t) => t.uid === uid);
    if (!item) return null;
    state.talismans = state.talismans.filter((t) => t.uid !== uid);
    return item;
  }

  function breakthrough(state, rng, opts) {
    opts = opts || {};
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    if (state.tuVi < needOf(state)) return { ok: false, reason: "Tu vi chưa đủ.", fx: [] };
    if (state.stamina < C().costs.break) return { ok: false, reason: "Thể lực không đủ để đột phá.", fx: [] };
    let extra = 0;
    if (opts.talismanUid) {
      const item = state.talismans.find((t) => t.uid === opts.talismanUid);
      const def = item && talismanDef(item.id);
      if (!def || !def.brk) return { ok: false, reason: "Phù này không dùng để phá kiếp.", fx: [] };
      takeTalisman(state, item.uid);
      extra = def.brk;
    }
    const wall = isWall(state);
    const kind = breakKind(state);
    const chance = clamp(breakChance(state) + extra, 0.08, 0.97);
    const success = rng() < chance;
    state.stamina -= C().costs.break;
    state.buffs.break = 0;
    const fx = [];
    if (success) {
      state.tuVi = Math.max(0, state.tuVi - needOf(state));
      const realm = realmDef(state.realm);
      if (kind === "ascend") {
        state.stats.breaks += 1;
        passYear(state, rng, fx, true);
        state.ending = { kind: "ascend", reason: "phi thăng" };
        grant(state, "phi-thang", fx);
        const text = "Lôi kiếp tan. Bạn bước khỏi vòng sinh tử.";
        pushLog(state, text);
        fx.push({ type: "log", text });
      } else if (kind === "wall") {
        const next = realmDef(state.realm + 1);
        state.realm += 1;
        state.layer = 1;
        state.lifespan += next.life;
        state.grown.atk += next.atk;
        state.grown.def += next.def;
        state.stats.breaks += 1;
        state.buffs.injury = 0;
        const filled = sync(state);
        state.hp = filled.hpMax;
        state.stamina = filled.stamMax;
        grant(state, next.id, fx);
        passYear(state, rng, fx);
        const text = "Phá cảnh thành công. Bạn bước vào " + next.name + ". Thọ +" + next.life + ".";
        pushLog(state, text);
        fx.push({ type: "log", text });
      } else {
        state.layer += 1;
        state.grown.atk += realm.atk;
        state.grown.def += realm.def;
        state.stats.breaks += 1;
        const filled = derived(state);
        state.hp = Math.min(filled.hpMax, state.hp + Math.round(filled.hpMax * 0.4));
        const text = realm.name + " tầng " + state.layer + ". Kinh mạch mở thêm một vòng.";
        pushLog(state, text);
        fx.push({ type: "log", text });
      }
    } else {
      state.tuVi = Math.round(state.tuVi * (wall ? 0.55 : 0.75));
      state.hp = Math.max(1, Math.round(state.hp * (wall ? 0.58 : 0.82)));
      state.buffs.injury = Math.max(state.buffs.injury, wall ? 3 : 1);
      if (wall) {
        state.lifespan -= state.realm >= 2 ? 8 : 4;
        const die = rng() < deathChance(state) || state.lifespan <= state.age;
        if (die) {
          state.ending = { kind: "death", reason: "lôi kiếp" };
          grant(state, "loi-kiep", fx);
        }
        passYear(state, rng, fx);
        const text = state.ending && state.ending.reason === "lôi kiếp"
          ? "Lôi kiếp đánh nát kinh mạch."
          : "Phá cảnh thất bại. Thọ giảm, kinh mạch chấn động.";
        pushLog(state, text);
        fx.push({ type: "log", text });
      } else {
        const text = "Tầng này chưa phá được. Tu vi tán bớt.";
        pushLog(state, text);
        fx.push({ type: "log", text });
      }
    }
    if (state.ending && state.ending.kind === "ascend") {
      return { ok: true, fx, open: "ending" };
    }
    return { ok: true, fx, open: state.ending ? "ending" : null };
  }

  function learnManual(state, artId) {
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    if (!state.manuals.includes(artId)) return { ok: false, reason: "Không có bí kíp này.", fx: [] };
    if (state.arts.length >= maxArts(state)) return { ok: false, reason: "Đã đủ số công pháp.", fx: [] };
    const cost = learnCost(state, artId);
    if (state.stones < cost) return { ok: false, reason: "Không đủ linh thạch.", fx: [] };
    state.stones -= cost;
    state.manuals = state.manuals.filter((id) => id !== artId);
    state.arts.push(artId);
    const text = "Lĩnh ngộ " + artDef(artId).name + ".";
    pushLog(state, text);
    const fx = [{ type: "log", text }];
    if (state.arts.length === 1) grant(state, "cong-phap", fx);
    return { ok: true, fx, open: null };
  }

  function toggleEquip(state, gearUid) {
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    const gear = state.bag.find((g) => g.uid === gearUid);
    if (!gear) return { ok: false, reason: "Không có pháp bảo này.", fx: [] };
    if (state.equipped.includes(gearUid)) {
      state.equipped = state.equipped.filter((id) => id !== gearUid);
      sync(state);
      return { ok: true, fx: [{ type: "log", text: "Gỡ " + gear.name + "." }], open: null };
    }
    if (state.equipped.length >= slotCount(state)) {
      return { ok: false, reason: "Hãy gỡ một pháp bảo trước.", fx: [] };
    }
    state.equipped.push(gearUid);
    sync(state);
    return { ok: true, fx: [{ type: "log", text: "Dùng " + gear.name + "." }], open: null };
  }

  function sellGear(state, gearUid) {
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    if (state.equipped.includes(gearUid)) return { ok: false, reason: "Hãy gỡ pháp bảo trước khi bán.", fx: [] };
    const gear = state.bag.find((g) => g.uid === gearUid);
    if (!gear) return { ok: false, reason: "Không có pháp bảo này.", fx: [] };
    const price = sellValue(state, gear.price);
    state.bag = state.bag.filter((g) => g.uid !== gearUid);
    state.stones += price;
    const text = "Bán " + gear.name + ", +" + price + " linh thạch.";
    pushLog(state, text);
    return { ok: true, fx: [{ type: "stones", n: price, text }], open: null };
  }

  function useTalisman(state, talismanUid) {
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    const item = state.talismans.find((t) => t.uid === talismanUid);
    if (!item) return { ok: false, reason: "Không còn lá phù đó.", fx: [] };
    const def = talismanDef(item.id);
    if (def.bolt || def.guard) return { ok: false, reason: "Chỉ dùng khi giao đấu.", fx: [] };
    takeTalisman(state, item.uid);
    const d = derived(state);
    const fx = [];
    if (def.heal) {
      const gain = Math.round(d.hpMax * def.heal);
      const before = state.hp;
      state.hp = Math.min(d.hpMax, state.hp + gain);
      fx.push({ type: "hp", n: state.hp - before, text: "Sinh lực +" + (state.hp - before) });
    }
    if (def.life) {
      state.lifespan += def.life;
      fx.push({ type: "life", n: def.life, text: "Tuổi thọ +" + def.life });
    }
    if (def.brk) {
      state.buffs.break = clamp((state.buffs.break || 0) + def.brk, 0, 0.6);
      fx.push({ type: "log", text: "Lần đột phá sau dễ hơn." });
    }
    const text = "Dùng " + def.name + ".";
    pushLog(state, text);
    fx.push({ type: "log", text });
    return { ok: true, fx, open: null };
  }

  function buy(state, index) {
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    const offer = state.shop[index];
    if (!offer) return { ok: false, reason: "Món này đã bán.", fx: [] };
    if (offer.kind === "art" && state.arts.length >= maxArts(state)) {
      return { ok: false, reason: "Đã đủ số công pháp.", fx: [] };
    }
    if (offer.kind === "gear" && state.bag.length >= 6) return { ok: false, reason: "Hành trang đã đầy.", fx: [] };
    if (offer.kind === "talisman" && state.talismans.length >= 8) return { ok: false, reason: "Túi phù đã đầy.", fx: [] };
    const price = priceOf(state, offer);
    if (state.stones < price) return { ok: false, reason: "Không đủ linh thạch.", fx: [] };
    state.stones -= price;
    state.shop.splice(index, 1);
    const fx = [];
    if (offer.kind === "art") {
      state.arts.push(offer.id);
      fx.push({ type: "log", text: "Học " + artDef(offer.id).name + "." });
      if (state.arts.length === 1) grant(state, "cong-phap", fx);
    } else if (offer.kind === "gear") {
      const gear = mintGear(state, gearDef(offer.id));
      state.bag.push(gear);
      if (state.equipped.length < slotCount(state)) state.equipped.push(gear.uid);
      sync(state);
      fx.push({ type: "gear", text: "Mua " + gear.name + "." });
    } else if (offer.kind === "pill") {
      const pill = pillDef(offer.id);
      const d = derived(state);
      if (pill.stam) state.stamina = Math.min(d.stamMax, state.stamina + pill.stam);
      if (pill.heal) state.hp = Math.min(d.hpMax, state.hp + Math.round(d.hpMax * pill.heal));
      if (pill.life) state.lifespan += pill.life;
      fx.push({ type: "log", text: "Dùng " + pill.name + "." });
    } else if (offer.kind === "talisman") {
      state.talismans.push({ uid: uid(state), id: offer.id });
      fx.push({ type: "item", text: "Mua " + talismanDef(offer.id).name + "." });
    }
    pushLog(state, fx[0].text);
    return { ok: true, fx, open: null };
  }

  function refreshShop(state, rng) {
    const why = busy(state);
    if (why) return { ok: false, reason: why, fx: [] };
    const cost = C().costs.refresh;
    if (state.stones < cost) return { ok: false, reason: "Không đủ linh thạch để đổi hàng.", fx: [] };
    state.stones -= cost;
    state.shop = rollShop(state, rng);
    return { ok: true, fx: [{ type: "log", text: "Chợ đổi hàng." }], open: null };
  }

  function dismissIntro(state) {
    state.intro = false;
    return { ok: true, fx: [], open: null };
  }

  function present(state) {
    const d = derived(state);
    const realm = realmDef(state.realm);
    const need = needOf(state);
    const kind = breakKind(state);
    const block = busy(state);
    const ready = !block && state.tuVi >= need;
    const labels = { layer: "Phá tầng", wall: "Phá cảnh", ascend: "Phi thăng" };
    const breakTalisman = state.talismans.map((t) => ({ t, def: talismanDef(t.id) })).find((x) => x.def && x.def.brk);
    const chance = breakChance(state);
    const remaining = state.lifespan - state.age;
    let hint = "";
    if (block) hint = block === "Hành trình này đã khép." ? "" : "Có việc đang chờ.";
    else if (remaining <= 6) hint = "Chỉ còn " + remaining + " năm.";
    else if (state.tuVi >= need) hint = kind === "ascend" ? "Đủ lực để độ kiếp." : "Tu vi đã đầy. Có thể đột phá.";
    else if (state.buffs.injury > 0) hint = "Kinh mạch đang tổn thương, tu vi vào chậm.";
    else if (state.stamina < C().costs.cultivate) hint = "Thể lực mỏng. Nên nghỉ ngơi.";
    const actions = {
      cultivate: {
        enabled: !block && state.tuVi < need && state.stamina >= C().costs.cultivate,
        reason: block || (state.tuVi >= need ? "Tu vi đã đầy. Hãy đột phá." : "Thể lực không đủ để bế quan."),
      },
      explore: {
        enabled: !block && state.stamina >= C().costs.explore,
        reason: block || "Thể lực không đủ để xuống núi.",
      },
      rest: {
        enabled: !block && (state.stamina < d.stamMax || state.hp < d.hpMax),
        reason: block || "Thể lực và sinh lực đã đầy.",
      },
      breakthrough: {
        enabled: ready && state.stamina >= C().costs.break,
        reason: block || (state.tuVi < need ? "Còn thiếu " + Math.max(0, need - state.tuVi) + " tu vi." : "Thể lực không đủ để đột phá."),
        kind, chance, death: deathChance(state), label: labels[kind],
        talisman: breakTalisman ? {
          uid: breakTalisman.t.uid,
          name: breakTalisman.def.name,
          chance: clamp(chance + breakTalisman.def.brk, 0.08, 0.97),
        } : null,
      },
    };
    return {
      name: state.name,
      year: state.year,
      age: state.age,
      lifespan: state.lifespan,
      remaining,
      warning: remaining <= 8,
      hint,
      realmName: realm.name,
      realmIndex: state.realm,
      realmCount: C().realms.length,
      layer: state.layer,
      layers: realm.layers,
      tuVi: state.tuVi,
      need,
      tuViPct: clamp(state.tuVi / need, 0, 1),
      hp: state.hp,
      hpMax: d.hpMax,
      hpPct: clamp(state.hp / d.hpMax, 0, 1),
      stamina: state.stamina,
      stamMax: d.stamMax,
      stamPct: clamp(state.stamina / d.stamMax, 0, 1),
      atk: Math.round(d.atk),
      def: Math.round(d.def),
      stones: state.stones,
      artPower: d.artPower,
      maxArts: d.maxArts,
      slots: d.slots,
      injury: state.buffs.injury > 0,
      breakBuff: state.buffs.break || 0,
      talents: state.talents.map((id) => talent(id)),
      arts: state.arts.map((id) => {
        const art = artDef(id);
        return { id, name: art.name, desc: art.desc, effect: effectLine(state, art) };
      }),
      manuals: state.manuals.map((id) => {
        const art = artDef(id);
        const cost = learnCost(state, id);
        return { id, name: art.name, desc: art.desc, effect: effectLine(state, art), cost, afford: state.stones >= cost && state.arts.length < d.maxArts };
      }),
      bag: state.bag.map((g) => ({
        uid: g.uid, name: g.name, desc: g.desc, atk: g.atk, def: g.def,
        equipped: state.equipped.includes(g.uid),
        sell: sellValue(state, g.price),
      })),
      talismans: state.talismans.map((t) => {
        const def = talismanDef(t.id);
        return { uid: t.uid, id: t.id, name: def.name, desc: def.desc, combat: !!(def.bolt || def.guard), field: !!(def.heal || def.life || def.brk) };
      }),
      shop: state.shop.map((offer, index) => {
        const price = priceOf(state, offer);
        let reason = "";
        if (state.stones < price) reason = "Không đủ linh thạch.";
        if (offer.kind === "art" && state.arts.length >= d.maxArts) reason = "Đã đủ số công pháp.";
        return { index, kind: offer.kind, name: offerName(offer), desc: offerDesc(state, offer), price, afford: !reason, reason };
      }),
      refreshCost: C().costs.refresh,
      canRefresh: !busy(state) && state.stones >= C().costs.refresh,
      log: state.log.slice(0, 14),
      achievements: (C().achievements || []).filter((item) => (state.achievements || []).indexOf(item.id) !== -1).map((item) => ({ name: item.name, desc: item.desc })),
      actions, stats: state.stats, intro: state.intro, ending: state.ending ? endingView(state) : null,
      pending: pendingView(state),
    };
  }

  function pendingView(state) {
    if (!state.pending) return null;
    if (state.pending.kind === "event") {
      const enc = encounter(state.pending.eventId);
      let text = enc.text;
      if (state.pending.beast && enc.cat === "combat") text += "\n\nĐối thủ: " + state.pending.beast.name + ".";
      return { kind: "event", title: enc.title, text, choices: enc.choices.map((c) => ({ id: c.id, label: c.label })) };
    }
    const enemy = state.pending.enemy;
    const d = derived(state);
    let atk = d.atk * (1 + d.strike);
    if (state.pending.round === 0) atk *= 1 + d.first;
    const heavy = state.pending.round % 2 === 0;
    return {
      kind: "combat",
      lines: state.pending.lines.slice(0, 6),
      guard: state.pending.guard,
      enemy: { name: enemy.name, hp: Math.max(0, enemy.hp), maxHp: enemy.maxHp, intent: heavy ? "Đòn nặng" : "Đòn nhẹ" },
      you: { hp: Math.max(0, state.hp), maxHp: d.hpMax },
      preview: strikeDamage(atk, enemy.def, 1),
      threat: strikeDamage(enemy.atk, d.def, heavy ? 1.22 : 0.82),
      talismans: state.talismans.filter((t) => {
        const def = talismanDef(t.id);
        return def && (def.heal || def.bolt || def.guard);
      }).map((t) => ({ uid: t.uid, name: talismanDef(t.id).name })),
    };
  }

  function endingView(state) {
    const realm = realmDef(state.realm);
    const ascend = state.ending.kind === "ascend";
    const titles = { "phi thăng": "Phi thăng", "hết thọ": "Hết thọ", "lôi kiếp": "Lôi kiếp", "kinh mạch": "Đứt mạch" };
    const texts = {
      "phi thăng": "Lôi kiếp tan. Bạn bước ra khỏi vòng nhân quả. Trong gió như có tiếng Thái Công mỉm cười.",
      "hết thọ": "Thọ nguyên đã cạn. Đèn tắt, còn lại cảnh giới và những năm tháng trên đường.",
      "lôi kiếp": "Lôi kiếp đánh nát kinh mạch. Bạn ngã xuống giữa tiếng sấm.",
      "kinh mạch": "Một lựa chọn quá tay làm kinh mạch đứt lìa.",
    };
    return {
      kind: state.ending.kind,
      title: ascend ? "Phi thăng" : (titles[state.ending.reason] || "Tạ thế"),
      text: texts[state.ending.reason] || texts["hết thọ"],
      name: state.name,
      age: state.age,
      realm: ascend ? "Phi thăng" : realm.name + " · tầng " + state.layer,
      stones: state.stones,
      explores: state.stats.explores,
      wins: state.stats.wins,
      breaks: state.stats.breaks,
      talents: state.talents.map((id) => talent(id).name),
      arts: state.arts.map((id) => artDef(id).name),
      achievements: (state.achievements || []).map((id) => {
        const def = (C().achievements || []).find((item) => item.id === id);
        return def ? def.name : "";
      }).filter(Boolean),
    };
  }

  function serialize(state) { return JSON.stringify(state); }
  function hydrate(raw) {
    try {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!data || data.v !== 1 || !Array.isArray(data.talents) || data.talents.length !== 3) return null;
      if (data.talents.some((id) => !talent(id))) return null;
      if (!Array.isArray(data.arts) || !Array.isArray(data.bag) || !Array.isArray(data.log)) return null;
      if (data.realm < 0 || data.realm >= C().realms.length) return null;
      if (!Array.isArray(data.achievements)) data.achievements = ["nhap-mon"];
      return data;
    } catch (err) {
      return null;
    }
  }

  root.Rules = {
    createRun, derived, artPower, learnCost, sellValue, priceOf, odds,
    cultivate, rest, explore, choose, combatAct, breakthrough,
    learnManual, toggleEquip, sellGear, useTalisman, buy, refreshShop, dismissIntro,
    present, serialize, hydrate, strikeDamage,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
