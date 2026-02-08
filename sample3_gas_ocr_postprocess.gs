var SAMPLE3_TEXT = [
  "INVOICE",
  "Vendor: Example Logistics Co.",
  "Inv0ice No: INV-2026-02-019",
  "Date: 2026/02/20",
  "Total Due: USD 2,450.00",
  "Tax: USD 245.00",
  "Notes: Payment due within 14 days."
].join("\n");

function sample3ParseOcrText() {
  var ss = SpreadsheetApp.getActive();
  var inputSheet = getOrCreateSheet_(ss, "Sample3_OCR_Text");
  var outputSheet = getOrCreateSheet_(ss, "Sample3_Output");

  var text = inputSheet.getRange("A1").getValue();
  if (!text) {
    text = SAMPLE3_TEXT;
    inputSheet.getRange("A1").setValue(text);
  }

  var parsed = parseOcrText_(text);
  var headers = [
    "invoice_no",
    "invoice_date",
    "total",
    "tax",
    "currency",
    "needs_review"
  ];

  outputSheet.clearContents();
  outputSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  outputSheet.getRange(2, 1, 1, headers.length).setValues([[
    parsed.invoice_no,
    parsed.invoice_date,
    parsed.total,
    parsed.tax,
    parsed.currency,
    parsed.needs_review
  ]]);
}

function parseOcrText_(text) {
  text = text.replace("Inv0ice", "Invoice");

  var invoiceNo = matchValue_(text, /Invoice No:\s*([A-Z0-9-]+)/);
  var dateValue = matchValue_(text, /Date:\s*([0-9]{4}[/-][0-9]{2}[/-][0-9]{2})/);
  var totalMatch = text.match(/Total Due:\s*([A-Z]{3})\s*([0-9,]+\.[0-9]{2})/);
  var taxMatch = text.match(/Tax:\s*([A-Z]{3})\s*([0-9,]+\.[0-9]{2})/);

  var currency = totalMatch ? totalMatch[1] : (taxMatch ? taxMatch[1] : "");
  var total = totalMatch ? totalMatch[2].replace(/,/g, "") : "";
  var tax = taxMatch ? taxMatch[2].replace(/,/g, "") : "";
  var needsReview = invoiceNo && dateValue && total && tax ? "no" : "yes";

  return {
    invoice_no: invoiceNo,
    invoice_date: dateValue ? dateValue.replace(/\//g, "-") : "",
    total: total,
    tax: tax,
    currency: currency,
    needs_review: needsReview
  };
}

function matchValue_(text, regex) {
  var match = text.match(regex);
  return match ? String(match[1]).trim() : "";
}

function getOrCreateSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}
