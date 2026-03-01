"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { AvailabilityBlock } from "./page" // adjust import path
import type { EventItem } from "@/lib/events"
import { formatTimeRange } from "@/lib/events"

type Props = {
  userReady: boolean
  availability: AvailabilityBlock[]
  onToggle: (day: number, hour: number) => void
  onQuickSet: (preset: "weeknights" | "weekend" | "clear") => void

  /**
   * IMPORTANT:
   * This component will render however many items you pass here.
   * If you're only seeing 2, the parent/API is only giving 2.
   */
  suggested: EventItem[]
  onConfirm: (ev: EventItem) => void

  /**
   * Optional: pass the user's tag "slugs" or names down so we can filter client-side.
   * Examples: ["pickleball", "soccer", "board-games"]
   */
  userTags?: string[]
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function hourLabel(h: number) {
  const hr12 = ((h + 11) % 12) + 1
  const ampm = h >= 12 ? "PM" : "AM"
  return `${hr12}${ampm}`
}

/** Turn selected hours into compact ranges like 6–9PM or 10AM–12PM */
function compressHours(hours: number[]) {
  const sorted = [...hours].sort((a, b) => a - b)
  const ranges: Array<{ start: number; end: number }> = []
  let i = 0
  while (i < sorted.length) {
    let start = sorted[i]
    let end = start
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) {
      i++
      end = sorted[i]
    }
    ranges.push({ start, end })
    i++
  }
  return ranges.map(({ start, end }) => {
    if (start === end) return hourLabel(start)
    const endDisplay = end + 1
    return `${hourLabel(start)}–${hourLabel(endDisplay)}`
  })
}

/**
 * Best-effort tag extractor. Adjust this to match what your API returns.
 * Recommended: put `tags: string[]` on EventItem in your suggested query.
 */
function getEventTags(ev: EventItem): string[] {
  const anyEv = ev as unknown as {
    tags?: string[]
    tag_slugs?: string[]
    tag_ids?: string[]
  }

  if (Array.isArray(anyEv.tags)) return anyEv.tags
  if (Array.isArray(anyEv.tag_slugs)) return anyEv.tag_slugs
  if (Array.isArray(anyEv.tag_ids)) return anyEv.tag_ids
  return []
}

