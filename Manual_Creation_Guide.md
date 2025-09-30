# Laura Boekhoudsysteem - Manual Creation Guide

This guide provides step-by-step instructions to manually create the Laura_Boekhoudsysteem.xlsm workbook.

## Step 1: Create the Workbook

1. Open Excel
2. Create a new workbook
3. Save as "Laura_Boekhoudsysteem.xlsm" (macro-enabled format)
4. Delete the default "Sheet1" if it exists

## Step 2: Create All Worksheets

Create the following worksheets in this exact order:
1. Consulttypes
2. Mutualiteiten  
3. Categorieën
4. Klanten
5. Afspraken
6. Uitgaven
7. Overzicht
8. Terugbetaling-signalen

## Step 3: Set Up Consulttypes Sheet

1. Go to Consulttypes sheet
2. In A1: Type (bold)
3. In B1: Prijs (bold)
4. Add data:
   - A2: Intake gesprek, B2: 60
   - A3: Lange opvolg (consultatie), B3: 35
   - A4: Korte opvolg (consultatie), B4: 30
   - A5: Nabespreking, B5: 25
   - A6: Groepssessie (workshop), B6: (empty)
5. Set column widths: A=28, B=12
6. Select A2, go to View > Freeze Panes > Freeze Panes

## Step 4: Set Up Mutualiteiten Sheet

1. Go to Mutualiteiten sheet
2. In A1: Naam (bold)
3. In B1: MaxSessiesPerJaar (bold)
4. In C1: Opmerking (bold)
5. Add mutualiteit names in A2-A9:
   - CM, Helan, Solidaris, LM, Partena, OZ, De Voorzorg, IDEWE
6. Set column widths: A=18, B=18, C=50

## Step 5: Set Up Categorieën Sheet

1. Go to Categorieën sheet
2. In A1: Categorie (bold)
3. Add categories in A2-A8:
   - Huur, Materiaal, Verplaatsing, Software, Opleiding, Marketing, Overig
4. Set column width: A=24

## Step 6: Set Up Klanten Sheet

1. Go to Klanten sheet
2. Add headers in row 1 (bold):
   - A1: KlantID, B1: Voornaam, C1: Achternaam, D1: VolledigeNaam
   - E1: E-mail, F1: Telefoon, G1: Startdatum, H1: Mutualiteit
3. Add sample data in row 2:
   - A2: 1, B2: Jan, C2: Peeters, D2: =TRIM(B2&" "&C2)
   - E2: jan@example.com, F2: 0470 00 00 00, G2: 06/10/2025, H2: (empty)
4. Set up data validation for H2:H500:
   - Select H2:H500
   - Data > Data Validation > List
   - Source: =Mutualiteiten!A2:A1000
   - Check "Ignore blank"
5. Set column widths: A=10, B=14, C=14, D=24, E=26, F=16, G=14, H=16
6. Select A2, go to View > Freeze Panes > Freeze Panes

## Step 7: Set Up Afspraken Sheet

1. Go to Afspraken sheet
2. Add headers in row 1 (bold):
   - A1: Datum, B1: Klant, C1: Type, D1: Aantal, E1: Prijs (automatisch)
   - F1: Totaal, G1: Terugbetaalbaar?, H1: Opmerking, I1: Maand
3. Add sample data in row 2:
   - A2: 07/10/2025, B2: =Klanten!D2, C2: Intake gesprek, D2: 1
   - E2: =IFERROR(XLOOKUP(C2,Consulttypes!A:A,Consulttypes!B:B),"")
   - F2: =IFERROR(E2*D2,""), G2: Nee, H2: (empty)
   - I2: =DATE(YEAR(A2),MONTH(A2),1)
4. Set up data validations:
   - B2:B500: List, Source: =Klanten!$D$2:$D$500
   - C2:C500: List, Source: =Consulttypes!$A$2:$A$1000
5. Set column widths: A=12, B=24, C=28, D=10, E=18, F=12, G=16, H=30, I=12
6. Select A2, go to View > Freeze Panes > Freeze Panes

## Step 8: Set Up Uitgaven Sheet

1. Go to Uitgaven sheet
2. Add headers in row 1 (bold):
   - A1: Datum, B1: Beschrijving, C1: Categorie, D1: Bedrag
   - E1: Betaalmethode, F1: Maand
3. Add sample data in row 2:
   - A2: 08/10/2025, B2: Softwarelicentie, C2: Software, D2: 19.99
   - E2: Kaart, F2: =DATE(YEAR(A2),MONTH(A2),1)
4. Set up data validation for C2:C500:
   - List, Source: =Categorieën!$A$2:$A$1000
5. Set column widths: A=12, B=30, C=16, D=12, E=16, F=12
6. Select A2, go to View > Freeze Panes > Freeze Panes

