import { auth0 } from "@/lib/auth0";
import { sql } from "@/lib/db";
import { CaseLower } from "lucide-react";

export async function POST(req: Request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user?.sub) return new Response("Not authenticated", { status: 401 });
    const userId = session.user.sub;
    const body = await req.json();
    const blocks = body.availabilityBlocks ?? [];
    const interestIds = body.interestIds ?? [];

    // Insert availability
    for (const b of blocks) {
        let day_num = 0;
        switch (b.day) {
            case 'Sun':
                day_num = 0;
                break;
            case 'Mon':
                day_num = 1;
                break;
            case 'Tue':
                day_num = 2;
                break;
            case 'Wed':
                day_num = 3;
                break;
            case 'Thu':
                day_num = 4;
                break;
            case 'Fri':
                day_num = 5;
                break;
            default:
                day_num = 6;
        }

      await sql`
        INSERT INTO user_availability (user_id, start_time, end_time, weekday)
        VALUES (${userId}, ${b.start}, ${b.end}, ${day_num})
        ON CONFLICT (user_id, start_time, end_time, weekday) DO NOTHING
      `;
    }

    // Insert tags
    for (const tagName of interestIds) {
        const name = tagName.toLowerCase();
        await sql`
            INSERT INTO user_tags (user_id, tag_id)
            SELECT ${userId}, id
            FROM tags
            WHERE name = ${name}
            ON CONFLICT (user_id, tag_id) DO NOTHING
        `;
    }

    return new Response("Preferences saved", { status: 200 });
  } catch (err) {
    console.error("Error saving preferences:", err);
    return new Response("Failed to save preferences", { status: 500 });
  }
}