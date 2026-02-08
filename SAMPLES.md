# Sample Demos (Mini Portfolio)

This repository includes three small demos that show how automation work can be
structured. Each demo has input files, a runnable script, and sample outputs.

All demos run with the Python standard library only.

---

## Demo 1: Invoice text -> CSV (PDF-ready flow)

**Goal:** Extract invoice fields and output a clean CSV.

**Files**
- Input text: `sample1_invoice_text.txt`
- Script: `sample1_extract_invoice.py`
- Output: `sample1_output.csv`
- GAS: `sample1_gas_extract_invoice.gs`

**Run**
```
python sample1_extract_invoice.py
```

**Notes**
- The input is a text file that represents PDF-extracted text.
- For real PDFs, you can add a PDF parser (e.g., pdfplumber) and pass a .pdf
  file to the script.
- GAS version reads text from cell A1 in sheet `Sample1_Input` and writes to
  `Sample1_Output`.

---

## Demo 2: CSV normalize + monthly summary

**Goal:** Normalize different CSV formats and create a monthly summary.

**Files**
- Inputs: `sample2_sales_raw_store_a.csv`, `sample2_sales_raw_store_b.csv`
- Script: `sample2_aggregate.py`
- Outputs: `sample2_output_normalized.csv`, `sample2_output_summary.csv`
- GAS: `sample2_gas_aggregate.gs`

**Run**
```
python sample2_aggregate.py
```

---

## Demo 3: OCR text -> CSV (post-processing)

**Goal:** Parse OCR output text and produce a clean CSV with review flags.

**Files**
- Input text: `sample3_ocr_text.txt`
- Script: `sample3_ocr_extract.py`
- Output: `sample3_output.csv`
- GAS: `sample3_gas_ocr_postprocess.gs`

**Run**
```
python sample3_ocr_extract.py
```

**Notes**
- This demo assumes OCR text is already available.
- In production, OCR can be done with Tesseract or a cloud OCR service.
- GAS version reads text from cell A1 in sheet `Sample3_OCR_Text` and writes to
  `Sample3_Output`.

---

## Recommended display on your website

- Show the input and output side-by-side (before/after).
- Add 2 to 3 bullet points explaining the benefit.
- Mention that the workflow can be adapted per client.

---

## GAS quick start

1. Open a Google Sheet.
2. Go to Extensions -> Apps Script.
3. Create a new script file and paste the `.gs` content.
4. Run the main function:
   - Demo 1: `sample1ExtractInvoice`
   - Demo 2: `sample2Aggregate`
   - Demo 3: `sample3ParseOcrText`
