// app/login/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <main className="min-h-[100svh] bg-background">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-4 py-10">
        {/* Top */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground/70" />
            Weekly events • Sunday release • Monday confirm
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Log in to get matched
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set your availability on Sundays, pick up to 3 hobbies, and we’ll schedule real events
            with people in your city.
          </p>
        </header>

        {/* Card */}
        <Card className="shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Continue</CardTitle>
            <CardDescription>
              Use your account to join and confirm events.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Auth0: use <a> (recommended) rather than next/link */}
            <a href="/auth/login" className="block">
              <Button className="w-full h-12 text-base" size="lg">
                Log in
              </Button>
            </a>

            <a href="/auth/login?screen_hint=signup" className="block">
              <Button className="w-full h-12 text-base" size="lg" variant="secondary">
                Create account
              </Button>
            </a>

            <div className="py-2">
              <Separator />
            </div>

            {/* Trust/expectations - reduces flakiness */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-foreground/60" />
                Sunday at noon: you receive event assignments.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-foreground/60" />
                Monday at noon: accept to confirm attendance.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-foreground/60" />
                Public venues only to keep it simple and safe.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-auto pt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to show up if you accept an event.
        </footer>
      </div>
    </main>
  );
}