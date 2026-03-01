// "use client"

// import React, { useEffect, useMemo, useState } from "react"
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// import { useUser } from "@auth0/nextjs-auth0/client"
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { sampleEvents, EventItem, overlaps, formatTimeRange } from "@/lib/events"

// type Registration = {
//   event: EventItem
//   name: string
// }

// const STORAGE_KEY_BASE = "eventu:registrations"

// type DbEventRow = {
//   id: number
//   name: string
//   start_time: string
//   end_time: string
//   location: string | null
// }

// export default function DashboardPage() {
//   const { user, error, isLoading } = useUser()

//   // ✅ make events dynamic (db-backed)
//   const [events, setEvents] = useState<EventItem[]>([])
//   const [eventsLoading, setEventsLoading] = useState(false)
//   const [eventsError, setEventsError] = useState<string | null>(null)

//   const [registrations, setRegistrations] = useState<Registration[]>([])
//   const [warning, setWarning] = useState<string | null>(null)

//   // Load registrations from localStorage per user
//   useEffect(() => {
//     if (!user) return
//     const key = `${STORAGE_KEY_BASE}:${user.sub}`
//     try {
//       const raw = localStorage.getItem(key)
//       if (raw) setRegistrations(JSON.parse(raw))
//     } catch (e) {
//       console.warn("failed to load registrations", e)
//     }
//   }, [user])

//   // Save registrations
//   useEffect(() => {
//     if (!user) return
//     const key = `${STORAGE_KEY_BASE}:${user.sub}`
//     try {
//       localStorage.setItem(key, JSON.stringify(registrations))
//     } catch (e) {
//       console.warn("failed to save registrations", e)
//     }
//   }, [registrations, user])

//   // ✅ Fetch events from DB on page load (and when user loads, optional)
//   useEffect(() => {
//     let alive = true

//     async function loadEvents() {
//       setEventsLoading(true)
//       setEventsError(null)

//       try {
//         // You can filter by date window later. Start simple: get all.
// 		useEffect(() => {
//   console.log("Dashboard mounted");

//   async function loadEvents() {
//     console.log("About to fetch events");

//     const res = await fetch("/api/events", { method: "GET" })
//     console.log("fetch /api/events response:", res)

//     const json = await res.json()
//     console.log("json:", json)
//   }

//   loadEvents()
// }, [])
//         const res = await fetch("/api/events", { method: "GET" })
// 		console.log("fetch /api/events", res);
//         const json = await res.json()

//         if (!res.ok || !json?.ok) {
//           throw new Error(json?.error || "Failed to load events")
//         }

//         const rows: DbEventRow[] = json.events ?? []

//         // Map DB row -> EventItem used by your UI
//         const mapped: EventItem[] = rows.map((r) => ({
//           id: String(r.id),
//           title: r.name,
//           description: "", // you can add later if you add a column
//           start: new Date(r.start_time).toISOString(),
//           end: new Date(r.end_time).toISOString(),
//           location: r.location ?? "TBD",
//           attendees: [], // you can fill later if you store registrations in DB
//         }))

//         if (alive) setEvents(mapped.length ? mapped : sampleEvents())
//       } catch (e: any) {
//         console.warn("Failed to fetch db events:", e)
//         if (alive) {
//           setEventsError(e?.message ?? "Failed to fetch events")
//           // fallback to sample events so UI still works
//           setEvents(sampleEvents())
//         }
//       } finally {
//         if (alive) setEventsLoading(false)
//       }
//     }

//     loadEvents()
//     return () => {
//       alive = false
//     }
//   }, [])

//   const registeredEvents = useMemo(() => registrations.map((r) => r.event), [registrations])

//   function HoursCalendar({ events }: { events: EventItem[] }) {
//     const now = new Date()
//     const slots = Array.from({ length: 7 }).map((_, i) => {
//       const d = new Date(now)
//       d.setHours(now.getHours() + i, 0, 0, 0)
//       return d
//     })

//     return (
//       <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
//         {slots.map((slot) => {
//           const overlapping = events.filter((e) => {
//             const s = new Date(e.start).getTime()
//             const eTime = new Date(e.end).getTime()
//             const t = slot.getTime()
//             return s <= t && t < eTime
//           })
//           return (
//             <div
//               key={slot.toISOString()}
//               className={`flex justify-between items-center p-1 rounded ${overlapping.length ? "bg-indigo-100" : ""}`}
//             >
//               <span>{slot.toLocaleTimeString(undefined, { hour: "numeric", hour12: true })}</span>
//               {overlapping.map((e) => (
//                 <span key={e.id} className="ml-2 font-medium">
//                   {e.title}
//                 </span>
//               ))}
//             </div>
//           )
//         })}
//       </div>
//     )
//   }

