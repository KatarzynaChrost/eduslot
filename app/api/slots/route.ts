import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] Fetching available slots...")
    const supabase = await createClient()

    const { data: slots, error } = await supabase
      .from("slots")
      .select("*")
      .eq("is_booked", false)
      .order("day", { ascending: true })
      .order("hour", { ascending: true })

    if (error) {
      console.error("[v0] Supabase error:", error)
      throw error
    }

    console.log("[v0] Found slots:", slots?.length || 0)
    return NextResponse.json(slots || [])
  } catch (error) {
    console.error("[v0] Error fetching slots:", error)
    return NextResponse.json(
      { error: "Błąd pobierania terminów. Upewnij się, że baza danych została utworzona." },
      { status: 500 },
    )
  }
}
