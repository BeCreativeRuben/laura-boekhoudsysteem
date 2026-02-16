    -- Insert mutualiteiten with their specific reimbursement rules
    -- Run this AFTER removing tenant isolation

    -- Delete any existing mutualiteiten first (if needed)
    -- DELETE FROM mutualiteiten;

    -- Insert mutualiteiten with their rules
    INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
    ('Christelijke Mutualiteit (CM)', 4, 'Tegemoetkoming van 40 EUR vanaf 4 sessies per jaar')
    ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 4, opmerking = 'Tegemoetkoming van 40 EUR vanaf 4 sessies per jaar';

    INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
    ('Liberale Mutualiteit (LM)', 6, 'Tegemoetkoming van 5 EUR per consultatie, max 6 keer per jaar')
    ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 6, opmerking = 'Tegemoetkoming van 5 EUR per consultatie, max 6 keer per jaar';

    INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
    ('Solidaris', 4, 'Tegemoetkoming van 10 EUR per consultatie, max 4 keer per jaar. Met doktersattest: 8 keer per jaar (aangeven bij klant)')
    ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 4, opmerking = 'Tegemoetkoming van 10 EUR per consultatie, max 4 keer per jaar. Met doktersattest: 8 keer per jaar (aangeven bij klant)';

    INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
    ('Helan', 1, 'Jaarlijkse terugbetaling van 25 EUR per kalenderjaar')
    ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 1, opmerking = 'Jaarlijkse terugbetaling van 25 EUR per kalenderjaar';

    INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
    ('Vlaams en Neutraal Ziekenfonds (VNZ)', 5, 'Tegemoetkoming van 10 EUR per consultatie, max 5 keer per jaar (max 50 EUR per jaar)')
    ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 5, opmerking = 'Tegemoetkoming van 10 EUR per consultatie, max 5 keer per jaar (max 50 EUR per jaar)';
