import React, { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventItem, formatTimeRange } from "@/lib/events"
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react"
import { Registration } from "./page"

export function WeekTabMobile({
  now,
  registrations,
  myUpcoming,
  onRemove,
  calendar,
}: {
  now: Date
  registrations: Registration[]
  myUpcoming: EventItem[]
  onRemove: (id: string) => void
  calendar: React.ReactNode
}) {
  // Collapse by default if there are a lot of items; tweak threshold if you want.
  const [gamesOpen, setGamesOpen] = useState(true)

  const regById = useMemo(() => {
    const map = new Map<string, Registration>()
    for (const r of registrations) map.set(r.event.id, r)
    return map
  }, [registrations])

  return (
    <div className="space-y-4">
      {/* Today (full-width, compact) */}
      <section className="space-y-2">
        <div className="px-4 sm:px-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="h-4 w-4" />
            Today
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {now.toLocaleString(undefined, { weekday: "long" })} • quick view
          </div>
        </div>

        {/* calendar already uses edge-to-edge strip in your refactor */}
        <div className="px-0 sm:px-0">{calendar}</div>
      </section>

      <div className="px-4 sm:px-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Your games</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Committed schedule (no overlaps).
            </div>
          </div>

          <button
            type="button"
            onClick={() => setGamesOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground"
            aria-expanded={gamesOpen}
          >
            {gamesOpen ? (
              <>
                Hide <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Your games list */}
      {gamesOpen && (
        <div className="space-y-2">
          {registrations.length === 0 ? (
            <div className="px-4 sm:px-0">
              <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                No games yet. Go to “Schedule” and confirm suggestions.
              </div>
            </div>
          ) : (
            <div className="divide-y border-y">
              {myUpcoming.map((ev) => {
                const reg = regById.get(ev.id)
                return (
                  <div
                    key={ev.id}
                    className="-mx-4 w-[calc(100%+2rem)] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {ev.title}
                        </div>
                        <div className="mt-1 truncate text-xs text-muted-foreground">
                          {ev.location}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium">
                            {formatTimeRange(ev)}
                          </div>

                          {reg?.kind && (
                            <Badge
                              variant="outline"
                              className="h-6 rounded-lg px-2 text-xs"
                            >
                              {reg.kind === "scheduled"
                                ? "Scheduled"
                                : reg.kind === "manual"
                                  ? "Manual"
                                  : "Jump In"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 rounded-xl"
                        onClick={() => onRemove(ev.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}