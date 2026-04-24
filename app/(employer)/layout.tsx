import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  Briefcase,
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/employer",
    icon: LayoutDashboard,
  },
  {
    title: "Post New Job",
    href: "/employer/jobs/new",
    icon: PlusCircle,
  },
  {
    title: "Manage Jobs",
    href: "/employer/jobs",
    icon: FolderOpen,
  },
];

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) || "jobseeker";

  // Allow both employers and admins
  if (role !== "employer" && role !== "admin") {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">Employer Portal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <link.icon className="h-5 w-5" />
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Main Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          {/* Mobile Menu */}
          <div className="flex items-center gap-4 lg:hidden">
            <Link href="/employer" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Briefcase className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Employer</span>
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/employer/jobs/new">
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Post Job
              </Button>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.firstName || "Employer"}
            </span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Link href="/employer/jobs/new" className="hidden lg:block">
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card lg:hidden">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground hover:text-foreground"
            >
              <link.icon className="h-5 w-5" />
              <span>{link.title}</span>
            </Link>
          ))}
        </nav>

        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
