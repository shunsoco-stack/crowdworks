Option Explicit

Private Const SHEET_INVENTORY As String = "Inventory"
Private Const SHEET_REORDER As String = "Reorder"
Private Const SHEET_PRICE As String = "PriceMaster"
Private Const SHEET_DEALER As String = "DealerMaster"
Private Const SHEET_MONTHLY_INV As String = "MonthlyInventory"
Private Const SHEET_SALES As String = "Sales"
Private Const SHEET_SUMMARY As String = "Summary"

Private Const COL_ITEM_ID As Long = 1
Private Const COL_ITEM_NAME As Long = 2
Private Const COL_CATEGORY As Long = 3
Private Const COL_QUANTITY As Long = 4
Private Const COL_MIN_QUANTITY As Long = 5
Private Const COL_LOCATION As Long = 6
Private Const COL_LAST_UPDATED As Long = 7

Private Const COL_PRICE_YEAR As Long = 1
Private Const COL_PRICE_ITEM_ID As Long = 2
Private Const COL_PRICE_ITEM_NAME As Long = 3
Private Const COL_PRICE_BASE_PRICE As Long = 4
Private Const COL_PRICE_COST As Long = 5
Private Const COL_PRICE_NOTES As Long = 6

Private Const COL_DEALER_ID As Long = 1
Private Const COL_DEALER_NAME As Long = 2
Private Const COL_DEALER_QUAL As Long = 3
Private Const COL_DEALER_RATE As Long = 4
Private Const COL_DEALER_NOTES As Long = 5

Private Const COL_MONTH_YEAR_MONTH As Long = 1
Private Const COL_MONTH_DEALER_ID As Long = 2
Private Const COL_MONTH_ITEM_ID As Long = 3
Private Const COL_MONTH_OPENING As Long = 4
Private Const COL_MONTH_RECEIVED As Long = 5
Private Const COL_MONTH_SOLD As Long = 6
Private Const COL_MONTH_CLOSING As Long = 7
Private Const COL_MONTH_UPDATED As Long = 8

Private Const COL_SALE_DATE As Long = 1
Private Const COL_SALE_DEALER_ID As Long = 2
Private Const COL_SALE_ITEM_ID As Long = 3
Private Const COL_SALE_QTY As Long = 4
Private Const COL_SALE_YEAR As Long = 5
Private Const COL_SALE_BASE_PRICE As Long = 6
Private Const COL_SALE_RATE As Long = 7
Private Const COL_SALE_NET_UNIT_PRICE As Long = 8
Private Const COL_SALE_NET_SALES As Long = 9
Private Const COL_SALE_COST_UNIT As Long = 10
Private Const COL_SALE_COST_TOTAL As Long = 11
Private Const COL_SALE_GROSS_PROFIT As Long = 12
Private Const COL_SALE_GROSS_MARGIN As Long = 13
Private Const COL_SALE_NOTES As Long = 14

Private Const COL_SUM_YEAR_MONTH As Long = 1
Private Const COL_SUM_DEALER_ID As Long = 2
Private Const COL_SUM_SALES As Long = 3
Private Const COL_SUM_GROSS_PROFIT As Long = 4
Private Const COL_SUM_GROSS_MARGIN As Long = 5

Public Sub SetupInventorySheet()
    Dim ws As Worksheet
    Set ws = GetOrCreateSheet(SHEET_INVENTORY)

    ws.Cells(1, COL_ITEM_ID).Value = "ItemID"
    ws.Cells(1, COL_ITEM_NAME).Value = "ItemName"
    ws.Cells(1, COL_CATEGORY).Value = "Category"
    ws.Cells(1, COL_QUANTITY).Value = "Quantity"
    ws.Cells(1, COL_MIN_QUANTITY).Value = "MinQuantity"
    ws.Cells(1, COL_LOCATION).Value = "Location"
    ws.Cells(1, COL_LAST_UPDATED).Value = "LastUpdated"
End Sub

Public Sub SetupAllSheets()
    SetupInventorySheet
    SetupPriceMasterSheet
    SetupDealerMasterSheet
    SetupMonthlyInventorySheet
    SetupSalesSheet
    SetupSummarySheet
    MsgBox "Sheets created.", vbInformation
End Sub

