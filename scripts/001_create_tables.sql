-- Create slots table
CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  day TEXT NOT NULL,
  hour TEXT NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  student TEXT NOT NULL,
  subject TEXT,
  slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_slots_is_booked ON slots(is_booked);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON bookings(slot_id);
