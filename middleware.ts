import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")

    if (!session) {
      // Redirect to login page
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