Public Sub SetupPriceMasterSheet()
    Dim ws As Worksheet
    Set ws = GetOrCreateSheet(SHEET_PRICE)

    If Trim(CStr(ws.Cells(1, COL_PRICE_YEAR).Value)) <> "" Then Exit Sub

    ws.Cells(1, COL_PRICE_YEAR).Value = "Year"
    ws.Cells(1, COL_PRICE_ITEM_ID).Value = "ItemID"
    ws.Cells(1, COL_PRICE_ITEM_NAME).Value = "ItemName"
    ws.Cells(1, COL_PRICE_BASE_PRICE).Value = "BasePrice"
    ws.Cells(1, COL_PRICE_COST).Value = "Cost"
    ws.Cells(1, COL_PRICE_NOTES).Value = "Notes"
End Sub

Public Sub SetupDealerMasterSheet()
    Dim ws As Worksheet
    Set ws = GetOrCreateSheet(SHEET_DEALER)

    If Trim(CStr(ws.Cells(1, COL_DEALER_ID).Value)) <> "" Then Exit Sub

    ws.Cells(1, COL_DEALER_ID).Value = "DealerID"
    ws.Cells(1, COL_DEALER_NAME).Value = "DealerName"
    ws.Cells(1, COL_DEALER_QUAL).Value = "Qualification"
    ws.Cells(1, COL_DEALER_RATE).Value = "PriceRate"
    ws.Cells(1, COL_DEALER_NOTES).Value = "Notes"
End Sub

Public Sub SetupMonthlyInventorySheet()
    Dim ws As Worksheet
    Set ws = GetOrCreateSheet(SHEET_MONTHLY_INV)

    If Trim(CStr(ws.Cells(1, COL_MONTH_YEAR_MONTH).Value)) <> "" Then Exit Sub

    ws.Cells(1, COL_MONTH_YEAR_MONTH).Value = "YearMonth"
    ws.Cells(1, COL_MONTH_DEALER_ID).Value = "DealerID"
    ws.Cells(1, COL_MONTH_ITEM_ID).Value = "ItemID"
    ws.Cells(1, COL_MONTH_OPENING).Value = "OpeningStock"
    ws.Cells(1, COL_MONTH_RECEIVED).Value = "Received"
    ws.Cells(1, COL_MONTH_SOLD).Value = "Sold"
    ws.Cells(1, COL_MONTH_CLOSING).Value = "ClosingStock"
    ws.Cells(1, COL_MONTH_UPDATED).Value = "LastUpdated"
End Sub

Public Sub SetupSalesSheet()
    Dim ws As Worksheet
    Set ws = GetOrCreateSheet(SHEET_SALES)

    If Trim(CStr(ws.Cells(1, COL_SALE_DATE).Value)) <> "" Then Exit Sub

    ws.Cells(1, COL_SALE_DATE).Value = "SaleDate"
    ws.Cells(1, COL_SALE_DEALER_ID).Value = "DealerID"
    ws.Cells(1, COL_SALE_ITEM_ID).Value = "ItemID"
    ws.Cells(1, COL_SALE_QTY).Value = "Quantity"
    ws.Cells(1, COL_SALE_YEAR).Value = "SaleYear"
    ws.Cells(1, COL_SALE_BASE_PRICE).Value = "BasePrice"
    ws.Cells(1, COL_SALE_RATE).Value = "PriceRate"
    ws.Cells(1, COL_SALE_NET_UNIT_PRICE).Value = "NetUnitPrice"
    ws.Cells(1, COL_SALE_NET_SALES).Value = "NetSales"
    ws.Cells(1, COL_SALE_COST_UNIT).Value = "CostUnit"
    ws.Cells(1, COL_SALE_COST_TOTAL).Value = "CostTotal"
    ws.Cells(1, COL_SALE_GROSS_PROFIT).Value = "GrossProfit"
    ws.Cells(1, COL_SALE_GROSS_MARGIN).Value = "GrossMargin"
    ws.Cells(1, COL_SALE_NOTES).Value = "Notes"
End Sub

Public Sub SetupSummarySheet()
    Dim ws As Worksheet
    Set ws = GetOrCreateSheet(SHEET_SUMMARY)

    If Trim(CStr(ws.Cells(1, COL_SUM_YEAR_MONTH).Value)) <> "" Then Exit Sub

    ws.Cells(1, COL_SUM_YEAR_MONTH).Value = "YearMonth"
    ws.Cells(1, COL_SUM_DEALER_ID).Value = "DealerID"
    ws.Cells(1, COL_SUM_SALES).Value = "SalesTotal"
    ws.Cells(1, COL_SUM_GROSS_PROFIT).Value = "GrossProfit"
    ws.Cells(1, COL_SUM_GROSS_MARGIN).Value = "GrossMargin"
End Sub

