Option Explicit

' This VBA script creates the complete Laura_Boekhoudsysteem.xlsm workbook
' Run this in a new Excel workbook to generate the complete system

Sub CreateLauraWorkbook()
    Dim wb As Workbook
    Dim ws As Worksheet
    Dim i As Integer
    
    ' Create new workbook
    Set wb = Workbooks.Add
    
    ' Rename the workbook
    wb.SaveAs ThisWorkbook.Path & "\Laura_Boekhoudsysteem.xlsm", xlOpenXMLWorkbookMacroEnabled
    
    ' Delete default sheets and create our sheets
    Application.DisplayAlerts = False
    For i = wb.Worksheets.Count To 1 Step -1
        wb.Worksheets(i).Delete
    Next i
    Application.DisplayAlerts = True
    
    ' Create all required worksheets
    Call CreateConsulttypesSheet(wb)
    Call CreateMutualiteitenSheet(wb)
    Call CreateCategorieenSheet(wb)
    Call CreateKlantenSheet(wb)
    Call CreateAfsprakenSheet(wb)
    Call CreateUitgavenSheet(wb)
    Call CreateOverzichtSheet(wb)
    Call CreateTerugbetalingSheet(wb)
    
    ' Create VBA modules and forms
    Call CreateVBAComponents(wb)
    
    ' Save the workbook
    wb.Save
    
    MsgBox "Laura Boekhoudsysteem workbook created successfully!", vbInformation
End Sub

Sub CreateConsulttypesSheet(wb As Workbook)
    Dim ws As Worksheet
    Set ws = wb.Worksheets.Add
    ws.Name = "Consulttypes"
    
    ' Headers
    With ws.Range("A1:B1")
        .Value = Array("Type", "Prijs")
        .Font.Bold = True
    End With
    
    ' Sample data
    ws.Range("A2").Value = "Intake gesprek"
    ws.Range("B2").Value = 60
    ws.Range("A3").Value = "Lange opvolg (consultatie)"
    ws.Range("B3").Value = 35
    ws.Range("A4").Value = "Korte opvolg (consultatie)"
    ws.Range("B4").Value = 30
    ws.Range("A5").Value = "Nabespreking"
    ws.Range("B5").Value = 25
    ws.Range("A6").Value = "Groepssessie (workshop)"
    ' B6 left empty as specified
    
    ' Column widths
    ws.Columns("A").ColumnWidth = 28
    ws.Columns("B").ColumnWidth = 12
    
    ' Freeze row 1
    ws.Range("A2").Select
    ActiveWindow.FreezePanes = True
End Sub

Sub CreateMutualiteitenSheet(wb As Workbook)
    Dim ws As Worksheet
    Set ws = wb.Worksheets.Add
    ws.Name = "Mutualiteiten"
    
    ' Headers
    With ws.Range("A1:C1")
        .Value = Array("Naam", "MaxSessiesPerJaar", "Opmerking")
        .Font.Bold = True
    End With
    
    ' Sample data for Naam column
    Dim mutualiteiten As Variant
    mutualiteiten = Array("CM", "Helan", "Solidaris", "LM", "Partena", "OZ", "De Voorzorg", "IDEWE")
    
    Dim i As Integer
    For i = 0 To UBound(mutualiteiten)
        ws.Cells(i + 2, 1).Value = mutualiteiten(i)
    Next i
    
    ' Column widths
    ws.Columns("A").ColumnWidth = 18
    ws.Columns("B").ColumnWidth = 18
    ws.Columns("C").ColumnWidth = 50
End Sub

Sub CreateCategorieenSheet(wb As Workbook)
    Dim ws As Worksheet
    Set ws = wb.Worksheets.Add
    ws.Name = "Categorieën"
    
    ' Headers
    ws.Range("A1").Value = "Categorie"
    ws.Range("A1").Font.Bold = True
    
    ' Sample data
    Dim categorieen As Variant
    categorieen = Array("Huur", "Materiaal", "Verplaatsing", "Software", "Opleiding", "Marketing", "Overig")
    
    Dim i As Integer
    For i = 0 To UBound(categorieen)
        ws.Cells(i + 2, 1).Value = categorieen(i)
    Next i
    
    ' Column width
    ws.Columns("A").ColumnWidth = 24
End Sub

