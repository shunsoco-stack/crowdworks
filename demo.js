const pdfInput = document.getElementById("pdfInput");
const extractButton = document.getElementById("extractButton");
const statusEl = document.getElementById("status");
const resultBody = document.getElementById("resultBody");
const batchHead = document.getElementById("batchHead");
const missingFieldsEl = document.getElementById("missingFields");
const textPreview = document.getElementById("textPreview");
const downloadCsvButton = document.getElementById("downloadCsv");
const copyCsvButton = document.getElementById("copyCsv");
const ocrToggle = document.getElementById("ocrToggle");
const allPagesToggle = document.getElementById("allPagesToggle");

let currentRecord = null;
let currentResults = [];
let pdfjsReadyPromise = null;
let tesseractReadyPromise = null;
let pdfSupportPromise = null;
const OCR_PASSES = [
  { label: "標準", scale: 3.0, threshold: null, psm: "3" },
  { label: "高精度", scale: 4.0, threshold: 175, psm: "6" },
];

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

const PDFJS_SUPPORT_SOURCES = [
  {
    label: "local",
    cMapUrl: "./vendor/cmaps/",
    standardFontDataUrl: "./vendor/standard_fonts/",
    probe: "./vendor/cmaps/Adobe-Japan1-0.bcmap",
  },
  {
    label: "jsDelivr",
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
    standardFontDataUrl:
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
    probe:
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/Adobe-Japan1-0.bcmap",
  },
  {
    label: "unpkg",
    cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
    standardFontDataUrl:
      "https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/",
    probe:
      "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/Adobe-Japan1-0.bcmap",
  },
];

const TESSERACT_SOURCES = [
  "https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js",
  "https://unpkg.com/tesseract.js@5.0.4/dist/tesseract.min.js",
];

const TESSDATA_SOURCES = [
  {
    label: "jsDelivr",
    langPath: "https://cdn.jsdelivr.net/npm/@tesseract.js-data/jpn/4.0.0_best",
  },
  {
    label: "unpkg",
    langPath: "https://unpkg.com/@tesseract.js-data/jpn/4.0.0_best",
  },
  {
    label: "projectnaptha",
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
  },
];

