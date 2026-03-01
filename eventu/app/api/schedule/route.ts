// src/app/api/schedule/route.ts
import { NextResponse } from "next/server"
import { fetchAllUsersBarebones } from "@/lib/fetchUsers"
import { suggestOneEventPerHobby } from "@/lib/schedule"

function num(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const day = url.searchParams.get("day") ?? "2026-03-01"
    const duration = num(url.searchParams.get("duration"), 90)
    const step = num(url.searchParams.get("step"), 30)
    const min = num(url.searchParams.get("min"), 2)

    const users = await fetchAllUsersBarebones()

    const suggestions = suggestOneEventPerHobby(users, {
      dayIso: day,
      durationMinutes: duration,
      stepMinutes: step,
      minAttendees: min,
      timeZone: "America/Chicago",
      dayStartHour: 8,
      dayEndHour: 22,
    })

    return NextResponse.json({
      ok: true,
      day,
      suggestions,
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}