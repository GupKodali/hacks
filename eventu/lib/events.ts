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
  return `${s.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  })} — ${e.toLocaleString(undefined, {
    timeStyle: "short",
  })}`
}

/**
 * Returns the next occurrence of weekday at given hour/minute.
 * If today is that weekday:
 *   - returns today if time has not passed
 *   - otherwise returns next week's weekday
 *
 * weekday: 0=Sunday ... 6=Saturday
 */
function nextOrTodayWeekdayDate(
  weekday: number,
  hour: number,
  minute: number
) {
  const now = new Date()
  const today = now.getDay()

  let diff = (weekday + 7 - today) % 7

  const candidate = new Date(now)
  candidate.setDate(now.getDate() + diff)
  candidate.setHours(hour, minute, 0, 0)

  // If it's today but time already passed → go to next week
  if (diff === 0 && candidate.getTime() < now.getTime()) {
    candidate.setDate(candidate.getDate() + 7)
  }

  return candidate
}

export function sampleEvents(): EventItem[] {
  // Sunday events (6 PM block)
  const sunday = nextOrTodayWeekdayDate(0, 18, 0)

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

  // ✅ Event 4: Saturday at 8:00 PM (today if Saturday before 8PM)
  const ev4Start = nextOrTodayWeekdayDate(6, 20, 0)
  const ev4End = new Date(ev4Start)
  ev4End.setHours(ev4Start.getHours() + 2)

  // Debug (optional — remove after confirming)
  // console.log("Event 4 local:", ev4Start.toString())

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
    {
      id: "bball",
      title: "Pickup UNL BBALL",
      description: "Pro teams, rotating subs.",
      start: ev4Start.toISOString(),
      end: ev4End.toISOString(),
      location: "HSS Courts",
      attendees: [
        "John",
        "Jane",
        "Bob",
        "Alice",
        "Tom",
        "Sara",
        "Mike",
        "Emily",
        "David",
        "Laura",
      ],
    },
  ]
}

export function eventsHappeningToday(
  events: EventItem[],
  nowArg?: Date
): EventItem[] {
  const now = nowArg ? new Date(nowArg) : new Date()

  const sod = new Date(now)
  sod.setHours(0, 0, 0, 0)

  const eod = new Date(now)
  eod.setHours(23, 59, 59, 999)

  const nowMs = now.getTime()
  const sodMs = sod.getTime()
  const eodMs = eod.getTime()

  return events
    .filter((ev) => {
      const start = new Date(ev.start).getTime()
      const end = new Date(ev.end).getTime()

      const touchesToday = start <= eodMs && end >= sodMs
      const notEndedYet = end >= nowMs

      return touchesToday && notEndedYet
    })
    .sort(
      (a, b) =>
        new Date(a.start).getTime() - new Date(b.start).getTime()
    )
}