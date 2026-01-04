import type { EventCard, GameState, Offer, Role } from "./types";
import { mulberry32, pickOne } from "./rng";

export function newGame(role: Role, seed: number): GameState {
  return {
    month: 1,
    inMonth: false,
    roleId: role.id,
    roleName: role.name,
    cash: role.starting_cash,
    salary: role.salary,
    fixedExpenses: role.fixed_expenses,
    passiveIncome: role.starting_passive_income ?? 0,
    netWorth: role.starting_net_worth ?? 0,
    seed,
    log: [`ゲーム開始：${role.name}（現金 ${fmt(role.starting_cash)}）`],
    portfolio: [],
  };
}

export function isWin(s: GameState): boolean {
  return s.fixedExpenses > 0 && s.passiveIncome >= s.fixedExpenses;
}

export function netMonthly(s: GameState): number {
  return s.salary + s.passiveIncome - s.fixedExpenses;
}

export function monthStart(s: GameState): void {
  if (s.inMonth) return;
  const income = s.salary + s.passiveIncome;
  s.cash += income;
  s.cash -= s.fixedExpenses;
  s.inMonth = true;
  s.log.push(
    `${s.month}月開始：収入 ${fmt(income)}（給与 ${fmt(s.salary)} + パッシブ ${fmt(s.passiveIncome)}）- 固定費 ${fmt(
      s.fixedExpenses,
    )} => 現金 ${fmt(s.cash)}`,
  );
}

export function drawEvent(s: GameState, events: EventCard[]): EventCard {
  const rand = mulberry32(hashSeed(s.seed, s.month, 1));
  return pickOne(events, rand);
}

export function drawOffers(s: GameState, offers: Offer[]): Offer[] {
  const rand = mulberry32(hashSeed(s.seed, s.month, 2));
  const a = pickOne(offers, rand);
  const b = pickOne(offers, rand);
  if (a.id === b.id && offers.length > 1) {
    // mild de-dup
    return [a, offers[(offers.findIndex((o) => o.id === a.id) + 1) % offers.length]];
  }
  return [a, b];
}

export function applyEvent(s: GameState, ev: EventCard): void {
  s.cash += ev.cash_delta;
  s.salary = Math.max(0, s.salary + ev.salary_delta);
  s.fixedExpenses = Math.max(0, s.fixedExpenses + ev.fixed_expenses_delta);
  s.passiveIncome = Math.max(0, s.passiveIncome + ev.passive_income_delta);
  s.currentEvent = ev;
  s.log.push(`イベント：${ev.name}（${eventEffectSummary(ev)}）`);
}

export function canAfford(s: GameState, offer: Offer): boolean {
  return s.cash >= offer.down_payment;
}

export function buyOffer(s: GameState, offer: Offer): void {
  if (!canAfford(s, offer)) {
    throw new Error("Not enough cash");
  }
  s.cash -= offer.down_payment;
  s.cash += offer.cash_delta;
  s.passiveIncome = Math.max(0, s.passiveIncome + offer.passive_income_delta);
  s.salary = Math.max(0, s.salary + offer.salary_delta);
  s.netWorth += offer.net_worth_delta;
  s.portfolio.push({
    id: offer.id,
    name: offer.name,
    kind: offer.kind,
    down_payment: offer.down_payment,
    cash_delta: offer.cash_delta,
    passive_income_delta: offer.passive_income_delta,
    salary_delta: offer.salary_delta,
    net_worth_delta: offer.net_worth_delta,
  });
  s.log.push(
    `購入：${offer.name}（頭金 ${fmt(offer.down_payment)} / パッシブ +${fmt(offer.passive_income_delta)}/月 / 給与 +${fmt(
      offer.salary_delta,
    )}/月）`,
  );
}

export function endMonth(s: GameState): void {
  s.inMonth = false;
  s.month += 1;
  s.currentEvent = undefined;
  s.currentOffers = undefined;
  s.log.push(`月終了：次は ${s.month}月`);
}

export function eventEffectSummary(ev: EventCard): string {
  const parts: string[] = [];
  if (ev.cash_delta) parts.push(`現金 ${signed(ev.cash_delta)}`);
  if (ev.salary_delta) parts.push(`給与 ${signed(ev.salary_delta)}/月`);
  if (ev.fixed_expenses_delta) parts.push(`固定費 ${signed(ev.fixed_expenses_delta)}/月`);
  if (ev.passive_income_delta) parts.push(`パッシブ ${signed(ev.passive_income_delta)}/月`);
  return parts.length ? parts.join(" / ") : "影響なし";
}

export function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

function signed(n: number): string {
  const s = n >= 0 ? "+" : "";
  return `${s}${fmt(n)}`;
}

function hashSeed(seed: number, month: number, salt: number): number {
  // simple mixing
  let x = seed ^ (month * 0x9e3779b1) ^ (salt * 0x85ebca6b);
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

