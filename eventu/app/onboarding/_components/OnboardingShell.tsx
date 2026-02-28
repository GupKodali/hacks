// app/onboarding/_components/OnboardingShell.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function OnboardingShell({
  step,
  title,
  subtitle,
  children,
}: {
  step: 1 | 2 | 3;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const steps = [
    { n: 1, label: "Hobbies" },
    { n: 2, label: "Availability" },
    { n: 3, label: "Deposit" },
  ] as const;

  return (
    <main className="min-h-[100svh] bg-background">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">Step {step} of 3</Badge>
            <div className="flex gap-2 text-xs text-muted-foreground">
              {steps.map((s) => (
                <span
                  key={s.n}
                  className={[
                    "rounded-full border px-2 py-0.5",
                    s.n === step ? "text-foreground border-foreground/30" : "opacity-60",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Account setup</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">{children}</CardContent>
        </Card>

        <footer className="mt-auto pt-6 text-center text-xs text-muted-foreground">
          Public venues only. Weekly matching releases Sundays at noon.
        </footer>
      </div>
    </main>
  );
}