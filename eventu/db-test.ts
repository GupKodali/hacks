import "dotenv/config"
import postgres from "postgres"

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: { rejectUnauthorized: false },
})

async function test() {
  try {
    const result = await sql`SELECT NOW() AS now`
    console.log("Database connected! Current time:", result[0].now)
    process.exit(0)
  } catch (err) {
    console.error("Database connection failed:", err)
    process.exit(1)
  }
}

test()