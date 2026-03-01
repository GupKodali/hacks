// src/lib/scheduleBarebones.ts

export type AvailabilityBlock = {
  start: string // ISO in UTC (recommended)
  end: string   // ISO in UTC
}

export type User = {
  id: string
  name?: string
  hobbies: string[]              // e.g. ["basketball", "tennis"]
  availability: AvailabilityBlock[]
}

export type SuggestedEvent = {
  hobby: string
  start: string // ISO
  end: string   // ISO
  attendeeUserIds: string[]
  attendeeCount: number
}

export type ScheduleOptions = {
  dayIso: string               // "2026-03-01" (local day concept)
  timeZone?: string            // default "America/Chicago"
  dayStartHour?: number        // default 8
  dayEndHour?: number          // default 22 (10pm)
  stepMinutes?: number         // default 30
  durationMinutes?: number     // default 90
  minAttendees?: number        // default 2
  hobbiesWhitelist?: string[]  // optional, schedule only these hobbies
}

/**
 * Convert a "local wall clock time (in a timezone)" on a given day
 * into a UTC Date.
 *
 * We avoid external deps, but this is good enough for MVP scheduling.
 */
function localTimeOnDayToUtc(dayIso: string, hour: number, minute: number, timeZone: string): Date {
  // Make a Date that represents roughly that local time by:
  // 1) create a UTC date at noon to safely compute the local date parts
  // 2) construct a "fake UTC" timestamp for the intended local datetime
  // 3) compute tz offset by formatting and re-parsing

  const safe = new Date(`${dayIso}T12:00:00.000Z`)

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(safe)

  const y = parts.find(p => p.type === "year")?.value
  const m = parts.find(p => p.type === "month")?.value
  const d = parts.find(p => p.type === "day")?.value
  if (!y || !m || !d) throw new Error("Failed to compute local date parts")

  // "Pretend" the wall time is UTC for a moment:
  const pretendUtc = new Date(`${y}-${m}-${d}T${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}:00.000Z`)

  // Now figure out what time that pretendUtc would be in the timezone,
  // then compute offset difference.
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  const p2 = fmt.formatToParts(pretendUtc)
  const yy = p2.find(p => p.type === "year")?.value
  const mm = p2.find(p => p.type === "month")?.value
  const dd = p2.find(p => p.type === "day")?.value
  const hh = p2.find(p => p.type === "hour")?.value
  const mi = p2.find(p => p.type === "minute")?.value
  const ss = p2.find(p => p.type === "second")?.value
  if (!yy || !mm || !dd || !hh || !mi || !ss) throw new Error("Failed to compute offset")

  // This string represents what the timezone thinks the pretendUtc time is.
  // Convert it back to a UTC Date:
  const tzInterpretedAsUtc = new Date(`${yy}-${mm}-${dd}T${hh}:${mi}:${ss}.000Z`)

  // Offset = tzInterpretedAsUtc - pretendUtc
  const offsetMs = tzInterpretedAsUtc.getTime() - pretendUtc.getTime()

  // To get the *real* UTC time for that local wall time, subtract offset.
  return new Date(pretendUtc.getTime() - offsetMs)
}

function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60 * 1000)
}

function userCanAttendWindow(user: User, startUtc: Date, endUtc: Date): boolean {
  const s = startUtc.getTime()
  const e = endUtc.getTime()
  for (const block of user.availability) {
    const bs = new Date(block.start).getTime()
    const be = new Date(block.end).getTime()
    // needs to fully cover the window
    if (bs <= s && be >= e) return true
  }
  return false
}

export function suggestOneEventPerHobby(users: User[], opts: ScheduleOptions): SuggestedEvent[] {
  const timeZone = opts.timeZone ?? "America/Chicago"
  const dayStartHour = opts.dayStartHour ?? 8
  const dayEndHour = opts.dayEndHour ?? 22
  const stepMinutes = opts.stepMinutes ?? 30
  const durationMinutes = opts.durationMinutes ?? 90
  const minAttendees = opts.minAttendees ?? 2

  // Build hobby -> users map
  const hobbyToUsers = new Map<string, User[]>()
  for (const u of users) {
    for (const h of u.hobbies) {
      if (opts.hobbiesWhitelist && !opts.hobbiesWhitelist.includes(h)) continue
      const arr = hobbyToUsers.get(h) ?? []
      arr.push(u)
      hobbyToUsers.set(h, arr)
    }
  }

  const results: SuggestedEvent[] = []

  for (const [hobby, hobbyUsers] of hobbyToUsers.entries()) {
    if (hobbyUsers.length === 0) continue

    // Candidate window boundaries (in UTC) based on local day window
    const dayStartUtc = localTimeOnDayToUtc(opts.dayIso, dayStartHour, 0, timeZone)
    const dayEndUtc = localTimeOnDayToUtc(opts.dayIso, dayEndHour, 0, timeZone)

    let bestStart: Date | null = null
    let bestAttendees: string[] = []

    for (let t = new Date(dayStartUtc); t.getTime() + durationMinutes * 60 * 1000 <= dayEndUtc.getTime(); t = addMinutes(t, stepMinutes)) {
      const end = addMinutes(t, durationMinutes)
      const attendees: string[] = []

      for (const u of hobbyUsers) {
        if (userCanAttendWindow(u, t, end)) attendees.push(u.id)
      }

      if (attendees.length > bestAttendees.length) {
        bestStart = new Date(t)
        bestAttendees = attendees
      }
    }

    if (!bestStart) continue
    if (bestAttendees.length < minAttendees) continue

    results.push({
      hobby,
      start: bestStart.toISOString(),
      end: addMinutes(bestStart, durationMinutes).toISOString(),
      attendeeUserIds: bestAttendees,
      attendeeCount: bestAttendees.length,
    })
  }

  return results
}