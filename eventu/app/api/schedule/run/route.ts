// import { NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { suggestOneEventPerHobby } from "@/lib/schedule"

// type AlgoUser = {
//   id: string
//   hobbies: string[]
//   availability: { start: string; end: string }[]
// }

// function isoToday() {
//   return new Date().toISOString().slice(0, 10)
// }

// function toNum(v: string | null, fallback: number) {
//   const n = v ? Number(v) : NaN
//   return Number.isFinite(n) ? n : fallback
// }

// function parsePgTime(t: string) {
//   const [h, m] = t.split(":")
//   return { hour: Number(h), minute: Number(m) }
// }

// function addDaysIso(dayIso: string, days: number) {
//   const d = new Date(`${dayIso}T12:00:00.000Z`)
//   d.setUTCDate(d.getUTCDate() + days)
//   return d.toISOString().slice(0, 10)
// }

// /**
//  * Convert a local wall-clock time on a given day (in a timezone) to a UTC Date.
//  * (No external deps; MVP-OK.)
//  */
// function localTimeOnDayToUtc(dayIso: string, hour: number, minute: number, timeZone: string) {
//   const base = new Date(`${dayIso}T12:00:00.000Z`)

//   const parts = new Intl.DateTimeFormat("en-CA", {
//     timeZone,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }).formatToParts(base)

//   const y = parts.find((p) => p.type === "year")?.value
//   const m = parts.find((p) => p.type === "month")?.value
//   const d = parts.find((p) => p.type === "day")?.value
//   if (!y || !m || !d) throw new Error("Failed to compute local date parts")

//   const pretendUtc = new Date(
//     `${y}-${m}-${d}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`
//   )

//   const fmt = new Intl.DateTimeFormat("en-US", {
//     timeZone,
//     hour12: false,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   })

//   const p2 = fmt.formatToParts(pretendUtc)
//   const yy = p2.find((p) => p.type === "year")?.value
//   const mm = p2.find((p) => p.type === "month")?.value
//   const dd = p2.find((p) => p.type === "day")?.value
//   const hh = p2.find((p) => p.type === "hour")?.value
//   const mi = p2.find((p) => p.type === "minute")?.value
//   const ss = p2.find((p) => p.type === "second")?.value
//   if (!yy || !mm || !dd || !hh || !mi || !ss) throw new Error("Failed to compute tz offset")

//   const tzInterpreted = new Date(`${yy}-${mm}-${dd}T${hh}:${mi}:${ss}.000Z`)
//   const offset = tzInterpreted.getTime() - pretendUtc.getTime()

//   return new Date(pretendUtc.getTime() - offset)
// }

// export async function POST(req: Request) {
//   try {
//     const url = new URL(req.url)
//     const day = url.searchParams.get("day") ?? isoToday()

//     const durationMinutes = toNum(url.searchParams.get("duration"), 20)
//     const stepMinutes = toNum(url.searchParams.get("step"), 60)
//     const minAttendees = toNum(url.searchParams.get("min"), 2)

//     const timeZone = "America/Chicago"

//     // weekday (0=Sun ... 6=Sat) for the given day in Chicago
//     const wk = new Date(`${day}T12:00:00.000Z`).toLocaleDateString("en-US", {
//       weekday: "short",
//       timeZone,
//     })
//     const weekdayMap: Record<string, number> = {
//       Sun: 0,
//       Mon: 1,
//       Tue: 2,
//       Wed: 3,
//       Thu: 4,
//       Fri: 5,
//       Sat: 6,
//     }
//     const weekdayNum = weekdayMap[wk]
//     if (weekdayNum == null) {
//       return NextResponse.json({ ok: false, error: "Invalid weekday" }, { status: 500 })
//     }

//     const dayStartUtc = localTimeOnDayToUtc(day, 0, 0, timeZone).toISOString()
//     const dayEndUtc = localTimeOnDayToUtc(addDaysIso(day, 1), 0, 0, timeZone).toISOString()

//     // 1) Users
//     const users = await sql<{ user_id: string }[]>`SELECT user_id FROM users`

//     // 2) User hobbies via tags
//     const tagRows = await sql<{ user_id: string; tag_id: number; name: string }[]>`
//       SELECT ut.user_id, ut.tag_id, t.name
//       FROM user_tags ut
//       JOIN tags t ON ut.tag_id = t.id
//     `