Sub CreateKlantenSheet(wb As Workbook)
    Dim ws As Worksheet
    Set ws = wb.Worksheets.Add
    ws.Name = "Klanten"
    
    ' Headers
    With ws.Range("A1:H1")
        .Value = Array("KlantID", "Voornaam", "Achternaam", "VolledigeNaam", "E-mail", "Telefoon", "Startdatum", "Mutualiteit")
        .Font.Bold = True
    End With
    
    ' Sample row
    ws.Range("A2").Value = 1
    ws.Range("B2").Value = "Jan"
    ws.Range("C2").Value = "Peeters"
    ws.Range("D2").Formula = "=TRIM(B2&"" ""&C2)"
    ws.Range("E2").Value = "jan@example.com"
    ws.Range("F2").Value = "0470 00 00 00"
    ws.Range("G2").Value = DateValue("06/10/2025")
    ' H2 left empty as specified
    
    ' Data validation for Mutualiteit column
    With ws.Range("H2:H500").Validation
        .Delete
        .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Formula1:="=Mutualiteiten!A2:A1000"
        .IgnoreBlank = True
    End With
    
    ' Column widths
    ws.Columns("A").ColumnWidth = 10
    ws.Columns("B").ColumnWidth = 14
    ws.Columns("C").ColumnWidth = 14
    ws.Columns("D").ColumnWidth = 24
    ws.Columns("E").ColumnWidth = 26
    ws.Columns("F").ColumnWidth = 16
    ws.Columns("G").ColumnWidth = 14
    ws.Columns("H").ColumnWidth = 16
    
    ' Freeze row 1
    ws.Range("A2").Select
    ActiveWindow.FreezePanes = True
End Sub

