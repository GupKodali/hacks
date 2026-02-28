import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  return (
    <main className="min-h-[100svh] bg-background">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set availability Sundays, pick up to 3 hobbies, get assigned real events.
          </p>
        </header>

        <Card className="shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Sign up</CardTitle>
            <CardDescription>Continue with a provider</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Social row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Google */}
              <a
                href="/auth/login?connection=google-oauth2&screen_hint=signup"
                className="block"
              >
                <Button variant="outline" className="h-12 w-full justify-center gap-2">
                  <GoogleIcon />
                  Continue with Google
                </Button>
              </a>

              {/* Apple */}
              <a
                href="/auth/login?connection=apple&screen_hint=signup"
                className="block"
              >
                <Button variant="outline" className="h-12 w-full justify-center gap-2">
                  <AppleIcon />
                  Continue with Apple
                </Button>
              </a>
            </div>

            <div className="py-1">
              <Separator />
            </div>

            <a href="/auth/login?screen_hint=signup" className="block">
              <Button className="h-12 w-full text-base" size="lg">
                Create account with email
              </Button>
            </a>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4 text-foreground">
                Log in
              </a>
            </p>
          </CardContent>
        </Card>

        <footer className="mt-auto pt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to show up if you accept an event.
        </footer>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M44.5 20H24v8.5h11.7C34.3 33.7 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.5 0 6.4 1.3 8.7 3.4l6-6C35.1 5.1 29.9 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.3-.5-4z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.7 13.2c0-2 1.6-3 1.7-3.1-1-1.5-2.5-1.7-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.8-2.7-.8-1.4 0-2.7.8-3.4 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.1 2.8 2.1 1.1 0 1.6-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-1.1 2.7-2.1.8-1.2 1.1-2.4 1.1-2.5-.1 0-2-.8-2-3.3zM14.9 6.7c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.7-1 1.7-.9 2.6 1 .1 2-.5 2.6-1.2z" />
    </svg>
  );
}