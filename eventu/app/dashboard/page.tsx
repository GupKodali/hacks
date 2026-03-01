  // "use client"

  // import React, { useCallback, useEffect, useMemo, useState } from "react"
  // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // // @ts-ignore
  // import { useUser } from "@auth0/nextjs-auth0/client"
  // import Image from "next/image"

  // import {
  //   Card,
  //   CardHeader,
  //   CardTitle,
  //   CardDescription,
  //   CardContent,
  //   CardFooter,
  // } from "@/components/ui/card"
  // import { Button } from "@/components/ui/button"
  // import { Badge } from "@/components/ui/badge"
  // import { Separator } from "@/components/ui/separator"
  // import { Switch } from "@/components/ui/switch"
  // import { Input } from "@/components/ui/input"

  // import {
  //   Dialog,
  //   DialogContent,
  //   DialogDescription,
  //   DialogHeader,
  //   DialogTitle,
  //   DialogTrigger,
  // } from "@/components/ui/dialog"

  // import {
  //   sampleEvents,
  //   EventItem,
  //   overlaps,
  //   formatTimeRange,
  //   eventsHappeningToday,
  // } from "@/lib/events"

  // import LogoutButton from "@/components/LogoutButton"
  // import {
  //   CalendarDays,
  //   CheckCircle2,
  //   Clock,
  //   Compass,
  //   Info,
  //   MapPin,
  //   Sparkles,
  //   Target,
  //   User,
  //   Users,
  //   Zap,
  // } from "lucide-react"
  // import { JumpInTabMobile } from "./jump-in"
  // import { DiscoverTabMobile } from "./discover"
  // import { ProfileTabMobile } from "./profile"
  // import { WeekTabMobile } from "./week"
  // import { ScheduleTabMobile } from "./schedule"

  // type TabKey = "schedule" | "week" | "discover" | "jumpin" | "profile"

  // export type Registration = {
  //   event: EventItem
  //   name: string
  //   kind: "scheduled" | "manual" | "jumpin"
  //   createdAt: string
  // }

  // export type AvailabilityBlock = {
  //   day: number // 0..6
  //   hour: number // 0..23
  // }

  // const STORAGE_KEY_BASE = "eventu:registrations"
  // const AVAIL_KEY_BASE = "eventu:availability"


  // export default function DashboardPage() {
  //   const { user, error, isLoading } = useUser()
  //   const [events] = useState<EventItem[]>(() => sampleEvents())

  //   const [registrations, setRegistrations] = useState<Registration[]>([])
  //   const [availability, setAvailability] = useState<AvailabilityBlock[]>([])

  //   const [tab, setTab] = useState<TabKey>("schedule")
  //   const [warning, setWarning] = useState<string | null>(null)

  //   const [query, setQuery] = useState("")
  //   const [hideConflicts, setHideConflicts] = useState(true)

  //   const [nowTick, setNowTick] = useState<number>(() => Date.now())
  //   useEffect(() => {
  //     const t = setInterval(() => setNowTick(Date.now()), 30_000)
  //     return () => clearInterval(t)
  //   }, [])
  //   const now = useMemo(() => new Date(nowTick), [nowTick])

  //   const isPast1PM = useMemo(() => {
  //     const one = new Date(now)
  //     one.setHours(13, 0, 0, 0)
  //     return now.getTime() >= one.getTime()
  //   }, [now])

  //   // Load persisted registrations + availability
  //   useEffect(() => {
  //     if (!user) return
  //     const rKey = `${STORAGE_KEY_BASE}:${user.sub}`
  //     const aKey = `${AVAIL_KEY_BASE}:${user.sub}`

  //     try {
  //       const rawR = localStorage.getItem(rKey)
  //       if (rawR) setRegistrations(JSON.parse(rawR))
  //     } catch (e) {
  //       console.warn("failed to load registrations", e)
  //       setRegistrations([])
  //     }

  //     try {
  //       const rawA = localStorage.getItem(aKey)
  //       if (rawA) setAvailability(JSON.parse(rawA))
  //     } catch (e) {
  //       console.warn("failed to load availability", e)
  //       setAvailability([])
  //     }
  //   }, [user])

  //   // Save on change
  //   useEffect(() => {
  //     if (!user) return
  //     const rKey = `${STORAGE_KEY_BASE}:${user.sub}`
  //     try {
  //       localStorage.setItem(rKey, JSON.stringify(registrations))
  //     } catch (e) {
  //       console.warn("failed to save registrations", e)
  //     }
  //   }, [registrations, user])

  //   useEffect(() => {
  //     if (!user) return
  //     const aKey = `${AVAIL_KEY_BASE}:${user.sub}`
  //     try {
  //       localStorage.setItem(aKey, JSON.stringify(availability))
  //     } catch (e) {
  //       console.warn("failed to save availability", e)
  //     }
  //   }, [availability, user])

  //   const registeredEvents = useMemo(() => registrations.map((r) => r.event), [registrations])

  //   const attendingCountById = useMemo(() => {
  //     const map: Record<string, number> = {}
  //     for (const r of registrations) map[r.event.id] = (map[r.event.id] || 0) + 1
  //     return map
  //   }, [registrations])

  //   const jumpInEvents = useMemo(() => eventsHappeningToday(events, now), [events, now])

  //   const canRegister = useCallback(
  //     (event: EventItem) => !registeredEvents.some((reg) => overlaps(reg, event)),
  //     [registeredEvents]
  //   )

  //   // Availability matching
  //   const availSet = useMemo(() => {
  //     const s = new Set<string>()
  //     for (const b of availability) s.add(`${b.day}-${b.hour}`)
  //     return s
  //   }, [availability])

  //   function eventMatchesAvailability(ev: EventItem) {
  //     const start = new Date(ev.start)
  //     return availSet.has(`${start.getDay()}-${start.getHours()}`)
  //   }

  //   // Suggested schedule: up to 3 events that match availability and don't overlap
  //   const suggestedSchedule = useMemo(() => {
  //     const candidates = [...events]
  //       .filter((ev) => eventMatchesAvailability(ev))
  //       .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  //     const alreadyIds = new Set(registrations.map((r) => r.event.id))
  //     const picked: EventItem[] = []
  //     for (const ev of candidates) {
  //       if (alreadyIds.has(ev.id)) continue
  //       const conflictPicked = picked.some((p) => overlaps(p, ev))
  //       const conflictRegistered = registeredEvents.some((r) => overlaps(r, ev))
  //       if (conflictPicked || conflictRegistered) continue
  //       picked.push(ev)
  //       if (picked.length >= 3) break
  //     }
  //     return picked
  //   }, [events, registrations, registeredEvents, availSet])

  //   const myUpcoming = useMemo(() => {
  //     return [...registeredEvents].sort(
  //       (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  //     )
  //   }, [registeredEvents])

  //   const discoverEvents = useMemo(() => {
  //     const q = query.trim().toLowerCase()
  //     return events
  //       .filter((ev) => {
  //         if (!q) return true
  //         const hay = `${ev.title} ${ev.location} ${ev.description}`.toLowerCase()
  //         return hay.includes(q)
  //       })
  //       .filter((ev) => {
  //         if (!hideConflicts) return true
  //         return canRegister(ev) || registrations.some((r) => r.event.id === ev.id)
  //       })
  //   }, [events, query, hideConflicts, canRegister, registrations])

  //   const userReady = Boolean(user) && !isLoading

  //   const addRegistration = useCallback(
  //     (ev: EventItem, kind: Registration["kind"]) => {
  //       setWarning(null)
  //       if (!user) return

  //       const already = registrations.some((r) => r.event.id === ev.id)
  //       if (already) return

  //       if (kind !== "jumpin" && !canRegister(ev)) {
  //         setWarning("That overlaps with something already on your schedule.")
  //         return
  //       }

  //       if (kind === "jumpin") {
  //         const conflicts = registeredEvents.some((reg) => overlaps(reg, ev))
  //         if (conflicts) setWarning("Jump-in conflicts with your schedule (allowed for Jump Ins).")
  //       }

  //       const name = user?.name || user?.email || "(unknown)"
  //       setRegistrations((prev) => [
  //         ...prev,
  //         { event: ev, name, kind, createdAt: new Date().toISOString() },
  //       ])
  //     },
  //     [user, registrations, canRegister, registeredEvents]
  //   )

  //   const removeRegistration = useCallback((id: string) => {
  //     setRegistrations((prev) => prev.filter((r) => r.event.id !== id))
  //   }, [])

  //   const toggleAvailability = useCallback((day: number, hour: number) => {
  //     setAvailability((prev) => {
  //       const exists = prev.some((b) => b.day === day && b.hour === hour)
  //       if (exists) return prev.filter((b) => !(b.day === day && b.hour === hour))
  //       return [...prev, { day, hour }]
  //     })
  //   }, [])

  //   const quickSetAvailability = useCallback((preset: "weeknights" | "weekend" | "clear") => {
  //     if (preset === "clear") return setAvailability([])
  //     if (preset === "weeknights") {
  //       const blocks: AvailabilityBlock[] = []
  //       for (const day of [1, 2, 3, 4]) for (const hour of [18, 19, 20, 21]) blocks.push({ day, hour })
  //       return setAvailability(blocks)
  //     }
  //     if (preset === "weekend") {
  //       const blocks: AvailabilityBlock[] = []
  //       for (const day of [6, 0]) for (const hour of [10, 11, 12, 13, 14]) blocks.push({ day, hour })
  //       return setAvailability(blocks)
  //     }
  //   }, [])

  //   // Compact next-hours strip (mobile)
  //   function HoursStrip({ events }: { events: EventItem[] }) {
  //     const slots = Array.from({ length: 6 }).map((_, i) => {
  //       const d = new Date(now)
  //       d.setMinutes(0, 0, 0)
  //       d.setHours(now.getHours() + i)
  //       return d
  //     })

  //     return (
  //       <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
  //         {slots.map((slot) => {
  //           const slotStart = slot.getTime()
  //           const slotEnd = slotStart + 60 * 60 * 1000
  //           const overlapping = events.filter((ev) => {
  //             const s = new Date(ev.start).getTime()
  //             const e = new Date(ev.end).getTime()
  //             return s < slotEnd && e > slotStart
  //           })

  //           return (
  //             <div
  //               key={slot.toISOString()}
  //               className={`min-w-[120px] rounded-xl border px-3 py-2 text-xs ${
  //                 overlapping.length ? "bg-muted/40" : ""
  //               }`}
  //             >
  //               <div className="flex items-center gap-2 text-muted-foreground">
  //                 <Clock className="h-4 w-4" />
  //                 <span className="font-medium text-foreground">
  //                   {slot.toLocaleTimeString(undefined, { hour: "numeric", hour12: true })}
  //                 </span>
  //               </div>
  //               <div className="mt-2 space-y-1">
  //                 {overlapping.length ? (
  //                   overlapping.slice(0, 2).map((e) => (
  //                     <div key={e.id} className="truncate font-medium">
  //                       {e.title}
  //                     </div>
  //                   ))
  //                 ) : (
  //                   <div className="text-muted-foreground">Free</div>
  //                 )}
  //                 {overlapping.length > 2 && (
  //                   <div className="text-muted-foreground">+{overlapping.length - 2} more</div>
  //                 )}
  //               </div>
  //             </div>
  //           )
  //         })}
  //       </div>
  //     )
  //   }

  //   function EventCard({
  //     ev,
  //     mode,
  //   }: {
  //     ev: EventItem
  //     mode: "suggested" | "discover" | "jumpin" | "mine"
  //   }) {
  //     const existing = registrations.find((r) => r.event.id === ev.id)
  //     const already = Boolean(existing)
  //     const conflicts = registeredEvents.some((reg) => overlaps(reg, ev))
  //     const attending = (ev.attendees?.length || 0) + (attendingCountById[ev.id] || 0)

  //     const action = (() => {
  //       if (!user) return { label: "Sign in to join", disabled: true, onClick: () => {} }
  //       if (already) {
  //         if (mode === "mine") return { label: "Remove", disabled: isLoading, onClick: () => removeRegistration(ev.id) }
  //         return { label: "Added", disabled: true, onClick: () => {} }
  //       }
  //       if (mode === "jumpin") return { label: "Quick Join", disabled: isLoading, onClick: () => addRegistration(ev, "jumpin") }
  //       if (mode === "suggested") return { label: "Confirm", disabled: isLoading, onClick: () => addRegistration(ev, "scheduled") }
  //       return { label: "Register", disabled: isLoading || !canRegister(ev), onClick: () => addRegistration(ev, "manual") }
  //     })()

  //     return (
  //       <Card className="rounded-2xl">
  //         <CardHeader className="space-y-1 pb-3">
  //           <div className="flex items-start justify-between gap-2">
  //             <div className="min-w-0">
  //               <CardTitle className="text-base truncate">{ev.title}</CardTitle>
  //               <CardDescription className="mt-1 flex items-center gap-1 truncate">
  //                 <MapPin className="h-4 w-4" />
  //                 <span className="truncate">{ev.location}</span>
  //               </CardDescription>
  //             </div>

  //             {mode !== "mine" && conflicts && (
  //               <Badge variant={mode === "jumpin" ? "destructive" : "secondary"} className="shrink-0">
  //                 Conflict
  //               </Badge>
  //             )}
  //           </div>
  //         </CardHeader>

  //         <CardContent className="space-y-2 pt-0">
  //           <div className="text-sm text-muted-foreground line-clamp-2">{ev.description}</div>
  //           <div className="text-sm font-medium">{formatTimeRange(ev)}</div>

  //           <div className="flex items-center justify-between">
  //             <div className="text-xs text-muted-foreground">{attending} attending</div>
  //             {existing?.kind && (
  //               <Badge variant="outline" className="text-xs">
  //                 {existing.kind === "scheduled" ? "Scheduled" : existing.kind === "manual" ? "Manual" : "Jump In"}
  //               </Badge>
  //             )}
  //           </div>

  //           {mode === "discover" && !already && !canRegister(ev) && (
  //             <div className="text-xs text-muted-foreground">Overlaps your schedule</div>
  //           )}
  //         </CardContent>

  //         <CardFooter className="pt-3">
  //           <Button
  //             className="w-full rounded-xl"
  //             size="sm"
  //             variant={mode === "mine" ? "outline" : "default"}
  //             disabled={action.disabled}
  //             onClick={action.onClick}
  //           >
  //             {action.label}
  //           </Button>
  //         </CardFooter>
  //       </Card>
  //     )
  //   }

  //   function BottomNav() {
  //     return (
  //       <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/90 backdrop-blur">
  //         <div className="mx-auto grid max-w-5xl grid-cols-5 px-2 py-2">
  //           <BottomNavButton active={tab === "schedule"} onClick={() => setTab("schedule")} label="Schedule" icon={<Target className="h-5 w-5" />} />
  //           <BottomNavButton active={tab === "week"} onClick={() => setTab("week")} label="Week" icon={<CalendarDays className="h-5 w-5" />} />
  //           <BottomNavButton active={tab === "discover"} onClick={() => setTab("discover")} label="Discover" icon={<Compass className="h-5 w-5" />} />
  //           <BottomNavButton active={tab === "jumpin"} onClick={() => setTab("jumpin")} label="Jump In" icon={<Zap className="h-5 w-5" />} />
  //           <BottomNavButton active={tab === "profile"} onClick={() => setTab("profile")} label="Me" icon={<User className="h-5 w-5" />} />
  //         </div>
  //       </nav>
  //     )
  //   }

  //   return (
  //     <div className="min-h-screen bg-background">
  //       {/* Sticky header */}
  //       <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
  //         <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
  //           <div className="flex items-center gap-3">
  //             <Image src="/logo.png" alt="EventU Logo" width={110} height={32} priority />
  //             <Badge variant="secondary" className="hidden sm:inline-flex">
  //               {now.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
  //             </Badge>
  //           </div>

  //           <div className="flex items-center gap-2">
  //             {/* Info dialog */}
  //             <Dialog>
  //               <DialogTrigger asChild>
  //                 <Button variant="outline" size="sm" className="rounded-xl">
  //                   <Info className="h-4 w-4" />
  //                   <span className="ml-2 hidden sm:inline">What is this?</span>
  //                 </Button>
  //               </DialogTrigger>
  //               <DialogContent className="sm:max-w-2xl">
  //                 <DialogHeader>
  //                   <DialogTitle>What EventU is about</DialogTitle>
  //                   <DialogDescription>
  //                     A simple way to meet people through scheduled activities.
  //                   </DialogDescription>
  //                 </DialogHeader>

  //                 <div className="space-y-4 text-sm">
  //                   <div className="rounded-xl border bg-muted/20 p-4">
  //                     <div className="flex items-start gap-3">
  //                       <Sparkles className="mt-0.5 h-5 w-5 text-muted-foreground" />
  //                       <div>
  //                         <div className="font-medium">How it works</div>
  //                         <div className="mt-1 text-muted-foreground">
  //                           Based on all users' availability, we suggest a personalized schedule each week. You can also browse 
  //                           and join other activities that fit your schedule, or jump into last-minute games happening today.
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>

  //                   <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
  //                     <div className="rounded-xl border p-4">
  //                       <div className="flex items-center gap-2 font-medium">
  //                         <Users className="h-4 w-4" /> Meet new people
  //                       </div>
  //                       <div className="mt-1 text-muted-foreground">
  //                         Meet with communities in your area through shared activities. It's like a gym schedule, but for games and hobbies.
  //                       </div>
  //                     </div>

  //                     <div className="rounded-xl border p-4">
  //                       <div className="flex items-center gap-2 font-medium">
  //                         <Target className="h-4 w-4" /> Plan your week
  //                       </div>
  //                       <div className="mt-1 text-muted-foreground">
  //                         You’ll know your games ahead of time and how many people are in each one.
  //                       </div>
  //                     </div>

  //                     <div className="rounded-xl border p-4">
  //                       <div className="flex items-center gap-2 font-medium">
  //                         <Zap className="h-4 w-4" /> Jump Ins
  //                       </div>
  //                       <div className="mt-1 text-muted-foreground">
  //                         After 1PM, you can join last-minute games for the rest of today (overlaps not allowed).
  //                       </div>
  //                     </div>

  //                     <div className="rounded-xl border p-4">
  //                       <div className="flex items-center gap-2 font-medium">
  //                         <CheckCircle2 className="h-4 w-4" /> $5 commitment
  //                       </div>
  //                       <div className="mt-1 text-muted-foreground">
  //                         Everyone starts with a $5 commitment. If you don’t show up, it gets donated to charity. 
  //                         Showing up means more fun for you and everyone else, and supports the platform. We’ll never 
  //                         charge if you show up!
  //                       </div>
  //                     </div>
  //                   </div>

  //                   <Separator />

  //                   <div className="text-muted-foreground">
  //                     The goal is simple: less planning, more real games with real people.
  //                   </div>
  //                 </div>
  //               </DialogContent>
  //             </Dialog>

  //             <LogoutButton />
  //           </div>
  //         </div>

  //         <div className="mx-auto max-w-5xl px-4 pb-3">
  //           {user ? (
  //             <div className="text-xs text-muted-foreground">
  //               Signed in as <span className="font-medium">{user.name || user.email}</span>
  //             </div>
  //           ) : (
  //             <div className="text-xs text-muted-foreground">Sign in to set availability and get scheduled.</div>
  //           )}
  //         </div>
  //       </header>

  //       {/* Main */}
  //       <main className="mx-auto max-w-5xl px-4 pb-28 pt-4">
  //         {/* Hero */}
  //         {/* Tab content */}
  //         <div className="mt-4">
  //           {tab === "schedule" && (
  //             <ScheduleTabMobile
  //               userReady={userReady}
  //               availability={availability}
  //               onToggle={toggleAvailability}
  //               onQuickSet={quickSetAvailability}
  //               suggested={suggestedSchedule}
  //               onConfirm={(ev) => addRegistration(ev, "scheduled")}
  //             />
  //           )}

  //           {tab === "week" && (
  //             <WeekTabMobile
  //               now={now}
  //               registrations={registrations}
  //               myUpcoming={myUpcoming}
  //               onRemove={removeRegistration}
  //               calendar={<HoursStrip events={registeredEvents} />}
  //             />
  //           )}

  //           {tab === "discover" && (
  //             <DiscoverTabMobile
  //               query={query}
  //               setQuery={setQuery}
  //               hideConflicts={hideConflicts}
  //               setHideConflicts={setHideConflicts}
  //               events={discoverEvents}
  //               render={(ev) => <EventCard key={ev.id} ev={ev} mode="discover" />}
  //             />
  //           )}

  //           {tab === "jumpin" && (
  //             <JumpInTabMobile
  //               isPast1PM={isPast1PM}
  //               jumpInEvents={jumpInEvents}
  //               render={(ev) => <EventCard key={ev.id} ev={ev} mode="jumpin" />}
  //             />
  //           )}

  //           {tab === "profile" && <ProfileTabMobile />}
  //         </div>

  //         {/* Warnings/errors */}
  //         <div className="mt-4 space-y-2">
  //           {warning && (
  //             <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
  //               {warning}
  //             </div>
  //           )}
  //           {error && (
  //             <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
  //               {String(error)}
  //             </div>
  //           )}
  //         </div>
  //       </main>

  //       <BottomNav />
  //       <div className="h-6" />
  //     </div>
  //   )
  // }

  // function BottomNavButton({
  //   active,
  //   onClick,
  //   icon,
  //   label,
  // }: {
  //   active: boolean
  //   onClick: () => void
  //   icon: React.ReactNode
  //   label: string
  // }) {
  //   return (
  //     <button
  //       onClick={onClick}
  //       className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] ${
  //         active ? "bg-muted font-medium" : "text-muted-foreground"
  //       }`}
  //     >
  //       {icon}
  //       <span>{label}</span>
  //     </button>
  //   )
  // }

  // export function formatHour(h: number) {
  //   const hour12 = ((h + 11) % 12) + 1
  //   const ampm = h >= 12 ? "PM" : "AM"
  //   return `${hour12}${ampm}`
  // }

  "use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useUser } from "@auth0/nextjs-auth0/client"
