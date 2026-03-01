import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { sql } from '@/lib/db';

export async function POST() {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auth0Id = session.user.sub;
  const email = session.user.email;

  // Insert new user if not exists
  await sql`
    INSERT INTO users (user_id, email)
    VALUES (${auth0Id}, ${email ?? 'User'})
    ON CONFLICT (user_id) DO NOTHING
  `;

  return NextResponse.json({ success: true });
}