"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Briefcase, Building2, User, Shield } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user role from public metadata
  const role = (user?.publicMetadata?.role as string) || "jobseeker";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-semibold sm:inline-block">
            Ethiopia Remote Talent
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/jobs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Find Jobs
          </Link>
          <Link
            href="/companies"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Companies
          </Link>
          {isSignedIn && (
            <>
              {role === "employer" || role === "admin" ? (
                <Link
                  href="/employer"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Employer Dashboard
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              )}
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/employer/jobs/new" className="hidden md:block">
                <Button size="sm">Post a Job</Button>
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Get Started</Button>
              </SignUpButton>
            </div>
          )}

          {/* Mobile Menu Button */}
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/jobs" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Find Jobs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/companies" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Companies
                </Link>
              </DropdownMenuItem>
              {isSignedIn && (
                <>
                  <DropdownMenuSeparator />
                  {role === "employer" || role === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/employer"
                        className="flex items-center gap-2"
                      >
                        <Building2 className="h-4 w-4" />
                        Employer Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/employer/jobs/new"
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="h-4 w-4" />
                      Post a Job
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              {!isSignedIn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <SignInButton mode="modal">
                      <button className="flex w-full items-center gap-2">
                        Sign In
                      </button>
                    </SignInButton>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <SignUpButton mode="modal">
                      <button className="flex w-full items-center gap-2 font-medium text-primary">
                        Get Started
                      </button>
                    </SignUpButton>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
