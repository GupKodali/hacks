// import { auth0 } from "@/lib/auth0"
// import { sql } from "@/lib/db"

// const VALID_KINDS = new Set(["scheduled", "manual", "jumpin"])

// export async function GET() {
//   try {
//     const session = await auth0.getSession()
//     if (!session?.user?.sub) {
//       return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       })
//     }
//     const userId = session.user.sub

//     // IMPORTANT:
//     // Replace `event_registrations` with YOUR table name if different.
//     // This joins events so the client can render without extra lookups.
//     const result = await sql`
//       select
//         r.id,
//         r.user_id as user_sub,
//         r.event_id,
//         r.kind,
//         r.display_name,
//         r.created_at,
//         e.name as event_name,
//         e.start_time,
//         e.end_time,
//         e.location,
//         coalesce(e.description, '') as description
//       from event_registrations r
//       join events e on e.id = r.event_id
//       where r.user_id = ${userId}
//       order by e.start_time asc
//     `
//     const rows = (result as any).rows ?? result ?? []

//     return new Response(JSON.stringify({ ok: true, registrations: rows }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     })
//   } catch (err: any) {
//     console.error("GET /api/registrations error:", err)
//     return new Response(JSON.stringify({ ok: false, error: err?.message ?? "Server error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     })
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const session = await auth0.getSession()
//     if (!session?.user?.sub) {
//       return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       })
//     }
//     const userId = session.user.sub

//     const body = await req.json().catch(() => null)
//     const eventId = Number(body?.eventId)
//     const kind = body?.kind
//     const displayName = typeof body?.displayName === "string" ? body.displayName : null

//     if (!Number.isFinite(eventId)) {
//       return new Response(JSON.stringify({ ok: false, error: "Invalid eventId" }), { status: 400 })
//     }
//     if (!VALID_KINDS.has(kind)) {
//       return new Response(JSON.stringify({ ok: false, error: "Invalid kind" }), { status: 400 })
//     }

//     // Replace `event_registrations` with YOUR table name if different.
//     await sql`
//       insert into event_registrations (user_id, event_id, kind, display_name)
//       values (${userId}, ${eventId}, ${kind}, ${displayName})
//       on conflict (user_id, event_id) do nothing
//     `

//     return new Response(JSON.stringify({ ok: true }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     })
//   } catch (err: any) {
//     console.error("POST /api/registrations error:", err)
//     return new Response(JSON.stringify({ ok: false, error: err?.message ?? "Server error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     })
//   }
// }

// export async function DELETE(req: Request) {
//   try {
//     const session = await auth0.getSession()
//     if (!session?.user?.sub) {
//       return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       })
//     }
//     const userId = session.user.sub

//     const url = new URL(req.url)
//     const eventId = Number(url.searchParams.get("eventId"))
//     if (!Number.isFinite(eventId)) {
//       return new Response(JSON.stringify({ ok: false, error: "Invalid eventId" }), { status: 400 })
//     }

//     await sql`
//       delete from event_registrations
//       where user_id = ${userId} and event_id = ${eventId}
//     `

//     return new Response(JSON.stringify({ ok: true }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     })
//   } catch (err: any) {
//     console.error("DELETE /api/registrations error:", err)
//     return new Response(JSON.stringify({ ok: false, error: err?.message ?? "Server error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     })
//   }
// }

import { auth0 } from "@/lib/auth0"
import { sql } from "@/lib/db"

const VALID_KINDS = new Set(["scheduled", "manual", "jumpin"])

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

    // Join to events to get dates/times/location/etc.
    const result = await sql`
      select
        a.event_id,
        e.name as event_name,
        e.start_time,
        e.end_time,
        e.location,
        coalesce(e.description, '') as description
      from event_attendees a
      join events e on e.id = a.event_id
      where a.user_id = ${userId}
      order by e.start_time asc
    `
    const rows = (result as any).rows ?? result ?? []

    // Your dashboard expects "kind" + "created_at" fields.
    // If your event_attendees table DOES NOT store them, we return defaults here.
    const displayName = session.user.name || session.user.email || "(unknown)"
    const nowIso = new Date().toISOString()

    const registrations = rows.map((r: any) => ({
      // match the shape your dashboard mapping expects
      event_id: Number(r.event_id),
      kind: "manual",
      created_at: nowIso,
      display_name: displayName,

      // joined event fields
      event_name: r.event_name,
      start_time: r.start_time,
      end_time: r.end_time,
      location: r.location,
      description: r.description,
    }))

    return new Response(JSON.stringify({ ok: true, registrations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("GET /api/registrations error:", err)
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(req: Request) {
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
    const eventId = Number(body?.eventId)
    const kind = body?.kind

    if (!Number.isFinite(eventId)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid eventId" }), { status: 400 })
    }
    // We accept kind, but if you don't store it in DB we just ignore it.
    if (kind && !VALID_KINDS.has(kind)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid kind" }), { status: 400 })
    }

    // Insert without needing a UNIQUE constraint:
    await sql`
      insert into event_attendees (user_id, event_id)
      select ${userId}, ${eventId}
      where not exists (
        select 1 from event_attendees
        where user_id = ${userId} and event_id = ${eventId}
      )
    `

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("POST /api/registrations error:", err)
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth0.getSession()
    if (!session?.user?.sub) {
      return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
    const userId = session.user.sub

    const url = new URL(req.url)
    const eventId = Number(url.searchParams.get("eventId"))
    if (!Number.isFinite(eventId)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid eventId" }), { status: 400 })
    }

    await sql`
      delete from event_attendees
      where user_id = ${userId} and event_id = ${eventId}
    `

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("DELETE /api/registrations error:", err)
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}