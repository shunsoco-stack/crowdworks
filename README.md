# Excel VBA Inventory Management Macro

This repository provides a VBA module for an Excel-based inventory management
workbook. It supports yearly price changes, dealer qualification pricing,
monthly dealer inventory tracking, and sales/gross margin calculations.

## Files

- `InventoryManagement.bas`: VBA module with setup, add item, stock update,
  and reorder list macros.
- `InventoryTemplate.xlsx`: ready-to-use workbook with all sheets and headers.

## Template Workbook

`InventoryTemplate.xlsx` includes the required sheets and headers so beginners
can start entering data immediately. Excel macros cannot be saved in `.xlsx`,
so if you want to use the VBA automation, save it as `.xlsm` and import the
`InventoryManagement.bas` module.

## Quick Start

1. Open `InventoryTemplate.xlsx`.
2. Save as **Excel Macro-Enabled Workbook** (`.xlsm`) if you want to use macros.
3. Press `ALT+F11` to open the VBA editor.
4. From the menu, choose **File > Import File...** and import
   `InventoryManagement.bas`.
5. Run `SetupAllSheets` if you need to re-create the sheets.
6. Use the macros below to manage data:
   - `AddItem` - add a new inventory item.
   - `AddPriceEntry` - add yearly price and cost per item.
   - `AddDealer` - register dealer and qualification rate.
   - `RecordMonthlyInventory` - record monthly inventory per dealer and item.
   - `RecordSale` - record sales with automatic pricing and margin.
   - `GenerateMonthlySummary` - summarize sales by month and dealer.
   - `StockIn` / `StockOut` / `GenerateReorderList` - optional global stock.

## Worksheet Columns

The `Inventory` sheet uses the following columns:

1. ItemID
2. ItemName
3. Category
4. Quantity
5. MinQuantity
6. Location
7. LastUpdated

The `PriceMaster` sheet uses:

1. Year
2. ItemID
3. ItemName
4. BasePrice
5. Cost
6. Notes

The `DealerMaster` sheet uses:

1. DealerID
2. DealerName
3. Qualification
4. PriceRate
5. Notes

The `MonthlyInventory` sheet uses:

1. YearMonth (YYYY-MM)
2. DealerID
3. ItemID
4. OpeningStock
5. Received
6. Sold
7. ClosingStock
8. LastUpdated

The `Sales` sheet uses:

1. SaleDate
2. DealerID
3. ItemID
4. Quantity
5. SaleYear
6. BasePrice
7. PriceRate
8. NetUnitPrice
9. NetSales
10. CostUnit
11. CostTotal
12. GrossProfit
13. GrossMargin
14. Notes

The `Summary` sheet uses:

1. YearMonth
2. DealerID
3. SalesTotal
4. GrossProfit
5. GrossMargin
