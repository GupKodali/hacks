import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auth0Id = session.user.sub;

  // Get all tags
  const allTags = await sql`
    SELECT id, name
    FROM tags
    ORDER BY name ASC
  `;

  // Get user's selected tags
  const userTags = await sql`
    SELECT tag_id
    FROM user_tags
    WHERE user_id = ${auth0Id}
  `;

  return NextResponse.json({
    allTags,
    userTagIds: userTags.map((t) => t.tag_id),
  });
}