Public Sub AddItem()
    Dim ws As Worksheet
    Dim itemId As String
    Dim itemName As String
    Dim category As String
    Dim location As String
    Dim qty As Long
    Dim minQty As Long
    Dim qtyText As String
    Dim minQtyText As String
    Dim nextRow As Long

    Set ws = GetOrCreateSheet(SHEET_INVENTORY)
    EnsureHeader ws

    itemId = Trim(InputBox("Enter item ID", "Add Item"))
    If itemId = "" Then Exit Sub
    If FindRowByID(ws, itemId) > 0 Then
        MsgBox "Item ID already exists.", vbExclamation
        Exit Sub
    End If

    itemName = Trim(InputBox("Enter item name", "Add Item"))
    If itemName = "" Then Exit Sub

    category = Trim(InputBox("Enter category", "Add Item"))
    location = Trim(InputBox("Enter location", "Add Item"))

    qtyText = Trim(InputBox("Enter quantity", "Add Item"))
    If qtyText = "" Or Not IsNumeric(qtyText) Then
        MsgBox "Quantity must be a number.", vbExclamation
        Exit Sub
    End If
    qty = CLng(qtyText)

    minQtyText = Trim(InputBox("Enter minimum quantity", "Add Item"))
    If minQtyText = "" Or Not IsNumeric(minQtyText) Then
        MsgBox "Minimum quantity must be a number.", vbExclamation
        Exit Sub
    End If
    minQty = CLng(minQtyText)

    nextRow = NextDataRow(ws, COL_ITEM_ID)
    ws.Cells(nextRow, COL_ITEM_ID).Value = itemId
    ws.Cells(nextRow, COL_ITEM_NAME).Value = itemName
    ws.Cells(nextRow, COL_CATEGORY).Value = category
    ws.Cells(nextRow, COL_QUANTITY).Value = qty
    ws.Cells(nextRow, COL_MIN_QUANTITY).Value = minQty
    ws.Cells(nextRow, COL_LOCATION).Value = location
    ws.Cells(nextRow, COL_LAST_UPDATED).Value = Now

    MsgBox "Item added.", vbInformation
End Sub

Public Sub StockIn()
    UpdateStockWithPrompt True
End Sub

Public Sub StockOut()
    UpdateStockWithPrompt False
End Sub

Public Sub GenerateReorderList()
    Dim ws As Worksheet
    Dim reorderWs As Worksheet
    Dim lastRow As Long
    Dim rowIndex As Long
    Dim targetRow As Long
    Dim qty As Variant
    Dim minQty As Variant

    Set ws = GetOrCreateSheet(SHEET_INVENTORY)
    EnsureHeader ws

    Set reorderWs = GetOrCreateSheet(SHEET_REORDER)
    reorderWs.Cells.ClearContents

    CopyHeaders ws, reorderWs
    targetRow = 2

    lastRow = ws.Cells(ws.Rows.Count, COL_ITEM_ID).End(xlUp).Row
    For rowIndex = 2 To lastRow
        If Trim(CStr(ws.Cells(rowIndex, COL_ITEM_ID).Value)) <> "" Then
            qty = ws.Cells(rowIndex, COL_QUANTITY).Value
            minQty = ws.Cells(rowIndex, COL_MIN_QUANTITY).Value
            If IsNumeric(qty) And IsNumeric(minQty) Then
                If CLng(qty) <= CLng(minQty) Then
                    CopyRow ws, reorderWs, rowIndex, targetRow
                    targetRow = targetRow + 1
                End If
            End If
        End If
    Next rowIndex

    MsgBox "Reorder list generated.", vbInformation
End Sub