//   function canRegister(event: EventItem) {
//     return !registeredEvents.some((reg) => overlaps(reg, event))
//   }

//   function handleRegister(ev: EventItem) {
//     setWarning(null)
//     if (!canRegister(ev)) {
//       setWarning("This event overlaps with one of your registered events.")
//       return
//     }

//     const name = user?.name || user?.email || "(unknown)"
//     setRegistrations((prev) => [...prev, { event: ev, name }])
//   }

//   function handleUnregister(id: string) {
//     setRegistrations((prev) => prev.filter((r) => r.event.id !== id))
//   }

//   return (
//     <div className="min-h-screen p-6">
//       <div className="mb-4">
//         <img src="/logo.png" alt="EventU" className="h-12 mb-2" />
//         {user && (
//           <p className="text-sm text-muted-foreground">
//             Signed in as {user.name || user.email}
//           </p>
//         )}
//         {eventsLoading && <p className="text-sm text-muted-foreground mt-1">Loading events…</p>}
//         {eventsError && <p className="text-sm text-destructive mt-1">Couldn’t load DB events: {eventsError}</p>}
//       </div>

//       <div className="flex gap-6">
//         <main className="flex-1 space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-medium">Available Events</h2>
//             <div className="text-sm text-muted-foreground">Auto-generated weekly list (Sunday 8PM CST)</div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {events.map((ev) => {
//               const already = registrations.some((r) => r.event.id === ev.id)
//               return (
//                 <Card key={ev.id}>
//                   <CardHeader>
//                     <CardTitle>{ev.title}</CardTitle>
//                     <CardDescription>{ev.location}</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm text-muted-foreground">{ev.description}</p>
//                     <p className="mt-3 text-sm">{formatTimeRange(ev)}</p>
//                   </CardContent>
//                   <CardFooter className="justify-between">
//                     <div className="text-sm">{(ev.attendees || []).length} attending</div>
//                     <div>
//                       <Button
//                         size="sm"
//                         onClick={() => handleRegister(ev)}
//                         disabled={already || !user || isLoading}
//                         variant={already ? "outline" : "default"}
//                       >
//                         {already ? "Registered" : "Register"}
//                       </Button>
//                     </div>
//                   </CardFooter>
//                 </Card>
//               )
//             })}
//           </div>
//         </main>

//         <aside className="w-80">
//           <div className="sticky top-6 space-y-3">
//             <div className="rounded-lg border bg-card p-4">
//               <h3 className="font-semibold">Your Schedule</h3>
//               <HoursCalendar events={registeredEvents} />
//               <p className="text-sm text-muted-foreground">Registered events (no overlaps allowed)</p>

