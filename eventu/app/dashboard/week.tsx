import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventItem, formatTimeRange } from "@/lib/events"
import { CalendarDays } from "lucide-react"
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
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Today
            </CardTitle>
            <CardDescription>
              {now.toLocaleString(undefined, { weekday: "long" })} • quick view
            </CardDescription>
          </CardHeader>
          <CardContent>{calendar}</CardContent>
        </Card>
  
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Your games</CardTitle>
            <CardDescription>Committed schedule (no overlaps).</CardDescription>
          </CardHeader>
  
          <CardContent className="space-y-3">
            {registrations.length === 0 ? (
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                No games yet. Go to “Schedule” and confirm suggestions.
              </div>
            ) : (
              myUpcoming.map((ev) => {
                const reg = registrations.find((r) => r.event.id === ev.id)
                return (
                  <div key={ev.id} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{ev.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground truncate">{ev.location}</div>
                        <div className="mt-1 text-sm">{formatTimeRange(ev)}</div>
  
                        {reg?.kind && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {reg.kind === "scheduled" ? "Scheduled" : reg.kind === "manual" ? "Manual" : "Jump In"}
                            </Badge>
                          </div>
                        )}
                      </div>
  
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl shrink-0"
                        onClick={() => onRemove(ev.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    )
  }