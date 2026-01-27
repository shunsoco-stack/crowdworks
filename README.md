# Excel VBA Inventory Management Macro

This repository provides a simple VBA module for an Excel-based inventory
management sheet.

## Files

- `InventoryManagement.bas`: VBA module with setup, add item, stock update,
  and reorder list macros.

## Quick Start

1. Open Excel and create a new workbook.
2. Press `ALT+F11` to open the VBA editor.
3. From the menu, choose **File > Import File...** and import
   `InventoryManagement.bas`.
4. Run `SetupInventorySheet` to create the `Inventory` worksheet header.
5. Use the macros below to manage inventory:
   - `AddItem` - add a new inventory item.
   - `StockIn` - increase quantity for an item.
   - `StockOut` - decrease quantity for an item.
   - `GenerateReorderList` - create a `Reorder` sheet for low stock items.

## Worksheet Columns

The `Inventory` sheet uses the following columns:

1. ItemID
2. ItemName
3. Category
4. Quantity
5. MinQuantity
6. Location
7. LastUpdated
