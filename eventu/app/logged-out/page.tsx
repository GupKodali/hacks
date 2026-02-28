"use client"

import { auth0 } from "@/lib/auth0";
import Link from "next/link";

export default async function LoggedOutPage() {
  const session = await auth0.getSession();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>You have been logged out</h1>

        <p>You are successfully signed out.</p>
   

      <Link
        href="/auth/login?prompt=login"
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "black",
          color: "white",
          borderRadius: "6px",
        }}
      >
        Login Again
      </Link>
    </div>
  );
}