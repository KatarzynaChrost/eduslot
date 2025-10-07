import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Function to generate unique student link
function generateStudentLink(firstName: string, lastName: string): string {
  const firstLetter = firstName.charAt(0).toLowerCase()
  const lastNameLower = lastName.toLowerCase().replace(/\s+/g, "")
  const hash = Math.random().toString(36).substring(2, 6)
  return `${firstLetter}${lastNameLower}-${hash}`
}

// GET all students
export async function GET() {
  try {
    const supabase = await createClient()

    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false })

    if (studentsError) {
      console.error("[v0] Error fetching students:", studentsError)
      return NextResponse.json({ error: "Nie udało się pobrać uczniów" }, { status: 500 })
    }

    // Get bookings count for each student
    const studentsWithBookings = await Promise.all(
      students.map(async (student) => {
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            id,
            slot_id,
            slots (
              day,
              hour
            )
          `)
          .eq("student_id", student.id)

        if (bookingsError) {
          console.error("[v0] Error fetching bookings for student:", bookingsError)
          return { ...student, bookings: [] }
        }

        return {
          ...student,
          bookings: bookings || [],
          bookings_count: bookings?.length || 0,
        }
      }),
    )

    return NextResponse.json(studentsWithBookings)
  } catch (error) {
    console.error("[v0] Error in GET /api/students:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

// POST create new student
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { first_name, last_name, max_slots } = body

    if (!first_name || !last_name) {
      return NextResponse.json({ error: "Imię i nazwisko są wymagane" }, { status: 400 })
    }

    if (!max_slots || max_slots < 1) {
      return NextResponse.json({ error: "Maksymalna liczba slotów musi być większa niż 0" }, { status: 400 })
    }

    const supabase = await createClient()

    const unique_link = generateStudentLink(first_name, last_name)

    const { data, error } = await supabase
      .from("students")
      .insert({
        first_name,
        last_name,
        max_slots,
        unique_link,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating student:", error)
      return NextResponse.json({ error: "Nie udało się utworzyć ucznia" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in POST /api/students:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
