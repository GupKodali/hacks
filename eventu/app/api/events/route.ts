import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    // optional query params
    const from = url.searchParams.get("from") // ISO string
    const to = url.searchParams.get("to")     // ISO string

    const nowIso = new Date().toISOString()
    const twoWeeksIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    const fromIso = from ?? nowIso
    const toIso = to ?? twoWeeksIso

    const rows = await sql<
      { id: number; name: string; start_time: string; end_time: string; location: string | null }[]
    >`
      SELECT id, name, start_time, end_time, location
      FROM events
      WHERE start_time >= ${fromIso}::timestamptz
        AND start_time < ${toIso}::timestamptz
      ORDER BY start_time ASC
    `

    return NextResponse.json({ ok: true, events: rows })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}