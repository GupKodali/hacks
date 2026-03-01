"use client"

import React, { useEffect, useMemo, useState } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useUser } from "@auth0/nextjs-auth0/client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { sampleEvents, EventItem, overlaps, formatTimeRange } from "@/lib/events"

type DbEventRow = {
  id: number
  name: string
  start_time: string
  end_time: string
  location: string | null
  description?: string | null
}

type DbRegistrationRow = {
  // Depending on your /api/registrations response, some of these may not exist.
  // This type supports both "joined event" responses and "event_id only" responses.
  id?: number
  event_id: number
  user_sub?: string
  display_name?: string | null
  kind?: "scheduled" | "manual" | "jumpin" | string
  created_at?: string | null

  event_name?: string | null
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  description?: string | null
}

type Registration = {
  event: EventItem
  name: string
}

export default function DashboardPage() {
  const { user, error, isLoading } = useUser()

  const [events, setEvents] = useState<EventItem[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)

  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [regsLoading, setRegsLoading] = useState(false)
  const [regsError, setRegsError] = useState<string | null>(null)

  const [warning, setWarning] = useState<string | null>(null)

  // A simple tick to allow a "Refresh" button + optional polling
  const [refreshTick, setRefreshTick] = useState(0)

  // ------- DB: Load events (with no-store + resilient mapping) -------
  useEffect(() => {
    let alive = true

    async function loadEvents() {
      setEventsLoading(true)
      setEventsError(null)

      try {
        console.log("[Dashboard] Fetching /api/events ...")
        const res = await fetch("/api/events", { method: "GET", cache: "no-store" })
        console.log("[Dashboard] /api/events status:", res.status)

        const json = await res.json().catch(() => null)
        console.log("[Dashboard] /api/events json:", json)

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || `Failed to load events (status ${res.status})`)
        }

        const rows: DbEventRow[] = json.events ?? []

        // Resilient mapping: skip bad rows instead of crashing the whole map.
        const mapped: EventItem[] = []
        for (const r of rows) {
          const s = new Date(r.start_time)
          const e = new Date(r.end_time)

          if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
            console.warn("[Dashboard] Skipping event with invalid times:", r)
            continue
          }

          mapped.push({
            id: String(r.id),
            title: r.name,
            description: r.description ?? "",
            start: s.toISOString(),
            end: e.toISOString(),
            location: r.location ?? "TBD",
            attendees: [],
          })
        }

        if (!alive) return

        // ✅ DB-only behavior:
        // Show exactly what DB returns (even if empty). No sample fallback.
        setEvents(mapped)
      } catch (e: any) {
        console.warn("[Dashboard] Failed to fetch db events:", e)
        if (!alive) return
        setEventsError(e?.message ?? "Failed to fetch events")
        setEvents([]) // ✅ DB-only
      } finally {
        if (alive) setEventsLoading(false)
      }
    }

    loadEvents()

    // Optional polling: uncomment if you want it to auto-update without refresh.
    // const t = setInterval(loadEvents, 30_000)
    // return () => {
    //   alive = false
    //   clearInterval(t)
    // }

    return () => {
      alive = false
    }
  }, [refreshTick])

  // ------- DB: Load registrations for this user (no-store + robust mapping) -------
  useEffect(() => {
    if (!user?.sub) return
    let alive = true

    async function loadRegistrations() {
      setRegsLoading(true)
      setRegsError(null)

      try {
        console.log("[Dashboard] Fetching /api/registrations ...")
        const res = await fetch("/api/registrations", { method: "GET", cache: "no-store" })
        console.log("[Dashboard] /api/registrations status:", res.status)

        const json = await res.json().catch(() => null)
        console.log("[Dashboard] /api/registrations json:", json)

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || `Failed to load registrations (status ${res.status})`)
        }

        const rows: DbRegistrationRow[] = json.registrations ?? []

        const mapped: Registration[] = rows
          .map((r) => {
            const displayName = r.display_name || user?.name || user?.email || "User"

            // Option A: joined event fields
            if (r.event_name && r.start_time && r.end_time) {
              const s = new Date(r.start_time)
              const e = new Date(r.end_time)
              if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
                console.warn("[Dashboard] Skipping registration with invalid joined times:", r)
                return null
              }

              const ev: EventItem = {
                id: String(r.event_id),
                title: r.event_name,
                description: r.description ?? "",
                start: s.toISOString(),
                end: e.toISOString(),
                location: r.location ?? "TBD",
                attendees: [],
              }
              return { event: ev, name: displayName }
            }

            // Option B: event_id only -> lookup from events state
            const ev = events.find((e) => e.id === String(r.event_id))
            if (!ev) {
              // If events haven't loaded yet, this can temporarily happen.
              return null
            }
            return { event: ev, name: displayName }
          })
          .filter(Boolean) as Registration[]

        if (!alive) return
        setRegistrations(mapped)
      } catch (e: any) {
        console.warn("[Dashboard] Failed to fetch registrations:", e)
        if (!alive) return
        setRegsError(e?.message ?? "Failed to fetch registrations")
        setRegistrations([])
      } finally {
        if (alive) setRegsLoading(false)
      }
    }

    loadRegistrations()
    return () => {
      alive = false
    }
  }, [user?.sub, user?.name, user?.email, events, refreshTick])

  const registeredEvents = useMemo(() => registrations.map((r) => r.event), [registrations])

  function HoursCalendar({ events }: { events: EventItem[] }) {
    const now = new Date()
    const slots = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now)
      d.setHours(now.getHours() + i, 0, 0, 0)
      return d
    })

    return (
      <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
        {slots.map((slot) => {
          const overlapping = events.filter((ev) => {
            const s = new Date(ev.start).getTime()
            const eTime = new Date(ev.end).getTime()
            const t = slot.getTime()
            return s <= t && t < eTime
          })

          return (
            <div
              key={slot.toISOString()}
              className={`flex justify-between items-center p-1 rounded ${
                overlapping.length ? "bg-indigo-100" : ""
              }`}
            >
              <span>{slot.toLocaleTimeString(undefined, { hour: "numeric", hour12: true })}</span>
              {overlapping.map((ev) => (
                <span key={ev.id} className="ml-2 font-medium">
                  {ev.title}
                </span>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  function canRegister(event: EventItem) {
    return !registeredEvents.some((reg) => overlaps(reg, event))
  }

  async function handleRegister(ev: EventItem) {
    setWarning(null)
    if (!user?.sub) return

    if (!canRegister(ev)) {
      setWarning("This event overlaps with one of your registered events.")
      return
    }

    try {
      const displayName = user?.name || user?.email || "(unknown)"

      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          eventId: Number(ev.id),
          displayName,
        }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Failed to register (status ${res.status})`)
      }

      // Refresh registrations from DB (source of truth)
      setRefreshTick((x) => x + 1)
    } catch (e: any) {
      console.warn("register failed:", e)
      setWarning(e?.message ?? "Failed to register")
    }
  }

  async function handleUnregister(eventId: string) {
    if (!user?.sub) return
    setWarning(null)

    try {
      const res = await fetch(`/api/registrations?eventId=${encodeURIComponent(eventId)}`, {
        method: "DELETE",
        cache: "no-store",
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Failed to remove (status ${res.status})`)
      }

      // Refresh registrations from DB (source of truth)
      setRefreshTick((x) => x + 1)
    } catch (e: any) {
      console.warn("unregister failed:", e)
      setWarning(e?.message ?? "Failed to remove registration")
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <img src="/logo.png" alt="EventU" className="h-12 mb-2" />

          {error && <p className="text-sm text-destructive">Auth error: {String(error)}</p>}

          {user && (
            <p className="text-sm text-muted-foreground">
              Signed in as {user.name || user.email}
            </p>
          )}

          {eventsLoading && <p className="text-sm text-muted-foreground mt-1">Loading events…</p>}
          {eventsError && (
            <p className="text-sm text-destructive mt-1">Couldn’t load DB events: {eventsError}</p>
          )}

          {regsLoading && user && <p className="text-sm text-muted-foreground mt-1">Loading your registrations…</p>}
          {regsError && user && (
            <p className="text-sm text-destructive mt-1">Couldn’t load registrations: {regsError}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshTick((x) => x + 1)}
            disabled={eventsLoading || regsLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <main className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Available Events</h2>
            <div className="text-sm text-muted-foreground">Auto-generated weekly list (Sunday 8PM CST)</div>
          </div>

          {events.length === 0 && !eventsLoading && !eventsError && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              No events found in the database.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              const already = registrations.some((r) => r.event.id === ev.id)
              return (
                <Card key={ev.id}>
                  <CardHeader>
                    <CardTitle>{ev.title}</CardTitle>
                    <CardDescription>{ev.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{ev.description}</p>
                    <p className="mt-3 text-sm">{formatTimeRange(ev)}</p>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <div className="text-sm">{(ev.attendees || []).length} attending</div>
                    <div>
                      <Button
                        size="sm"
                        onClick={() => handleRegister(ev)}
                        disabled={already || !user || isLoading}
                        variant={already ? "outline" : "default"}
                      >
                        {already ? "Registered" : "Register"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </main>

        <aside className="w-80">
          <div className="sticky top-6 space-y-3">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold">Your Schedule</h3>
              <HoursCalendar events={registeredEvents} />
              <p className="text-sm text-muted-foreground">Registered events (no overlaps allowed)</p>

              <div className="mt-3 space-y-2">
                {!user && <div className="text-sm text-muted-foreground">Sign in to see your schedule.</div>}

                {user && registrations.length === 0 && (
                  <div className="text-sm text-muted-foreground">No events yet</div>
                )}

                {registrations.map((r) => (
                  <div key={r.event.id} className="flex items-start justify-between gap-2 border rounded-md p-2">
                    <div>
                      <div className="font-medium text-sm">{r.event.title}</div>
                      <div className="text-xs text-muted-foreground">{formatTimeRange(r.event)}</div>
                      <div className="text-xs text-muted-foreground">You: {r.name}</div>
                    </div>
                    <div>
                      <Button size="sm" variant="ghost" onClick={() => handleUnregister(r.event.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {warning && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {warning}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}