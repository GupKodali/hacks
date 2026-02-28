"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const START_HOUR = 10;
const END_HOUR = 22;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i
);

type Availability = Record<DayKey, boolean[]>;

type Interest = {
  id: string; // UUID or cuid
  name: string;
  emoji?: string | null;
};

function createDefaultAvailability(): Availability {
  // ✅ Start as GRAY (unselected) — user taps to turn green
  return {
    mon: Array(HOURS.length).fill(false),
    tue: Array(HOURS.length).fill(false),
    wed: Array(HOURS.length).fill(false),
    thu: Array(HOURS.length).fill(false),
    fri: Array(HOURS.length).fill(false),
    sat: Array(HOURS.length).fill(false),
    sun: Array(HOURS.length).fill(false),
  };
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "pm" : "am";
  const hour12 = ((hour + 11) % 12) + 1;
  return `${hour12}${suffix}`;
}

export default function PreferencesPage() {
  const [availability, setAvailability] = useState<Availability>(
    createDefaultAvailability()
  );
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  // Interests (pulled from SQL later via /api/interests)
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const selectedSet = useMemo(
    () => new Set(selectedInterestIds),
    [selectedInterestIds]
  );

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        // Load preferences
        const prefRes = await fetch("/api/preferences", { method: "GET" });
        if (prefRes.ok) {
          const data = await prefRes.json();
          if (!ignore) {
            // If saved prefs exist, they override the gray-defaults
            if (data.availability) setAvailability(data.availability);
            if (Array.isArray(data.interestIds)) {
              setSelectedInterestIds(data.interestIds);
            }
          }
        }

        // Load interests catalog
        const interestRes = await fetch("/api/interests", { method: "GET" });
        if (interestRes.ok) {
          const list = (await interestRes.json()) as Interest[];
          if (!ignore && Array.isArray(list)) setAllInterests(list);
        }
      } catch {
        // keep defaults
      } finally {
        if (!ignore) setLoadingPrefs(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  function toggleCell(day: DayKey, index: number) {
    setAvailability((prev) => {
      const updated = { ...prev };
      updated[day] = [...prev[day]];
      updated[day][index] = !updated[day][index];
      return updated;
    });
  }

  function toggleInterest(id: string) {
    setSelectedInterestIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  async function savePreferences() {
    setStatus(null);
    setSaving(true);

    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability,
          interestIds: selectedInterestIds,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setStatus("Preferences saved!");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus("Error saving preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[100svh] bg-background">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-semibold">Preferences</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap gray boxes to mark availability (turns green). Pick interests for
            better event matches.
          </p>
        </header>

        {/* Availability Card */}
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              Tap to toggle. Starts gray by default (unselected).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {loadingPrefs ? (
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
            ) : (
              DAYS.map((day) => (
                <div key={day.key} className="space-y-2">
                  <div className="text-sm font-medium">
                    {day.label}
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 md:overflow-x-visible md:pb-0">
                    {HOURS.map((hour, index) => {
                      const active = availability[day.key][index];
                      return (
                        <button
                          key={`${day.key}-${hour}`}
                          type="button"
                          onClick={() => toggleCell(day.key, index)}
                          className={[
                            "h-11 rounded-md border transition active:scale-[0.99]",
                            "text-xs sm:text-sm",
                            "min-w-[78px] sm:min-w-[86px] md:min-w-[60px] lg:min-w-[70px]",
                            active
                              ? "bg-emerald-500/25 border-emerald-500/60"
                              : "bg-muted border-border hover:bg-muted/70",
                          ].join(" ")}
                          title={`${day.label} ${formatHour(hour)}–${formatHour(
                            hour + 1
                          )}`}
                        >
                          {formatHour(hour)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Separator className="my-6 sm:my-8" />

        {/* Interests Card */}
        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
            <CardDescription>
              Loaded from your database (via <code>/api/interests</code>) and
              saved per user.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {allInterests.length === 0 ? (
              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                No interests loaded yet. Once you add your SQL table +{" "}
                <code>/api/interests</code>, they’ll show up here as selectable
                boxes.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {allInterests.map((i) => {
                  const selected = selectedSet.has(i.id);
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => toggleInterest(i.id)}
                      className={[
                        "flex items-center gap-2 rounded-lg border p-3 text-left",
                        "transition active:scale-[0.99]",
                        selected
                          ? "border-emerald-500/60 bg-emerald-500/15"
                          : "border-border bg-muted hover:bg-muted/70",
                      ].join(" ")}
                      title={i.name}
                    >
                      <span className="text-lg">{i.emoji ?? "✨"}</span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {i.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selected ? "Selected" : "Tap to select"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {allInterests.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Selected: {selectedInterestIds.length}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-sm text-muted-foreground">{status}</div>
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>

        <footer className="mt-auto pt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to show up if you accept an event.
        </footer>
      </div>
    </main>
  );
}