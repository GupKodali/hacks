// "use client"

// import React, { useEffect, useMemo, useState } from "react"
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// import { useUser } from "@auth0/nextjs-auth0/client"
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { sampleEvents, EventItem, overlaps, formatTimeRange } from "@/lib/events"
// import Image from "next/image"

// // ✅ shadcn dialog (adjust import path if yours differs)
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"

// type Registration = {
//   event: EventItem
//   name: string
// }

// const STORAGE_KEY_BASE = "eventu:registrations"

// export default function DashboardPage() {
//   const { user, error, isLoading } = useUser()
//   const [events] = useState<EventItem[]>(() => sampleEvents())
//   const [registrations, setRegistrations] = useState<Registration[]>([])
//   const [warning, setWarning] = useState<string | null>(null)

//   const [jumpOpen, setJumpOpen] = useState(false)

//   const [nowTick, setNowTick] = useState<number>(() => Date.now())
//   useEffect(() => {
//     const t = setInterval(() => setNowTick(Date.now()), 30_000)
//     return () => clearInterval(t)
//   }, [])

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

//   useEffect(() => {
//     if (!user) return
//     const key = `${STORAGE_KEY_BASE}:${user.sub}`
//     try {
//       localStorage.setItem(key, JSON.stringify(registrations))
//     } catch (e) {
//       console.warn("failed to save registrations", e)
//     }
//   }, [registrations, user])

//   const registeredEvents = useMemo(() => registrations.map((r) => r.event), [registrations])

//   // --- Time logic for 1PM + "rest of day" ---
//   const now = useMemo(() => new Date(nowTick), [nowTick])
//   const isPast1PM = useMemo(() => {
//     const one = new Date(now)
//     one.setHours(13, 0, 0, 0) // 1:00 PM
//     return now.getTime() >= one.getTime()
//   }, [now])

//   const endOfDay = useMemo(() => {
//     const eod = new Date(now)
//     eod.setHours(23, 59, 59, 999)
//     return eod
//   }, [now])

//   // ✅ events we can hop into for the rest of today (starting now until end of day)
//   const jumpInEvents = useMemo(() => {
//     const nowMs = now.getTime()
//     const eodMs = endOfDay.getTime()
//     return events
//       .filter((ev) => {
//         const start = new Date(ev.start).getTime()
//         return start >= nowMs && start <= eodMs
//       })
//       .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
//   }, [events, now, endOfDay])

//   function HoursCalendar({ events }: { events: EventItem[] }) {
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
//               className={`flex justify-between items-center p-1 rounded ${
//                 overlapping.length ? "bg-indigo-100" : ""
//               }`}
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

//   // ✅ Jump-ins bypass overlap checks (by design)
//   function handleJumpIn(ev: EventItem) {
//     setWarning(null)

//     const already = registrations.some((r) => r.event.id === ev.id)
//     if (already) return

//     const conflicts = registeredEvents.some((reg) => overlaps(reg, ev))
//     if (conflicts) {
//       setWarning("Jump-in added an event that overlaps your schedule (allowed for Jump Ins).")
//     }

//     const name = user?.name || user?.email || "(unknown)"
//     setRegistrations((prev) => [...prev, { event: ev, name }])

//     // optional: close popup after joining
//     setJumpOpen(false)
//   }

//   function handleUnregister(id: string) {
//     setRegistrations((prev) => prev.filter((r) => r.event.id !== id))
//   }

//   return (
//     <div className="min-h-screen p-6">
//       <h1 className="text-2xl font-semibold mb-4 text-center">
//         <div className="flex justify-center">
//           <Image src="/logo.png" alt="EventU Logo" width={300} height={300} priority />
//         </div>
//         {user && (
//           <span className="block text-sm text-muted-foreground mt-1">
//             Signed in as {user.name || user.email}
//           </span>
//         )}
//       </h1>

//       <div className="flex gap-6">
//         <main className="flex-1 space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-medium">Available Events</h2>

//             <div className="text-sm text-muted-foreground">
//               Auto-generated weekly list (Sunday 8PM CST)
//             </div>
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
//                     <Button
//                       size="sm"
//                       onClick={() => handleRegister(ev)}
//                       disabled={already || !user || isLoading}
//                       variant={already ? "outline" : "default"}
//                     >
//                       {already ? "Registered" : "Register"}
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               )
//             })}
//           </div>
//         </main>

//         <aside className="w-80">
//           <div className="sticky top-6 space-y-3">
//             {/* ✅ MOVED HERE: Jump In button now above My Schedule */}
//             <Dialog open={jumpOpen} onOpenChange={setJumpOpen}>
//               <DialogTrigger asChild>
//                 <Button className="w-full" disabled={!user || isLoading} variant="default">
//                   Jump In Right Now
//                 </Button>
//               </DialogTrigger>

