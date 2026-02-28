"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "../_components/OnboardingShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "eventu_onboarding_v1";

type Draft = {
  hobbies: string[];
  availabilityBlocks: { day: string; start: string; end: string }[];
  depositAcknowledged: boolean;
};

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { hobbies: [], availabilityBlocks: [], depositAcknowledged: false };
  } catch {
    return { hobbies: [], availabilityBlocks: [], depositAcknowledged: false };
  }
}
function saveDraft(d: Draft) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

export default function DepositClient() {
  const router = useRouter();
  const [ack, setAck] = useState(false);
  const [draft, setDraft] = useState<Draft>({ hobbies: [], availabilityBlocks: [], depositAcknowledged: false });

  useEffect(() => {
    const d = loadDraft();
    setDraft(d);
    setAck(!!d.depositAcknowledged);
  }, []);

  const subtitle = useMemo(
    () => "This is a lightweight commitment tool. For MVP, this screen is a mock (no real payments).",
    []
  );

  const onFinish = () => {
    const next = { ...draft, depositAcknowledged: ack };
    saveDraft(next);

    // MVP: just send them to dashboard.
    // Later: write hobbies/availability to DB + mark onboardingComplete = true.
    router.push("/dashboard");
  };

  return (
    <OnboardingShell step={3} title="Commitment deposit (mock)" subtitle={subtitle}>
      <div className="space-y-4">
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-sm font-medium">$5 deposit</div>
          <p className="text-sm text-muted-foreground">
            If you <span className="text-foreground font-medium">miss</span> an event you accepted,
            the $5 goes to charity. If you attend, you keep it.
          </p>
          <p className="text-xs text-muted-foreground">
            MVP note: No payments are processed yet—this is just the UX + policy.
          </p>
        </div>

        <Separator />

        <div className="rounded-xl border p-4 space-y-3">
          <div className="text-sm font-medium">Quick summary</div>
          <div className="text-sm text-muted-foreground">
            <div>
              <span className="text-foreground font-medium">Hobbies:</span>{" "}
              {draft.hobbies?.length ? draft.hobbies.join(", ") : "None selected"}
            </div>
            <div className="mt-1">
              <span className="text-foreground font-medium">Availability windows:</span>{" "}
              {draft.availabilityBlocks?.length ? draft.availabilityBlocks.length : 0}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border p-4">
          <Checkbox id="ack" checked={ack} onCheckedChange={(v) => setAck(v === true)} />
          <label htmlFor="ack" className="text-sm leading-snug">
            I understand: if I accept an event and no-show, the $5 deposit is forfeited to charity.
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-full"
            onClick={() => router.push("/onboarding/availability")}
          >
            Back
          </Button>
          <Button
            type="button"
            className="h-12 w-full text-base"
            disabled={!ack}
            onClick={onFinish}
          >
            Finish setup
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Next: you’ll land on the dashboard. Later we’ll persist this to SQL and enforce deposit logic.
        </p>
      </div>
    </OnboardingShell>
  );
}