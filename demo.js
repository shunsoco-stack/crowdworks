const pdfInput = document.getElementById("pdfInput");
const extractButton = document.getElementById("extractButton");
const statusEl = document.getElementById("status");
const resultBody = document.getElementById("resultBody");
const missingFieldsEl = document.getElementById("missingFields");
const textPreview = document.getElementById("textPreview");
const downloadCsvButton = document.getElementById("downloadCsv");
const copyCsvButton = document.getElementById("copyCsv");

let currentRecord = null;
let pdfjsReadyPromise = null;

const PDFJS_SOURCES = [
  {
    script: "./vendor/pdf.min.js",
    worker: "./vendor/pdf.worker.min.js",
  },
  {
    script: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
    worker:
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js",
  },
  {
    script: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js",
    worker: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js",
  },
  {
    script:
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    worker:
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  },
];

const FIELD_CONFIG = [
  {
    label: "請求書番号",
    key: "invoice_no",
    patterns: [/請求書番号\s*([A-Z0-9-]+)/, /Invoice No:\s*([A-Z0-9-]+)/],
  },
  {
    label: "発行日",
    key: "invoice_date",
    patterns: [
      /発行日\s*([0-9]{4}[/-][0-9]{2}[/-][0-9]{2})/,
      /発行日\s*([0-9]{4}年[0-9]{2}月[0-9]{2}日)/,
      /Invoice Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/,
    ],
  },
  {
    label: "請求元",
    key: "vendor",
    patterns: [/請求元\s*(.+)/, /Vendor:\s*(.+)/],
  },
  {
    label: "請求先",
    key: "customer",
    patterns: [/請求先\s*(.+)/, /Billing To:\s*(.+)/],
  },
  {
    label: "小計",
    key: "subtotal",
    patterns: [/小計\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{2})?)/, /Subtotal:\s*([0-9,]+\.[0-9]{2})/],
  },
  {
    label: "消費税",
    key: "tax",
    patterns: [
      /消費税.*?\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{2})?)/,
      /Tax:\s*([0-9,]+\.[0-9]{2})/,
    ],
  },
  {
    label: "合計金額",
    key: "total",
    patterns: [
      /合計金額\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{2})?)/,
      /合計\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{2})?)/,
      /Total:\s*([0-9,]+\.[0-9]{2})/,
    ],
  },
];

const OUTPUT_FIELDS = [
  ...FIELD_CONFIG.map((field) => ({ label: field.label, key: field.key })),
  { label: "通貨", key: "currency" },
  { label: "元ファイル", key: "source" },
];

function setStatus(message, variant = "info") {
  statusEl.textContent = message;
  statusEl.classList.remove("error", "success");
  if (variant === "error") {
    statusEl.classList.add("error");
  }
  if (variant === "success") {
    statusEl.classList.add("success");
  }
}