const FIELD_CONFIG = [
  {
    label: "請求書番号",
    key: "invoice_no",
    patterns: [
      /請求書番号[:：]?\s*([A-Z0-9-]+)/,
      /請\s*求\s*書\s*番\s*号[:：]?\s*([A-Z0-9-]+)/,
      /Invoice No:\s*([A-Z0-9-]+)/,
    ],
  },
  {
    label: "発行日",
    key: "invoice_date",
    patterns: [
      /発行日\s*([0-9]{4}[/-][0-9]{1,2}[/-][0-9]{1,2})/,
      /発行日\s*([0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日)/,
      /発\s*行\s*日\s*([0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日)/,
      /Invoice Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/,
    ],
  },
  {
    label: "請求元",
    key: "vendor",
    patterns: [/請求元\s*(.+)/, /請\s*求\s*元\s*(.+)/, /Vendor:\s*(.+)/],
  },
  {
    label: "請求先",
    key: "customer",
    patterns: [/請求先\s*(.+)/, /請\s*求\s*先\s*(.+)/, /Billing To:\s*(.+)/],
  },
  {
    label: "小計",
    key: "subtotal",
    patterns: [
      /小計\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
      /小\s*計\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
      /Subtotal:\s*([0-9,]+\.[0-9]{2})/,
    ],
  },
  {
    label: "消費税",
    key: "tax",
    patterns: [
      /消費税.*?\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
      /消\s*費\s*税.*?\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
      /Tax:\s*([0-9,]+\.[0-9]{2})/,
    ],
  },
  {
    label: "合計金額",
    key: "total",
    patterns: [
      /合計金額\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
      /合\s*計\s*金\s*額\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
      /合計\s*[¥￥]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
      /Total:\s*([0-9,]+\.[0-9]{2})/,
    ],
  },
];

const OUTPUT_FIELDS = [
  ...FIELD_CONFIG.map((field) => ({ label: field.label, key: field.key })),
  { label: "通貨", key: "currency" },
  { label: "元ファイル", key: "source" },
];

const BATCH_FIELDS = [
  { label: "元ファイル", key: "source" },
  { label: "ステータス", key: "status" },
  { label: "未抽出", key: "missing" },
  ...FIELD_CONFIG.map((field) => ({ label: field.label, key: field.key })),
  { label: "通貨", key: "currency" },
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
    const altMatch = value.match(/([0-9]{4})年([0-9]{1,2})月([0-9]{1,2})日/);
    if (altMatch) {
      return `${altMatch[1]}-${altMatch[2].padStart(2, "0")}-${altMatch[3].padStart(2, "0")}`;
    }
  }
  const normalized = value.replace(/\//g, "-");
  const parts = normalized.split("-");
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
  }
  return normalized;
}

function normalizeAmount(value) {
  if (!value) return "";
  return value
    .replace(/[¥￥]/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
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

function normalizeFullWidth(text) {
  return text
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30))
    .replace(/[Ａ-Ｚ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff21 + 0x41))
    .replace(/[ａ-ｚ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff41 + 0x61))
    .replace(/：/g, ":")
    .replace(/／/g, "/")
    .replace(/－/g, "-")
    .replace(/　/g, " ");
}

function normalizeOcrText(text) {
  let normalized = normalizeFullWidth(text || "");
  normalized = normalized.replace(/\r\n/g, "\n");
  let prev;
  do {
    prev = normalized;
    normalized = normalized.replace(
      /([ぁ-んァ-ン一-龥])\s+([ぁ-んァ-ン一-龥])/g,
      "$1$2"
    );
  } while (normalized !== prev);
  normalized = normalized.replace(/(\d)\s+(?=\d)/g, "$1");
  normalized = normalized.replace(/[ \t]+/g, " ");
  return normalized;
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

async function ensureTesseract() {
  if (window.Tesseract) {
    return;
  }
  if (!tesseractReadyPromise) {
    tesseractReadyPromise = (async () => {
      for (const source of TESSERACT_SOURCES) {
        try {
          await loadScript(source);
          if (window.Tesseract) {
            return;
          }
        } catch (error) {
          console.warn(error);
        }
      }
      throw new Error("TESSERACT_LOAD_FAILED");
    })();
  }
  return tesseractReadyPromise;
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

async function resolvePdfSupportSource() {
  if (pdfSupportPromise) {
    return pdfSupportPromise;
  }
  pdfSupportPromise = (async () => {
    for (const source of PDFJS_SUPPORT_SOURCES) {
      try {
        const response = await fetch(source.probe, { method: "GET" });
        if (response.ok) {
          return {
            cMapUrl: source.cMapUrl,
            cMapPacked: true,
            standardFontDataUrl: source.standardFontDataUrl,
          };
        }
      } catch (error) {
        console.warn(`PDF support source failed: ${source.label}`, error);
      }
    }
    return null;
  })();
  return pdfSupportPromise;
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
  const row = document.createElement("tr");
  BATCH_FIELDS.forEach((field) => {
    const cell = document.createElement("td");
    cell.textContent = record[field.key] || "";
    row.appendChild(cell);
  });
  resultBody.appendChild(row);
}

function initBatchTable() {
  if (!batchHead) {
    return;
  }
  batchHead.innerHTML = "";
  const row = document.createElement("tr");
  BATCH_FIELDS.forEach((field) => {
    const th = document.createElement("th");
    th.textContent = field.label;
    row.appendChild(th);
  });
  batchHead.appendChild(row);
}

function buildCsv(records) {
  const headers = BATCH_FIELDS.map((field) => field.label);
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escapeCsv).join(",")];
  records.forEach((record) => {
    const values = BATCH_FIELDS.map((field) => record[field.key] || "");
    lines.push(values.map(escapeCsv).join(","));
  });
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

async function readPdfText(file, allPages) {
  const arrayBuffer = await file.arrayBuffer();
  const support = await resolvePdfSupportSource();
  const params = support ? { data: arrayBuffer, ...support } : { data: arrayBuffer };
  const pdf = await pdfjsLib.getDocument(params).promise;
  const pagesText = [];
  const maxPages = allPages ? pdf.numPages : 1;
  for (let pageNum = 1; pageNum <= maxPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const pageText = await extractPageText(page);
    pagesText.push(pageText);
  }
  return { text: pagesText.join("\n"), pdf };
}

async function renderFirstPageToCanvas(pdf, scale = OCR_PASSES[0].scale) {
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

function applyOcrPreprocess(canvas, threshold) {
  if (threshold === null || threshold === undefined) {
    return canvas;
  }
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const value = luminance > threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

async function runOcr(pdf) {
  await ensureTesseract();
  let bestText = "";
  let hadLangError = false;
  for (const source of TESSDATA_SOURCES) {
    try {
      for (let i = 0; i < OCR_PASSES.length; i += 1) {
        const pass = OCR_PASSES[i];
        setStatus(`OCR中（${source.label}/${pass.label}）...`);
        let canvas = await renderFirstPageToCanvas(pdf, pass.scale);
        canvas = applyOcrPreprocess(canvas, pass.threshold);
        const { data } = await window.Tesseract.recognize(canvas, "jpn", {
          logger: (msg) => {
            if (msg.status === "recognizing text") {
              const progress = Math.round((msg.progress || 0) * 100);
              setStatus(`OCR中（${source.label}/${pass.label}）... ${progress}%`);
            }
          },
          tessedit_pageseg_mode: pass.psm,
          preserve_interword_spaces: "1",
          user_defined_dpi: "300",
          langPath: source.langPath,
        });
        const text = data.text || "";
        if (text.trim().length > bestText.trim().length) {
          bestText = text;
        }
        if (bestText.trim().length >= 80) {
          return bestText;
        }
      }
    } catch (error) {
      hadLangError = true;
      console.warn(error);
    }
  }
  if (hadLangError && !bestText.trim()) {
    throw new Error("TESSDATA_LOAD_FAILED");
  }
  return bestText;
}

async function handleExtract() {
  const files = Array.from(pdfInput.files || []);
  if (!files.length) {
    setStatus("PDFを選択してください。", "error");
    return;
  }

  setStatus("PDFライブラリを読み込み中...");
  extractButton.disabled = true;
  try {
    await ensurePdfJs();
    resultBody.innerHTML = "";
    initBatchTable();
    currentResults = [];

    const allPages = allPagesToggle?.checked ?? true;
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      setStatus(`処理中 (${i + 1}/${files.length}): ${file.name}`);

      const { text, pdf } = await readPdfText(file, allPages);
      let finalText = text;
      let ocrUsed = false;
      if (!finalText.trim()) {
        if (ocrToggle.checked) {
          setStatus(`OCR開始: ${file.name}`);
          finalText = await runOcr(pdf);
          ocrUsed = true;
        }
      }

      const normalizedText = normalizeOcrText(finalText);
      textPreview.value = normalizedText;
      const { record, missing } = extractFields(normalizedText, file.name);
      const missingText = missing.length ? missing.join(" / ") : "-";
      const status =
        !normalizedText.trim()
          ? "テキスト抽出不可"
          : normalizedText.trim().length < 20
          ? "OCR結果が少ない"
          : missing.length
          ? "一部未抽出"
          : "OK";

      const outputRecord = {
        ...record,
        status: ocrUsed ? `${status}（OCR）` : status,
        missing: missingText,
        source: file.name,
      };

      currentRecord = outputRecord;
      currentResults.push(outputRecord);
      renderResult(outputRecord);
      missingFieldsEl.textContent = `最後の処理結果: ${outputRecord.status}`;
    }

    setStatus(`抽出完了 (${currentResults.length}件)`, "success");
  } catch (error) {
    console.error(error);
    setStatus(buildErrorMessage(error), "error");
  } finally {
    extractButton.disabled = false;
  }
}

function downloadCsv() {
  if (!currentResults.length) {
    setStatus("先にPDFを抽出してください。", "error");
    return;
  }
  const csvContent = buildCsv(currentResults);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "invoice_extract_batch.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyCsv() {
  if (!currentResults.length) {
    setStatus("先にPDFを抽出してください。", "error");
    return;
  }
  const csvContent = buildCsv(currentResults).replace(/^\uFEFF/, "");
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
  if (error?.message === "TESSERACT_LOAD_FAILED") {
    return "OCRライブラリの読み込みに失敗しました。ネットワーク制限をご確認ください。";
  }
  if (error?.message === "TESSDATA_LOAD_FAILED") {
    return "OCRの言語データ取得に失敗しました。ネットワーク制限をご確認ください。";
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
