// app/login/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="min-h-[100svh] bg-background">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your email and password to continue. You’ll be taken to your dashboard after signing in.
          </p>
        </header>

        <Card className="shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Continue</CardTitle>
            <CardDescription>Secure login handled by Auth0.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Auth0 recommends <a> (not next/link) for auth routes */}
            <a href="/auth/login" className="block">
              <Button className="h-12 w-full text-base" size="lg">
                Log in with email
              </Button>
            </a>

            <a href="/auth/login?screen_hint=signup" className="block">
              <Button className="h-12 w-full text-base" size="lg" variant="secondary">
                Create account
              </Button>
            </a>

            <p className="pt-2 text-center text-xs text-muted-foreground">
              You’ll land on your dashboard after login.
            </p>
          </CardContent>
        </Card>

        <footer className="mt-auto pt-8 text-center text-xs text-muted-foreground">
          Tip: accepting an event is a commitment to show up.
        </footer>
      </div>
    </main>
  );
}