Public Sub AddPriceEntry()
    Dim ws As Worksheet
    Dim yearText As String
    Dim itemId As String
    Dim itemName As String
    Dim basePriceText As String
    Dim costText As String
    Dim notes As String
    Dim yearValue As Long
    Dim basePrice As Double
    Dim cost As Double
    Dim nextRow As Long

    Set ws = GetOrCreateSheet(SHEET_PRICE)
    SetupPriceMasterSheet

    yearText = Trim(InputBox("Enter year (YYYY)", "Add Price"))
    If yearText = "" Or Not IsNumeric(yearText) Then Exit Sub
    yearValue = CLng(yearText)

    itemId = Trim(InputBox("Enter item ID", "Add Price"))
    If itemId = "" Then Exit Sub
    If FindPriceRow(ws, yearValue, itemId) > 0 Then
        MsgBox "Price entry already exists.", vbExclamation
        Exit Sub
    End If

    itemName = Trim(InputBox("Enter item name", "Add Price"))

    basePriceText = Trim(InputBox("Enter base price", "Add Price"))
    If basePriceText = "" Or Not IsNumeric(basePriceText) Then
        MsgBox "Base price must be a number.", vbExclamation
        Exit Sub
    End If
    basePrice = CDbl(basePriceText)

    costText = Trim(InputBox("Enter cost", "Add Price"))
    If costText = "" Or Not IsNumeric(costText) Then
        MsgBox "Cost must be a number.", vbExclamation
        Exit Sub
    End If
    cost = CDbl(costText)

    notes = Trim(InputBox("Enter notes (optional)", "Add Price"))

    nextRow = NextDataRow(ws, COL_PRICE_YEAR)
    ws.Cells(nextRow, COL_PRICE_YEAR).Value = yearValue
    ws.Cells(nextRow, COL_PRICE_ITEM_ID).Value = itemId
    ws.Cells(nextRow, COL_PRICE_ITEM_NAME).Value = itemName
    ws.Cells(nextRow, COL_PRICE_BASE_PRICE).Value = basePrice
    ws.Cells(nextRow, COL_PRICE_COST).Value = cost
    ws.Cells(nextRow, COL_PRICE_NOTES).Value = notes

    MsgBox "Price entry added.", vbInformation
End Sub

Public Sub AddDealer()
    Dim ws As Worksheet
    Dim dealerId As String
    Dim dealerName As String
    Dim qualification As String
    Dim rateText As String
    Dim notes As String
    Dim rateValue As Double
    Dim nextRow As Long

    Set ws = GetOrCreateSheet(SHEET_DEALER)
    SetupDealerMasterSheet

    dealerId = Trim(InputBox("Enter dealer ID", "Add Dealer"))
    If dealerId = "" Then Exit Sub
    If FindRowByValue(ws, COL_DEALER_ID, dealerId) > 0 Then
        MsgBox "Dealer ID already exists.", vbExclamation
        Exit Sub
    End If

    dealerName = Trim(InputBox("Enter dealer name", "Add Dealer"))
    qualification = Trim(InputBox("Enter qualification", "Add Dealer"))

    rateText = Trim(InputBox("Enter price rate (e.g. 1.0, 0.95)", "Add Dealer"))
    If rateText = "" Or Not IsNumeric(rateText) Then
        MsgBox "Price rate must be a number.", vbExclamation
        Exit Sub
    End If
    rateValue = CDbl(rateText)
    If rateValue <= 0 Then
        MsgBox "Price rate must be positive.", vbExclamation
        Exit Sub
    End If

    notes = Trim(InputBox("Enter notes (optional)", "Add Dealer"))

    nextRow = NextDataRow(ws, COL_DEALER_ID)
    ws.Cells(nextRow, COL_DEALER_ID).Value = dealerId
    ws.Cells(nextRow, COL_DEALER_NAME).Value = dealerName
    ws.Cells(nextRow, COL_DEALER_QUAL).Value = qualification
    ws.Cells(nextRow, COL_DEALER_RATE).Value = rateValue
    ws.Cells(nextRow, COL_DEALER_NOTES).Value = notes

    MsgBox "Dealer added.", vbInformation
End Sub

Public Sub RecordMonthlyInventory()
    Dim ws As Worksheet
    Dim yearMonthText As String
    Dim dealerId As String
    Dim itemId As String
    Dim openingText As String
    Dim receivedText As String
    Dim soldText As String
    Dim openingQty As Long
    Dim receivedQty As Long
    Dim soldQty As Long
    Dim closingQty As Long
    Dim nextRow As Long

    Set ws = GetOrCreateSheet(SHEET_MONTHLY_INV)
    SetupMonthlyInventorySheet

    yearMonthText = Trim(InputBox("Enter year-month (YYYY-MM)", "Monthly Inventory"))
    If yearMonthText = "" Then Exit Sub
    If Not IsValidYearMonth(yearMonthText) Then
        MsgBox "Invalid year-month format.", vbExclamation
        Exit Sub
    End If

    dealerId = Trim(InputBox("Enter dealer ID", "Monthly Inventory"))
    If dealerId = "" Then Exit Sub

    itemId = Trim(InputBox("Enter item ID", "Monthly Inventory"))
    If itemId = "" Then Exit Sub

    openingText = Trim(InputBox("Enter opening stock", "Monthly Inventory"))
    If openingText = "" Or Not IsNumeric(openingText) Then
        MsgBox "Opening stock must be a number.", vbExclamation
        Exit Sub
    End If
    openingQty = CLng(openingText)

    receivedText = Trim(InputBox("Enter received quantity", "Monthly Inventory"))
    If receivedText = "" Or Not IsNumeric(receivedText) Then
        MsgBox "Received quantity must be a number.", vbExclamation
        Exit Sub
    End If
    receivedQty = CLng(receivedText)

    soldText = Trim(InputBox("Enter sold quantity", "Monthly Inventory"))
    If soldText = "" Or Not IsNumeric(soldText) Then
        MsgBox "Sold quantity must be a number.", vbExclamation
        Exit Sub
    End If
    soldQty = CLng(soldText)

    closingQty = openingQty + receivedQty - soldQty
    If closingQty < 0 Then
        MsgBox "Closing stock cannot be negative.", vbExclamation
        Exit Sub
    End If

    nextRow = NextDataRow(ws, COL_MONTH_YEAR_MONTH)
    ws.Cells(nextRow, COL_MONTH_YEAR_MONTH).Value = yearMonthText
    ws.Cells(nextRow, COL_MONTH_DEALER_ID).Value = dealerId
    ws.Cells(nextRow, COL_MONTH_ITEM_ID).Value = itemId
    ws.Cells(nextRow, COL_MONTH_OPENING).Value = openingQty
    ws.Cells(nextRow, COL_MONTH_RECEIVED).Value = receivedQty
    ws.Cells(nextRow, COL_MONTH_SOLD).Value = soldQty
    ws.Cells(nextRow, COL_MONTH_CLOSING).Value = closingQty
    ws.Cells(nextRow, COL_MONTH_UPDATED).Value = Now

    MsgBox "Monthly inventory recorded.", vbInformation