//     const userToHobbies = new Map<string, string[]>()
//     const hobbyToTagId = new Map<string, number>()

//     for (const r of tagRows) {
//       hobbyToTagId.set(r.name, r.tag_id)
//       const arr = userToHobbies.get(r.user_id) ?? []
//       arr.push(r.name)
//       userToHobbies.set(r.user_id, arr)
//     }

//     for (const [uid, hobbies] of userToHobbies.entries()) {
//       userToHobbies.set(uid, Array.from(new Set(hobbies)))
//     }

//     // 3) Availability for this weekday
//     const availRows = await sql<{ user_id: string; start_time: string; end_time: string }[]>`
//       SELECT user_id, start_time, end_time
//       FROM user_availability
//       WHERE weekday = ${weekdayNum}
//     `

//     const userToAvail = new Map<string, { start: string; end: string }[]>()
//     for (const r of availRows) {
//       const { hour: sh, minute: sm } = parsePgTime(r.start_time)
//       const { hour: eh, minute: em } = parsePgTime(r.end_time)

//       const startUtc = localTimeOnDayToUtc(day, sh, sm, timeZone)
//       let endUtc = localTimeOnDayToUtc(day, eh, em, timeZone)

//       // if availability wraps past midnight, push end to next day
//       if (endUtc.getTime() <= startUtc.getTime()) {
//         endUtc = localTimeOnDayToUtc(addDaysIso(day, 1), eh, em, timeZone)
//       }

//       const arr = userToAvail.get(r.user_id) ?? []
//       arr.push({ start: startUtc.toISOString(), end: endUtc.toISOString() })
//       userToAvail.set(r.user_id, arr)
//     }

//     const algoUsers: AlgoUser[] = users.map((u) => ({
//       id: u.user_id,
//       hobbies: userToHobbies.get(u.user_id) ?? [],
//       availability: userToAvail.get(u.user_id) ?? [],
//     }))

//     // 4) Run scheduler
//     const suggestions = suggestOneEventPerHobby(algoUsers as any, {
//       dayIso: day,
//       durationMinutes,
//       stepMinutes,
//       minAttendees,
//       timeZone,
//       dayStartHour: 8,
//       dayEndHour: 22,
//     })

//     const planned = suggestions
//       .map((s) => {
//         const tagId = hobbyToTagId.get(s.hobby)
//         if (tagId == null) return null
//         return {
//           name: `AUTO: ${s.hobby} Night`,
//           start: s.start,
//           end: s.end,
//           tagId,
//         }
//       })
//       .filter((x): x is { name: string; start: string; end: string; tagId: number } => x !== null)

//     // 5) Transaction using postgres.js recommended style
//     const inserted = await sql.begin(async (tx) => {
//       // delete old AUTO events for that day window
//       await tx`
//         DELETE FROM events
//         WHERE name LIKE 'AUTO:%'
//           AND start_time >= ${dayStartUtc}::timestamptz
//           AND start_time < ${dayEndUtc}::timestamptz
//       `

//       const out: { id: number; name: string; start: string; end: string; tagId: number }[] = []

//       for (const ev of planned) {
//         const rows = await tx<{ id: number }[]>`
//           INSERT INTO events (name, start_time, end_time, location)
//           VALUES (${ev.name}, ${ev.start}::timestamptz, ${ev.end}::timestamptz, 'TBD')
//           RETURNING id
//         `
//         const eventId = rows[0]?.id
//         if (!eventId) continue

//         await tx`
//           INSERT INTO event_tags (event_id, tag_id)
//           VALUES (${eventId}, ${ev.tagId})
//         `

//         out.push({ id: eventId, ...ev })
//       }

//       return out
//     })

//     return NextResponse.json({
//       ok: true,
//       day,
//       weekday: weekdayNum,
//       usersConsidered: algoUsers.length,
//       planned: planned.length,
//       inserted: inserted.length,
//       events: inserted,
//     })
//   } catch (e: any) {
//     return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 })
//   }
// }

import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { suggestOneEventPerHobby } from "@/lib/schedule"

