import { Suspense } from "react";
import {
  Briefcase,
  Users,
  Building2,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import clientPromise from "@/lib/db";

async function getAdminStats() {
  try {
    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    const [
      totalJobs,
      activeJobs,
      closedJobs,
      totalUsers,
      totalEmployers,
      totalApplications,
      pendingApplications,
      recentJobs,
    ] = await Promise.all([
      db.collection("jobs").countDocuments(),
      db.collection("jobs").countDocuments({ status: "active" }),
      db.collection("jobs").countDocuments({ status: "closed" }),
      db.collection("users").countDocuments({ role: "jobseeker" }),
      db.collection("users").countDocuments({ role: "employer" }),
      db.collection("applications").countDocuments(),
      db.collection("applications").countDocuments({ status: "pending" }),
      db
        .collection("jobs")
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
    ]);

    return {
      totalJobs,
      activeJobs,
      closedJobs,
      totalUsers,
      totalEmployers,
      totalApplications,
      pendingApplications,
      recentJobs,
    };
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return {
      totalJobs: 0,
      activeJobs: 0,
      closedJobs: 0,
      totalUsers: 0,
      totalEmployers: 0,
      totalApplications: 0,
      pendingApplications: 0,
      recentJobs: [],
    };
  }
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

async function AdminStatsCards() {
  const stats = await getAdminStats();

  const statsData = [
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      description: `${stats.activeJobs} active, ${stats.closedJobs} closed`,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Job Seekers",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Employers",
      value: stats.totalEmployers,
      description: "Company accounts",
      icon: Building2,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Applications",
      value: stats.totalApplications,
      description: `${stats.pendingApplications} pending review`,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RecentJobsTable() {
  const stats = await getAdminStats();

  if (stats.recentJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No jobs posted yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.recentJobs.map((job: any) => (
            <div
              key={job._id.toString()}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{job.title}</p>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    job.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {job.status === "active" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {job.status}
                </span>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    {
      title: "Manage Jobs",
      description: "Review, approve, or remove job listings",
      href: "/admin/jobs",
      icon: Briefcase,
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Manage Employers",
      description: "Approve or ban employer accounts",
      href: "/admin/employers",
      icon: Building2,
    },
    {
      title: "View Analytics",
      description: "See traffic and usage statistics",
      href: "/admin/analytics",
      icon: TrendingUp,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <action.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to the Ethiopia Remote Talent admin panel
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <AdminStatsCards />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          }
        >
          <RecentJobsTable />
        </Suspense>

        <QuickActions />
      </div>
    </div>
  );
}
