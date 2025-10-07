import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET student by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", params.id)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: "Nie znaleziono ucznia" }, { status: 404 })
    }

    // Get student's bookings
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
      .eq("student_id", params.id)

    if (bookingsError) {
      console.error("[v0] Error fetching bookings:", bookingsError)
      return NextResponse.json({ error: "Nie udało się pobrać rezerwacji" }, { status: 500 })
    }

    return NextResponse.json({
      ...student,
      bookings: bookings || [],
    })
  } catch (error) {
    console.error("[v0] Error in GET /api/students/[id]:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

// PATCH update student
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { first_name, last_name, max_slots } = body

    const supabase = await createClient()

    const updateData: any = {}
    if (first_name) updateData.first_name = first_name
    if (last_name) updateData.last_name = last_name
    if (max_slots !== undefined) updateData.max_slots = max_slots

    const { data, error } = await supabase.from("students").update(updateData).eq("id", params.id).select().single()

    if (error) {
      console.error("[v0] Error updating student:", error)
      return NextResponse.json({ error: "Nie udało się zaktualizować ucznia" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in PATCH /api/students/[id]:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

// DELETE student
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Delete student (bookings will be deleted automatically due to CASCADE)
    const { error } = await supabase.from("students").delete().eq("id", params.id)

    if (error) {
      console.error("[v0] Error deleting student:", error)
      return NextResponse.json({ error: "Nie udało się usunąć ucznia" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/students/[id]:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
