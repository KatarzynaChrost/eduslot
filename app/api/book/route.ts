import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const bookingSchema = z.object({
  student_id: z.number(),
  slot_ids: z.array(z.number()).min(1, "Wybierz co najmniej jeden termin"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)
    const supabase = await createClient()

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", validatedData.student_id)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: "Nie znaleziono ucznia" }, { status: 404 })
    }

    const { data: existingBookings, error: existingError } = await supabase
      .from("bookings")
      .select("id, slot_id")
      .eq("student_id", validatedData.student_id)

    if (existingError) {
      console.error("[v0] Error fetching existing bookings:", existingError)
      return NextResponse.json({ error: "Błąd podczas sprawdzania rezerwacji" }, { status: 500 })
    }

    if (validatedData.slot_ids.length > student.max_slots) {
      return NextResponse.json(
        {
          error: `Możesz zarezerwować maksymalnie ${student.max_slots} terminów.`,
        },
        { status: 400 },
      )
    }

    const { data: slots, error: slotsError } = await supabase.from("slots").select("*").in("id", validatedData.slot_ids)

    if (slotsError || !slots || slots.length !== validatedData.slot_ids.length) {
      return NextResponse.json({ error: "Niektóre terminy nie istnieją" }, { status: 404 })
    }

    const existingSlotIds = existingBookings?.map((b) => b.slot_id) || []
    const bookedByOthers = slots.filter((slot) => slot.is_booked && !existingSlotIds.includes(slot.id))

    if (bookedByOthers.length > 0) {
      return NextResponse.json({ error: "Niektóre terminy są już zajęte przez innych uczniów" }, { status: 400 })
    }

    if (existingBookings && existingBookings.length > 0) {
      const oldSlotIds = existingBookings.map((b) => b.slot_id)

      await supabase.from("bookings").delete().eq("student_id", validatedData.student_id)
      await supabase.from("slots").update({ is_booked: false }).in("id", oldSlotIds)
    }

    const bookingsToInsert = validatedData.slot_ids.map((slot_id) => ({
      student_id: validatedData.student_id,
      slot_id,
    }))

    const { data: bookings, error: bookingError } = await supabase.from("bookings").insert(bookingsToInsert).select()

    if (bookingError) {
      console.error("[v0] Error creating bookings:", bookingError)
      throw bookingError
    }

    const { error: updateError } = await supabase
      .from("slots")
      .update({ is_booked: true })
      .in("id", validatedData.slot_ids)

    if (updateError) {
      console.error("[v0] Error updating slots:", updateError)
      throw updateError
    }

    return NextResponse.json({ success: true, bookings })
  } catch (error) {
    console.error("[v0] Error creating booking:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Błąd podczas rezerwacji" }, { status: 500 })
  }
}
