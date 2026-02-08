import argparse
import csv
import os
import re
import sys


FIELD_PATTERNS = {
    "invoice_no": r"Invoice No:\s*([A-Z0-9-]+)",
    "invoice_date": r"Invoice Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})",
    "vendor": r"Vendor:\s*(.+)",
    "customer": r"Billing To:\s*(.+)",
    "subtotal": r"Subtotal:\s*([0-9]+\.[0-9]{2})",
    "tax": r"Tax:\s*([0-9]+\.[0-9]{2})",
    "total": r"Total:\s*([0-9]+\.[0-9]{2})",
}


def load_text(path):
    if path.lower().endswith(".pdf"):
        try:
            import pdfplumber
        except ImportError as exc:
            raise SystemExit(
                "pdfplumber is not installed. Run: pip install pdfplumber"
            ) from exc
        with pdfplumber.open(path) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        return "\n".join(pages)
    with open(path, "r", encoding="utf-8") as handle:
        return handle.read()


def extract_fields(text):
    result = {}
    missing = []
    for field, pattern in FIELD_PATTERNS.items():
        match = re.search(pattern, text, re.MULTILINE)
        if match:
            result[field] = match.group(1).strip()
        else:
            result[field] = ""
            missing.append(field)
    return result, missing


def write_csv(path, record, source):
    headers = [
        "invoice_no",
        "invoice_date",
        "vendor",
        "customer",
        "subtotal",
        "tax",
        "total",
        "currency",
        "source",
    ]
    row = {**record, "currency": "USD", "source": source}
    with open(path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerow(row)


def main():
    parser = argparse.ArgumentParser(
        description="Extract invoice fields from text or PDF."
    )
    parser.add_argument(
        "--input",
        default="sample1_invoice_text.txt",
        help="Path to text or PDF file.",
    )
    parser.add_argument(
        "--output",
        default="sample1_output.csv",
        help="Path to output CSV.",
    )
    args = parser.parse_args()

    text = load_text(args.input)
    record, missing = extract_fields(text)
    write_csv(args.output, record, os.path.basename(args.input))

    if missing:
        print("Missing fields:", ", ".join(missing))
        print("CSV was created with empty values for missing fields.")
    else:
        print("All fields extracted successfully.")
    print("Output:", args.output)


if __name__ == "__main__":
    sys.exit(main())
