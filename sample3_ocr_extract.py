import argparse
import csv
import re
import sys


def load_text(path):
    with open(path, "r", encoding="utf-8") as handle:
        return handle.read()


def normalize_text(text):
    return text.replace("Inv0ice", "Invoice")


def parse_fields(text):
    text = normalize_text(text)
    fields = {
        "invoice_no": "",
        "invoice_date": "",
        "total": "",
        "tax": "",
        "currency": "",
    }
    missing = []

    invoice_match = re.search(r"Invoice No:\s*([A-Z0-9-]+)", text)
    if invoice_match:
        fields["invoice_no"] = invoice_match.group(1).strip()
    else:
        missing.append("invoice_no")

    date_match = re.search(r"Date:\s*([0-9]{4}[/-][0-9]{2}[/-][0-9]{2})", text)
    if date_match:
        fields["invoice_date"] = date_match.group(1).replace("/", "-")
    else:
        missing.append("invoice_date")

    total_match = re.search(r"Total Due:\s*([A-Z]{3})\s*([0-9,]+\.[0-9]{2})", text)
    if total_match:
        fields["currency"] = total_match.group(1)
        fields["total"] = total_match.group(2).replace(",", "")
    else:
        missing.append("total")

    tax_match = re.search(r"Tax:\s*([A-Z]{3})\s*([0-9,]+\.[0-9]{2})", text)
    if tax_match:
        if not fields["currency"]:
            fields["currency"] = tax_match.group(1)
        fields["tax"] = tax_match.group(2).replace(",", "")
    else:
        missing.append("tax")

    fields["needs_review"] = "yes" if missing else "no"
    return fields, missing


def write_csv(path, fields):
    headers = [
        "invoice_no",
        "invoice_date",
        "total",
        "tax",
        "currency",
        "needs_review",
    ]
    with open(path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerow(fields)


def main():
    parser = argparse.ArgumentParser(description="Parse OCR text to CSV.")
    parser.add_argument(
        "--input",
        default="sample3_ocr_text.txt",
        help="Path to OCR text file.",
    )
    parser.add_argument(
        "--output",
        default="sample3_output.csv",
        help="Path to output CSV.",
    )
    args = parser.parse_args()

    text = load_text(args.input)
    fields, missing = parse_fields(text)
    write_csv(args.output, fields)

    if missing:
        print("Missing fields:", ", ".join(missing))
    print("Output:", args.output)


if __name__ == "__main__":
    sys.exit(main())
