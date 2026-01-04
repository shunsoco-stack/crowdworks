from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

import random


@dataclass
class OfferCard:
    id: str
    name: str
    kind: str
    description: str
    down_payment: int
    cash_delta: int
    passive_income_delta: int
    salary_delta: int
    net_worth_delta: int

    def kind_label(self) -> str:
        labels = {
            "investment": "投資",
            "side_hustle": "副業",
            "skill": "スキル",
            "safety": "守り",
        }
        return labels.get(self.kind, self.kind)


@dataclass
class EventCard:
    id: str
    name: str
    description: str
    cash_delta: int
    salary_delta: int
    fixed_expenses_delta: int
    passive_income_delta: int

    def effect_summary(self) -> str:
        parts: list[str] = []
        if self.cash_delta:
            parts.append(f"現金 {self.cash_delta:+,}")
        if self.salary_delta:
            parts.append(f"給与(毎月) {self.salary_delta:+,}")
        if self.fixed_expenses_delta:
            parts.append(f"固定費(毎月) {self.fixed_expenses_delta:+,}")
        if self.passive_income_delta:
            parts.append(f"パッシブ(毎月) {self.passive_income_delta:+,}")
        return " / ".join(parts) if parts else "影響なし"


@dataclass
class GameState:
    role_id: str
    role_name: str
    month: int = 1
    in_month: bool = False

    cash: int = 0
    salary: int = 0
    fixed_expenses: int = 0
    passive_income: int = 0

    net_worth: int = 0

    rng_seed: int | None = None
    rng_state: object | None = None

    offers_deck: list[OfferCard] = field(default_factory=list)
    events_deck: list[EventCard] = field(default_factory=list)

    current_event: EventCard | None = None
    current_offers: list[OfferCard] = field(default_factory=list)

    portfolio: list[dict] = field(default_factory=list)
    log: list[str] = field(default_factory=list)

    def rng(self) -> random.Random:
        r = random.Random()
        if self.rng_state is None:
            r.seed(self.rng_seed)
        else:
            r.setstate(self.rng_state)
        return r

    def save_rng(self, r: random.Random) -> None:
        self.rng_state = r.getstate()

    @staticmethod
    def from_dict(d: dict) -> "GameState":
        # Minimal validation; assume trusted save.
        offers = [OfferCard(**o) for o in d.get("offers_deck", [])]
        events = [EventCard(**e) for e in d.get("events_deck", [])]
        current_event = EventCard(**d["current_event"]) if d.get("current_event") else None
        current_offers = [OfferCard(**o) for o in d.get("current_offers", [])]
        return GameState(
            role_id=d["role_id"],
            role_name=d["role_name"],
            month=d.get("month", 1),
            in_month=d.get("in_month", False),
            cash=d.get("cash", 0),
            salary=d.get("salary", 0),
            fixed_expenses=d.get("fixed_expenses", 0),
            passive_income=d.get("passive_income", 0),
            net_worth=d.get("net_worth", 0),
            rng_seed=d.get("rng_seed"),
            rng_state=d.get("rng_state"),
            offers_deck=offers,
            events_deck=events,
            current_event=current_event,
            current_offers=current_offers,
            portfolio=d.get("portfolio", []),
            log=d.get("log", []),
        )


def new_game(
    roles: list[dict],
    role_id: str,
    offers: list[dict],
    events: list[dict],
    seed: int | None = None,
) -> GameState:
    role = next((r for r in roles if r["id"] == role_id), None)
    if role is None:
        raise ValueError(f"Unknown role_id: {role_id}")

    offer_cards = [OfferCard(**o) for o in offers]
    event_cards = [EventCard(**e) for e in events]

    g = GameState(
        role_id=role["id"],
        role_name=role["name"],
        cash=int(role["starting_cash"]),
        salary=int(role["salary"]),
        fixed_expenses=int(role["fixed_expenses"]),
        passive_income=int(role.get("starting_passive_income", 0)),
        net_worth=int(role.get("starting_net_worth", 0)),
        rng_seed=seed,
        offers_deck=offer_cards,
        events_deck=event_cards,
    )
    g.log.append(f"ゲーム開始：{g.role_name}（現金 {g.cash:,}）")
    return g


def summarize_state(g: GameState) -> dict:
    net_monthly = (g.salary + g.passive_income) - g.fixed_expenses
    return {
        "cash": g.cash,
        "salary": g.salary,
        "fixed_expenses": g.fixed_expenses,
        "passive_income": g.passive_income,
        "net_monthly": net_monthly,
        "net_worth": g.net_worth,
    }


def check_win(g: GameState) -> bool:
    return g.passive_income >= g.fixed_expenses and g.fixed_expenses > 0


def process_month_start(g: GameState) -> None:
    """
    Month start (MVP):
      - receive salary + passive income
      - pay fixed expenses
      - move into "in_month" state
    """
    if g.in_month:
        return
    income = g.salary + g.passive_income
    g.cash += income
    g.cash -= g.fixed_expenses
    g.log.append(
        f"{g.month}月開始：収入 {income:,}（給与 {g.salary:,}+パッシブ {g.passive_income:,}）- 固定費 {g.fixed_expenses:,} => 現金 {g.cash:,}"
    )
    g.in_month = True


def draw_cards(g: GameState, deck: Literal["offers", "events"], n: int) -> list:
    r = g.rng()
    cards = g.offers_deck if deck == "offers" else g.events_deck
    drawn = [r.choice(cards) for _ in range(n)]
    g.save_rng(r)
    return drawn


def apply_event(g: GameState, ev: EventCard) -> None:
    g.cash += ev.cash_delta
    g.salary += ev.salary_delta
    g.fixed_expenses += ev.fixed_expenses_delta
    g.passive_income += ev.passive_income_delta
    g.log.append(f"イベント：{ev.name}（{ev.effect_summary()}）")

    # Guardrails: don't go negative on core monthly items
    g.salary = max(0, g.salary)
    g.fixed_expenses = max(0, g.fixed_expenses)
    g.passive_income = max(0, g.passive_income)


def can_afford_offer(g: GameState, offer: OfferCard) -> bool:
    return g.cash >= offer.down_payment


def purchase_offer(g: GameState, offer: OfferCard) -> None:
    if not can_afford_offer(g, offer):
        raise ValueError("Not enough cash for down payment")

    g.cash -= offer.down_payment
    g.cash += offer.cash_delta
    g.passive_income += offer.passive_income_delta
    g.salary += offer.salary_delta
    g.net_worth += offer.net_worth_delta

    g.portfolio.append(
        {
            "id": offer.id,
            "name": offer.name,
            "kind": offer.kind,
            "down_payment": offer.down_payment,
            "cash_delta": offer.cash_delta,
            "passive_income_delta": offer.passive_income_delta,
            "salary_delta": offer.salary_delta,
            "net_worth_delta": offer.net_worth_delta,
        }
    )
    g.log.append(
        f"購入：{offer.name}（頭金 {offer.down_payment:,} / パッシブ +{offer.passive_income_delta:,}/月 / 給与 +{offer.salary_delta:,}/月）"
    )

    # Keep core monthly items non-negative
    g.salary = max(0, g.salary)
    g.passive_income = max(0, g.passive_income)

