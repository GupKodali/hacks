import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { EventItem } from "@/lib/events"
import { Compass, ChevronDown, ChevronUp } from "lucide-react"

export function DiscoverTabMobile({
  query,
  setQuery,
  hideConflicts,
  setHideConflicts,
  events,
  render,
}: {
  query: string
  setQuery: (v: string) => void
  hideConflicts: boolean
  setHideConflicts: (v: boolean) => void
  events: EventItem[]
  render: (ev: EventItem) => React.ReactNode
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <div className="space-y-3">
      {/* Header + search (compact, mobile-first) */}
      <div className="px-4 sm:px-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Compass className="h-4 w-4" />
              Discover
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Browse events and add them to your week.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground"
            aria-expanded={filtersOpen}
          >
            Filters
            {filtersOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="mt-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: basketball, soccer, park..."
            className="h-10 rounded-xl"
          />
        </div>

        {/* Collapsible filters */}
        {filtersOpen && (
          <div className="mt-3 flex items-center justify-between rounded-xl border px-3 py-2">
            <div className="min-w-0">
              <div className="text-sm font-medium">Hide conflicts</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Only show events that fit your schedule
              </div>
            </div>
            <Switch checked={hideConflicts} onCheckedChange={setHideConflicts} />
          </div>
        )}

        {/* If filters are collapsed, show a tiny status line instead */}
        {!filtersOpen && (
          <div className="mt-2 text-xs text-muted-foreground">
            {hideConflicts ? "Hiding conflicts" : "Showing all events"}
          </div>
        )}
      </div>

      {/* Results: stack (works with edge-to-edge EventRow) */}
      {events.length === 0 ? (
        <div className="px-4 text-sm text-muted-foreground sm:px-0">
          No results. Try a different search.
        </div>
      ) : (
        <div className="divide-y border-y">
          {events.map((ev) => render(ev))}
        </div>
      )}
    </div>
  )
}