Sub CreateAfsprakenSheet(wb As Workbook)
    Dim ws As Worksheet
    Set ws = wb.Worksheets.Add
    ws.Name = "Afspraken"
    
    ' Headers
    With ws.Range("A1:I1")
        .Value = Array("Datum", "Klant", "Type", "Aantal", "Prijs (automatisch)", "Totaal", "Terugbetaalbaar?", "Opmerking", "Maand")
        .Font.Bold = True
    End With
    
    ' Sample row
    ws.Range("A2").Value = DateValue("07/10/2025")
    ws.Range("B2").Formula = "=Klanten!D2"
    ws.Range("C2").Value = "Intake gesprek"
    ws.Range("D2").Value = 1
    ws.Range("E2").Formula = "=IFERROR(XLOOKUP(C2,Consulttypes!A:A,Consulttypes!B:B),"""")"
    ws.Range("F2").Formula = "=IFERROR(E2*D2,"""")"
    ws.Range("G2").Value = "Nee"
    ' H2 left empty as specified
    ws.Range("I2").Formula = "=DATE(YEAR(A2),MONTH(A2),1)"
    
    ' Data validations
    With ws.Range("B2:B500").Validation
        .Delete
        .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Formula1:="=Klanten!$D$2:$D$500"
        .IgnoreBlank = True
    End With
    
    With ws.Range("C2:C500).Validation
        .Delete
        .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Formula1:="=Consulttypes!$A$2:$A$1000"
        .IgnoreBlank = True
    End With
    
    ' Column widths
    ws.Columns("A").ColumnWidth = 12
    ws.Columns("B").ColumnWidth = 24
    ws.Columns("C").ColumnWidth = 28
    ws.Columns("D").ColumnWidth = 10
    ws.Columns("E").ColumnWidth = 18
    ws.Columns("F").ColumnWidth = 12
    ws.Columns("G").ColumnWidth = 16
    ws.Columns("H").ColumnWidth = 30
    ws.Columns("I").ColumnWidth = 12
    
    ' Freeze row 1
    ws.Range("A2").Select
    ActiveWindow.FreezePanes = True
End Sub

Sub CreateUitgavenSheet(wb As Workbook)
    Dim ws As Worksheet
    Set ws = wb.Worksheets.Add
    ws.Name = "Uitgaven"
    
    ' Headers
    With ws.Range("A1:F1")
        .Value = Array("Datum", "Beschrijving", "Categorie", "Bedrag", "Betaalmethode", "Maand")
        .Font.Bold = True
    End With
    
    ' Sample row
    ws.Range("A2").Value = DateValue("08/10/2025")
    ws.Range("B2").Value = "Softwarelicentie"
    ws.Range("C2").Value = "Software"
    ws.Range("D2").Value = 19.99
    ws.Range("E2").Value = "Kaart"
    ws.Range("F2").Formula = "=DATE(YEAR(A2),MONTH(A2),1)"
    
    ' Data validation for Categorie
    With ws.Range("C2:C500).Validation
        .Delete
        .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Formula1:="=Categorieën!$A$2:$A$1000"
        .IgnoreBlank = True
    End With
    
    ' Column widths
    ws.Columns("A").ColumnWidth = 12
    ws.Columns("B").ColumnWidth = 30
    ws.Columns("C").ColumnWidth = 16
    ws.Columns("D").ColumnWidth = 12
    ws.Columns("E").ColumnWidth = 16
    ws.Columns("F").ColumnWidth = 12
    
    ' Freeze row 1
    ws.Range("A2").Select
    ActiveWindow.FreezePanes = True
End Sub

Sub CreateOverzichtSheet(wb As Workbook)
    Dim ws As Worksheet
    Set ws = wb.Worksheets.Add
    ws.Name = "Overzicht"
    
    ' Title
    With ws.Range("A1")
        .Value = "Overzicht"
        .Font.Bold = True
        .Font.Size = 14
    End With
    
    ' KPIs
    ws.Range("A3").Value = "Inkomsten (deze maand)"
    ws.Range("B3").Formula = "=IFERROR(SUMIFS(Afspraken!F:F,Afspraken!I:I,DATE(YEAR(TODAY()),MONTH(TODAY()),1)),0)"
    
    ws.Range("A4").Value = "Uitgaven (deze maand)"
    ws.Range("B4").Formula = "=IFERROR(SUMIFS(Uitgaven!D:D,Uitgaven!F:F,DATE(YEAR(TODAY()),MONTH(TODAY()),1)),0)"
    
    ws.Range("A5").Value = "Netto (deze maand)"
    ws.Range("B5").Formula = "=B3-B4"
    
    ' Table header
    With ws.Range("A7:D7")
        .Value = Array("Maand", "Inkomsten", "Uitgaven", "Netto")
        .Font.Bold = True
    End With
    
    ' Monthly data (Jan-Dec of current year)
    Dim i As Integer
    For i = 1 To 12
        ws.Cells(7 + i, 1).Value = DateSerial(Year(Date), i, 1)
        ws.Cells(7 + i, 2).Formula = "=IFERROR(SUMIFS(Afspraken!F:F,Afspraken!I:I,DATE(YEAR(A" & (7 + i) & "),MONTH(A" & (7 + i) & "),1)),0)"
        ws.Cells(7 + i, 3).Formula = "=IFERROR(SUMIFS(Uitgaven!D:D,Uitgaven!F:F,DATE(YEAR(A" & (7 + i) & "),MONTH(A" & (7 + i) & "),1)),0)"
        ws.Cells(7 + i, 4).Formula = "=B" & (7 + i) & "-C" & (7 + i)
    Next i
    
    ' Column widths
    ws.Columns("A").ColumnWidth = 14
    ws.Columns("B").ColumnWidth = 18
    ws.Columns("C").ColumnWidth = 18
    ws.Columns("D").ColumnWidth = 18
End Sub

Sub CreateTerugbetalingSheet(wb As Workbook)
    Dim ws As Worksheet
    Set ws = wb.Worksheets.Add
    ws.Name = "Terugbetaling-signalen"
    
    ' Merged header
    With ws.Range("A1:H1")
        .Merge
        .Value = "Dit blad markeert welke klanten in het lopende jaar een drempel bereiken voor terugbetaling, afhankelijk van de mutualiteitsregels (te definiëren in 'Mutualiteiten')."
        .WrapText = True
        .Font.Bold = True
    End With
    
    ' Table headers
    With ws.Range("A3:E3")
        .Value = Array("Klant", "Mutualiteit", "Sessies dit jaar (terugbetaalbaar gemarkeerd)", "MaxSessiesPerJaar", "Signaal")
        .Font.Bold = True
    End With
    
    ' Example row with formulas
    ws.Range("A4").Formula = "=Klanten!D2"
    ws.Range("B4").Formula = "=Klanten!H2"
    ws.Range("C4").Formula = "=IFERROR(COUNTIFS(Afspraken!B:B,Klanten!D2,Afspraken!A:A,"">=""&DATE(YEAR(TODAY()),1,1),Afspraken!A:A,""<""&DATE(YEAR(TODAY())+1,1,1),Afspraken!G:G,""Ja*""),0)"
    ws.Range("D4").Formula = "=IFERROR(XLOOKUP(Klanten!H2,Mutualiteiten!A:A,Mutualiteiten!B:B),""-"")"
    ws.Range("E4").Formula = "=IFERROR(IF(AND(ISNUMBER(D4),C4>=D4),""MELDEN: klant informeren over terugbetaling"",""""),"""")"
    
    ' Column widths
    ws.Columns("A").ColumnWidth = 24
    ws.Columns("B").ColumnWidth = 16
    ws.Columns("C").ColumnWidth = 36
    ws.Columns("D").ColumnWidth = 22
    ws.Columns("E").ColumnWidth = 28
End Sub

Sub CreateVBAComponents(wb As Workbook)
    ' This would create the VBA modules and forms
    ' Note: This is a simplified version - the actual implementation would require
    ' more complex VBA code to create modules and forms programmatically
    MsgBox "VBA components need to be created manually. See the provided VBA code files.", vbInformation
End Sub