End Sub

Public Sub RecordSale()
    Dim ws As Worksheet
    Dim dateText As String
    Dim saleDate As Date
    Dim dealerId As String
    Dim itemId As String
    Dim qtyText As String
    Dim qty As Long
    Dim saleYear As Long
    Dim basePrice As Double
    Dim costUnit As Double
    Dim rateValue As Double
    Dim netUnitPrice As Double
    Dim netSales As Double
    Dim costTotal As Double
    Dim grossProfit As Double
    Dim grossMargin As Double
    Dim nextRow As Long

    Set ws = GetOrCreateSheet(SHEET_SALES)
    SetupSalesSheet

    dateText = Trim(InputBox("Enter sale date (YYYY-MM-DD)", "Record Sale"))
    If dateText = "" Then Exit Sub
    If Not IsDate(dateText) Then
        MsgBox "Invalid date.", vbExclamation
        Exit Sub
    End If
    saleDate = CDate(dateText)
    saleYear = Year(saleDate)

    dealerId = Trim(InputBox("Enter dealer ID", "Record Sale"))
    If dealerId = "" Then Exit Sub

    itemId = Trim(InputBox("Enter item ID", "Record Sale"))
    If itemId = "" Then Exit Sub

    qtyText = Trim(InputBox("Enter quantity", "Record Sale"))
    If qtyText = "" Or Not IsNumeric(qtyText) Then
        MsgBox "Quantity must be a number.", vbExclamation
        Exit Sub
    End If
    qty = CLng(qtyText)
    If qty <= 0 Then
        MsgBox "Quantity must be positive.", vbExclamation
        Exit Sub
    End If

    If Not TryGetPrice(saleYear, itemId, basePrice, costUnit) Then
        MsgBox "Price not found for the year and item.", vbExclamation
        Exit Sub
    End If

    If Not TryGetDealerRate(dealerId, rateValue) Then
        MsgBox "Dealer not found.", vbExclamation
        Exit Sub
    End If

    netUnitPrice = basePrice * rateValue
    netSales = netUnitPrice * qty
    costTotal = costUnit * qty
    grossProfit = netSales - costTotal
    If netSales <> 0 Then
        grossMargin = grossProfit / netSales
    Else
        grossMargin = 0
    End If

    nextRow = NextDataRow(ws, COL_SALE_DATE)
    ws.Cells(nextRow, COL_SALE_DATE).Value = saleDate
    ws.Cells(nextRow, COL_SALE_DATE).NumberFormat = "yyyy-mm-dd"
    ws.Cells(nextRow, COL_SALE_DEALER_ID).Value = dealerId
    ws.Cells(nextRow, COL_SALE_ITEM_ID).Value = itemId
    ws.Cells(nextRow, COL_SALE_QTY).Value = qty
    ws.Cells(nextRow, COL_SALE_YEAR).Value = saleYear
    ws.Cells(nextRow, COL_SALE_BASE_PRICE).Value = basePrice
    ws.Cells(nextRow, COL_SALE_RATE).Value = rateValue
    ws.Cells(nextRow, COL_SALE_NET_UNIT_PRICE).Value = netUnitPrice
    ws.Cells(nextRow, COL_SALE_NET_SALES).Value = netSales
    ws.Cells(nextRow, COL_SALE_COST_UNIT).Value = costUnit
    ws.Cells(nextRow, COL_SALE_COST_TOTAL).Value = costTotal
    ws.Cells(nextRow, COL_SALE_GROSS_PROFIT).Value = grossProfit
    ws.Cells(nextRow, COL_SALE_GROSS_MARGIN).Value = grossMargin
    ws.Cells(nextRow, COL_SALE_GROSS_MARGIN).NumberFormat = "0.00%"

    MsgBox "Sale recorded.", vbInformation