function normalizeDate(value) {
  if (!value) return "";
  if (value.includes("年")) {
    const match = value.match(/([0-9]{4})年([0-9]{2})月([0-9]{2})日/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }
  return value.replace(/\//g, "-");
}

function normalizeAmount(value) {
  if (!value) return "";
  return value
    .replace(/[¥￥]/g, "")
    .replace(/,/g, "")
    .replace(/円/g, "")
    .replace(/JPY|USD/g, "")
    .trim();
}

function normalizeParty(value) {
  if (!value) return "";
  return value.replace(/御中/g, "").trim();
}

function detectCurrency(text) {
  if (/[¥￥]/.test(text) || text.includes("円") || text.includes("JPY")) {
    return "JPY";
  }
  if (text.includes("$") || text.includes("USD")) {
    return "USD";
  }
  if (/請求書|小計|合計金額/.test(text)) {
    return "JPY";
  }
  return "";
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensurePdfJs() {
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_SOURCES[0].worker;
    return;
  }
  if (!pdfjsReadyPromise) {
    pdfjsReadyPromise = (async () => {
      for (const source of PDFJS_SOURCES) {
        try {
          await loadScript(source.script);
          if (window.pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = source.worker;
            return;
          }
        } catch (error) {
          console.warn(error);
        }
      }
      throw new Error("PDFJS_LOAD_FAILED");
    })();
  }
  return pdfjsReadyPromise;
}

function extractFields(text, sourceName) {
  const record = {};
  const missing = [];

  FIELD_CONFIG.forEach((field) => {
    let value = "";
    field.patterns.some((pattern) => {
      const match = text.match(pattern);
      if (match) {
        value = match[1].trim();
        return true;
      }
      return false;
    });

    if (field.key === "invoice_date") {
      value = normalizeDate(value);
    }
    if (["subtotal", "tax", "total"].includes(field.key)) {
      value = normalizeAmount(value);
    }
    if (["vendor", "customer"].includes(field.key)) {
      value = normalizeParty(value);
    }

    record[field.key] = value;
    if (!value) {
      missing.push(field.label);
    }
  });

  record.currency = detectCurrency(text) || "JPY";
  record.source = sourceName || "";

  return { record, missing };
}

function renderResult(record) {
  resultBody.innerHTML = "";
  OUTPUT_FIELDS.forEach((field) => {
    const row = document.createElement("tr");
    const labelCell = document.createElement("td");
    const valueCell = document.createElement("td");
    labelCell.textContent = field.label;
    valueCell.textContent = record[field.key] || "";
    row.appendChild(labelCell);
    row.appendChild(valueCell);
    resultBody.appendChild(row);
  });
}

function buildCsv(record) {
  const headers = OUTPUT_FIELDS.map((field) => field.label);
  const values = OUTPUT_FIELDS.map((field) => record[field.key] || "");

  const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const lines = [headers.map(escapeCsv).join(","), values.map(escapeCsv).join(",")];
  return `\uFEFF${lines.join("\r\n")}`;
}

async function extractPageText(page) {
  const textContent = await page.getTextContent();
  const items = textContent.items.map((item) => ({
    str: item.str,
    x: item.transform[4],
    y: item.transform[5],
  }));

  items.sort((a, b) => b.y - a.y || a.x - b.x);

  const lines = [];
  let currentY = null;
  let currentLine = "";

  items.forEach((item) => {
    if (currentY === null || Math.abs(item.y - currentY) > 2) {
      if (currentLine) {
        lines.push(currentLine.trim());
      }
      currentLine = item.str;
      currentY = item.y;
    } else {
      currentLine += `${currentLine ? " " : ""}${item.str}`;
    }
  });
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  return lines.join("\n");
}

async function readPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pagesText = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const pageText = await extractPageText(page);
    pagesText.push(pageText);
  }
  return pagesText.join("\n");
}

async function handleExtract() {
  const file = pdfInput.files[0];
  if (!file) {
    setStatus("PDFを選択してください。", "error");
    return;
  }

  setStatus("PDFライブラリを読み込み中...");
  extractButton.disabled = true;
  try {
    await ensurePdfJs();
    setStatus("読み込み中...");
    const text = await readPdfText(file);
    textPreview.value = text;
    const { record, missing } = extractFields(text, file.name);
    currentRecord = record;
    renderResult(record);
    if (missing.length) {
      missingFieldsEl.textContent = `未抽出: ${missing.join(" / ")}`;
    } else {
      missingFieldsEl.textContent = "すべての項目を抽出しました。";
    }
    if (!text.trim()) {
      setStatus("テキストを抽出できませんでした（画像PDFの可能性）。", "error");
    } else {
      setStatus("抽出完了", "success");
    }
  } catch (error) {
    console.error(error);
    setStatus(buildErrorMessage(error), "error");
  } finally {
    extractButton.disabled = false;
  }
}

function downloadCsv() {
  if (!currentRecord) {
    setStatus("先にPDFを抽出してください。");
    return;
  }
  const csvContent = buildCsv(currentRecord);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "invoice_extract.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyCsv() {
  if (!currentRecord) {
    setStatus("先にPDFを抽出してください。", "error");
    return;
  }
  const csvContent = buildCsv(currentRecord).replace(/^\uFEFF/, "");
  try {
    await navigator.clipboard.writeText(csvContent);
    setStatus("CSVをクリップボードにコピーしました。", "success");
  } catch (error) {
    console.error(error);
    setStatus("コピーに失敗しました。", "error");
  }
}

function buildErrorMessage(error) {
  const name = error?.name || "";
  const message = error?.message || "";
  if (name === "PasswordException") {
    return "パスワード付きPDFは未対応です。";
  }
  if (name === "InvalidPDFException") {
    return "PDFが壊れているか、PDFとして認識できません。";
  }
  if (name === "MissingPDFException") {
    return "PDFファイルが見つかりませんでした。";
  }
  if (error?.message === "PDFJS_LOAD_FAILED") {
    return "PDF読み取りライブラリの読み込みに失敗しました。ネットワーク制限/広告ブロッカーの確認、またはライブラリを同梱してください。";
  }
  if (message) {
    return `抽出に失敗しました: ${message}`;
  }
  return "抽出に失敗しました。PDF形式をご確認ください。";
}

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_SOURCES[0].worker;
}

extractButton.addEventListener("click", handleExtract);
downloadCsvButton.addEventListener("click", downloadCsv);
copyCsvButton.addEventListener("click", copyCsv);
