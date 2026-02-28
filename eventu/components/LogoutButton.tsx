"use client";

import { Button } from "./ui/button";

export default function LogoutButton() {

  return (
    <Button>
     <a href="/logged-out">Logout</a>
    </Button>
  );
}