End Sub

Public Sub GenerateMonthlySummary()
    Dim ws As Worksheet
    Dim summaryWs As Worksheet
    Dim lastRow As Long
    Dim rowIndex As Long
    Dim saleDate As Variant
    Dim yearMonthText As String
    Dim dealerId As String
    Dim netSales As Double
    Dim grossProfit As Double
    Dim key As String
    Dim dict As Object
    Dim summaryRow As Long
    Dim keyItem As Variant
    Dim values As Variant
    Dim parts() As String

    Set ws = GetOrCreateSheet(SHEET_SALES)
    SetupSalesSheet
    Set summaryWs = GetOrCreateSheet(SHEET_SUMMARY)
    summaryWs.Cells.ClearContents
    SetupSummarySheet

    Set dict = CreateObject("Scripting.Dictionary")
    lastRow = ws.Cells(ws.Rows.Count, COL_SALE_DATE).End(xlUp).Row

    For rowIndex = 2 To lastRow
        saleDate = ws.Cells(rowIndex, COL_SALE_DATE).Value
        If IsDate(saleDate) Then
            yearMonthText = Format(CDate(saleDate), "yyyy-mm")
        Else
            yearMonthText = ""
        End If

        dealerId = Trim(CStr(ws.Cells(rowIndex, COL_SALE_DEALER_ID).Value))
        If yearMonthText <> "" And dealerId <> "" Then
            key = yearMonthText & "|" & dealerId
            netSales = SafeDouble(ws.Cells(rowIndex, COL_SALE_NET_SALES).Value)
            grossProfit = SafeDouble(ws.Cells(rowIndex, COL_SALE_GROSS_PROFIT).Value)

            If dict.Exists(key) Then
                values = dict(key)
                values(0) = values(0) + netSales
                values(1) = values(1) + grossProfit
                dict(key) = values
            Else
                dict.Add key, Array(netSales, grossProfit)
            End If
        End If
    Next rowIndex

    summaryRow = 2
    For Each keyItem In dict.Keys
        values = dict(keyItem)
        parts = Split(CStr(keyItem), "|")
        summaryWs.Cells(summaryRow, COL_SUM_YEAR_MONTH).Value = parts(0)
        summaryWs.Cells(summaryRow, COL_SUM_DEALER_ID).Value = parts(1)
        summaryWs.Cells(summaryRow, COL_SUM_SALES).Value = values(0)
        summaryWs.Cells(summaryRow, COL_SUM_GROSS_PROFIT).Value = values(1)
        If values(0) <> 0 Then
            summaryWs.Cells(summaryRow, COL_SUM_GROSS_MARGIN).Value = values(1) / values(0)
        Else
            summaryWs.Cells(summaryRow, COL_SUM_GROSS_MARGIN).Value = 0
        End If
        summaryWs.Cells(summaryRow, COL_SUM_GROSS_MARGIN).NumberFormat = "0.00%"
        summaryRow = summaryRow + 1
    Next keyItem

    MsgBox "Summary updated.", vbInformation
End Sub

Private Sub UpdateStockWithPrompt(ByVal isStockIn As Boolean)
    Dim ws As Worksheet
    Dim itemId As String
    Dim deltaText As String
    Dim delta As Long
    Dim actionLabel As String

    Set ws = GetOrCreateSheet(SHEET_INVENTORY)
    EnsureHeader ws

    If isStockIn Then
        actionLabel = "Stock In"
    Else
        actionLabel = "Stock Out"
    End If

    itemId = Trim(InputBox("Enter item ID", actionLabel))
    If itemId = "" Then Exit Sub

    deltaText = Trim(InputBox("Enter quantity", actionLabel))
    If deltaText = "" Or Not IsNumeric(deltaText) Then
        MsgBox "Quantity must be a number.", vbExclamation
        Exit Sub
    End If
    delta = CLng(deltaText)
    If delta <= 0 Then
        MsgBox "Quantity must be positive.", vbExclamation
        Exit Sub
    End If

    If isStockIn Then
        UpdateStockDelta ws, itemId, delta
    Else
        UpdateStockDelta ws, itemId, -delta
    End If
