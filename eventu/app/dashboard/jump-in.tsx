import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventItem } from "@/lib/events"
import { Zap } from "lucide-react"

export function JumpInTabMobile({
    isPast1PM,
    jumpInEvents,
    render,
  }: {
    isPast1PM: boolean
    jumpInEvents: EventItem[]
    render: (ev: EventItem) => React.ReactNode
  }) {
    if (!isPast1PM) {
      return (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Jump Ins
            </CardTitle>
            <CardDescription>Daily last-minute games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <div className="font-medium">Jump Ins open at 1:00 PM.</div>
              <div className="mt-1 text-muted-foreground">
                After 1PM, you’ll see events for the rest of today. Overlaps are allowed.
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  
    return (
      <div className="space-y-3">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Jump In today
            </CardTitle>
            <CardDescription>Overlaps allowed.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            These are games happening later today that still need players.
          </CardContent>
        </Card>
  
        {jumpInEvents.length === 0 ? (
          <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
            Nothing scheduled for the rest of today.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">{jumpInEvents.map((ev) => render(ev))}</div>
        )}
      </div>
    )
  }