import Image from "next/image"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { EventItem, overlaps, formatTimeRange, eventsHappeningToday } from "@/lib/events"

import LogoutButton from "@/components/LogoutButton"
import { CalendarDays, CheckCircle2, Clock, Compass, Info, MapPin, Sparkles, Target, User, Users, Zap } from "lucide-react"
import { JumpInTabMobile } from "./jump-in"
import { DiscoverTabMobile } from "./discover"
import { ProfileTabMobile } from "./profile"
import { WeekTabMobile } from "./week"
import { ScheduleTabMobile } from "./schedule"

type TabKey = "schedule" | "week" | "discover" | "jumpin" | "profile"

export type Registration = {
  event: EventItem
  name: string
  kind: "scheduled" | "manual" | "jumpin"
  createdAt: string
}

export type AvailabilityBlock = {
  day: number // 0..6
  hour: number // 0..23
}

// DB shapes (adjust to your API)
type DbEventRow = {
  id: number
  name: string
  start_time: string
  end_time: string
  location: string | null
  description?: string | null
  attending_count?: number | null // optional if you return it
}

type DbRegistrationRow = {
  id: number
  event_id: number
  user_sub: string
  display_name: string | null
  kind: "scheduled" | "manual" | "jumpin"
  created_at: string
  // If your registrations GET joins event info, include these:
  event_name?: string | null
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  description?: string | null
}

