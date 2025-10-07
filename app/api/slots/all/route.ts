import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: slots, error } = await supabase
      .from("slots")
      .select(`
        *,
        bookings (
          id,
          student:students (
            first_name,
            last_name
          )
        )
      `)
      .order("day", { ascending: true })
      .order("hour", { ascending: true })

    if (error) {
      console.error("[v0] Supabase error:", error)
      throw error
    }

    return NextResponse.json(slots || [])
  } catch (error) {
    console.error("[v0] Error fetching all slots:", error)
    return NextResponse.json({ error: "Błąd pobierania terminów" }, { status: 500 })
  }
}
