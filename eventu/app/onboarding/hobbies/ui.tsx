"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "../_components/OnboardingShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "eventu_onboarding_v1";

const DEFAULT_HOBBIES = [
  "Pickleball",
  "Pickup Basketball",
  "Board Games",
  "Coffee / Walk",
  "Trivia Night",
  "Study Session",
  "Running",
  "Gym / Lifting",
  "Volleyball",
  "Tennis",
] as const;

type OnboardingDraft = {
  hobbies: string[];
  availabilityBlocks: { day: string; start: string; end: string }[];
  depositAcknowledged: boolean;
};

function loadDraft(): OnboardingDraft {
  if (typeof window === "undefined") return { hobbies: [], availabilityBlocks: [], depositAcknowledged: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { hobbies: [], availabilityBlocks: [], depositAcknowledged: false };
    return JSON.parse(raw);
  } catch {
    return { hobbies: [], availabilityBlocks: [], depositAcknowledged: false };
  }
}

function saveDraft(draft: OnboardingDraft) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export default function HobbiesClient() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const remaining = 3 - selected.length;

  useEffect(() => {
    const draft = loadDraft();
    setSelected(draft.hobbies ?? []);
  }, []);

  const canContinue = selected.length > 0 && selected.length <= 3;

  const toggle = (h: string) => {
    setSelected((prev) => {
      const exists = prev.includes(h);
      if (exists) return prev.filter((x) => x !== h);
      if (prev.length >= 3) return prev; // hard cap
      return [...prev, h];
    });
  };

  const onContinue = () => {
    const draft = loadDraft();
    const next: OnboardingDraft = {
      ...draft,
      hobbies: selected,
    };
    saveDraft(next);
    router.push("/onboarding/availability");
  };

  const subtitle = useMemo(
    () => "Pick up to 3. We’ll match you into events based on overlap + availability.",
    []
  );

  return (
    <OnboardingShell step={1} title="Choose your hobbies" subtitle={subtitle}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Select up to <span className="text-foreground font-medium">3</span>.
          </p>
          <Badge variant={remaining === 0 ? "secondary" : "outline"}>
            {remaining} left
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEFAULT_HOBBIES.map((h) => {
            const active = selected.includes(h);
            return (
              <button
                key={h}
                type="button"
                onClick={() => toggle(h)}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background hover:bg-muted",
                ].join(" ")}
              >
                {h}
              </button>
            );
          })}
        </div>

        <Separator />

        <div className="flex gap-3">
          <Button
            className="h-12 w-full text-base"
            disabled={!canContinue}
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          You can change these later. For MVP, this just affects matching and event types.
        </p>
      </div>
    </OnboardingShell>
  );
}