## Step 9: Set Up Overzicht Sheet

1. Go to Overzicht sheet
2. In A1: Overzicht (bold, size 14)
3. Add KPIs:
   - A3: Inkomsten (deze maand)
   - B3: =IFERROR(SUMIFS(Afspraken!F:F,Afspraken!I:I,DATE(YEAR(TODAY()),MONTH(TODAY()),1)),0)
   - A4: Uitgaven (deze maand)
   - B4: =IFERROR(SUMIFS(Uitgaven!D:D,Uitgaven!F:F,DATE(YEAR(TODAY()),MONTH(TODAY()),1)),0)
   - A5: Netto (deze maand)
   - B5: =B3-B4
4. Add table headers in row 7 (bold):
   - A7: Maand, B7: Inkomsten, C7: Uitgaven, D7: Netto
5. Add monthly data (rows 8-19):
   - A8: =DATE(YEAR(TODAY()),1,1)
   - B8: =IFERROR(SUMIFS(Afspraken!F:F,Afspraken!I:I,DATE(YEAR(A8),MONTH(A8),1)),0)
   - C8: =IFERROR(SUMIFS(Uitgaven!D:D,Uitgaven!F:F,DATE(YEAR(A8),MONTH(A8),1)),0)
   - D8: =B8-C8
   - Copy formulas down to row 19, changing the month in column A
6. Set column widths: A=14, B=18, C=18, D=18

## Step 10: Set Up Terugbetaling-signalen Sheet

1. Go to Terugbetaling-signalen sheet
2. Merge A1:H1 and add text (bold, wrapped):
   "Dit blad markeert welke klanten in het lopende jaar een drempel bereiken voor terugbetaling, afhankelijk van de mutualiteitsregels (te definiëren in 'Mutualiteiten')."
3. Add headers in row 3 (bold):
   - A3: Klant, B3: Mutualiteit, C3: Sessies dit jaar (terugbetaalbaar gemarkeerd)
   - D3: MaxSessiesPerJaar, E3: Signaal
4. Add example formulas in row 4:
   - A4: =Klanten!D2
   - B4: =Klanten!H2
   - C4: =IFERROR(COUNTIFS(Afspraken!B:B,Klanten!D2,Afspraken!A:A,">="&DATE(YEAR(TODAY()),1,1),Afspraken!A:A,"<"&DATE(YEAR(TODAY())+1,1,1),Afspraken!G:G,"Ja*"),0)
   - D4: =IFERROR(XLOOKUP(Klanten!H2,Mutualiteiten!A:A,Mutualiteiten!B:B),"-")
   - E4: =IFERROR(IF(AND(ISNUMBER(D4),C4>=D4),"MELDEN: klant informeren over terugbetaling",""),"")
5. Set column widths: A=24, B=16, C=36, D=22, E=28

## Step 11: Add VBA Code

1. Press Alt+F11 to open VBA Editor
2. Insert > Module, name it "modLaura"
3. Copy the code from modLaura.vba file
4. Insert > UserForm, name it "frmNewClient"
5. Add controls to frmNewClient:
   - TextBox: txtVoornaam
   - TextBox: txtAchternaam  
   - TextBox: txtEmail
   - TextBox: txtTel
   - TextBox: txtStart
   - ComboBox: cboMutualiteit
   - CommandButton: btnSave (Caption: Opslaan)
   - CommandButton: btnCancel (Caption: Annuleren)
6. Copy the code from frmNewClient.vba file
7. Insert > UserForm, name it "frmNewAppointment"
8. Add controls to frmNewAppointment:
   - TextBox: txtDatum
   - ComboBox: cboKlant
   - ComboBox: cboType
   - TextBox: txtAantal
   - ComboBox: cboterug
   - TextBox: txtOpmerking (MultiLine = True)
   - CommandButton: btnSave (Caption: Opslaan)
   - CommandButton: btnCancel (Caption: Annuleren)
9. Copy the code from frmNewAppointment.vba file

## Step 12: Add Macro Buttons

1. Go to Overzicht sheet
2. Developer > Insert > Form Controls > Button
3. Draw button, assign macro "NieuweKlant", text: "Nieuwe klant"
4. Draw another button, assign macro "NieuweAfspraak", text: "Nieuwe afspraak"

## Step 13: Final Testing

1. Test adding a new client via the button
2. Test adding a new appointment via the button
3. Verify formulas update correctly
4. Check that data validation works
5. Save the workbook as .xlsm

## Notes

- All formulas use English function names (IFERROR, XLOOKUP, DATE, etc.)
- Use commas as separators in formulas
- Ensure no RowSource or ControlSource properties are set on ComboBoxes
- The VBA code populates ComboBox lists programmatically
