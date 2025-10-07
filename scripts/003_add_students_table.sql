-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  max_slots INTEGER NOT NULL DEFAULT 1,
  unique_link TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update bookings table to use student_id instead of student name
ALTER TABLE bookings DROP COLUMN IF EXISTS student;
ALTER TABLE bookings DROP COLUMN IF EXISTS subject;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_students_unique_link ON students(unique_link);