export function ScheduleTabMobile({
  userReady,
  availability,
  onToggle,
  onQuickSet,
  suggested,
  onConfirm,
  userTags = [],
}: Props) {
  // If they already picked stuff, keep the grid collapsed by default.
  const [gridOpen, setGridOpen] = useState(availability.length === 0)
  const [showAllHours, setShowAllHours] = useState(false)

  // Suggested list controls
  const [onlyMyInterests, setOnlyMyInterests] = useState(true)
  const [showAllSuggested, setShowAllSuggested] = useState(false)

  const selectedByDay = useMemo(() => {
    const map = new Map<number, number[]>()
    for (const b of availability) {
      map.set(b.day, [...(map.get(b.day) ?? []), b.hour])
    }
    return map
  }, [availability])

  const selectedSummary = useMemo(() => {
    const items = [...selectedByDay.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([day, hours]) => ({
        day,
        ranges: compressHours(hours),
      }))
      .filter((d) => d.ranges.length > 0)

    return items
  }, [selectedByDay])

  // “Common” hours (compact): weeknights + weekend day
  const hoursCompact = useMemo(() => {
    return [10, 11, 12, 13, 14, 18, 19, 20, 21]
  }, [])

  const hoursAll = useMemo(() => Array.from({ length: 15 }, (_, i) => i + 8), []) // 8AM..10PM
  const hours = showAllHours ? hoursAll : hoursCompact

  const selectedSet = useMemo(() => {
    const s = new Set<string>()
    for (const b of availability) s.add(`${b.day}-${b.hour}`)
    return s
  }, [availability])

  const filteredSuggested = useMemo(() => {
    if (!onlyMyInterests) return suggested

    // If user has no tags, don't hide everything
    if (userTags.length === 0) return suggested

    const userTagSet = new Set(userTags.map((t) => t.toLowerCase().trim()))

    return suggested.filter((ev) => {
      const evTags = getEventTags(ev).map((t) => t.toLowerCase().trim())
      // If the event has no tags, keep it (so suggestions don't go empty by accident)
      if (evTags.length === 0) return true
      return evTags.some((t) => userTagSet.has(t))
    })
  }, [onlyMyInterests, suggested, userTags])

  const SUGGESTED_PREVIEW_COUNT = 6
  const suggestedToRender = useMemo(() => {
    if (showAllSuggested) return filteredSuggested
    return filteredSuggested.slice(0, SUGGESTED_PREVIEW_COUNT)
  }, [filteredSuggested, showAllSuggested])

  const hiddenCount = Math.max(0, filteredSuggested.length - suggestedToRender.length)

  return (
    <div className="space-y-4">
      {/* Top actions */}
      <div className="px-4 sm:px-0">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={!userReady}
            onClick={() => onQuickSet("weeknights")}
          >
            Weeknights
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={!userReady}
            onClick={() => onQuickSet("weekend")}
          >
            Weekend
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-xl"
            disabled={!userReady}
            onClick={() => onQuickSet("clear")}
          >
            Clear
          </Button>
        </div>

        {/* Selected times list */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Your set times</div>
            <button
              type="button"
              onClick={() => setGridOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground"
            >
              {gridOpen ? (
                <>
                  Hide grid <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Edit in grid <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {selectedSummary.length === 0 ? (
            <div className="mt-2 text-sm text-muted-foreground">
              No availability selected yet. Open the grid to pick times.
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {selectedSummary.map(({ day, ranges }) => (
                <div key={day} className="flex items-start gap-2">
                  <div className="w-10 shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">
                    {DAY_NAMES[day]}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ranges.map((r) => (
                      <Badge key={r} variant="secondary" className="h-6 rounded-lg px-2 text-xs">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Collapsible grid */}
      {gridOpen && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-4 sm:px-0">
            <div className="text-sm font-semibold">Availability grid</div>
            <button
              type="button"
              onClick={() => setShowAllHours((v) => !v)}
              className="rounded-lg px-2 py-1 text-xs text-muted-foreground"
            >
              {showAllHours ? "Show fewer hours" : "Show all hours"}
            </button>
          </div>

          {/* Grid: compact, tap-friendly */}
          <div className="overflow-x-auto px-4 pb-1 sm:px-0">
            <div className="min-w-[560px]">
              {/* Header row */}
              <div className="grid grid-cols-[72px_repeat(7,1fr)] gap-1">
                <div className="text-[11px] text-muted-foreground" />
                {DAY_NAMES.map((d) => (
                  <div
                    key={d}
                    className="rounded-lg bg-muted/40 py-1 text-center text-[11px] font-medium"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Hour rows */}
              <div className="mt-1 space-y-1">
                {hours.map((h) => (
                  <div key={h} className="grid grid-cols-[72px_repeat(7,1fr)] gap-1">
                    <div className="flex items-center justify-end pr-2 text-[11px] text-muted-foreground">
                      {hourLabel(h)}
                    </div>

                    {Array.from({ length: 7 }).map((_, day) => {
                      const on = selectedSet.has(`${day}-${h}`)
                      return (
                        <button
                          key={`${day}-${h}`}
                          type="button"
                          disabled={!userReady}
                          onClick={() => onToggle(day, h)}
                          className={[
                            "h-9 rounded-lg border text-[11px] transition",
                            "disabled:opacity-50",
                            on
                              ? "bg-foreground text-background"
                              : "bg-background hover:bg-muted/30",
                          ].join(" ")}
                          aria-pressed={on}
                        >
                          {on ? "On" : ""}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 text-xs text-muted-foreground sm:px-0">
            Tip: pick 2–4 time windows you can reliably make each week.
          </div>
        </div>
      )}

      <Separator />

      {/* Suggested schedule (compact list) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4 sm:px-0">
          <div className="text-sm font-semibold">Suggested this week</div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">Only my interests</div>
            <Switch
              checked={onlyMyInterests}
              onCheckedChange={setOnlyMyInterests}
              disabled={!userReady}
            />
          </div>
        </div>

        {/* Small helper line if they have no tags */}
        {onlyMyInterests && userTags.length === 0 && (
          <div className="px-4 text-xs text-muted-foreground sm:px-0">
            You don’t have any tags yet—showing all suggestions.
          </div>
        )}

        {filteredSuggested.length === 0 ? (
          <div className="px-4 text-sm text-muted-foreground sm:px-0">
            No suggestions match your set times (or interests) yet—add more availability or tags.
          </div>
        ) : (
          <>
            <div className="divide-y border-y">
              {suggestedToRender.map((ev) => (
                <div key={ev.id} className="-mx-4 w-[calc(100%+2rem)] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{ev.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{ev.location}</div>
                      <div className="mt-2 text-sm font-medium">{formatTimeRange(ev)}</div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 rounded-xl"
                      disabled={!userReady}
                      onClick={() => onConfirm(ev)}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredSuggested.length > SUGGESTED_PREVIEW_COUNT && (
              <div className="px-4 sm:px-0">
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setShowAllSuggested((v) => !v)}
                >
                  {showAllSuggested ? "Show fewer" : `Show all (+${hiddenCount})`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}