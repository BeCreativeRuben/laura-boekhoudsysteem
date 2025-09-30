# PowerShell script to create Laura Boekhoudsysteem Excel workbook
# This script uses COM automation to create the Excel workbook programmatically

param(
    [string]$OutputPath = "Laura_Boekhoudsysteem.xlsm"
)

# Create Excel application
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    # Create new workbook
    $workbook = $excel.Workbooks.Add()
    
    # Delete default sheets
    while ($workbook.Worksheets.Count -gt 1) {
        $workbook.Worksheets[1].Delete()
    }
    
    # Rename the remaining sheet to "Consulttypes"
    $workbook.Worksheets[1].Name = "Consulttypes"
    
    # Create Consulttypes sheet
    $ws = $workbook.Worksheets["Consulttypes"]
    $ws.Range("A1:B1").Value2 = @("Type", "Prijs")
    $ws.Range("A1:B1").Font.Bold = $true
    
    $consultData = @(
        @("Intake gesprek", 60),
        @("Lange opvolg (consultatie)", 35),
        @("Korte opvolg (consultatie)", 30),
        @("Nabespreking", 25),
        @("Groepssessie (workshop)", "")
    )
    
    for ($i = 0; $i -lt $consultData.Length; $i++) {
        $ws.Cells($i + 2, 1).Value2 = $consultData[$i][0]
        if ($consultData[$i][1] -ne "") {
            $ws.Cells($i + 2, 2).Value2 = $consultData[$i][1]
        }
    }
    
    $ws.Columns("A").ColumnWidth = 28
    $ws.Columns("B").ColumnWidth = 12
    $ws.Range("A2").Select()
    $excel.ActiveWindow.FreezePanes = $true
    
    # Create Mutualiteiten sheet
    $ws = $workbook.Worksheets.Add()
    $ws.Name = "Mutualiteiten"
    $ws.Range("A1:C1").Value2 = @("Naam", "MaxSessiesPerJaar", "Opmerking")
    $ws.Range("A1:C1").Font.Bold = $true
    
    $mutualiteiten = @("CM", "Helan", "Solidaris", "LM", "Partena", "OZ", "De Voorzorg", "IDEWE")
    for ($i = 0; $i -lt $mutualiteiten.Length; $i++) {
        $ws.Cells($i + 2, 1).Value2 = $mutualiteiten[$i]
    }
    
    $ws.Columns("A").ColumnWidth = 18
    $ws.Columns("B").ColumnWidth = 18
    $ws.Columns("C").ColumnWidth = 50
    
    # Create Categorieën sheet
    $ws = $workbook.Worksheets.Add()
    $ws.Name = "Categorieën"
    $ws.Range("A1").Value2 = "Categorie"
    $ws.Range("A1").Font.Bold = $true
    
    $categorieen = @("Huur", "Materiaal", "Verplaatsing", "Software", "Opleiding", "Marketing", "Overig")
    for ($i = 0; $i -lt $categorieen.Length; $i++) {
        $ws.Cells($i + 2, 1).Value2 = $categorieen[$i]
    }
    
    $ws.Columns("A").ColumnWidth = 24
    
    # Create Klanten sheet
    $ws = $workbook.Worksheets.Add()
    $ws.Name = "Klanten"
    $ws.Range("A1:H1").Value2 = @("KlantID", "Voornaam", "Achternaam", "VolledigeNaam", "E-mail", "Telefoon", "Startdatum", "Mutualiteit")
    $ws.Range("A1:H1").Font.Bold = $true
    
    # Sample data
    $ws.Cells(2, 1).Value2 = 1
    $ws.Cells(2, 2).Value2 = "Jan"
    $ws.Cells(2, 3).Value2 = "Peeters"
    $ws.Cells(2, 4).Formula = '=TRIM(B2&" "&C2)'
    $ws.Cells(2, 5).Value2 = "jan@example.com"
    $ws.Cells(2, 6).Value2 = "0470 00 00 00"
    $ws.Cells(2, 7).Value2 = [DateTime]"2025-10-06"
    
    # Data validation for Mutualiteit
    $validation = $ws.Range("H2:H500").Validation
    $validation.Add([Microsoft.Office.Interop.Excel.XlDVType]::xlValidateList, [Microsoft.Office.Interop.Excel.XlDVAlertStyle]::xlValidAlertStop, "=Mutualiteiten!A2:A1000")
    $validation.IgnoreBlank = $true
    
    $ws.Columns("A").ColumnWidth = 10
    $ws.Columns("B").ColumnWidth = 14
    $ws.Columns("C").ColumnWidth = 14
    $ws.Columns("D").ColumnWidth = 24
    $ws.Columns("E").ColumnWidth = 26
    $ws.Columns("F").ColumnWidth = 16
    $ws.Columns("G").ColumnWidth = 14
    $ws.Columns("H").ColumnWidth = 16
    $ws.Range("A2").Select()
    $excel.ActiveWindow.FreezePanes = $true
    
    # Create Afspraken sheet
    $ws = $workbook.Worksheets.Add()
    $ws.Name = "Afspraken"
    $ws.Range("A1:I1").Value2 = @("Datum", "Klant", "Type", "Aantal", "Prijs (automatisch)", "Totaal", "Terugbetaalbaar?", "Opmerking", "Maand")
    $ws.Range("A1:I1").Font.Bold = $true
    
    # Sample data
    $ws.Cells(2, 1).Value2 = [DateTime]"2025-10-07"
    $ws.Cells(2, 2).Formula = "=Klanten!D2"
    $ws.Cells(2, 3).Value2 = "Intake gesprek"
    $ws.Cells(2, 4).Value2 = 1
    $ws.Cells(2, 5).Formula = '=IFERROR(XLOOKUP(C2,Consulttypes!A:A,Consulttypes!B:B),"")'
    $ws.Cells(2, 6).Formula = '=IFERROR(E2*D2,"")'
    $ws.Cells(2, 7).Value2 = "Nee"
    $ws.Cells(2, 9).Formula = "=DATE(YEAR(A2),MONTH(A2),1)"
    
    # Data validations
    $validation = $ws.Range("B2:B500").Validation
    $validation.Add([Microsoft.Office.Interop.Excel.XlDVType]::xlValidateList, [Microsoft.Office.Interop.Excel.XlDVAlertStyle]::xlValidAlertStop, "=Klanten!`$D`$2:`$D`$500")
    $validation.IgnoreBlank = $true
    
    $validation = $ws.Range("C2:C500").Validation
    $validation.Add([Microsoft.Office.Interop.Excel.XlDVType]::xlValidateList, [Microsoft.Office.Interop.Excel.XlDVAlertStyle]::xlValidAlertStop, "=Consulttypes!`$A`$2:`$A`$1000")
    $validation.IgnoreBlank = $true
    
    $ws.Columns("A").ColumnWidth = 12
    $ws.Columns("B").ColumnWidth = 24
    $ws.Columns("C").ColumnWidth = 28
    $ws.Columns("D").ColumnWidth = 10
    $ws.Columns("E").ColumnWidth = 18
    $ws.Columns("F").ColumnWidth = 12
    $ws.Columns("G").ColumnWidth = 16
    $ws.Columns("H").ColumnWidth = 30
    $ws.Columns("I").ColumnWidth = 12
    $ws.Range("A2").Select()
    $excel.ActiveWindow.FreezePanes = $true
    
    # Create Uitgaven sheet
    $ws = $workbook.Worksheets.Add()
    $ws.Name = "Uitgaven"
    $ws.Range("A1:F1").Value2 = @("Datum", "Beschrijving", "Categorie", "Bedrag", "Betaalmethode", "Maand")
    $ws.Range("A1:F1").Font.Bold = $true
    
    # Sample data
    $ws.Cells(2, 1).Value2 = [DateTime]"2025-10-08"
    $ws.Cells(2, 2).Value2 = "Softwarelicentie"
    $ws.Cells(2, 3).Value2 = "Software"
    $ws.Cells(2, 4).Value2 = 19.99
    $ws.Cells(2, 5).Value2 = "Kaart"
    $ws.Cells(2, 6).Formula = "=DATE(YEAR(A2),MONTH(A2),1)"
    
    # Data validation for Categorie
    $validation = $ws.Range("C2:C500").Validation
    $validation.Add([Microsoft.Office.Interop.Excel.XlDVType]::xlValidateList, [Microsoft.Office.Interop.Excel.XlDVAlertStyle]::xlValidAlertStop, "=Categorieën!`$A`$2:`$A`$1000")
    $validation.IgnoreBlank = $true
    
    $ws.Columns("A").ColumnWidth = 12
    $ws.Columns("B").ColumnWidth = 30
    $ws.Columns("C").ColumnWidth = 16
    $ws.Columns("D").ColumnWidth = 12
    $ws.Columns("E").ColumnWidth = 16
    $ws.Columns("F").ColumnWidth = 12
    $ws.Range("A2").Select()
    $excel.ActiveWindow.FreezePanes = $true
    
    # Create Overzicht sheet
    $ws = $workbook.Worksheets.Add()
    $ws.Name = "Overzicht"
    $ws.Range("A1").Value2 = "Overzicht"
    $ws.Range("A1").Font.Bold = $true
    $ws.Range("A1").Font.Size = 14
    
    # KPIs
    $ws.Range("A3").Value2 = "Inkomsten (deze maand)"
    $ws.Cells(3, 2).Formula = '=IFERROR(SUMIFS(Afspraken!F:F,Afspraken!I:I,DATE(YEAR(TODAY()),MONTH(TODAY()),1)),0)'
    $ws.Range("A4").Value2 = "Uitgaven (deze maand)"
    $ws.Cells(4, 2).Formula = '=IFERROR(SUMIFS(Uitgaven!D:D,Uitgaven!F:F,DATE(YEAR(TODAY()),MONTH(TODAY()),1)),0)'
    $ws.Range("A5").Value2 = "Netto (deze maand)"
    $ws.Cells(5, 2).Formula = "=B3-B4"
    
    # Table headers
    $ws.Range("A7:D7").Value2 = @("Maand", "Inkomsten", "Uitgaven", "Netto")
    $ws.Range("A7:D7").Font.Bold = $true
    
    # Monthly data
    for ($month = 1; $month -le 12; $month++) {
        $row = 7 + $month
        $ws.Cells($row, 1).Value2 = [DateTime]"2025-$month-01"
        $ws.Cells($row, 2).Formula = "=IFERROR(SUMIFS(Afspraken!F:F,Afspraken!I:I,DATE(YEAR(A$row),MONTH(A$row),1)),0)"
        $ws.Cells($row, 3).Formula = "=IFERROR(SUMIFS(Uitgaven!D:D,Uitgaven!F:F,DATE(YEAR(A$row),MONTH(A$row),1)),0)"
        $ws.Cells($row, 4).Formula = "=B$row-C$row"
    }
    
    $ws.Columns("A").ColumnWidth = 14
    $ws.Columns("B").ColumnWidth = 18
    $ws.Columns("C").ColumnWidth = 18
    $ws.Columns("D").ColumnWidth = 18
    
    # Create Terugbetaling-signalen sheet
    $ws = $workbook.Worksheets.Add()
    $ws.Name = "Terugbetaling-signalen"
    
    # Merged header
    $ws.Range("A1:H1").Merge()
    $ws.Range("A1").Value2 = "Dit blad markeert welke klanten in het lopende jaar een drempel bereiken voor terugbetaling, afhankelijk van de mutualiteitsregels (te definiëren in 'Mutualiteiten')."
    $ws.Range("A1").Font.Bold = $true
    $ws.Range("A1").WrapText = $true
    
    # Table headers
    $ws.Range("A3:E3").Value2 = @("Klant", "Mutualiteit", "Sessies dit jaar (terugbetaalbaar gemarkeerd)", "MaxSessiesPerJaar", "Signaal")
    $ws.Range("A3:E3").Font.Bold = $true
    
    # Example formulas
    $ws.Cells(4, 1).Formula = "=Klanten!D2"
    $ws.Cells(4, 2).Formula = "=Klanten!H2"
    $ws.Cells(4, 3).Formula = '=IFERROR(COUNTIFS(Afspraken!B:B,Klanten!D2,Afspraken!A:A,">="&DATE(YEAR(TODAY()),1,1),Afspraken!A:A,"<"&DATE(YEAR(TODAY())+1,1,1),Afspraken!G:G,"Ja*"),0)'
    $ws.Cells(4, 4).Formula = '=IFERROR(XLOOKUP(Klanten!H2,Mutualiteiten!A:A,Mutualiteiten!B:B),"-")'
    $ws.Cells(4, 5).Formula = '=IFERROR(IF(AND(ISNUMBER(D4),C4>=D4),"MELDEN: klant informeren over terugbetaling",""),"")'
    
    $ws.Columns("A").ColumnWidth = 24
    $ws.Columns("B").ColumnWidth = 16
    $ws.Columns("C").ColumnWidth = 36
    $ws.Columns("D").ColumnWidth = 22
    $ws.Columns("E").ColumnWidth = 28
    
    # Save the workbook
    $workbook.SaveAs($OutputPath, 52) # 52 = xlOpenXMLWorkbookMacroEnabled
    
    Write-Host "Workbook created successfully: $OutputPath"
    Write-Host "Note: VBA modules and UserForms need to be added manually using the provided VBA code files."
    
} catch {
    Write-Error "Error creating workbook: $($_.Exception.Message)"
} finally {
    # Clean up
    $workbook.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