//               <div className="mt-3 space-y-2">
//                 {registrations.length === 0 && <div className="text-sm text-muted-foreground">No events yet</div>}
//                 {registrations.map((r) => (
//                   <div key={r.event.id} className="flex items-start justify-between gap-2 border rounded-md p-2">
//                     <div>
//                       <div className="font-medium text-sm">{r.event.title}</div>
//                       <div className="text-xs text-muted-foreground">{formatTimeRange(r.event)}</div>
//                       <div className="text-xs text-muted-foreground">You: {r.name}</div>
//                     </div>
//                     <div>
//                       <Button size="sm" variant="ghost" onClick={() => handleUnregister(r.event.id)}>
//                         Remove
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {warning && (
//               <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
//                 {warning}
//               </div>
//             )}
//           </div>
//         </aside>
//       </div>
//     </div>
//   )
// }

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
  id: number
  event_id: number
  user_sub: string
  display_name: string | null
  // optional extras
  event_name?: string | null
  start_time?: string | null
  end_time?: string | null
  location?: string | null
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

  // ------- DB: Load events -------
  useEffect(() => {
    let alive = true

    async function loadEvents() {
      setEventsLoading(true)
      setEventsError(null)

      try {
        console.log("[Dashboard] Fetching /api/events ...")
        const res = await fetch("/api/events", { method: "GET" })
        console.log("[Dashboard] /api/events status:", res.status)

        const json = await res.json().catch(() => null)
        console.log("[Dashboard] /api/events json:", json)

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || `Failed to load events (status ${res.status})`)
        }

        const rows: DbEventRow[] = json.events ?? []

        const mapped: EventItem[] = rows.map((r) => ({
          id: String(r.id),
          title: r.name,
          description: r.description ?? "",
          start: new Date(r.start_time).toISOString(),
          end: new Date(r.end_time).toISOString(),
          location: r.location ?? "TBD",
          attendees: [], // fill later if you add attendee counts to /api/events
        }))

        if (!alive) return
        setEvents(mapped.length ? mapped : (Array.isArray(sampleEvents) ? sampleEvents : []))
      } catch (e: any) {
        console.warn("[Dashboard] Failed to fetch db events:", e)
        if (!alive) return
        setEventsError(e?.message ?? "Failed to fetch events")
        // optional fallback so UI isn't empty
        setEvents(Array.isArray(sampleEvents) ? sampleEvents : [])
      } finally {
        if (alive) setEventsLoading(false)
      }
    }

    loadEvents()
    return () => {
      alive = false
    }
  }, [])

  // ------- DB: Load registrations for this user -------
  useEffect(() => {
    if (!user?.sub) return

    let alive = true

    async function loadRegistrations() {
      setRegsLoading(true)
      setRegsError(null)

      try {
        console.log("[Dashboard] Fetching /api/registrations ...")
        const res = await fetch("/api/registrations", { method: "GET" })
        console.log("[Dashboard] /api/registrations status:", res.status)

        const json = await res.json().catch(() => null)
        console.log("[Dashboard] /api/registrations json:", json)

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || `Failed to load registrations (status ${res.status})`)
        }

        const rows: DbRegistrationRow[] = json.registrations ?? []

        // You have two options:
        // A) /api/registrations returns joined event fields (event_name, start_time, etc.) -> we can map directly
        // B) /api/registrations returns only event_id -> we lookup event from `events` state

        const mapped: Registration[] = rows
          .map((r) => {
            const displayName = r.display_name || user?.name || user?.email || "User"

            // If API returns joined event info, use it. Otherwise lookup from `events`.
            let ev: EventItem | undefined

            if (r.event_name && r.start_time && r.end_time) {
              ev = {
                id: String(r.event_id),
                title: r.event_name,
                description: "",
                start: new Date(r.start_time).toISOString(),
                end: new Date(r.end_time).toISOString(),
                location: r.location ?? "TBD",
                attendees: [],
              }
            } else {
              ev = events.find((e) => e.id === String(r.event_id))
            }

            if (!ev) return null
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
    // re-run when events load too, so we can resolve event_id lookups
  }, [user?.sub, user?.name, user?.email, events])

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
        body: JSON.stringify({
          eventId: Number(ev.id),
          displayName,
        }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Failed to register (status ${res.status})`)
      }

      // Refresh registrations from DB
      // (simple + consistent; you can optimize later)
      const refetch = await fetch("/api/registrations", { method: "GET" })
      const refJson = await refetch.json().catch(() => null)
      if (refetch.ok && refJson?.ok) {
        // trigger mapping by updating registrations via effect dependency
        // easiest: just set a local state from returned rows if your API returns joined events
        // but we'll rely on the effect by forcing events to stay same; so just do manual mapping here:
        // Instead, simplest: reload the page section by calling the same effect logic? We'll do a quick local update:
      }

      // easiest local update (still DB-backed because POST succeeded)
      setRegistrations((prev) => [...prev, { event: ev, name: displayName }])
    } catch (e: any) {
      console.warn("register failed:", e)
      setWarning(e?.message ?? "Failed to register")
    }
  }

  async function handleUnregister(eventId: string) {
    if (!user?.sub) return

    try {
      const res = await fetch(`/api/registrations?eventId=${encodeURIComponent(eventId)}`, {
        method: "DELETE",
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Failed to remove (status ${res.status})`)
      }

      // Update UI
      setRegistrations((prev) => prev.filter((r) => r.event.id !== eventId))
    } catch (e: any) {
      console.warn("unregister failed:", e)
      setWarning(e?.message ?? "Failed to remove registration")
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-4">
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

      <div className="flex gap-6">
        <main className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Available Events</h2>
            <div className="text-sm text-muted-foreground">Auto-generated weekly list (Sunday 8PM CST)</div>
          </div>

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