export default function DashboardPage() {
  const { user, error, isLoading } = useUser()

  // ✅ DB-backed events only
  const [events, setEvents] = useState<EventItem[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)

  // ✅ DB-backed registrations + availability only
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([])
  const [dataError, setDataError] = useState<string | null>(null)
  const [savingAvail, setSavingAvail] = useState(false)

  const [tab, setTab] = useState<TabKey>("schedule")
  const [warning, setWarning] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [hideConflicts, setHideConflicts] = useState(true)

  const [nowTick, setNowTick] = useState<number>(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])
  const now = useMemo(() => new Date(nowTick), [nowTick])

  const isPast1PM = useMemo(() => {
    const one = new Date(now)
    one.setHours(13, 0, 0, 0)
    return now.getTime() >= one.getTime()
  }, [now])

  const userReady = Boolean(user) && !isLoading

  // -----------------------
  // DB: Fetch events
  // -----------------------
  useEffect(() => {
    let alive = true

    async function loadEvents() {
      setEventsLoading(true)
      setEventsError(null)

      try {
        console.log("[Dashboard] GET /api/events")
        const res = await fetch("/api/events", { method: "GET" })
        const json = await res.json().catch(() => null)

        console.log("[Dashboard] /api/events status:", res.status, "json:", json)

        if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load events")

        const rows: DbEventRow[] = json.events ?? []

        const mapped: EventItem[] = rows.map((r) => ({
          id: String(r.id),
          title: r.name,
          description: r.description ?? "",
          start: new Date(r.start_time).toISOString(),
          end: new Date(r.end_time).toISOString(),
          location: r.location ?? "TBD",
          // If you return attending_count, you can show it via ev.attendees length pattern or add field later.
          attendees: r.attending_count ? Array.from({ length: r.attending_count }).map((_, i) => `db:${i}`) : [],
        }))

        if (!alive) return
        setEvents(mapped) // ✅ NO sample fallback
      } catch (e: any) {
        console.warn("[Dashboard] events load failed:", e)
        if (!alive) return
        setEventsError(e?.message ?? "Failed to load events")
        setEvents([]) // ✅ DB only
      } finally {
        if (alive) setEventsLoading(false)
      }
    }

    loadEvents()
    return () => {
      alive = false
    }
  }, [])

  // -----------------------
  // DB: Fetch user registrations + availability
  // -----------------------
  useEffect(() => {
    if (!user?.sub) return
    let alive = true

    async function loadUserData() {
      setDataError(null)
      try {
        console.log("[Dashboard] GET /api/registrations + /api/availability")

        const [rRes, aRes] = await Promise.all([
          fetch("/api/registrations", { method: "GET" }),
          fetch("/api/availability", { method: "GET" }),
        ])

        const rJson = await rRes.json().catch(() => null)
        const aJson = await aRes.json().catch(() => null)

        console.log("[Dashboard] /api/registrations:", rRes.status, rJson)
        console.log("[Dashboard] /api/availability:", aRes.status, aJson)

        if (!rRes.ok || !rJson?.ok) throw new Error(rJson?.error || "Failed to load registrations")
        if (!aRes.ok || !aJson?.ok) throw new Error(aJson?.error || "Failed to load availability")

        const regRows: DbRegistrationRow[] = rJson.registrations ?? []
        const availRows: AvailabilityBlock[] = aJson.availability ?? []

        // Map registrations:
        // Option A: your GET /api/registrations returns joined event fields (recommended)
        // Option B: returns only event_id -> we look up from events[]
        const mappedRegs: Registration[] = regRows
          .map((r) => {
            const name = r.display_name || user?.name || user?.email || "(unknown)"

            let ev: EventItem | undefined

            if (r.event_name && r.start_time && r.end_time) {
              ev = {
                id: String(r.event_id),
                title: r.event_name,
                description: r.description ?? "",
                start: new Date(r.start_time).toISOString(),
                end: new Date(r.end_time).toISOString(),
                location: r.location ?? "TBD",
                attendees: [],
              }
            } else {
              ev = events.find((e) => e.id === String(r.event_id))
            }

            if (!ev) return null

            return {
              event: ev,
              name,
              kind: r.kind,
              createdAt: r.created_at,
            }
          })
          .filter(Boolean) as Registration[]

        if (!alive) return
        setRegistrations(mappedRegs)
        setAvailability(Array.isArray(availRows) ? availRows : [])
      } catch (e: any) {
        console.warn("[Dashboard] user data load failed:", e)
        if (!alive) return
        setDataError(e?.message ?? "Failed to load your data")
        setRegistrations([])
        setAvailability([])
      }
    }

    loadUserData()
    return () => {
      alive = false
    }
    // re-run when events arrive so event_id lookups resolve if you don't join
  }, [user?.sub, user?.name, user?.email, events])

  const registeredEvents = useMemo(() => registrations.map((r) => r.event), [registrations])

  const jumpInEvents = useMemo(() => eventsHappeningToday(events, now), [events, now])

  const canRegister = useCallback(
    (event: EventItem) => !registeredEvents.some((reg) => overlaps(reg, event)),
    [registeredEvents]
  )

  // Availability matching
  const availSet = useMemo(() => {
    const s = new Set<string>()
    for (const b of availability) s.add(`${b.day}-${b.hour}`)
    return s
  }, [availability])

  function eventMatchesAvailability(ev: EventItem) {
    const start = new Date(ev.start)
    return availSet.has(`${start.getDay()}-${start.getHours()}`)
  }

  // Suggested schedule: up to 3 events that match availability and don't overlap
  const suggestedSchedule = useMemo(() => {
    const candidates = [...events]
      .filter((ev) => eventMatchesAvailability(ev))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    const alreadyIds = new Set(registrations.map((r) => r.event.id))
    const picked: EventItem[] = []
    for (const ev of candidates) {
      if (alreadyIds.has(ev.id)) continue
      const conflictPicked = picked.some((p) => overlaps(p, ev))
      const conflictRegistered = registeredEvents.some((r) => overlaps(r, ev))
      if (conflictPicked || conflictRegistered) continue
      picked.push(ev)
      if (picked.length >= 3) break
    }
    return picked
  }, [events, registrations, registeredEvents, availSet])

  const myUpcoming = useMemo(() => {
    return [...registeredEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [registeredEvents])

  const discoverEvents = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events
      .filter((ev) => {
        if (!q) return true
        const hay = `${ev.title} ${ev.location} ${ev.description}`.toLowerCase()
        return hay.includes(q)
      })
      .filter((ev) => {
        if (!hideConflicts) return true
        return canRegister(ev) || registrations.some((r) => r.event.id === ev.id)
      })
  }, [events, query, hideConflicts, canRegister, registrations])

  // -----------------------
  // DB: Write registrations
  // -----------------------
  const addRegistration = useCallback(
    async (ev: EventItem, kind: Registration["kind"]) => {
      setWarning(null)
      if (!user?.sub) return

      const already = registrations.some((r) => r.event.id === ev.id)
      if (already) return

      if (kind !== "jumpin" && !canRegister(ev)) {
        setWarning("That overlaps with something already on your schedule.")
        return
      }

      if (kind === "jumpin") {
        const conflicts = registeredEvents.some((reg) => overlaps(reg, ev))
        if (conflicts) setWarning("Jump-in conflicts with your schedule (allowed for Jump Ins).")
      }

      try {
        const displayName = user?.name || user?.email || "(unknown)"

        const res = await fetch("/api/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: Number(ev.id), kind, displayName }),
        })

        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to register")

        setRegistrations((prev) => [
          ...prev,
          { event: ev, name: displayName, kind, createdAt: new Date().toISOString() },
        ])
      } catch (e: any) {
        console.warn("[Dashboard] register failed:", e)
        setWarning(e?.message ?? "Failed to register")
      }
    },
    [user?.sub, user?.name, user?.email, registrations, canRegister, registeredEvents]
  )

  const removeRegistration = useCallback(async (id: string) => {
    if (!user?.sub) return
    setWarning(null)

    try {
      const res = await fetch(`/api/registrations?eventId=${encodeURIComponent(id)}`, { method: "DELETE" })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to remove registration")
      setRegistrations((prev) => prev.filter((r) => r.event.id !== id))
    } catch (e: any) {
      console.warn("[Dashboard] remove failed:", e)
      setWarning(e?.message ?? "Failed to remove registration")
    }
  }, [user?.sub])

  // -----------------------
  // DB: Write availability (save full array)
  // -----------------------
  const saveAvailability = useCallback(async (next: AvailabilityBlock[]) => {
    if (!user?.sub) return
    setSavingAvail(true)
    setDataError(null)
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: next }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to save availability")
    } catch (e: any) {
      console.warn("[Dashboard] availability save failed:", e)
      setDataError(e?.message ?? "Failed to save availability")
    } finally {
      setSavingAvail(false)
    }
  }, [user?.sub])

  const toggleAvailability = useCallback(
    (day: number, hour: number) => {
      setAvailability((prev) => {
        const exists = prev.some((b) => b.day === day && b.hour === hour)
        const next = exists ? prev.filter((b) => !(b.day === day && b.hour === hour)) : [...prev, { day, hour }]
        // DB write
        saveAvailability(next)
        return next
      })
    },
    [saveAvailability]
  )

  const quickSetAvailability = useCallback(
    (preset: "weeknights" | "weekend" | "clear") => {
      let next: AvailabilityBlock[] = []
      if (preset === "weeknights") {
        for (const day of [1, 2, 3, 4]) for (const hour of [18, 19, 20, 21]) next.push({ day, hour })
      } else if (preset === "weekend") {
        for (const day of [6, 0]) for (const hour of [10, 11, 12, 13, 14]) next.push({ day, hour })
      } else {
        next = []
      }
      setAvailability(next)
      saveAvailability(next)
    },
    [saveAvailability]
  )

  // Compact next-hours strip (mobile)
  function HoursStrip({ events }: { events: EventItem[] }) {
    const slots = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now)
      d.setMinutes(0, 0, 0)
      d.setHours(now.getHours() + i)
      return d
    })

    return (
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {slots.map((slot) => {
          const slotStart = slot.getTime()
          const slotEnd = slotStart + 60 * 60 * 1000
          const overlapping = events.filter((ev) => {
            const s = new Date(ev.start).getTime()
            const e = new Date(ev.end).getTime()
            return s < slotEnd && e > slotStart
          })

          return (
            <div
              key={slot.toISOString()}
              className={`min-w-[120px] rounded-xl border px-3 py-2 text-xs ${overlapping.length ? "bg-muted/40" : ""}`}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {slot.toLocaleTimeString(undefined, { hour: "numeric", hour12: true })}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {overlapping.length ? (
                  overlapping.slice(0, 2).map((e) => (
                    <div key={e.id} className="truncate font-medium">
                      {e.title}
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">Free</div>
                )}
                {overlapping.length > 2 && <div className="text-muted-foreground">+{overlapping.length - 2} more</div>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  function EventCard({ ev, mode }: { ev: EventItem; mode: "suggested" | "discover" | "jumpin" | "mine" }) {
    const existing = registrations.find((r) => r.event.id === ev.id)
    const already = Boolean(existing)
    const conflicts = registeredEvents.some((reg) => overlaps(reg, ev))

    // If your /api/events includes attending_count -> we stuffed it into attendees length above
    const attending = ev.attendees?.length || 0

    const action = (() => {
      if (!user) return { label: "Sign in to join", disabled: true, onClick: () => {} }
      if (already) {
        if (mode === "mine") return { label: "Remove", disabled: isLoading, onClick: () => removeRegistration(ev.id) }
        return { label: "Added", disabled: true, onClick: () => {} }
      }
      if (mode === "jumpin") return { label: "Quick Join", disabled: isLoading, onClick: () => addRegistration(ev, "jumpin") }
      if (mode === "suggested") return { label: "Confirm", disabled: isLoading, onClick: () => addRegistration(ev, "scheduled") }
      return { label: "Register", disabled: isLoading || !canRegister(ev), onClick: () => addRegistration(ev, "manual") }
    })()

    return (
      <Card className="rounded-2xl">
        <CardHeader className="space-y-1 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{ev.title}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1 truncate">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{ev.location}</span>
              </CardDescription>
            </div>

            {mode !== "mine" && conflicts && (
              <Badge variant={mode === "jumpin" ? "destructive" : "secondary"} className="shrink-0">
                Conflict
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pt-0">
          <div className="text-sm text-muted-foreground line-clamp-2">{ev.description}</div>
          <div className="text-sm font-medium">{formatTimeRange(ev)}</div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{attending} attending</div>
            {existing?.kind && (
              <Badge variant="outline" className="text-xs">
                {existing.kind === "scheduled" ? "Scheduled" : existing.kind === "manual" ? "Manual" : "Jump In"}
              </Badge>
            )}
          </div>

          {mode === "discover" && !already && !canRegister(ev) && (
            <div className="text-xs text-muted-foreground">Overlaps your schedule</div>
          )}
        </CardContent>

        <CardFooter className="pt-3">
          <Button
            className="w-full rounded-xl"
            size="sm"
            variant={mode === "mine" ? "outline" : "default"}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  function BottomNav() {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-5 px-2 py-2">
          <BottomNavButton active={tab === "schedule"} onClick={() => setTab("schedule")} label="Schedule" icon={<Target className="h-5 w-5" />} />
          <BottomNavButton active={tab === "week"} onClick={() => setTab("week")} label="Week" icon={<CalendarDays className="h-5 w-5" />} />
          <BottomNavButton active={tab === "discover"} onClick={() => setTab("discover")} label="Discover" icon={<Compass className="h-5 w-5" />} />
          <BottomNavButton active={tab === "jumpin"} onClick={() => setTab("jumpin")} label="Jump In" icon={<Zap className="h-5 w-5" />} />
          <BottomNavButton active={tab === "profile"} onClick={() => setTab("profile")} label="Me" icon={<User className="h-5 w-5" />} />
        </div>
      </nav>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="EventU Logo" width={110} height={32} priority />
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {now.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Info className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">What is this?</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>What EventU is about</DialogTitle>
                  <DialogDescription>A simple way to meet people through scheduled activities.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-sm">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">How it works</div>
                        <div className="mt-1 text-muted-foreground">
                          Based on all users' availability, we suggest a personalized schedule each week. You can also browse and join
                          other activities that fit your schedule, or jump into last-minute games happening today.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Users className="h-4 w-4" /> Meet new people
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Meet with communities in your area through shared activities. It's like a gym schedule, but for games and hobbies.
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Target className="h-4 w-4" /> Plan your week
                      </div>
                      <div className="mt-1 text-muted-foreground">You’ll know your games ahead of time and how many people are in each one.</div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Zap className="h-4 w-4" /> Jump Ins
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        After 1PM, you can join last-minute games for the rest of today (overlaps not allowed).
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4" /> $5 commitment
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Everyone starts with a $5 commitment. If you don’t show up, it gets donated to charity. Showing up means more fun for
                        you and everyone else, and supports the platform. We’ll never charge if you show up!
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-muted-foreground">The goal is simple: less planning, more real games with real people.</div>
                </div>
              </DialogContent>
            </Dialog>

            <LogoutButton />
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-3">
          {user ? (
            <div className="text-xs text-muted-foreground">
              Signed in as <span className="font-medium">{user.name || user.email}</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Sign in to set availability and get scheduled.</div>
          )}

          {eventsLoading && <div className="mt-2 text-xs text-muted-foreground">Loading events…</div>}
          {eventsError && <div className="mt-2 text-xs text-destructive">Events error: {eventsError}</div>}
          {dataError && <div className="mt-2 text-xs text-destructive">Data error: {dataError}</div>}
          {savingAvail && <div className="mt-2 text-xs text-muted-foreground">Saving availability…</div>}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4">
        <div className="mt-4">
          {tab === "schedule" && (
            <ScheduleTabMobile
              userReady={userReady}
              availability={availability}
              onToggle={toggleAvailability}
              onQuickSet={quickSetAvailability}
              suggested={suggestedSchedule}
              onConfirm={(ev) => addRegistration(ev, "scheduled")}
            />
          )}

          {tab === "week" && (
            <WeekTabMobile
              now={now}
              registrations={registrations}
              myUpcoming={myUpcoming}
              onRemove={removeRegistration}
              calendar={<HoursStrip events={registeredEvents} />}
            />
          )}

          {tab === "discover" && (
            <DiscoverTabMobile
              query={query}
              setQuery={setQuery}
              hideConflicts={hideConflicts}
              setHideConflicts={setHideConflicts}
              events={discoverEvents}
              render={(ev) => <EventCard key={ev.id} ev={ev} mode="discover" />}
            />
          )}

          {tab === "jumpin" && (
            <JumpInTabMobile
              isPast1PM={isPast1PM}
              jumpInEvents={jumpInEvents}
              render={(ev) => <EventCard key={ev.id} ev={ev} mode="jumpin" />}
            />
          )}

          {tab === "profile" && <ProfileTabMobile />}
        </div>

        <div className="mt-4 space-y-2">
          {warning && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {warning}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {String(error)}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
      <div className="h-6" />
    </div>
  )
}

function BottomNavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] ${
        active ? "bg-muted font-medium" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

export function formatHour(h: number) {
  const hour12 = ((h + 11) % 12) + 1
  const ampm = h >= 12 ? "PM" : "AM"
  return `${hour12}${ampm}`
}