import { type NextRequest, NextResponse } from "next/server"
import { verifyCredentials, createSession } from "@/lib/auth"
import { z } from "zod"

const loginSchema = z.object({
  username: z.string().min(1, "Nazwa użytkownika jest wymagana"),
  password: z.string().min(1, "Hasło jest wymagane"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = loginSchema.parse(body)

    const isValid = await verifyCredentials(username, password)

    if (!isValid) {
      return NextResponse.json({ error: "Nieprawidłowa nazwa użytkownika lub hasło" }, { status: 401 })
    }

    await createSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
