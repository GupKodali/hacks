"use client";

import { Button } from "./ui/button";

export default function LogoutButton() {

  return (
    <Button>
      <a href="/auth/logout?returnTo=/logged-out">
  Logout
</a>
    </Button>
  );
}