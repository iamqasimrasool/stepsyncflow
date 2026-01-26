"use client";

import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useHeader } from "@/components/layout/HeaderContext";
import SignOutButton from "@/components/auth/SignOutButton";

export default function AppHeader({
  orgName,
  showAdmin,
}: {
  orgName: string;
  showAdmin: boolean;
}) {
  const { header } = useHeader();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <p className="text-xs uppercase text-muted-foreground">Workspace</p>
            <Link href="/app" className="text-lg font-semibold hover:underline">
              {orgName}
            </Link>
          </div>
          <div className="hidden items-center gap-3 text-sm md:flex">
            <Link href="/app" className="font-medium text-foreground/80 hover:text-foreground">
              Home
            </Link>
            {showAdmin && (
              <Link
                href="/app/admin/sops"
                className="font-medium text-foreground/80 hover:text-foreground"
              >
                Flows
              </Link>
            )}
          </div>
        </div>
        <div className="hidden flex-1 md:block" />
        <div className="flex items-center gap-2">
          <Link
            href="/app/search"
            className="hidden items-center gap-2 rounded-full border border-white/40 bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur hover:bg-white sm:flex"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
          {showAdmin && (
            <Link
              href="/app/profile"
              className="hidden items-center justify-center rounded-full border border-white/40 bg-white/70 p-2 text-sm shadow-sm backdrop-blur hover:bg-white sm:flex"
              aria-label="Admin"
            >
              <User className="h-4 w-4" />
            </Link>
          )}
          <div className="hidden sm:block">
            <SignOutButton />
          </div>
          <Link
            href="/app/search"
            className="flex items-center justify-center rounded-full border p-2 text-sm hover:bg-muted sm:hidden"
            aria-label="Search SOPs"
          >
            <Search className="h-4 w-4" />
          </Link>
          {mounted && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="space-y-4 pt-10">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <Link href="/app" className="block text-lg font-semibold">
                  Home
                </Link>
                {showAdmin && (
                  <Link
                    href="/app/admin/sops"
                    className="block text-lg font-semibold"
                  >
                    Flows
                  </Link>
                )}
                {showAdmin && (
                  <Link href="/app/profile" className="block text-lg font-semibold">
                    Admin
                  </Link>
                )}
                <SignOutButton />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
