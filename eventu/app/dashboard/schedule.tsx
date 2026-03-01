import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { EventItem, formatTimeRange } from "@/lib/events"
import { Target, Sparkles, MapPin } from "lucide-react"
import { useMemo } from "react"
import { AvailabilityBlock } from "./page"
import { MiniAvailabilityGrid } from "@/components/availability-graph"

export function ScheduleTabMobile({
    userReady,
    availability,
    onToggle,
    onQuickSet,
    suggested,
    onConfirm,
  }: {
    userReady: boolean
    availability: AvailabilityBlock[]
    onToggle: (day: number, hour: number) => void
    onQuickSet: (preset: "weeknights" | "weekend" | "clear") => void
    suggested: EventItem[]
    onConfirm: (ev: EventItem) => void
  }) {
    const selectedCount = availability.length
  
    const commonSlots = useMemo(
      () => [
        { label: "Mon 6–9", day: 1, hours: [18, 19, 20, 21] },
        { label: "Tue 6–9", day: 2, hours: [18, 19, 20, 21] },
        { label: "Wed 6–9", day: 3, hours: [18, 19, 20, 21] },
        { label: "Thu 6–9", day: 4, hours: [18, 19, 20, 21] },
        { label: "Sat 10–2", day: 6, hours: [10, 11, 12, 13, 14] },
        { label: "Sun 10–2", day: 0, hours: [10, 11, 12, 13, 14] },
      ],
      []
    )
  
    function isSelected(day: number, hour: number) {
      return availability.some((b) => b.day === day && b.hour === hour)
    }
  
    function toggleSlotGroup(day: number, hours: number[]) {
      const allSelected = hours.every((h) => isSelected(day, h))
      for (const h of hours) {
        if (allSelected) {
          if (isSelected(day, h)) onToggle(day, h)
        } else {
          if (!isSelected(day, h)) onToggle(day, h)
        }
      }
    }
  
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Availability
            </CardTitle>
            <CardDescription>Pick times you can play — we’ll schedule your week.</CardDescription>
          </CardHeader>
  
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onQuickSet("weeknights")}>
                Weeknights
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onQuickSet("weekend")}>
                Weekend
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onQuickSet("clear")}>
                Clear
              </Button>
              <Badge variant="secondary" className="ml-auto">
                {selectedCount} blocks
              </Badge>
            </div>
  
            {!userReady && (
              <div className="rounded-xl border bg-muted/30 p-3 text-sm text-muted-foreground">
                Sign in to save availability and confirm scheduled games.
              </div>
            )}
  
            <div className="space-y-2">
              <div className="text-sm font-medium">Common time blocks</div>
              <div className="flex flex-wrap gap-2">
                {commonSlots.map((s) => {
                  const allSelected = s.hours.every((h) => isSelected(s.day, h))
                  return (
                    <button
                      key={s.label}
                      disabled={!userReady}
                      onClick={() => toggleSlotGroup(s.day, s.hours)}
                      className={`rounded-full border px-3 py-2 text-sm transition ${
                        allSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                      } ${!userReady ? "opacity-60" : ""}`}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
  
              <div className="text-xs text-muted-foreground">
                Want more control? Use the mini grid below.
              </div>
            </div>
  
            <div className="overflow-x-auto">
              <div className="min-w-[520px] rounded-xl border p-3 ">
                <MiniAvailabilityGrid disabled={!userReady} availability={availability} onToggle={onToggle} />
              </div>
            </div>
          </CardContent>
        </Card>
  
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Suggested schedule
            </CardTitle>
            <CardDescription>Games that match your availability (no overlaps).</CardDescription>
          </CardHeader>
  
          <CardContent className="space-y-3">
            {selectedCount === 0 ? (
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                Select a few time blocks to generate suggestions.
              </div>
            ) : suggested.length === 0 ? (
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                No suggestions match your current availability. Add more blocks.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {suggested.map((ev) => (
                  <Card key={ev.id} className="rounded-2xl">
                    <CardHeader className="space-y-1 pb-3">
                      <CardTitle className="text-base truncate">{ev.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 truncate">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{ev.location}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <div className="text-sm text-muted-foreground line-clamp-2">{ev.description}</div>
                      <div className="text-sm font-medium">{formatTimeRange(ev)}</div>
                    </CardContent>
                    <CardFooter className="pt-3">
                      <Button className="w-full rounded-xl" size="sm" disabled={!userReady} onClick={() => onConfirm(ev)}>
                        Confirm this game
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }