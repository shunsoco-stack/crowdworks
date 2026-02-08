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

**Run**
```
python sample1_extract_invoice.py
```

**Notes**
- The input is a text file that represents PDF-extracted text.
- For real PDFs, you can add a PDF parser (e.g., pdfplumber) and pass a .pdf
  file to the script.

---

## Demo 2: CSV normalize + monthly summary

**Goal:** Normalize different CSV formats and create a monthly summary.

**Files**
- Inputs: `sample2_sales_raw_store_a.csv`, `sample2_sales_raw_store_b.csv`
- Script: `sample2_aggregate.py`
- Outputs: `sample2_output_normalized.csv`, `sample2_output_summary.csv`

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

**Run**
```
python sample3_ocr_extract.py
```

**Notes**
- This demo assumes OCR text is already available.
- In production, OCR can be done with Tesseract or a cloud OCR service.

---

## Recommended display on your website

- Show the input and output side-by-side (before/after).
- Add 2 to 3 bullet points explaining the benefit.
- Mention that the workflow can be adapted per client.
