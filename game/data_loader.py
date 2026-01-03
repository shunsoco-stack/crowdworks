import json
from pathlib import Path


def _read_json(path: str) -> list[dict]:
    p = Path(path)
    raw = p.read_text(encoding="utf-8")
    data = json.loads(raw)
    if not isinstance(data, list):
        raise ValueError(f"JSON must be a list: {path}")
    return data


def load_roles(path: str) -> list[dict]:
    roles = _read_json(path)
    required = {"id", "name", "salary", "fixed_expenses", "starting_cash"}
    for r in roles:
        missing = required - set(r.keys())
        if missing:
            raise ValueError(f"Role missing keys {missing}: {r}")
    return roles


def load_offers(path: str) -> list[dict]:
    offers = _read_json(path)
    required = {
        "id",
        "name",
        "kind",
        "description",
        "down_payment",
        "cash_delta",
        "passive_income_delta",
        "salary_delta",
        "net_worth_delta",
    }
    for o in offers:
        missing = required - set(o.keys())
        if missing:
            raise ValueError(f"Offer missing keys {missing}: {o}")
    return offers


def load_events(path: str) -> list[dict]:
    events = _read_json(path)
    required = {
        "id",
        "name",
        "description",
        "cash_delta",
        "salary_delta",
        "fixed_expenses_delta",
        "passive_income_delta",
    }
    for e in events:
        missing = required - set(e.keys())
        if missing:
            raise ValueError(f"Event missing keys {missing}: {e}")
    return events

