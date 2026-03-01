import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { sql } from "@/lib/db";

export default async function PostLoginPage() {

  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.sub;
  const email = session.user.email;
  const safeEmail = email ?? "User";

  await sql`
    INSERT INTO users (user_id, username, longitude, latitude)
    VALUES (${userId}, ${safeEmail}, NULL, NULL)
    ON CONFLICT (user_id) DO NOTHING
  `;


  const result = await sql<{ completed: boolean }[]>`
    SELECT EXISTS(
      SELECT 1 
      FROM user_availability ua
      JOIN user_tags ut ON ua.user_id = ut.user_id
      WHERE ua.user_id = ${userId}
    ) AS completed
  `;

  const onboardingCompleted = result[0]?.completed ?? false;


  if (!onboardingCompleted) {
    redirect("/onboarding/hobbies");
  }  

  redirect("/dashboard");
}