End Sub

Private Sub UpdateStockDelta(ByVal ws As Worksheet, ByVal itemId As String, ByVal delta As Long)
    Dim rowIndex As Long
    Dim currentQty As Variant
    Dim newQty As Long

    rowIndex = FindRowByID(ws, itemId)
    If rowIndex = 0 Then
        MsgBox "Item ID not found.", vbExclamation
        Exit Sub
    End If

    currentQty = ws.Cells(rowIndex, COL_QUANTITY).Value
    If Not IsNumeric(currentQty) Then
        currentQty = 0
    End If
    newQty = CLng(currentQty) + delta
    If newQty < 0 Then
        MsgBox "Insufficient stock.", vbExclamation
        Exit Sub
    End If

    ws.Cells(rowIndex, COL_QUANTITY).Value = newQty
    ws.Cells(rowIndex, COL_LAST_UPDATED).Value = Now

    MsgBox "Stock updated.", vbInformation
End Sub

Private Function GetOrCreateSheet(ByVal sheetName As String) As Worksheet
    Dim ws As Worksheet

    On Error Resume Next
    Set ws = Worksheets(sheetName)
    On Error GoTo 0

    If ws Is Nothing Then
        Set ws = Worksheets.Add(After:=Worksheets(Worksheets.Count))
        ws.Name = sheetName
    End If

    Set GetOrCreateSheet = ws
End Function

Private Sub EnsureHeader(ByVal ws As Worksheet)
    If Trim(CStr(ws.Cells(1, COL_ITEM_ID).Value)) = "" Then
        SetupInventorySheet
    End If
End Sub

Private Function FindRowByID(ByVal ws As Worksheet, ByVal itemId As String) As Long
    Dim found As Range

    If itemId = "" Then
        FindRowByID = 0
        Exit Function
    End If

    Set found = ws.Range(ws.Cells(1, COL_ITEM_ID), ws.Cells(ws.Rows.Count, COL_ITEM_ID)) _
        .Find(What:=itemId, LookAt:=xlWhole, LookIn:=xlValues)

    If found Is Nothing Then
        FindRowByID = 0
    Else
        FindRowByID = found.Row
    End If
End Function

Private Function NextDataRow(ByVal ws As Worksheet, ByVal colIndex As Long) As Long
    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, colIndex).End(xlUp).Row
    If lastRow < 2 Then
        NextDataRow = 2
    Else
        NextDataRow = lastRow + 1
    End If
End Function

Private Sub CopyHeaders(ByVal sourceWs As Worksheet, ByVal targetWs As Worksheet)
    targetWs.Cells(1, COL_ITEM_ID).Value = sourceWs.Cells(1, COL_ITEM_ID).Value
    targetWs.Cells(1, COL_ITEM_NAME).Value = sourceWs.Cells(1, COL_ITEM_NAME).Value
    targetWs.Cells(1, COL_CATEGORY).Value = sourceWs.Cells(1, COL_CATEGORY).Value
    targetWs.Cells(1, COL_QUANTITY).Value = sourceWs.Cells(1, COL_QUANTITY).Value
    targetWs.Cells(1, COL_MIN_QUANTITY).Value = sourceWs.Cells(1, COL_MIN_QUANTITY).Value
    targetWs.Cells(1, COL_LOCATION).Value = sourceWs.Cells(1, COL_LOCATION).Value
    targetWs.Cells(1, COL_LAST_UPDATED).Value = sourceWs.Cells(1, COL_LAST_UPDATED).Value
End Sub

Private Sub CopyRow(ByVal sourceWs As Worksheet, ByVal targetWs As Worksheet, _
                    ByVal sourceRow As Long, ByVal targetRow As Long)
    targetWs.Cells(targetRow, COL_ITEM_ID).Value = sourceWs.Cells(sourceRow, COL_ITEM_ID).Value
    targetWs.Cells(targetRow, COL_ITEM_NAME).Value = sourceWs.Cells(sourceRow, COL_ITEM_NAME).Value
    targetWs.Cells(targetRow, COL_CATEGORY).Value = sourceWs.Cells(sourceRow, COL_CATEGORY).Value
    targetWs.Cells(targetRow, COL_QUANTITY).Value = sourceWs.Cells(sourceRow, COL_QUANTITY).Value
    targetWs.Cells(targetRow, COL_MIN_QUANTITY).Value = sourceWs.Cells(sourceRow, COL_MIN_QUANTITY).Value
    targetWs.Cells(targetRow, COL_LOCATION).Value = sourceWs.Cells(sourceRow, COL_LOCATION).Value
    targetWs.Cells(targetRow, COL_LAST_UPDATED).Value = sourceWs.Cells(sourceRow, COL_LAST_UPDATED).Value