//               <DialogContent className="sm:max-w-2xl">
//                 <DialogHeader>
//                   <DialogTitle>Last Minute Jump Ins</DialogTitle>
//                   <DialogDescription>
//                     {now.toLocaleString(undefined, {
//                       weekday: "long",
//                       hour: "numeric",
//                       minute: "2-digit",
//                     })}
//                   </DialogDescription>
//                 </DialogHeader>

//                 {!isPast1PM ? (
//                   <div className="rounded-md border bg-muted/30 p-4 text-sm">
//                     <div className="font-medium">Daily last minute jump ins will be available at 1PM.</div>
//                     <div className="mt-1 text-muted-foreground">
//                       Come back after 1:00 PM to see games you can hop into for the rest of today.
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     <div className="text-sm text-muted-foreground">
//                       Available games for the rest of today (overlaps allowed).
//                     </div>

//                     {jumpInEvents.length === 0 ? (
//                       <div className="text-sm text-muted-foreground">
//                         Nothing scheduled for the rest of today.
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {jumpInEvents.map((ev) => {
//                           const already = registrations.some((r) => r.event.id === ev.id)
//                           const conflicts = registeredEvents.some((reg) => overlaps(reg, ev))

//                           return (
//                             <Card key={ev.id}>
//                               <CardHeader>
//                                 <CardTitle className="flex items-center justify-between">
//                                   <span>{ev.title}</span>
//                                   {conflicts && (
//                                     <span className="text-xs text-destructive">Conflicts</span>
//                                   )}
//                                 </CardTitle>
//                                 <CardDescription>{ev.location}</CardDescription>
//                               </CardHeader>
//                               <CardContent>
//                                 <p className="text-sm text-muted-foreground">{ev.description}</p>
//                                 <p className="mt-3 text-sm">{formatTimeRange(ev)}</p>
//                               </CardContent>
//                               <CardFooter className="justify-between">
//                                 <div className="text-sm">{(ev.attendees || []).length} attending</div>
//                                 <Button
//                                   size="sm"
//                                   onClick={() => handleJumpIn(ev)}
//                                   disabled={already || !user || isLoading}
//                                   variant={already ? "outline" : "default"}
//                                 >
//                                   {already ? "Added" : "Quick Join"}
//                                 </Button>
//                               </CardFooter>
//                             </Card>
//                           )
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </DialogContent>
//             </Dialog>

//             <div className="rounded-lg border bg-card p-4">
//               <h3 className="font-semibold">Your Schedule</h3>
//               <HoursCalendar events={registeredEvents} />
//               <p className="text-sm text-muted-foreground">
//                 Registered events (no overlaps allowed)
//               </p>

//               <div className="mt-3 space-y-2">
//                 {registrations.length === 0 && (
//                   <div className="text-sm text-muted-foreground">No events yet</div>
//                 )}
//                 {registrations.map((r) => (
//                   <div
//                     key={r.event.id}
//                     className="flex items-start justify-between gap-2 border rounded-md p-2"
//                   >
//                     <div>
//                       <div className="font-medium text-sm">{r.event.title}</div>
//                       <div className="text-xs text-muted-foreground">
//                         {formatTimeRange(r.event)}
//                       </div>
//                       <div className="text-xs text-muted-foreground">You: {r.name}</div>
//                     </div>
//                     <Button size="sm" variant="ghost" onClick={() => handleUnregister(r.event.id)}>
//                       Remove
//                     </Button>
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { sampleEvents, EventItem, overlaps, formatTimeRange } from "@/lib/events"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Registration = {
  event: EventItem
  name: string
}

const STORAGE_KEY_BASE = "eventu:registrations"

export default function DashboardPage() {
  const { user, isLoading } = useUser()
  const [events] = useState<EventItem[]>(() => sampleEvents())
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [warning, setWarning] = useState<string | null>(null)
  const [jumpOpen, setJumpOpen] = useState(false)

  const now = useMemo(() => new Date(), [])

  /* ------------------ Load + Save ------------------ */

  useEffect(() => {
    if (!user) return
    const key = `${STORAGE_KEY_BASE}:${user.sub}`
    const raw = localStorage.getItem(key)
    if (raw) setRegistrations(JSON.parse(raw))
  }, [user])

  useEffect(() => {
    if (!user) return
    const key = `${STORAGE_KEY_BASE}:${user.sub}`
    localStorage.setItem(key, JSON.stringify(registrations))
  }, [registrations, user])

  const registeredEvents = useMemo(
    () => registrations.map((r) => r.event),
    [registrations]
  )

  /* ------------------ Hour Overlay Calendar ------------------ */

  function HoursCalendar({ events }: { events: EventItem[] }) {
    const slots = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now)
      d.setMinutes(0, 0, 0)
      d.setHours(d.getHours() + i)
      return d
    })

    const ROW_H = 44
    const PAD_TOP = 8
    const LABEL_W = 72

    const startMs = slots[0].getTime()
    const endMs =
      new Date(slots[slots.length - 1]).getTime() + 60 * 60 * 1000

    const visibleEvents = useMemo(() => {
      return events
        .map((e) => {
          const s = new Date(e.start).getTime()
          const en = new Date(e.end).getTime()
          return { ...e, _s: s, _e: en }
        })
        .filter((e) => e._e > startMs && e._s < endMs)
        .sort((a, b) => a._s - b._s)
    }, [events, startMs, endMs])

    const totalH = slots.length * ROW_H + PAD_TOP * 2

    function clamp(n: number, a: number, b: number) {
      return Math.max(a, Math.min(b, n))
    }

    function yFromMs(ms: number) {
      const fracHours = (ms - startMs) / (60 * 60 * 1000)
      return PAD_TOP + fracHours * ROW_H
    }

    return (
      <div className="mt-2">
        <div
          className="relative rounded-md border bg-background overflow-hidden"
          style={{ height: totalH }}
        >
          {/* Hour Lines */}
          {slots.map((slot, idx) => {
            const top = PAD_TOP + idx * ROW_H
            return (
              <div
                key={slot.toISOString()}
                className="absolute left-0 right-0 flex items-center"
                style={{ top, height: ROW_H }}
              >
                <div className="px-2 text-xs text-muted-foreground w-[72px] shrink-0">
                  {slot.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    hour12: true,
                  })}
                </div>
                <div className="flex-1 border-t" />
              </div>
            )
          })}

          {/* Event Overlays */}
          {visibleEvents.map((ev) => {
            const start = clamp(ev._s, startMs, endMs)
            const end = clamp(ev._e, startMs, endMs)

            const top = yFromMs(start)
            const bottom = yFromMs(end)
            const height = Math.max(24, bottom - top)

            return (
              <div
                key={ev.id}
                className="absolute rounded-md border bg-indigo-100 text-indigo-900 shadow-sm px-2 py-1 text-xs"
                style={{
                  top,
                  left: LABEL_W + 8,
                  right: 8,
                  height,
                }}
                title={`${ev.title} • ${formatTimeRange(ev)}`}
              >
                <div className="font-medium leading-tight">
                  {ev.title}
                </div>
                <div className="text-[11px] opacity-80">
                  {new Date(ev.start).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" – "}
                  {new Date(ev.end).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ------------------ Register Logic ------------------ */

  function canRegister(event: EventItem) {
    return !registeredEvents.some((reg) => overlaps(reg, event))
  }

  function handleRegister(ev: EventItem) {
    setWarning(null)

    const already = registrations.some((r) => r.event.id === ev.id)
    if (already) return

    if (!canRegister(ev)) {
      setWarning("This event overlaps with one of your registered events.")
      return
    }

    const name = user?.name || user?.email || "(unknown)"
    setRegistrations((prev) => [...prev, { event: ev, name }])
  }

  function handleUnregister(id: string) {
    setRegistrations((prev) =>
      prev.filter((r) => r.event.id !== id)
    )
  }

  /* ------------------ UI ------------------ */

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        <div className="flex justify-center">
          <Image src="/logo.png" alt="EventU Logo" width={250} height={250} />
        </div>
        {user && (
          <span className="block text-sm text-muted-foreground mt-2">
            Signed in as {user.name || user.email}
          </span>
        )}
      </h1>

      <div className="flex gap-6">
        {/* Main Section */}
        <main className="flex-1 space-y-4">
          <h2 className="text-lg font-medium">Available Events</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              const already = registrations.some(
                (r) => r.event.id === ev.id
              )

              return (
                <Card key={ev.id}>
                  <CardHeader>
                    <CardTitle>{ev.title}</CardTitle>
                    <CardDescription>{ev.location}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {ev.description}
                    </p>
                    <p className="mt-3 text-sm">
                      {formatTimeRange(ev)}
                    </p>
                  </CardContent>

                  <CardFooter className="justify-between">
                    <div className="text-sm">
                      {(ev.attendees || []).length} attending
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleRegister(ev)}
                      disabled={already || !user || isLoading}
                      variant={already ? "outline" : "default"}
                    >
                      {already ? "Registered" : "Register"}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-2">Your Schedule</h3>

              <HoursCalendar events={registeredEvents} />

              <p className="text-sm text-muted-foreground mt-3">
                Registered events (no overlaps allowed)
              </p>

              <div className="mt-3 space-y-2">
                {registrations.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No events yet
                  </div>
                )}

                {registrations.map((r) => (
                  <div
                    key={r.event.id}
                    className="flex items-start justify-between gap-2 border rounded-md p-2"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {r.event.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeRange(r.event)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        You: {r.name}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleUnregister(r.event.id)
                      }
                    >
                      Remove
                    </Button>
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