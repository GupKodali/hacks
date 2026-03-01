import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";

export default async function PostLoginPage() {
  const session = await auth0.getSession();

  // if not completed onboarding


  const onboardingCompleted = false;

  if(!onboardingCompleted) {
    redirect("/onboarding/hobbies");
  }

  if (!session) {
    redirect("/login");
  }
  

  redirect("/dashboard");
}