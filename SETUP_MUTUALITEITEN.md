# Setup Mutualiteiten met Terugbetalingsregels

## Stappen om mutualiteiten in te stellen

### 1. Database Migration uitvoeren

Ga naar Supabase SQL Editor en voer deze migrations uit (in volgorde):

#### A. Voeg solidaris_uitzondering veld toe
Run: `supabase/migrations/20240215000003_add_solidaris_uitzondering.sql`

#### B. Voeg mutualiteiten toe
Run: `supabase/migrations/20240215000004_insert_mutualiteiten.sql`

### 2. Mutualiteiten die worden toegevoegd:

1. **Christelijke Mutualiteit (CM)**
   - Max sessies: 4
   - Regel: Melding vanaf 4e sessie → "Tegemoetkoming van 40 EUR"

2. **Liberale Mutualiteit (LM)**
   - Max sessies: 6
   - Regel: Melding bij eerste 6x → "Tegemoetkoming van 5 EUR per consultatie. Nog X keer recht op terugbetaling dit jaar."

3. **Solidaris**
   - Max sessies: 4 (normaal) of 8 (met doktersattest)
   - Regel: Melding bij elke sessie → "Tegemoetkoming van 10 EUR per consultatie. Nog X keer recht op terugbetaling dit jaar."
   - **Belangrijk**: Bij klanten met Solidaris kan je een checkbox aanvinken voor "Solidaris uitzondering" (met doktersattest) → dan 8 sessies i.p.v. 4

4. **Helan**
   - Max sessies: 1
   - Regel: Melding bij eerste sessie → "Jaarlijkse terugbetaling van 25 EUR per kalenderjaar"

5. **Vlaams en Neutraal Ziekenfonds (VNZ)**
   - Max sessies: 5
   - Regel: Melding bij eerste 5x → "Tegemoetkoming van 10 EUR per consultatie. Nog X keer recht op terugbetaling dit jaar."

### 3. Functionaliteit

- **Terugbetaling pagina**: Toont alle klanten die recht hebben op terugbetaling met specifieke meldingen per mutualiteit
- **Klanten formulier**: Bij Solidaris klanten verschijnt een checkbox voor "Solidaris uitzondering"
- **Automatische berekening**: Het systeem berekent automatisch hoeveel sessies er nog over zijn

### 4. Testen

Na het uitvoeren van de migrations:
1. Herstart je server
2. Ga naar Instellingen → Mutualiteiten (zouden alle 5 moeten staan)
3. Voeg een klant toe met Solidaris → checkbox zou moeten verschijnen
4. Voeg terugbetaalbare afspraken toe → check de Terugbetaling pagina voor meldingen
