"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        const origin = window.location.origin;
        signOut({ callbackUrl: `${origin}/login` });
      }}
    >
      Log out
    </Button>
  );
}
