import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET student by unique link
export async function GET(request: Request, { params }: { params: { link: string } }) {
  try {
    const supabase = await createClient()

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("unique_link", params.link)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: "Nie znaleziono ucznia" }, { status: 404 })
    }

    // Get student's bookings with slot details
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        slot_id,
        created_at,
        slots (
          id,
          day,
          hour
        )
      `)
      .eq("student_id", student.id)

    if (bookingsError) {
      console.error("[v0] Error fetching bookings:", bookingsError)
      return NextResponse.json({ error: "Nie udało się pobrać rezerwacji" }, { status: 500 })
    }

    return NextResponse.json({
      ...student,
      bookings: bookings || [],
    })
  } catch (error) {
    console.error("[v0] Error in GET /api/students/link/[link]:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
