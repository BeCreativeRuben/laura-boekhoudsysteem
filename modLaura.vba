Option Explicit

' ---- Helpers ----
Public Function NextEmptyRow(ws As Worksheet, Optional col As Long = 1) As Long
    With ws
        If Application.WorksheetFunction.CountA(.Cells) = 0 Then
            NextEmptyRow = 2
        Else
            NextEmptyRow = .Cells(.Rows.Count, col).End(xlUp).Row + 1
            If NextEmptyRow < 2 Then NextEmptyRow = 2
        End If
    End With
End Function

Public Function NewKlantID(wsKl As Worksheet) As Long
    Dim lastID As Variant
    lastID = Application.Max(wsKl.Range("A:A"))
    If IsError(lastID) Or lastID = 0 Then
        NewKlantID = 1
    Else
        NewKlantID = CLng(lastID) + 1
    End If
End Function

' ---- Openers (wire to buttons) ----
Public Sub NieuweKlant()
    On Error GoTo EH
    frmNewClient.Show
    Exit Sub
EH:
    MsgBox "Kon formulier 'Nieuwe klant' niet openen: " & Err.Number & " - " & Err.Description, vbExclamation
End Sub

Public Sub NieuweAfspraak()
    On Error GoTo EH
    frmNewAppointment.Show
    Exit Sub
EH:
    MsgBox "Kon formulier 'Nieuwe afspraak' niet openen: " & Err.Number & " - " & Err.Description, vbExclamation
End Sub
