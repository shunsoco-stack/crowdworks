import csv
from decimal import Decimal
import sys


STORE_A_HEADERS = {"Date", "OrderID", "Amount", "Tax"}
STORE_B_HEADERS = {"order_date", "order_id", "total_amount", "tax_amount"}


def parse_date(value):
    value = value.strip()
    if "/" in value:
        value = value.replace("/", "-")
    return value


def parse_amount(value):
    return Decimal(value.replace(",", "").strip())


def normalize_rows(path):
    with open(path, "r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = set(reader.fieldnames or [])

        if STORE_A_HEADERS.issubset(headers):
            store_name = "Store A"
            mapping = {
                "date": "Date",
                "order_id": "OrderID",
                "amount": "Amount",
                "tax": "Tax",
                "store": None,
            }
        elif STORE_B_HEADERS.issubset(headers):
            store_name = None
            mapping = {
                "date": "order_date",
                "order_id": "order_id",
                "amount": "total_amount",
                "tax": "tax_amount",
                "store": "store",
            }
        else:
            raise ValueError(f"Unknown CSV format: {path}")

        for row in reader:
            normalized = {
                "date": parse_date(row[mapping["date"]]),
                "order_id": row[mapping["order_id"]].strip(),
                "amount": row[mapping["amount"]].strip(),
                "tax": row[mapping["tax"]].strip(),
                "store": (
                    row[mapping["store"]].strip()
                    if mapping["store"]
                    else store_name
                ),
                "source_file": path,
            }
            yield normalized


def write_normalized(path, rows):
    headers = ["date", "order_id", "amount", "tax", "store", "source_file"]
    with open(path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def write_summary(path, rows):
    summary = {}
    for row in rows:
        month = row["date"][:7]
        entry = summary.setdefault(
            month, {"orders": 0, "total_amount": Decimal("0"), "total_tax": Decimal("0")}
        )
        entry["orders"] += 1
        entry["total_amount"] += parse_amount(row["amount"])
        entry["total_tax"] += parse_amount(row["tax"])

    with open(path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle, fieldnames=["month", "orders", "total_amount", "total_tax"]
        )
        writer.writeheader()
        for month in sorted(summary.keys()):
            entry = summary[month]
            writer.writerow(
                {
                    "month": month,
                    "orders": entry["orders"],
                    "total_amount": f"{entry['total_amount']:.2f}",
                    "total_tax": f"{entry['total_tax']:.2f}",
                }
            )


def main():
    input_files = [
        "sample2_sales_raw_store_a.csv",
        "sample2_sales_raw_store_b.csv",
    ]

    normalized_rows = []
    for path in input_files:
        normalized_rows.extend(list(normalize_rows(path)))

    normalized_rows.sort(key=lambda row: row["date"])
    write_normalized("sample2_output_normalized.csv", normalized_rows)
    write_summary("sample2_output_summary.csv", normalized_rows)

    print("Normalized output: sample2_output_normalized.csv")
    print("Summary output: sample2_output_summary.csv")


if __name__ == "__main__":
    sys.exit(main())
