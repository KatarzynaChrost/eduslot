import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        *,
        slot:slots(*)
      `)
      .order("id", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error:", error)
      throw error
    }

    return NextResponse.json(bookings || [])
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return NextResponse.json({ error: "Błąd pobierania rezerwacji" }, { status: 500 })
  }
}
