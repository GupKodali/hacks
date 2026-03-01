// src/lib/fetchUsersBarebones.ts
import type { User } from "./schedule"

export async function fetchAllUsersBarebones(): Promise<User[]> {
  // Replace this with your real fetch (db call, etc.)
  // For MVP: you can keep mock data here.

  return [
    {
      id: "u1",
      name: "A",
      hobbies: ["basketball", "tennis"],
      availability: [
        { start: "2026-03-01T15:00:00.000Z", end: "2026-03-01T20:00:00.000Z" },
      ],
    },
    {
      id: "u2",
      name: "B",
      hobbies: ["basketball"],
      availability: [
        { start: "2026-03-01T16:00:00.000Z", end: "2026-03-01T22:00:00.000Z" },
      ],
    },
    {
      id: "u3",
      name: "C",
      hobbies: ["tennis"],
      availability: [
        { start: "2026-03-01T17:00:00.000Z", end: "2026-03-01T19:30:00.000Z" },
      ],
    },
  ]
}