import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auth0Id = session.user.sub;
  const email = session.user.email;
  const body = await req.json();
  const longitude = body.longitude;
  const latitude = body.latitude;
  await sql`
    INSERT INTO users (user_id, username, longitude, latitude)
    VALUES (${auth0Id}, ${email ?? 'User'}, ${longitude ?? null}, ${latitude ?? null})
    ON CONFLICT (user_id)
    DO UPDATE SET
    longitude = EXCLUDED.longitude,
    latitude = EXCLUDED.latitude;
  `;

  return NextResponse.json({ success: true });
}