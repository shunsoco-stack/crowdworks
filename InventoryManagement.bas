Option Explicit

Private Const SHEET_INVENTORY As String = "Inventory"
Private Const SHEET_REORDER As String = "Reorder"

Private Const COL_ITEM_ID As Long = 1
Private Const COL_ITEM_NAME As Long = 2
Private Const COL_CATEGORY As Long = 3
Private Const COL_QUANTITY As Long = 4
Private Const COL_MIN_QUANTITY As Long = 5
Private Const COL_LOCATION As Long = 6
Private Const COL_LAST_UPDATED As Long = 7

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
