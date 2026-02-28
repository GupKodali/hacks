import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>It works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Next.js + Tailwind + shadcn/ui are set up.
          </p>
          <Button>Button</Button>
        </CardContent>
      </Card>
    </main>
  )
}