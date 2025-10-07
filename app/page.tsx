"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/login")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Przekierowywanie...</p>
        </CardContent>
      </Card>
    </div>
  )
}
