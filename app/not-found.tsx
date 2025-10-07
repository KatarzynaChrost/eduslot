import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-coral-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-coral-100 p-3">
              <AlertCircle className="h-12 w-12 text-coral-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Strona nie została znaleziona</h2>

          <p className="text-gray-600 mb-6">
            Przepraszamy, ale strona, której szukasz, nie istnieje lub została przeniesiona.
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/admin">Przejdź do panelu admina</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/login">Strona logowania</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
