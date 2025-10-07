import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const bookingId = Number.parseInt(id)
    const supabase = await createClient()

    // Get booking to find slot_id
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Rezerwacja nie istnieje" }, { status: 404 })
    }

    // Delete booking
    const { error: deleteError } = await supabase.from("bookings").delete().eq("id", bookingId)

    if (deleteError) {
      console.error("[v0] Error deleting booking:", deleteError)
      throw deleteError
    }

    // Update slot to mark as available
    const { error: updateError } = await supabase.from("slots").update({ is_booked: false }).eq("id", booking.slot_id)

    if (updateError) {
      console.error("[v0] Error updating slot:", updateError)
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting booking:", error)
    return NextResponse.json({ error: "Błąd podczas usuwania rezerwacji" }, { status: 500 })
  }
}
