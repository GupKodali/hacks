// app/onboarding/deposit/page.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import DepositClient from "./ui";

export default async function DepositPage() {
  const session = await auth0.getSession();
  if (!session) redirect("/login");

  return <DepositClient />;
}