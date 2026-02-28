//           const clampedEnd = Math.min(endM, visibleEnd)

//           if (clampedEnd <= clampedStart) return null // not visible in this day view range

//           const top = ((clampedStart - visibleStart) / 60) * hourHeight
//           const height = Math.max(20, ((clampedEnd - clampedStart) / 60) * hourHeight)

//           return (
//             <div
//               key={ev.id}
//               className="absolute left-2 right-2 rounded-md bg-primary/90 text-white p-2 text-sm overflow-hidden"
//               style={{ top, height }}
//               title={`${ev.title} — ${formatTimeRange(ev)}`}
//             >
//               <div className="font-medium">{ev.title}</div>
//               <div className="text-xs opacity-80">{formatTimeRange(ev)}</div>
//             </div>
//           )
//         })}
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen p-6">
//       <h1 className="text-2xl font-semibold mb-4">EventU — Dashboard</h1>
//       <div className="flex gap-6">
//         <main className="flex-1 space-y-4">
//           {/* If a day is focused, show only the focused day view (replace dashboard content) */}
//           {focusedDay !== null ? (
//             <div>
//               <div className="flex items-center justify-between">
//                 <h2 className="text-lg font-medium">Day view — {weekDays[focusedDay]}</h2>
//                 <div>
//                   <Button size="sm" variant="ghost" onClick={() => setFocusedDay(null)}>
//                     Back to Dashboard
//                   </Button>
//                 </div>
//               </div>
//               <div className="mt-2">{renderDayViewSlots(focusedDay)}</div>
//             </div>
//           ) : (
//             <div>
//               <h2 className="text-lg font-medium">Day view — {weekDays[selectedDay]}</h2>
//               <div className="mt-2">{renderDayViewSlots(selectedDay)}</div>

//               <div className="mt-6">
//                 <div className="flex items-center justify-between">
//                   <h2 className="text-lg font-medium">Available Events</h2>
//                   <div className="text-sm text-muted-foreground">Auto-generated weekly list (Sunday 8PM CST)</div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//                   {events.map((ev) => {
//                     const already = registrations.some((r) => r.event.id === ev.id)
//                     return (
//                       <Card key={ev.id}>
//                         <CardHeader>
//                           <CardTitle>{ev.title}</CardTitle>
//                           <CardDescription>{ev.location}</CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                           <p className="text-sm text-muted-foreground">{ev.description}</p>
//                           <p className="mt-3 text-sm">{formatTimeRange(ev)}</p>
//                         </CardContent>
//                         <CardFooter className="justify-between">
//                           <div className="text-sm">{(ev.attendees || []).length} attending</div>
//                           <div>
//                             <Button
//                               size="sm"
//                               onClick={() => handleRegister(ev)}
//                               disabled={already}
//                               variant={already ? "outline" : "default"}
//                             >
//                               {already ? "Registered" : "Register"}
//                             </Button>
//                           </div>
//                         </CardFooter>
//                       </Card>
//                     )
//                   })}
//                 </div>
//               </div>
//             </div>
//           )}
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
//                         disabled={already}
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
//               <h3 className="font-semibold">Week</h3>
//               <p className="text-sm text-muted-foreground">Click a day to view 10am–10pm</p>

//               <div className="mt-3 space-y-2">
//                 {weekDays.map((d, i) => {
//                   const count = eventsForWeekdayIndex(i).length
//                   const isSelected = i === selectedDay
//                   return (
//                     <button
//                       key={d}
//                       onClick={() => setSelectedDay(i)}
//                       className={`w-full text-left flex items-center justify-between p-2 rounded-md ${isSelected ? "bg-primary/10" : "hover:bg-accent/5"}`}
//                     >
//                       <div className="font-medium">{d}</div>
//                       <div className="text-sm text-muted-foreground">{count}</div>
//                     </button>
//                   )
//                 })}
//               </div>
//             </div>

//             <div className="rounded-lg border bg-card p-4">
//               <h3 className="font-semibold">Your Schedule</h3>
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
//                       <Button size="sm" variant="ghost" onClick={() => handleUnregister(r.event.id)}>Remove</Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {warning && (
//               <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{warning}</div>
//             )}
//           </div>
//         </aside>
//       </div>
//     </div>
//   )
// }


// client-side dashboard page with auth and calendar

"use client"

import React, { useEffect, useMemo, useState } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useUser } from "@auth0/nextjs-auth0/client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { sampleEvents, EventItem, overlaps, formatTimeRange } from "@/lib/events"
import Image from "next/image"


type Registration = {
  event: EventItem
  name: string
}

const STORAGE_KEY_BASE = "eventu:registrations"

export default function DashboardPage() {
  const { user, error, isLoading } = useUser()
  const [events] = useState<EventItem[]>(() => sampleEvents())
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const key = `${STORAGE_KEY_BASE}:${user.sub}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) setRegistrations(JSON.parse(raw))
    } catch (e) {
      console.warn("failed to load registrations", e)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const key = `${STORAGE_KEY_BASE}:${user.sub}`
    try {
      localStorage.setItem(key, JSON.stringify(registrations))
    } catch (e) {
      console.warn("failed to save registrations", e)
    }
  }, [registrations, user])

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
          const overlapping = events.filter((e) => {
            const s = new Date(e.start).getTime()
            const eTime = new Date(e.end).getTime()
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
              {overlapping.map((e) => (
                <span key={e.id} className="ml-2 font-medium">
                  {e.title}
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

  function handleRegister(ev: EventItem) {
    setWarning(null)
    if (!canRegister(ev)) {
      setWarning("This event overlaps with one of your registered events.")
      return
    }
    const name = user?.name || user?.email || "(unknown)"
    setRegistrations((prev) => [...prev, { event: ev, name }])
  }

  function handleUnregister(id: string) {
    setRegistrations((prev) => prev.filter((r) => r.event.id !== id))
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        <div className="flex justify-center">
          <Image
        src="/logo.png"
        alt="EventU Logo"
        width={300}
        height={300}
        priority
          />
        </div>
        {user && (
          <span className="block text-sm text-muted-foreground mt-1">
            Signed in as {user.name || user.email}
          </span>
        )}
      </h1>
      <div className="flex gap-6">
        <main className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Available Events</h2>
            <div className="text-sm text-muted-foreground">
              Auto-generated weekly list (Sunday 8PM CST)
            </div>
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
                    <p className="text-sm text-muted-foreground">
                      {ev.description}
                    </p>
                    <p className="mt-3 text-sm">{formatTimeRange(ev)}</p>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <div className="text-sm">
                      {(ev.attendees || []).length} attending
                    </div>
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
              <p className="text-sm text-muted-foreground">
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
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnregister(r.event.id)}
                      >
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
