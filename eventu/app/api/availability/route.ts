import { auth0 } from "@/lib/auth0"
import { sql } from "@/lib/db"

type HourBlock = { day: number; hour: number }

function isValidHourBlock(b: any): b is HourBlock {
  return (
    b &&
    typeof b.day === "number" &&
    typeof b.hour === "number" &&
    Number.isInteger(b.day) &&
    Number.isInteger(b.hour) &&
    b.day >= 0 &&
    b.day <= 6 &&
    b.hour >= 0 &&
    b.hour <= 23
  )
}

function hhmmss(h: number) {
  const hh = String(h).padStart(2, "0")
  return `${hh}:00:00`
}

export async function GET() {
  try {
    const session = await auth0.getSession()
    if (!session?.user?.sub) {
      return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const userId = session.user.sub

    // Read all availability rows and convert to {day, hour} based on start_time hour.
    // Works when start_time/end_time are TIME (or stored as text like "18:00:00").
    const result = await sql`
      select
        weekday,
        extract(hour from start_time) as hour
      from user_availability
      where user_id = ${userId}
      order by weekday asc, hour asc
    `

    const rows = (result as any).rows ?? result ?? []

    const availability: HourBlock[] = rows.map((r: any) => ({
      day: Number(r.weekday),
      hour: Number(r.hour),
    }))

    return new Response(JSON.stringify({ ok: true, availability }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("GET /api/availability error:", err)
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth0.getSession()
    if (!session?.user?.sub) {
      return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const userId = session.user.sub

    const body = await req.json().catch(() => null)
    const availability = body?.availability

    if (!Array.isArray(availability) || !availability.every(isValidHourBlock)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid availability payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Replace-all strategy: simplest + matches your UI "source of truth" state.
    // If you want incremental toggles later, we can do that too.
    await sql`delete from user_availability where user_id = ${userId}`

    for (const b of availability as HourBlock[]) {
      const start = hhmmss(b.hour)
      const end = hhmmss((b.hour + 1) % 24) // if you never use 23->0, it's fine; else adjust

      await sql`
        insert into user_availability (user_id, start_time, end_time, weekday)
        values (${userId}, ${start}, ${end}, ${b.day})
        on conflict (user_id, start_time, end_time, weekday) do nothing
      `
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("PUT /api/availability error:", err)
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}