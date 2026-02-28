export type EventItem = {
  id: string
  title: string
  description?: string
  start: string // ISO
  end: string // ISO
  location?: string
  attendees?: string[]
}

export function overlaps(a: EventItem, b: EventItem) {
  const aStart = new Date(a.start).getTime()
  const aEnd = new Date(a.end).getTime()
  const bStart = new Date(b.start).getTime()
  const bEnd = new Date(b.end).getTime()

  return aStart < bEnd && bStart < aEnd
}

export function formatTimeRange(item: EventItem) {
  const s = new Date(item.start)
  const e = new Date(item.end)
  return `${s.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })} — ${e.toLocaleString(undefined, { timeStyle: "short" })}`
}

function nextWeekdayDate(weekday = 0, hour = 20, minute = 0) {
  // weekday: 0=Sunday ... 6=Saturday
  const now = new Date()
  const today = now.getDay()
  let diff = (weekday + 7 - today) % 7
  if (diff === 0) diff = 7 // next week same weekday
  const d = new Date(now)
  d.setDate(now.getDate() + diff)
  d.setHours(hour, minute, 0, 0)
  return d
}

export function sampleEvents(): EventItem[] {
  // Create a few sample events around the next Sunday evening schedule
  const sunday = nextWeekdayDate(0, 18, 0) // Sunday 6:00 PM
  const ev1Start = new Date(sunday)
  const ev1End = new Date(ev1Start)
  ev1End.setHours(ev1Start.getHours() + 1)

  const ev2Start = new Date(sunday)
  ev2Start.setHours(ev2Start.getHours() + 1)
  const ev2End = new Date(ev2Start)
  ev2End.setHours(ev2Start.getHours() + 2)

  const ev3Start = new Date(sunday)
  ev3Start.setHours(ev3Start.getHours() + 3)
  const ev3End = new Date(ev3Start)
  ev3End.setHours(ev3Start.getHours() + 2)

  return [
    {
      id: "ev-pickup-bball",
      title: "Pickup Basketball",
      description: "Casual 5v5 pickup. Bring water and a positive attitude.",
      start: ev1Start.toISOString(),
      end: ev1End.toISOString(),
      location: "Community Gym",
      attendees: [],
    },
    {
      id: "ev-soccer",
      title: "7-a-side Soccer",
      description: "Short sided pick up soccer game.",
      start: ev2Start.toISOString(),
      end: ev2End.toISOString(),
      location: "Park Field A",
      attendees: [],
    },
    {
      id: "ev-volley",
      title: "Beach Volleyball",
      description: "Mixed teams, rotating subs.",
      start: ev3Start.toISOString(),
      end: ev3End.toISOString(),
      location: "Sand Courts",
      attendees: [],
    },
  ]
}
