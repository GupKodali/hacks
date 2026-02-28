"use client"

import React, { useEffect, useMemo, useState } from "react"
// the auth0 client module lives in node_modules when dependencies are installed.
// the types sometimes aren't picked up by the workspace linter/TS server in this
// minimal example, so silence the warning; in a full install the import works
// normally.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useUser } from "@auth0/nextjs-auth0/client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { sampleEvents, EventItem, overlaps, formatTimeRange } from "@/lib/events"

type Registration = {
	event: EventItem
	name: string
}

// registrations are stored per-user so that multiple people sharing a browser
// don't see each other's saved data.  the key is derived from the logged in
// user's `sub` value (a stable identifier provided by Auth0).
const STORAGE_KEY_BASE = "eventu:registrations"

export default function DashboardPage() {
	const { user, error, isLoading } = useUser()
	const [events] = useState<EventItem[]>(() => sampleEvents())
	const [registrations, setRegistrations] = useState<Registration[]>([])
	const [warning, setWarning] = useState<string | null>(null)

	useEffect(() => {
		// wait until we know who the user is so we can pick the right key
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

	// build a simple 7‑hour timeline starting from the current hour.  each slot
	// will be highlighted if the user has an event that overlaps that hour.
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

		// use account details instead of prompting the user
		const name = user?.name || user?.email || "(unknown)"
		setRegistrations((prev) => [...prev, { event: ev, name }])
	}

	function handleUnregister(id: string) {
		setRegistrations((prev) => prev.filter((r) => r.event.id !== id))
	}

	return (
		<div className="min-h-screen p-6">
            <div className="mb-4">
				<img src="/logo.png" alt="EventU" className="h-12 mb-2" />
                {user && (
                    <p className="text-sm text-muted-foreground">
                        Signed in as {user.name || user.email}
                    </p>
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
							{/* show the upcoming 7‑hour calendar using only events the user registered for */}
							<HoursCalendar events={registeredEvents} />
							<p className="text-sm text-muted-foreground">Registered events (no overlaps allowed)</p>

							<div className="mt-3 space-y-2">
								{registrations.length === 0 && <div className="text-sm text-muted-foreground">No events yet</div>}
								{registrations.map((r) => (
									<div key={r.event.id} className="flex items-start justify-between gap-2 border rounded-md p-2">
										<div>
											<div className="font-medium text-sm">{r.event.title}</div>
											<div className="text-xs text-muted-foreground">{formatTimeRange(r.event)}</div>
											<div className="text-xs text-muted-foreground">You: {r.name}</div>
										</div>
										<div>
											<Button size="sm" variant="ghost" onClick={() => handleUnregister(r.event.id)}>Remove</Button>
										</div>
									</div>
								))}
							</div>
						</div>

						{warning && (
							<div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{warning}</div>
						)}
					</div>
				</aside>
			</div>
		</div>
	)
}

