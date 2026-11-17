const fs = require("fs");
const vm = require("vm");
const path = require("path");

const context = {};
vm.createContext(context);
for (const file of ["js/config.js", "js/rules.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}
const { CONFIG, Rules } = context;
let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error("FAIL:", msg);
  }
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function run(name, ids, rng) {
  return Rules.createRun({ name, talentIds: ids, rng: rng || mulberry32(1) });
}

const base = run("A", ["can-hoc", "quy-tho", "tai-tao"]);
assert(base.stones === 50, "base stones");
assert(base.lifespan === 94, "quy tho lifespan " + base.lifespan);
const d0 = Rules.derived(base);
assert(Math.abs(d0.atk - 12 * 1.1) < 0.01, "tai tao atk " + d0.atk);
assert(Math.abs(d0.def - 10 * 1.2 * 1.1) < 0.01, "def stack " + d0.def);
assert(d0.stamMax === Math.round(100 * 1.1), "stam " + d0.stamMax);
assert(Math.abs(d0.tuViBonus - 0.2) < 0.001, "tu vi bonus");
assert(base.hp === d0.hpMax && base.stamina === d0.stamMax, "full vitals");

const poor = run("B", ["di-ma", "menh-ngheo", "mot-mon"]);
assert(poor.lifespan === 54, "di ma life " + poor.lifespan);
assert(Rules.derived(poor).maxArts === 3, "cap 3");
assert(Math.abs(Rules.artPower(poor) - 3) < 0.001, "art x3");
assert(Math.abs(Rules.derived(poor).atk - 12 * 1.2) < 0.01, "di ma atk");
const cost = Rules.learnCost(poor, "tam-phap");
assert(cost === Math.round(140 * 0.5), "learn half " + cost);

const both = run("C", ["menh-ngheo", "tinh-gian", "hoc-doi"]);
assert(Math.abs(Rules.artPower(both) - 0.85 * 1.1) < 0.001, "art stack " + Rules.artPower(both));
assert(Rules.learnCost(both, "tam-phap") === Math.round(140 * 0.5 * 0.7), "learn stack " + Rules.learnCost(both, "tam-phap"));
assert(Rules.sellValue(both, 200) === Math.round(200 * 0.55 * 0.5), "sell half");

const rich = run("D", ["gia-tai", "phu-luc", "tien-nhan"], mulberry32(3));
assert(rich.stones === 1050, "rich stones");
assert(rich.talismans.length === 2, "two talismans");
assert(new Set(rich.talismans.map((t) => t.id)).size === 2, "distinct talismans");
assert(Rules.derived(rich).slots === 2, "two slots");

const clever = run("E", ["kheo-dung", "tam-bao", "tam-phap"]);
const gear = CONFIG.treasures[0];
assert(Math.max(gear.atk + 1, Math.round(gear.atk * 1.1)) === 5, "preview formula");
const plain = Rules.odds(base);
const hunter = Rules.odds(clever);
assert(Math.abs(plain.treasure - 0.13) < 0.01, "base treasure " + plain.treasure);
assert(Math.abs(hunter.treasure - 0.18) < 0.012, "treasure +5pp " + hunter.treasure);
assert(Math.abs(hunter.manual - 0.18) < 0.02, "manual +5pp " + hunter.manual);

let s = run("F", ["can-hoc", "quy-tho", "tai-tao"], () => 0);
const gained = Rules.cultivate(s, () => 0);
assert(gained.ok && s.tuVi > 32, "cultivate gain " + s.tuVi);
assert(s.age === 17 && s.year === 1, "year passed");
s.stamina = 0;
assert(!Rules.cultivate(s, () => 0).ok, "tired");
assert(!Rules.explore(s, () => 0).ok, "tired explore");
const rested = Rules.rest(s, () => 0);
assert(rested.ok && s.stamina > 0, "rested");

s.tuVi = Rules.present(s).need;
const inner = Rules.breakthrough(s, () => 0);
assert(inner.ok && s.layer === 2, "inner layer " + s.layer);
assert(s.year === 2, "inner break spends no year " + s.year);

s.age = s.lifespan - 1;
const dead = Rules.rest(s, () => 0);
assert(dead.open === "ending" && s.ending.kind === "death", "age death");

const climber = run("G", ["can-hoc", "quy-tho", "tai-tao"], () => 0);
let guard = 0;
while (!climber.ending && guard++ < 400) {
  const view = Rules.present(climber);
  if (view.tuVi >= view.need && view.actions.breakthrough.enabled) {
    const res = Rules.breakthrough(climber, () => 0);
    assert(res.ok, "break failed " + res.reason);
  } else if (view.actions.cultivate.enabled) {
    Rules.cultivate(climber, () => 0);
  } else {
    Rules.rest(climber, () => 0);
  }
}
assert(climber.ending && climber.ending.kind === "ascend", "scripted ascend " + (climber.ending && climber.ending.kind) + " age " + climber.age + "/" + climber.lifespan + " realm " + climber.realm);
assert(climber.age < climber.lifespan || climber.ending.kind === "ascend", "alive at ascend");

const round = Rules.serialize(base);
const back = Rules.hydrate(round);
assert(back && back.name === "A" && back.talents.length === 3, "roundtrip");
assert(Rules.hydrate("{") === null, "bad json");
assert(Rules.hydrate('{"v":1,"talents":["nope","nope","nope"]}') === null, "bad talent");

const fighter = run("H", ["di-ma", "tai-tao", "kheo-dung"], mulberry32(9));
fighter.stamina = Rules.derived(fighter).stamMax;
const trip = Rules.explore(fighter, mulberry32(9));
assert(trip.ok, "explore");
if (fighter.pending && fighter.pending.kind === "event") {
  const choice = Rules.present(fighter).pending.choices[0];
  Rules.choose(fighter, choice.id, mulberry32(11));
}
let turns = 0;
while (fighter.pending && fighter.pending.kind === "combat" && turns++ < 40) {
  Rules.combatAct(fighter, "strike", mulberry32(turns + 3));
}
assert(!fighter.pending || fighter.pending.kind !== "combat", "combat ends");

function play(seed, ids) {
  const rng = mulberry32(seed);
  const state = run("Bot", ids, rng);
  let steps = 0;
  while (!state.ending && steps++ < 500) {
    if (state.pending && state.pending.kind === "event") {
      const choice = state.pending && Rules.present(state).pending.choices[0];
      Rules.choose(state, choice.id, rng);
      continue;
    }
    if (state.pending && state.pending.kind === "combat") {
      const view = Rules.present(state);
      const heal = view.pending.talismans.find((t) => /Hồi Xuân/.test(t.name));
      if (view.hpPct < 0.35 && heal) Rules.combatAct(state, "talisman:" + heal.uid, rng);
      else if (view.pending.you.hp < view.pending.threat * 2) Rules.combatAct(state, "guard", rng);
      else Rules.combatAct(state, "strike", rng);
      continue;
    }
    const view = Rules.present(state);
    if (view.tuVi >= view.need && view.actions.breakthrough.enabled) {
      const talisman = view.actions.breakthrough.talisman;
      const use = talisman && view.actions.breakthrough.chance < 0.8;
      Rules.breakthrough(state, rng, use ? { talismanUid: talisman.uid } : {});
    } else if (view.manuals.some((m) => m.afford) && state.arts.length < view.maxArts) {
      const manual = view.manuals.find((m) => m.afford);
      Rules.learnManual(state, manual.id);
    } else if (view.shop.some((o) => o.afford && o.kind === "art") && state.arts.length < 2 && state.stones > 180) {
      const offer = view.shop.find((o) => o.afford && o.kind === "art");
      Rules.buy(state, offer.index);
    } else if (!view.actions.cultivate.enabled && view.actions.rest.enabled) {
      Rules.rest(state, rng);
    } else if (state.stats.explores < 12 && view.actions.explore.enabled && state.stones < 160) {
      Rules.explore(state, rng);
    } else if (view.actions.cultivate.enabled) {
      Rules.cultivate(state, rng);
    } else if (view.actions.rest.enabled) {
      Rules.rest(state, rng);
    } else break;
  }
  return state;
}

const seeds = [1, 2, 3, 4, 5, 7, 8, 11, 13, 17, 19, 23, 29, 31, 37, 41];
let wins = 0;
const notes = [];
for (const seed of seeds) {
  const end = play(seed, ["can-hoc", "quy-tho", "tai-tao"]);
  const kind = end.ending && end.ending.kind;
  if (kind === "ascend") wins += 1;
  notes.push(seed + ":" + (kind || "stuck") + "@" + end.age + "/" + end.lifespan + " r" + end.realm + " left" + (end.lifespan - end.age));
}
console.log("good build", wins + "/" + seeds.length, notes.join(" "));
assert(wins >= Math.ceil(seeds.length * 0.6), "good build should mostly ascend");

let hardWins = 0;
for (const seed of seeds) {
  const end = play(seed, ["di-ma", "menh-ngheo", "tam-bao"]);
  if (end.ending && end.ending.kind === "ascend") hardWins += 1;
}
console.log("hard build", hardWins + "/" + seeds.length);
assert(hardWins < wins, "hard build is harsher");

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("all assertions passed");
