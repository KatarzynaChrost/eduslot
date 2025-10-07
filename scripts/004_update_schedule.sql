-- Usuń wszystkie istniejące sloty i rezerwacje
DELETE FROM bookings;
DELETE FROM slots;

-- Resetuj sekwencję ID
ALTER SEQUENCE slots_id_seq RESTART WITH 1;
ALTER SEQUENCE bookings_id_seq RESTART WITH 1;

-- Dodaj nowe sloty: Poniedziałek-Piątek 16:00-20:00
INSERT INTO slots (day, hour, is_booked) VALUES
-- Poniedziałek
('Poniedziałek', '16:00', false),
('Poniedziałek', '17:00', false),
('Poniedziałek', '18:00', false),
('Poniedziałek', '19:00', false),
('Poniedziałek', '20:00', false),

-- Wtorek
('Wtorek', '16:00', false),
('Wtorek', '17:00', false),
('Wtorek', '18:00', false),
('Wtorek', '19:00', false),
('Wtorek', '20:00', false),

-- Środa
('Środa', '16:00', false),
('Środa', '17:00', false),
('Środa', '18:00', false),
('Środa', '19:00', false),
('Środa', '20:00', false),

-- Czwartek
('Czwartek', '16:00', false),
('Czwartek', '17:00', false),
('Czwartek', '18:00', false),
('Czwartek', '19:00', false),
('Czwartek', '20:00', false),

-- Piątek
('Piątek', '16:00', false),
('Piątek', '17:00', false),
('Piątek', '18:00', false),
('Piątek', '19:00', false),
('Piątek', '20:00', false),

-- Sobota 8:00-15:00 z przerwą 15min po 12:00
('Sobota', '08:00', false),
('Sobota', '09:00', false),
('Sobota', '10:00', false),
('Sobota', '11:00', false),
('Sobota', '12:15', false),
('Sobota', '13:15', false),
('Sobota', '14:15', false);
