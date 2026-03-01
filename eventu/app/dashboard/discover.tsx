import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { EventItem } from "@/lib/events"
import { Compass } from "lucide-react"

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
    return (
      <div className="space-y-3">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Discover
            </CardTitle>
            <CardDescription>Browse events and add them to your week.</CardDescription>
          </CardHeader>
  
          <CardContent className="space-y-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: basketball, soccer, park..."
            />
  
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Hide conflicts</div>
                <div className="text-xs text-muted-foreground">Only show events that fit your schedule</div>
              </div>
              <Switch checked={hideConflicts} onCheckedChange={setHideConflicts} />
            </div>
          </CardContent>
        </Card>
  
        <div className="grid grid-cols-1 gap-3">{events.map((ev) => render(ev))}</div>
      </div>
    )
  }
  
  