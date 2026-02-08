var SAMPLE1_TEXT = [
  "INVOICE",
  "Vendor: Example Logistics Co.",
  "Invoice No: INV-2026-02-001",
  "Invoice Date: 2026-02-05",
  "Billing To: Sample Trading LLC",
  "",
  "Line Items:",
  "1) Shipping fee (2 parcels) 800.00",
  "2) Handling fee (1 unit) 400.00",
  "",
  "Subtotal: 1200.00",
  "Tax: 120.00",
  "Total: 1320.00"
].join("\n");

function sample1ExtractInvoice() {
  var ss = SpreadsheetApp.getActive();
  var inputSheet = getOrCreateSheet_(ss, "Sample1_Input");
  var outputSheet = getOrCreateSheet_(ss, "Sample1_Output");

  var text = inputSheet.getRange("A1").getValue();
  if (!text) {
    text = SAMPLE1_TEXT;
    inputSheet.getRange("A1").setValue(text);
  }

  var parsed = parseInvoiceText_(text);
  var headers = [
    "invoice_no",
    "invoice_date",
    "vendor",
    "customer",
    "subtotal",
    "tax",
    "total",
    "currency",
    "needs_review"
  ];

  outputSheet.clearContents();
  outputSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  outputSheet.getRange(2, 1, 1, headers.length).setValues([[
    parsed.invoice_no,
    parsed.invoice_date,
    parsed.vendor,
    parsed.customer,
    parsed.subtotal,
    parsed.tax,
    parsed.total,
    parsed.currency,
    parsed.needs_review
  ]]);
}

function parseInvoiceText_(text) {
  var result = {
    invoice_no: matchValue_(text, /Invoice No:\s*([A-Z0-9-]+)/),
    invoice_date: matchValue_(text, /Invoice Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/),
    vendor: matchValue_(text, /Vendor:\s*(.+)/),
    customer: matchValue_(text, /Billing To:\s*(.+)/),
    subtotal: matchValue_(text, /Subtotal:\s*([0-9]+\.[0-9]{2})/),
    tax: matchValue_(text, /Tax:\s*([0-9]+\.[0-9]{2})/),
    total: matchValue_(text, /Total:\s*([0-9]+\.[0-9]{2})/),
    currency: "USD"
  };

  var missing = [];
  Object.keys(result).forEach(function(key) {
    if (!result[key] && key !== "currency") {
      missing.push(key);
    }
  });
  result.needs_review = missing.length ? "yes" : "no";
  return result;
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
