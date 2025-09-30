Option Explicit

Private Sub UserForm_Initialize()
    Dim wsMu As Worksheet, lastRow As Long, i As Long

    Me.txtStart.Value = Format(Date, "dd/mm/yyyy")
    Me.cboMutualiteit.Clear

    Set wsMu = ThisWorkbook.Worksheets("Mutualiteiten")
    If wsMu Is Nothing Then
        MsgBox "Blad 'Mutualiteiten' ontbreekt.", vbExclamation
        Exit Sub
    End If

    lastRow = wsMu.Cells(wsMu.Rows.Count, 1).End(xlUp).Row
    For i = 2 To lastRow
        If Len(Trim$(wsMu.Cells(i, 1).Value)) > 0 Then
            Me.cboMutualiteit.AddItem CStr(wsMu.Cells(i, 1).Value)
        End If
    Next i
End Sub

Private Sub btnCancel_Click()
    Unload Me
End Sub

Private Sub btnSave_Click()
    Dim voor As String, ach As String, em As String, tel As String, mu As String
    Dim d As Date
    Dim ws As Worksheet, r As Long

    voor = Trim(Me.txtVoornaam.Value)
    ach  = Trim(Me.txtAchternaam.Value)
    em   = Trim(Me.txtEmail.Value)
    tel  = Trim(Me.txtTel.Value)
    mu   = Trim(Me.cboMutualiteit.Value)

    If voor = "" Or ach = "" Then
        MsgBox "Voornaam en achternaam zijn verplicht.", vbExclamation
        Exit Sub
    End If

    If Trim(Me.txtStart.Value) = "" Then
        d = Date
    ElseIf IsDate(Me.txtStart.Value) Then
        d = CDate(Me.txtStart.Value)
    Else
        MsgBox "Startdatum is ongeldig. Gebruik dd/mm/jjjj.", vbExclamation
        Exit Sub
    End If

    Set ws = ThisWorkbook.Worksheets("Klanten")
    r = NextEmptyRow(ws, 1)

    ' A=KlantID, B=Voornaam, C=Achternaam, D=VolledigeNaam, E=E-mail, F=Telefoon, G=Startdatum, H=Mutualiteit
    ws.Cells(r, 1).Value = NewKlantID(ws)
    ws.Cells(r, 2).Value = voor
    ws.Cells(r, 3).Value = ach
    ws.Cells(r, 4).Formula = "=TRIM(B" & r & "&"" ""&C" & r & ")"
    ws.Cells(r, 5).Value = em
    ws.Cells(r, 6).Value = tel
    ws.Cells(r, 7).Value = d
    ws.Cells(r, 8).Value = mu

    MsgBox "Klant toegevoegd: " & ws.Cells(r, 4).Text, vbInformation
    Unload Me
End Sub
