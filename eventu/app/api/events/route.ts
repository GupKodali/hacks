import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

type DbEventRow = {
  id: number
  name: string
  start_time: string
  end_time: string
  location: string | null
  description?: string | null
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    // Optional query params
    const from = url.searchParams.get("from") // ISO
    const to = url.searchParams.get("to") // ISO

    // Default window: include recent past to avoid "why isn't my new row showing?"
    const fromDefault = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    const toDefault = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ahead

    const fromIso = from ?? fromDefault
    const toIso = to ?? toDefault

    const result = await sql<DbEventRow[]>`
      SELECT id, name, start_time, end_time, location, description
      FROM events
      WHERE start_time >= ${fromIso}::timestamptz
        AND start_time < ${toIso}::timestamptz
      ORDER BY start_time ASC
    `

    // Some sql helpers return an array directly; others return { rows }
    const rows = (result as any)?.rows ?? result ?? []

    return NextResponse.json(
      { ok: true, events: rows, meta: { fromIso, toIso, count: rows.length } },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  } catch (e: any) {
    console.error("GET /api/events error:", e)
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}