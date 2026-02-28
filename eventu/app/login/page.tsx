// app/login/page.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await auth0.getSession();
  if (session) redirect("/post-login");

  return (
    <main className="min-h-[100svh] bg-background">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure login is handled by Auth0. After signing in, you’ll be routed to setup (if needed)
            and then your dashboard.
          </p>
        </header>

        <Card className="shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Continue</CardTitle>
            <CardDescription>Use email/password or create a new account.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Auth0 routes: use <a> (not next/link) */}
            <a href="/auth/login" className="block">
              <Button className="h-12 w-full text-base" size="lg">
                Log in
              </Button>
            </a>

            <a href="/auth/login?screen_hint=signup" className="block">
              <Button className="h-12 w-full text-base" size="lg" variant="secondary">
                Create account
              </Button>
            </a>

            <p className="pt-2 text-center text-xs text-muted-foreground">
              Already signed in? You’ll be redirected automatically.
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