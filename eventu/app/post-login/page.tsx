import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export default async function PostLoginPage() {
//   const session = await auth0.getSession();

//   if (!session) {
//     redirect("/login");
//   }

//   const auth0Sub = session.user.sub;

//   let user = await prisma.user.findUnique({
//     where: { auth0Sub },
//   });


//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         auth0Sub,
//         email: session.user.email,
//         name: session.user.name,
//         onboardingComplete: false,
//       },
//     });
//   }

//   if (!user.onboardingComplete) {
//     redirect("/onboarding");
//   }

//   redirect("/dashboard");
}