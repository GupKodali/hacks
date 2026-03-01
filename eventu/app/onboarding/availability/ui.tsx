"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "../_components/OnboardingShell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MiniAvailabilityGrid } from "@/components/availability-graph";
import { AvailabilityBlock } from "@/app/dashboard/page";
import { useUser } from "@auth0/nextjs-auth0";

const STORAGE_KEY = "eventu_onboarding_v1";

type Block = { day: string; start: string; end: string };

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  updatedAt: number;
};

type OnboardingDraft = {
  hobbies: string[];
  availabilityBlocks: Block[];
  depositAcknowledged: boolean;
  location?: LocationData | null;
};

const DEFAULT_DRAFT: OnboardingDraft = {
  hobbies: [],
  availabilityBlocks: [],
  depositAcknowledged: false,
  location: null,
};

function loadDraft(): OnboardingDraft {
  try {
    if (typeof window === "undefined") return DEFAULT_DRAFT;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingDraft) : DEFAULT_DRAFT;
  } catch {
    return DEFAULT_DRAFT;
  }
}

function saveDraft(draft: OnboardingDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function normalizeToHour(t: string) {
  if (!t || t.length < 2) return "18:00";
  const hh = t.slice(0, 2);
  return `${hh}:00`;
}

function isValidBlock(b: Block) {
  return b.day && b.start && b.end && b.start < b.end;
}




/**
 * Enforce at most ONE window per day:
 * - If a window for the day doesn't exist, add it.
 * - If it does exist, replace it.
 */
function upsertBlockByDay(blocks: Block[], incoming: Block) {
  const idx = blocks.findIndex((b) => b.day === incoming.day);
  if (idx === -1) return [...blocks, incoming];
  const next = [...blocks];
  next[idx] = incoming;
  return next;
}

function hhmmToHour(t: string) {
  // expects "HH:MM"
  const hh = parseInt(t.slice(0, 2), 10);
  return Number.isFinite(hh) ? Math.max(0, Math.min(23, hh)) : 0;
}

function hourToHH00(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function dayIndexToKey(i: number) {
  return DAYS[i] ?? "Mon";
}

export default function AvailabilityClient() {
  const router = useRouter();

  const [blocks, setBlocks] = useState<Block[]>([]);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadDraft();

    const normalizedBlocks = (draft.availabilityBlocks ?? []).map((b) => ({
      ...b,
      start: normalizeToHour(b.start),
      end: normalizeToHour(b.end),
    }));

    setBlocks(normalizedBlocks);
    setLocation(draft.location ?? null);

    if (JSON.stringify(normalizedBlocks) !== JSON.stringify(draft.availabilityBlocks ?? [])) {
      saveDraft({ ...draft, availabilityBlocks: normalizedBlocks });
    }
  }, []);

  const removeBlockByDay = (dayKey: string) => {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.day !== dayKey);
      const draft = loadDraft();
      saveDraft({ ...draft, availabilityBlocks: next });
      return next;
    });
  };

  const setBlockForDay = (dayKey: string, startHour: number, endHour: number) => {
    const newBlock: Block = { day: dayKey, start: hourToHH00(startHour), end: hourToHH00(endHour) };
    if (!isValidBlock(newBlock)) return;

    setBlocks((prev) => {
      const next = upsertBlockByDay(prev, newBlock);
      const draft = loadDraft();
      saveDraft({ ...draft, availabilityBlocks: next });
      return next;
    });
  };


  // Toggle an hour cell, then compress that day into ONE contiguous window (min..max+1)
  const handleToggle = (dayIdx: number, hour: number) => {
    setBlocks((prev) => {
      const dayKey = dayIndexToKey(dayIdx);

      // Build selected hours set from existing window (single block/day)
      const existing = prev.find((b) => b.day === dayKey);
      const selected = new Set<number>();

      if (existing) {
        const s = hhmmToHour(normalizeToHour(existing.start));
        const e = hhmmToHour(normalizeToHour(existing.end));
        for (let h = s; h < e; h++) selected.add(h);
      }

      // Toggle clicked hour
      if (selected.has(hour)) selected.delete(hour);
      else selected.add(hour);

      const nextSelected = Array.from(selected).sort((a, b) => a - b);

      let nextBlocks: Block[];
      if (nextSelected.length === 0) {
        nextBlocks = prev.filter((b) => b.day !== dayKey);
      } else {
        const startH = nextSelected[0];
        const endH = nextSelected[nextSelected.length - 1] + 1; // end is exclusive
        const incoming: Block = { day: dayKey, start: hourToHH00(startH), end: hourToHH00(endH) };
        nextBlocks = upsertBlockByDay(prev.filter((b) => b.day !== dayKey), incoming);
      }

      const draft = loadDraft();
      saveDraft({ ...draft, availabilityBlocks: nextBlocks });

      return nextBlocks;
    });
  };

  const handleLocateMe = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextLoc: LocationData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          updatedAt: Date.now(),
        };

        setLocation(nextLoc);

        const draft = loadDraft();
        saveDraft({ ...draft, location: nextLoc });

        setLocating(false);
      },
      (err) => {
        console.error(err);
        setLocationError(
          err.code === err.PERMISSION_DENIED ? "Location permission denied." : "Unable to retrieve your location."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClearLocation = () => {
    setLocation(null);
    setLocationError(null);
    const draft = loadDraft();
    saveDraft({ ...draft, location: null });
  };
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([])
  const canContinue = blocks.length > 0;

  const subtitle = useMemo(
    () => "Add time windows you can reliably make during the week. Matching uses overlaps.",
    []
  );

  const orderedBlocks = useMemo(() => {
    const order = new Map(DAYS.map((d, i) => [d, i]));
    return [...blocks].sort(
      (a, b) =>
        (order.get(a.day as (typeof DAYS)[number]) ?? 0) -
        (order.get(b.day as (typeof DAYS)[number]) ?? 0)
    );
  }, [blocks]);

  return (
    <OnboardingShell step={2} title="Set your availability" subtitle={subtitle}>
      <div className="space-y-4">
        <div className="rounded-xl border p-4 space-y-3">
          <MiniAvailabilityGrid disabled={false} availability={availability} onToggle={handleToggle} />
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your windows</h3>

          {orderedBlocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No availability added yet.</p>
          ) : (
            <ul className="space-y-2">
              {orderedBlocks.map((b) => (
                <li
                  key={`${b.day}-${b.start}-${b.end}`}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="text-sm">
                    <span className="font-medium">{b.day}</span>{" "}
                    <span className="text-muted-foreground">
                      {b.start}–{b.end}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBlockByDay(b.day)}
                    className="text-xs text-muted-foreground underline underline-offset-4"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        <div className="rounded-xl border p-4 space-y-2">
          <h3 className="text-sm font-medium">Location (optional)</h3>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={handleLocateMe}
            disabled={locating}
          >
            {locating ? "Locating..." : "Locate me"}
          </Button>

          {location && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Lat: {location.latitude.toFixed(6)}</div>
              <div>Lng: {location.longitude.toFixed(6)}</div>
              {typeof location.accuracy === "number" && <div>Accuracy: ±{Math.round(location.accuracy)}m</div>}
              <div>Updated: {new Date(location.updatedAt).toLocaleString()}</div>

              <button type="button" onClick={handleClearLocation} className="text-xs underline underline-offset-4">
                Clear location
              </button>
            </div>
          )}

          {locationError && <div className="text-xs text-destructive">{locationError}</div>}
        </div>

        <div className="flex flex-col gap-3 pt-2">
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
            onClick={async() => {
              try {
                const draft = JSON.parse(localStorage.getItem("eventu_onboarding_v1") || "{}");
                console.log("draft: ", draft)
                const availabilityBlocks = draft.availabilityBlocks || [];
                console.log(availabilityBlocks);
                const interestIds: string[] = draft.hobbies ?? [] ; // assuming hobbies hold selected tag IDs
                console.log("interestIds: ", interestIds)
                const res = await fetch("/api/preferences", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ availabilityBlocks, interestIds }),
                });

                if (!res.ok) throw new Error("Failed to save preferences");

                router.push("/onboarding/deposit");
              } catch (err) {
                console.error("Error saving preferences:", err);
              }
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
