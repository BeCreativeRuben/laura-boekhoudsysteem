Option Explicit

Private Sub UserForm_Initialize()
    Dim wsK As Worksheet, wsT As Worksheet
    Dim lastRow As Long, i As Long

    ' Defaults
    Me.txtDatum.Value = Format(Date, "dd/mm/yyyy")
    Me.txtAantal.Value = "1"
    Me.cboterug.Clear
    Me.cboterug.List = Array("Ja", "Nee")

    Set wsK = ThisWorkbook.Worksheets("Klanten")
    Set wsT = ThisWorkbook.Worksheets("Consulttypes")
    If wsK Is Nothing Or wsT Is Nothing Then
        MsgBox "Blad 'Klanten' of 'Consulttypes' ontbreekt.", vbExclamation
        Exit Sub
    End If

    ' Klanten (VolledigeNaam = kolom D)
    Me.cboKlant.Clear
    lastRow = wsK.Cells(wsK.Rows.Count, 4).End(xlUp).Row
    For i = 2 To lastRow
        If Len(Trim$(wsK.Cells(i, 4).Value)) > 0 Then
            Me.cboKlant.AddItem CStr(wsK.Cells(i, 4).Value)
        End If
    Next i

    ' Consulttypes (kolom A)
    Me.cboType.Clear
    lastRow = wsT.Cells(wsT.Rows.Count, 1).End(xlUp).Row
    For i = 2 To lastRow
        If Len(Trim$(wsT.Cells(i, 1).Value)) > 0 Then
            Me.cboType.AddItem CStr(wsT.Cells(i, 1).Value)
        End If
    Next i
End Sub

Private Sub btnCancel_Click()
    Unload Me
End Sub

Private Sub btnSave_Click()
    Dim d As Date, klant As String, typ As String, tb As String, opm As String
    Dim aant As Double
    Dim ws As Worksheet, r As Long

    If Trim(Me.txtDatum.Value) = "" Then
        d = Date
    ElseIf IsDate(Me.txtDatum.Value) Then
        d = CDate(Me.txtDatum.Value)
    Else
        MsgBox "Datum is ongeldig. Gebruik dd/mm/jjjj.", vbExclamation
        Exit Sub
    End If

    klant = Trim(Me.cboKlant.Value)
    typ   = Trim(Me.cboType.Value)
    tb    = Trim(Me.cboterug.Value)
    opm   = Trim(Me.txtOpmerking.Value)

    If klant = "" Or typ = "" Then
        MsgBox "Kies een klant en een type consult.", vbExclamation
        Exit Sub
    End If

    If Trim(Me.txtAantal.Value) = "" Then
        aant = 1
    ElseIf IsNumeric(Me.txtAantal.Value) Then
        aant = CDbl(Me.txtAantal.Value)
        If aant <= 0 Then aant = 1
    Else
        aant = 1
    End If

    Set ws = ThisWorkbook.Worksheets("Afspraken")
    r = NextEmptyRow(ws, 1)

    ' A=Datum, B=Klant, C=Type, D=Aantal, E=Prijs, F=Totaal, G=Terugbetaalbaar?, H=Opmerking, I=Maand
    ws.Cells(r, 1).Value = d
    ws.Cells(r, 2).Value = klant
    ws.Cells(r, 3).Value = typ
    ws.Cells(r, 4).Value = aant

    ws.Cells(r, 5).Formula = "=IFERROR(XLOOKUP(C" & r & ",Consulttypes!A:A,Consulttypes!B:B),"""")"
    ws.Cells(r, 6).Formula = "=IFERROR(E" & r & "*D" & r & ","""")"
    ws.Cells(r, 7).Value = tb
    ws.Cells(r, 8).Value = opm
    ws.Cells(r, 9).Formula = "=DATE(YEAR(A" & r & "),MONTH(A" & r & "),1)"

    MsgBox "Afspraak toegevoegd voor " & klant & " (" & Format(d, "dd/mm/yyyy") & ")", vbInformation
    Unload Me
End Sub
