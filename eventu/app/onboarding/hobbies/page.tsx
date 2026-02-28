// app/onboarding/hobbies/page.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import HobbiesClient from "./ui";

export default async function HobbiesPage() {
  const session = await auth0.getSession();
  if (!session) redirect("/login");

  return <HobbiesClient />;
}