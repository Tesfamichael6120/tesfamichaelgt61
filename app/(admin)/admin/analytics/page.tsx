import { Suspense } from "react";
import {
  TrendingUp,
  Users,
  Briefcase,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import clientPromise from "@/lib/db";

async function getAnalyticsData() {
  try {
    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period stats
    const [
      totalJobs,
      newJobsThisMonth,
      newJobsLastMonth,
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalApplications,
      newAppsThisMonth,
      newAppsLastMonth,
      jobsByCategory,
      jobsByType,
      jobsByWorkMode,
      applicationsByStatus,
      recentActivity,
    ] = await Promise.all([
      db.collection("jobs").countDocuments(),
      db.collection("jobs").countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      db.collection("jobs").countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
      db.collection("users").countDocuments(),
      db.collection("users").countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      db.collection("users").countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
      db.collection("applications").countDocuments(),
      db.collection("applications").countDocuments({
        appliedAt: { $gte: thirtyDaysAgo },
      }),
      db.collection("applications").countDocuments({
        appliedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
      db
        .collection("jobs")
        .aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ])
        .toArray(),
      db
        .collection("jobs")
        .aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])
        .toArray(),
      db
        .collection("jobs")
        .aggregate([{ $group: { _id: "$workMode", count: { $sum: 1 } } }])
        .toArray(),
      db
        .collection("applications")
        .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        .toArray(),
      db
        .collection("jobs")
        .find()
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray(),
    ]);

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      overview: {
        totalJobs,
        jobsGrowth: calculateGrowth(newJobsThisMonth, newJobsLastMonth),
        totalUsers,
        usersGrowth: calculateGrowth(newUsersThisMonth, newUsersLastMonth),
        totalApplications,
        applicationsGrowth: calculateGrowth(newAppsThisMonth, newAppsLastMonth),
        newJobsThisMonth,
        newUsersThisMonth,
        newAppsThisMonth,
      },
      jobsByCategory,
      jobsByType,
      jobsByWorkMode,
      applicationsByStatus,
      recentActivity: recentActivity.map((job) => ({
        ...job,
        _id: job._id.toString(),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return {
      overview: {
        totalJobs: 0,
        jobsGrowth: 0,
        totalUsers: 0,
        usersGrowth: 0,
        totalApplications: 0,
        applicationsGrowth: 0,
        newJobsThisMonth: 0,
        newUsersThisMonth: 0,
        newAppsThisMonth: 0,
      },
      jobsByCategory: [],
      jobsByType: [],
      jobsByWorkMode: [],
      applicationsByStatus: [],
      recentActivity: [],
    };
  }
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

async function AnalyticsContent() {
  const data = await getAnalyticsData();

  const overviewCards = [
    {
      title: "Total Jobs",
      value: data.overview.totalJobs,
      change: data.overview.jobsGrowth,
      subtitle: `${data.overview.newJobsThisMonth} new this month`,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Users",
      value: data.overview.totalUsers,
      change: data.overview.usersGrowth,
      subtitle: `${data.overview.newUsersThisMonth} new this month`,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Applications",
      value: data.overview.totalApplications,
      change: data.overview.applicationsGrowth,
      subtitle: `${data.overview.newAppsThisMonth} new this month`,
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {overviewCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`flex items-center text-xs font-medium ${
                    card.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {card.change >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(card.change)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {card.subtitle}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Jobs by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.jobsByCategory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No data available
              </p>
            ) : (
              <div className="space-y-4">
                {data.jobsByCategory.map((cat: any, index: number) => {
                  const maxCount = data.jobsByCategory[0]?.count || 1;
                  const percentage = (cat.count / maxCount) * 100;
                  return (
                    <div key={cat._id || index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{cat._id || "Uncategorized"}</span>
                        <span className="text-muted-foreground">{cat.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs by Work Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs by Work Mode</CardTitle>
          </CardHeader>
          <CardContent>
            {data.jobsByWorkMode.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No data available
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {data.jobsByWorkMode.map((mode: any) => (
                  <div
                    key={mode._id}
                    className="text-center p-4 rounded-lg bg-muted/50"
                  >
                    <div className="text-2xl font-bold">{mode.count}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {mode._id || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data.applicationsByStatus.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No applications yet
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data.applicationsByStatus.map((status: any) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-yellow-100 text-yellow-700",
                    reviewed: "bg-blue-100 text-blue-700",
                    shortlisted: "bg-green-100 text-green-700",
                    hired: "bg-emerald-100 text-emerald-700",
                    rejected: "bg-red-100 text-red-700",
                  };
                  return (
                    <div
                      key={status._id}
                      className={`text-center p-3 rounded-lg ${
                        statusColors[status._id] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="text-xl font-bold">{status.count}</div>
                      <div className="text-xs capitalize">{status._id}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {data.jobsByType.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No data available
              </p>
            ) : (
              <div className="space-y-3">
                {data.jobsByType.map((type: any) => (
                  <div
                    key={type._id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <span className="font-medium capitalize">{type._id || "Unknown"}</span>
                    <span className="text-muted-foreground">{type.count} jobs</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Job Postings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-4">
              {data.recentActivity.map((job: any) => (
                <div
                  key={job._id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.company} - {job.location}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          View traffic and usage statistics
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
