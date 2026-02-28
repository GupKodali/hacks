// app/onboarding/availability/page.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import AvailabilityClient from "./ui";

export default async function AvailabilityPage() {
  const session = await auth0.getSession();
  if (!session) redirect("/login");

  return <AvailabilityClient />;
}