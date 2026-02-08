import argparse
import csv
import os
import re
import sys


FIELD_PATTERNS = {
    "invoice_no": [
        r"Invoice No:\s*([A-Z0-9-]+)",
        r"\u8acb\u6c42\u66f8\u756a\u53f7\s*([A-Z0-9-]+)",
    ],
    "invoice_date": [
        r"Invoice Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})",
        r"\u767a\u884c\u65e5\s*([0-9]{4}[/-][0-9]{2}[/-][0-9]{2})",
        r"\u767a\u884c\u65e5\s*([0-9]{4}\u5e74[0-9]{2}\u6708[0-9]{2}\u65e5)",
    ],
    "vendor": [
        r"Vendor:\s*(.+)",
        r"\u8acb\u6c42\u5143\s*(.+)",
    ],
    "customer": [
        r"Billing To:\s*(.+)",
        r"\u8acb\u6c42\u5148\s*(.+)",
    ],
    "subtotal": [
        r"Subtotal:\s*([0-9,]+\.[0-9]{2})",
        r"\u5c0f\u8a08\s*[\u00a5\uffe5]?\s*([0-9,]+(?:\.[0-9]{2})?)",
    ],
    "tax": [
        r"Tax:\s*([0-9,]+\.[0-9]{2})",
        r"\u6d88\u8cbb\u7a0e.*?\s*[\u00a5\uffe5]?\s*([0-9,]+(?:\.[0-9]{2})?)",
    ],
    "total": [
        r"Total:\s*([0-9,]+\.[0-9]{2})",
        r"\u5408\u8a08\u91d1\u984d\s*[\u00a5\uffe5]?\s*([0-9,]+(?:\.[0-9]{2})?)",
        r"\u5408\u8a08\s*[\u00a5\uffe5]?\s*([0-9,]+(?:\.[0-9]{2})?)",
    ],
}

YEN_SIGNS = ("\u00a5", "\uffe5")
OUTPUT_COLUMNS = [
    ("\u8acb\u6c42\u66f8\u756a\u53f7", "invoice_no"),
    ("\u767a\u884c\u65e5", "invoice_date"),
    ("\u8acb\u6c42\u5143", "vendor"),
    ("\u8acb\u6c42\u5148", "customer"),
    ("\u5c0f\u8a08", "subtotal"),
    ("\u6d88\u8cbb\u7a0e", "tax"),
    ("\u5408\u8a08\u91d1\u984d", "total"),
    ("\u901a\u8ca8", "currency"),
    ("\u5143\u30d5\u30a1\u30a4\u30eb", "source"),
]


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


def normalize_date(value):
    value = value.strip()
    if not value:
        return ""
    if "\u5e74" in value:
        match = re.search(
            r"([0-9]{4})\u5e74([0-9]{2})\u6708([0-9]{2})\u65e5", value
        )
        if match:
            return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
    return value.replace("/", "-")


def normalize_amount(value):
    value = value.strip()
    if not value:
        return ""
    for sign in YEN_SIGNS:
        value = value.replace(sign, "")
    return (
        value.replace(",", "")
        .replace("JPY", "")
        .replace("USD", "")
        .replace("\u5186", "")
        .strip()
    )


def normalize_party(value):
    value = value.strip()
    if not value:
        return ""
    return value.replace("\u5fa1\u4e2d", "").strip()


def detect_currency(text):
    if re.search(r"[\u00a5\uffe5]", text) or "\u5186" in text or "JPY" in text:
        return "JPY"
    if "$" in text or "USD" in text:
        return "USD"
    if re.search(
        r"\u8acb\u6c42\u66f8|\u5c0f\u8a08|\u5408\u8a08\u91d1\u984d", text
    ):
        return "JPY"
    if re.search(r"Invoice No:|Invoice Date:|Subtotal:|Total:", text):
        return "USD"
    return ""


def extract_fields(text):
    result = {}
    missing = []
    for field, patterns in FIELD_PATTERNS.items():
        value = ""
        for pattern in patterns:
            match = re.search(pattern, text, re.MULTILINE)
            if match:
                value = match.group(1).strip()
                break
        if field == "invoice_date":
            value = normalize_date(value)
        if field in ("subtotal", "tax", "total"):
            value = normalize_amount(value)
        if field in ("vendor", "customer"):
            value = normalize_party(value)
        result[field] = value
        if not value:
            missing.append(field)
    result["currency"] = detect_currency(text)
    return result, missing


def write_csv(path, record, source):
    headers = [label for label, _ in OUTPUT_COLUMNS]
    record = {**record, "source": source}
    row = {label: record.get(key, "") for label, key in OUTPUT_COLUMNS}
    with open(path, "w", newline="", encoding="utf-8-sig") as handle:
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
