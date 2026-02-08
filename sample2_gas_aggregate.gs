var SAMPLE2_RAW_A = [
  ["Date", "OrderID", "Amount", "Tax"],
  ["2026-01-05", "A-1001", "120.00", "12.00"],
  ["2026-01-18", "A-1002", "80.00", "8.00"],
  ["2026-02-03", "A-1003", "160.00", "16.00"]
];

var SAMPLE2_RAW_B = [
  ["order_date", "order_id", "total_amount", "tax_amount", "store"],
  ["2026/01/07", "B-2001", "200.00", "20.00", "Store B"],
  ["2026/02/14", "B-2002", "150.00", "15.00", "Store B"]
];

function sample2Aggregate() {
  var ss = SpreadsheetApp.getActive();
  var rawASheet = getOrCreateSheet_(ss, "Sample2_Raw_A");
  var rawBSheet = getOrCreateSheet_(ss, "Sample2_Raw_B");
  var normalizedSheet = getOrCreateSheet_(ss, "Sample2_Normalized");
  var summarySheet = getOrCreateSheet_(ss, "Sample2_Summary");

  if (rawASheet.getLastRow() < 2) {
    rawASheet.getRange(1, 1, SAMPLE2_RAW_A.length, SAMPLE2_RAW_A[0].length)
      .setValues(SAMPLE2_RAW_A);
  }
  if (rawBSheet.getLastRow() < 2) {
    rawBSheet.getRange(1, 1, SAMPLE2_RAW_B.length, SAMPLE2_RAW_B[0].length)
      .setValues(SAMPLE2_RAW_B);
  }

  var normalized = [
    ["date", "order_id", "amount", "tax", "store", "source_sheet"]
  ];

  normalized = normalized.concat(
    normalizeSheet_(rawASheet, "Store A")
  ).concat(
    normalizeSheet_(rawBSheet, null)
  );

  normalizedSheet.clearContents();
  normalizedSheet.getRange(1, 1, normalized.length, normalized[0].length)
    .setValues(normalized);

  var summary = buildSummary_(normalized.slice(1));
  summarySheet.clearContents();
  summarySheet.getRange(1, 1, summary.length, summary[0].length)
    .setValues(summary);
}

function normalizeSheet_(sheet, defaultStore) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return [];
  }

  var header = values[0];
  var indexes = {};
  header.forEach(function(name, idx) {
    indexes[name] = idx;
  });

  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row.join("").trim()) {
      continue;
    }

    var dateValue = row[indexes.Date] || row[indexes.order_date];
    var orderId = row[indexes.OrderID] || row[indexes.order_id];
    var amount = row[indexes.Amount] || row[indexes.total_amount];
    var tax = row[indexes.Tax] || row[indexes.tax_amount];
    var store = defaultStore || row[indexes.store] || "";

    rows.push([
      normalizeDate_(dateValue),
      String(orderId).trim(),
      String(amount).trim(),
      String(tax).trim(),
      String(store).trim(),
      sheet.getName()
    ]);
  }

  return rows;
}

function buildSummary_(rows) {
  var summaryMap = {};
  rows.forEach(function(row) {
    var month = String(row[0]).slice(0, 7);
    var amount = parseFloat(row[2]) || 0;
    var tax = parseFloat(row[3]) || 0;
    if (!summaryMap[month]) {
      summaryMap[month] = { orders: 0, amount: 0, tax: 0 };
    }
    summaryMap[month].orders += 1;
    summaryMap[month].amount += amount;
    summaryMap[month].tax += tax;
  });

  var output = [["month", "orders", "total_amount", "total_tax"]];
  Object.keys(summaryMap).sort().forEach(function(month) {
    var entry = summaryMap[month];
    output.push([
      month,
      entry.orders,
      entry.amount.toFixed(2),
      entry.tax.toFixed(2)
    ]);
  });

  return output;
}

function normalizeDate_(value) {
  var text = String(value).trim();
  return text.replace(/\//g, "-");
}

function getOrCreateSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}
