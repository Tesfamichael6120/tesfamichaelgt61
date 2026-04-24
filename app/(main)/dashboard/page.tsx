import { Suspense } from "react";
import { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRelativeTime, getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View and manage your job applications",
};

interface Application {
  _id: string;
  jobId: string;
  name: string;
  email: string;
  status: "pending" | "reviewed" | "shortlisted" | "hired" | "rejected";
  appliedAt: string;
  job: {
    _id: string;
    title: string;
    company: string;
    companyLogo?: string;
  } | null;
}

async function getApplications(userId: string): Promise<Application[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/applications?applicantId=${userId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.applications || [];
  } catch {
    return [];
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "success" | "destructive" | "warning"> = {
    pending: "secondary",
    reviewed: "warning",
    shortlisted: "default",
    hired: "success",
    rejected: "destructive",
  };

  return (
    <Badge variant={variants[status] || "secondary"} className="capitalize">
      {status}
    </Badge>
  );
}

function StatusIcon({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4 text-muted-foreground" />,
    reviewed: <FileText className="h-4 w-4 text-warning" />,
    shortlisted: <CheckCircle2 className="h-4 w-4 text-primary" />,
    hired: <CheckCircle2 className="h-4 w-4 text-success" />,
    rejected: <XCircle className="h-4 w-4 text-destructive" />,
  };

  return icons[status] || <Clock className="h-4 w-4" />;
}

async function DashboardContent() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const applications = await getApplications(userId);

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          Welcome back, {user?.firstName || "there"}!
        </h1>
        <p className="text-muted-foreground">
          Track your job applications and manage your profile
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Applied</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.shortlisted}</p>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.hired}</p>
              <p className="text-sm text-muted-foreground">Hired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Applications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Applications</CardTitle>
              <Link href="/jobs">
                <Button variant="outline" size="sm">
                  Browse Jobs
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
                  title="No applications yet"
                  description="Start applying to jobs to see your applications here"
                  action={{ label: "Find Jobs", href: "/jobs" }}
                />
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application._id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <Avatar className="h-12 w-12 rounded-lg">
                        {application.job?.companyLogo ? (
                          <AvatarImage
                            src={application.job.companyLogo}
                            alt={application.job.company}
                          />
                        ) : null}
                        <AvatarFallback className="rounded-lg bg-muted">
                          {application.job
                            ? getInitials(application.job.company)
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium">
                              {application.job?.title || "Unknown Position"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {application.job?.company || "Unknown Company"}
                            </p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <StatusIcon status={application.status} />
                            <span className="capitalize">{application.status}</span>
                          </span>
                          <span>
                            Applied {formatRelativeTime(application.appliedAt)}
                          </span>
                        </div>
                      </div>
                      {application.job && (
                        <Link href={`/jobs/${application.job._id}`}>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.imageUrl} alt={user?.firstName || ""} />
                  <AvatarFallback>
                    {getInitials(`${user?.firstName || ""} ${user?.lastName || ""}`)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{user?.createdAt ? formatRelativeTime(user.createdAt) : "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/jobs" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/jobs?workMode=remote" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Remote Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-2 h-9 w-64" />
      <Skeleton className="mb-8 h-5 w-80" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
