"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 mx-auto">
      <div className="flex flex-col items-center text-center space-y-8 max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-6 bg-muted rounded-full">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
          <p className="text-muted-foreground text-lg">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>

      <div className="mt-16 border-t pt-8 text-center w-full max-w-md">
        <p className="text-sm text-muted-foreground">If you believe this is an error, please contact support.</p>
      </div>
    </div>
  )
}

