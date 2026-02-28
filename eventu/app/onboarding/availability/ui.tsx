"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "../_components/OnboardingShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "eventu_onboarding_v1";

type Block = { day: string; start: string; end: string };
type OnboardingDraft = {
  hobbies: string[];
  availabilityBlocks: Block[];
  depositAcknowledged: boolean;
};

function loadDraft(): OnboardingDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { hobbies: [], availabilityBlocks: [], depositAcknowledged: false };
  } catch {
    return { hobbies: [], availabilityBlocks: [], depositAcknowledged: false };
  }
}
function saveDraft(draft: OnboardingDraft) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function isValidBlock(b: Block) {
  return b.day && b.start && b.end && b.start < b.end;
}

export default function AvailabilityClient() {
  const router = useRouter();

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [day, setDay] = useState<(typeof DAYS)[number]>("Mon");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("20:00");

  useEffect(() => {
    const draft = loadDraft();
    setBlocks(draft.availabilityBlocks ?? []);
  }, []);

  const addBlock = () => {
    const newBlock: Block = { day, start, end };
    if (!isValidBlock(newBlock)) return;

    setBlocks((prev) => {
      const next = [...prev, newBlock];
      const draft = loadDraft();
      saveDraft({ ...draft, availabilityBlocks: next });
      return next;
    });
  };

  const removeBlock = (idx: number) => {
    setBlocks((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      const draft = loadDraft();
      saveDraft({ ...draft, availabilityBlocks: next });
      return next;
    });
  };

  const canContinue = blocks.length > 0;

  const subtitle = useMemo(
    () => "Add time windows you can reliably make during the week. Matching uses overlaps.",
    []
  );

  return (
    <OnboardingShell step={2} title="Set your availability" subtitle={subtitle}>
      <div className="space-y-4">
        <div className="rounded-xl border p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Day</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={day}
                onChange={(e) => setDay(e.target.value as any)}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Start</Label>
              <input
                type="time"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>End</Label>
              <input
                type="time"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <Button type="button" className="h-11 w-full" onClick={addBlock}>
            Add time window
          </Button>

          <p className="text-xs text-muted-foreground">
            Tip: fewer, reliable windows beats “maybe” availability.
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your windows</h3>

          {blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No availability added yet.</p>
          ) : (
            <ul className="space-y-2">
              {blocks.map((b, idx) => (
                <li key={`${b.day}-${b.start}-${b.end}-${idx}`} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="text-sm">
                    <span className="font-medium">{b.day}</span>{" "}
                    <span className="text-muted-foreground">
                      {b.start}–{b.end}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBlock(idx)}
                    className="text-xs text-muted-foreground underline underline-offset-4"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-full"
            onClick={() => router.push("/onboarding/hobbies")}
          >
            Back
          </Button>
          <Button
            type="button"
            className="h-12 w-full"
            disabled={!canContinue}
            onClick={() => router.push("/onboarding/deposit")}
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}