type AlgoUser = {
  id: string
  hobbies: string[]
  availability: { start: string; end: string }[]
}

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

function toNum(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
}

function parsePgTime(t: string) {
  // "HH:MM:SS" or "HH:MM"
  const [h, m] = t.split(":")
  return { hour: Number(h), minute: Number(m) }
}

function addDaysIso(dayIso: string, days: number) {
  const d = new Date(`${dayIso}T12:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Convert a local wall-clock time on a given day (in a timezone) to a UTC Date.
 * (No deps, MVP-OK.)
 */
function localTimeOnDayToUtc(dayIso: string, hour: number, minute: number, timeZone: string) {
  const base = new Date(`${dayIso}T12:00:00.000Z`)

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(base)

  const y = parts.find((p) => p.type === "year")?.value
  const m = parts.find((p) => p.type === "month")?.value
  const d = parts.find((p) => p.type === "day")?.value
  if (!y || !m || !d) throw new Error("Failed to compute local date parts")

  // Pretend the local time is UTC to compute the timezone offset.
  const pretendUtc = new Date(
    `${y}-${m}-${d}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`
  )

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
  const yy = p2.find((p) => p.type === "year")?.value
  const mm = p2.find((p) => p.type === "month")?.value
  const dd = p2.find((p) => p.type === "day")?.value
  const hh = p2.find((p) => p.type === "hour")?.value
  const mi = p2.find((p) => p.type === "minute")?.value
  const ss = p2.find((p) => p.type === "second")?.value
  if (!yy || !mm || !dd || !hh || !mi || !ss) throw new Error("Failed to compute tz offset")

  const tzInterpreted = new Date(`${yy}-${mm}-${dd}T${hh}:${mi}:${ss}.000Z`)
  const offset = tzInterpreted.getTime() - pretendUtc.getTime()

  return new Date(pretendUtc.getTime() - offset)
}

function weekdayNumberForDay(dayIso: string, timeZone: string): number {
  const wk = new Date(`${dayIso}T12:00:00.000Z`).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone,
  })
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const n = map[wk]
  if (n == null) throw new Error("Invalid weekday")
  return n
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    // Schedules 7 days starting weekStart (Sunday → next Sunday window).
    // If you want it always anchored to Sunday, pass a Sunday date here.
    const weekStart = url.searchParams.get("weekStart") ?? isoToday()

    // knobs
    const durationMinutes = toNum(url.searchParams.get("duration"), 90)
    const stepMinutes = toNum(url.searchParams.get("step"), 60) // ✅ step by the hour
    const minAttendees = toNum(url.searchParams.get("min"), 2)

    const timeZone = "America/Chicago"

    // Pull core DB data once
    const users = await sql<{ user_id: string }[]>`SELECT user_id FROM users`

    const tagRows = await sql<{ user_id: string; tag_id: number; name: string }[]>`
      SELECT ut.user_id, ut.tag_id, t.name
      FROM user_tags ut
      JOIN tags t ON ut.tag_id = t.id
    `

    const userToHobbies = new Map<string, string[]>()
    const hobbyToTagId = new Map<string, number>()

    for (const r of tagRows) {
      hobbyToTagId.set(r.name, r.tag_id)
      const arr = userToHobbies.get(r.user_id) ?? []
      arr.push(r.name)
      userToHobbies.set(r.user_id, arr)
    }
    for (const [uid, hobbies] of userToHobbies.entries()) {
      userToHobbies.set(uid, Array.from(new Set(hobbies)))
    }

    // Pull all availability rows once (we’ll filter by weekday in memory)
    const availAll = await sql<{ user_id: string; start_time: string; end_time: string; weekday: number }[]>`
      SELECT user_id, start_time, end_time, weekday
      FROM user_availability
    `

    // Group availability by weekday -> user_id
    const availByWeekday = new Map<number, Map<string, { start_time: string; end_time: string }[]>>()
    for (const r of availAll) {
      const wd = Number(r.weekday)
      const byUser = availByWeekday.get(wd) ?? new Map<string, { start_time: string; end_time: string }[]>()
      const arr = byUser.get(r.user_id) ?? []
      arr.push({ start_time: r.start_time, end_time: r.end_time })
      byUser.set(r.user_id, arr)
      availByWeekday.set(wd, byUser)
    }

    // Build week plan: day-by-day, 1 event per hobby per day
    const weekPlanned: {
      day: string
      name: string
      start: string
      end: string
      tagId: number
      hobby: string
      attendeeCount: number
    }[] = []

    for (let i = 0; i < 7; i++) {
      const dayIso = addDaysIso(weekStart, i)
      const weekdayNum = weekdayNumberForDay(dayIso, timeZone)

      const byUser = availByWeekday.get(weekdayNum) ?? new Map()

      // Convert each user’s weekly availability into ISO blocks for this day
      const userToAvailIso = new Map<string, { start: string; end: string }[]>()

      for (const [uid, blocks] of byUser.entries()) {
        const isoBlocks: { start: string; end: string }[] = []

        for (const b of blocks) {
          const { hour: sh, minute: sm } = parsePgTime(String(b.start_time))
          const { hour: eh, minute: em } = parsePgTime(String(b.end_time))

          const startUtc = localTimeOnDayToUtc(dayIso, sh, sm, timeZone)
          let endUtc = localTimeOnDayToUtc(dayIso, eh, em, timeZone)

          // wrap past midnight
          if (endUtc.getTime() <= startUtc.getTime()) {
            endUtc = localTimeOnDayToUtc(addDaysIso(dayIso, 1), eh, em, timeZone)
          }

          isoBlocks.push({ start: startUtc.toISOString(), end: endUtc.toISOString() })
        }

        userToAvailIso.set(uid, isoBlocks)
      }

      const algoUsers: AlgoUser[] = users.map((u) => ({
        id: u.user_id,
        hobbies: userToHobbies.get(u.user_id) ?? [],
        availability: userToAvailIso.get(u.user_id) ?? [],
      }))

      const suggestions = suggestOneEventPerHobby(algoUsers as any, {
        dayIso: dayIso,
        durationMinutes,
        stepMinutes, // ✅ 60 mins step
        minAttendees,
        timeZone,
        dayStartHour: 8,
        dayEndHour: 22,
      })

      for (const s of suggestions) {
        const tagId = hobbyToTagId.get(s.hobby)
        if (tagId == null) continue

        weekPlanned.push({
          day: dayIso,
          hobby: s.hobby,
          tagId,
          name: `AUTO: ${s.hobby} Night`,
          start: s.start,
          end: s.end,
          attendeeCount: s.attendeeCount,
        })
      }
    }

    // Compute UTC window for delete: weekStart local midnight → weekStart+7 local midnight
    const weekStartUtc = localTimeOnDayToUtc(weekStart, 0, 0, timeZone).toISOString()
    const weekEndUtc = localTimeOnDayToUtc(addDaysIso(weekStart, 7), 0, 0, timeZone).toISOString()

    // Write to DB in a safe postgres.js transaction
    const inserted = await sql.begin(async (tx) => {
      // delete any previous auto events in that week window
      await tx`
        DELETE FROM events
        WHERE name LIKE 'AUTO:%'
          AND start_time >= ${weekStartUtc}::timestamptz
          AND start_time < ${weekEndUtc}::timestamptz
      `

      const out: { id: number; name: string; start: string; end: string; tagId: number; day: string; hobby: string }[] = []

      for (const ev of weekPlanned) {
        const rows = await tx<{ id: number }[]>`
          INSERT INTO events (name, start_time, end_time, location)
          VALUES (${ev.name}, ${ev.start}::timestamptz, ${ev.end}::timestamptz, 'TBD')
          RETURNING id
        `
        const eventId = rows[0]?.id
        if (!eventId) continue

        await tx`
          INSERT INTO event_tags (event_id, tag_id)
          VALUES (${eventId}, ${ev.tagId})
        `

        out.push({
          id: eventId,
          name: ev.name,
          start: ev.start,
          end: ev.end,
          tagId: ev.tagId,
          day: ev.day,
          hobby: ev.hobby,
        })
      }

      return out
    })

    return NextResponse.json({
      ok: true,
      weekStart,
      weekEndExclusive: addDaysIso(weekStart, 7),
      usersConsidered: users.length,
      planned: weekPlanned.length,
      inserted: inserted.length,
      events: inserted,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}