End Sub

Private Function FindRowByValue(ByVal ws As Worksheet, ByVal colIndex As Long, ByVal value As String) As Long
    Dim found As Range
    Dim searchValue As String

    searchValue = Trim(value)
    If searchValue = "" Then
        FindRowByValue = 0
        Exit Function
    End If

    Set found = ws.Range(ws.Cells(1, colIndex), ws.Cells(ws.Rows.Count, colIndex)) _
        .Find(What:=searchValue, LookAt:=xlWhole, LookIn:=xlValues)

    If found Is Nothing Then
        FindRowByValue = 0
    Else
        FindRowByValue = found.Row
    End If
End Function

Private Function FindPriceRow(ByVal ws As Worksheet, ByVal yearValue As Long, ByVal itemId As String) As Long
    Dim lastRow As Long
    Dim rowIndex As Long

    If itemId = "" Then
        FindPriceRow = 0
        Exit Function
    End If

    lastRow = ws.Cells(ws.Rows.Count, COL_PRICE_YEAR).End(xlUp).Row
    For rowIndex = 2 To lastRow
        If CLng(Val(ws.Cells(rowIndex, COL_PRICE_YEAR).Value)) = yearValue Then
            If Trim(CStr(ws.Cells(rowIndex, COL_PRICE_ITEM_ID).Value)) = itemId Then
                FindPriceRow = rowIndex
                Exit Function
            End If
        End If
    Next rowIndex

    FindPriceRow = 0
End Function

Private Function TryGetPrice(ByVal yearValue As Long, ByVal itemId As String, _
                             ByRef basePrice As Double, ByRef cost As Double) As Boolean
    Dim ws As Worksheet
    Dim rowIndex As Long
    Dim baseValue As Variant
    Dim costValue As Variant

    Set ws = GetOrCreateSheet(SHEET_PRICE)
    SetupPriceMasterSheet

    rowIndex = FindPriceRow(ws, yearValue, itemId)
    If rowIndex = 0 Then
        TryGetPrice = False
        Exit Function
    End If

    baseValue = ws.Cells(rowIndex, COL_PRICE_BASE_PRICE).Value
    costValue = ws.Cells(rowIndex, COL_PRICE_COST).Value

    If Not IsNumeric(baseValue) Or Not IsNumeric(costValue) Then
        TryGetPrice = False
        Exit Function
    End If

    basePrice = CDbl(baseValue)
    cost = CDbl(costValue)
    TryGetPrice = True
End Function

Private Function TryGetDealerRate(ByVal dealerId As String, ByRef rateValue As Double) As Boolean
    Dim ws As Worksheet
    Dim rowIndex As Long
    Dim rateCell As Variant

    Set ws = GetOrCreateSheet(SHEET_DEALER)
    SetupDealerMasterSheet

    rowIndex = FindRowByValue(ws, COL_DEALER_ID, dealerId)
    If rowIndex = 0 Then
        TryGetDealerRate = False
        Exit Function
    End If

    rateCell = ws.Cells(rowIndex, COL_DEALER_RATE).Value
    If rateCell = "" Then
        rateValue = 1
    ElseIf Not IsNumeric(rateCell) Then
        TryGetDealerRate = False
        Exit Function
    Else
        rateValue = CDbl(rateCell)
    End If

    TryGetDealerRate = True
End Function

Private Function IsValidYearMonth(ByVal yearMonthText As String) As Boolean
    Dim parts() As String
    Dim yearValue As Long
    Dim monthValue As Long

    parts = Split(yearMonthText, "-")
    If UBound(parts) <> 1 Then
        IsValidYearMonth = False
        Exit Function
    End If

    If Not IsNumeric(parts(0)) Or Not IsNumeric(parts(1)) Then
        IsValidYearMonth = False
        Exit Function
    End If

    yearValue = CLng(parts(0))
    monthValue = CLng(parts(1))

    If yearValue < 1900 Or monthValue < 1 Or monthValue > 12 Then
        IsValidYearMonth = False
        Exit Function
    End If

    IsValidYearMonth = True
End Function

Private Function SafeDouble(ByVal value As Variant) As Double
    If IsNumeric(value) Then
        SafeDouble = CDbl(value)
    Else
        SafeDouble = 0
    End If
End Function
