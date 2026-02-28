"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { sampleEvents, EventItem, overlaps, formatTimeRange } from "@/lib/events"

type Registration = {
	event: EventItem
	name: string
}

const STORAGE_KEY = "eventu:registrations"

export default function DashboardPage() {
	const [events] = useState<EventItem[]>(() => sampleEvents())
	const [registrations, setRegistrations] = useState<Registration[]>([])
	const [warning, setWarning] = useState<string | null>(null)

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (raw) setRegistrations(JSON.parse(raw))
		} catch (e) {
			console.warn("failed to load registrations", e)
		}
	}, [])

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations))
		} catch (e) {
			console.warn("failed to save registrations", e)
		}
	}, [registrations])

	const registeredEvents = useMemo(() => registrations.map((r) => r.event), [registrations])

	function canRegister(event: EventItem) {
		return !registeredEvents.some((reg) => overlaps(reg, event))
	}

	function handleRegister(ev: EventItem) {
		setWarning(null)
		if (!canRegister(ev)) {
			setWarning("This event overlaps with one of your registered events.")
			return
		}

		const name = window.prompt("Enter your name to register for this event:")
		if (!name) return

		setRegistrations((prev) => [...prev, { event: ev, name }])
	}

	function handleUnregister(id: string) {
		setRegistrations((prev) => prev.filter((r) => r.event.id !== id))
	}

	return (
		<div className="min-h-screen p-6">
			<h1 className="text-2xl font-semibold mb-4">EventU — Dashboard</h1>
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
												disabled={already}
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

