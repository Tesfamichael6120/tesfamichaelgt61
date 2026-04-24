import { Suspense } from "react";
import Link from "next/link";
import { Search, Filter, Building2, Briefcase, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clientPromise from "@/lib/db";
import { AdminUserActions } from "@/components/admin/admin-user-actions";

interface SearchParams {
  search?: string;
  page?: string;
}

async function getEmployers(searchParams: SearchParams) {
  try {
    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    const query: any = { role: "employer" };

    if (searchParams.search) {
      query.$or = [
        { email: { $regex: searchParams.search, $options: "i" } },
        { companyName: { $regex: searchParams.search, $options: "i" } },
      ];
    }

    const page = parseInt(searchParams.page || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const [employers, total] = await Promise.all([
      db
        .collection("users")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("users").countDocuments(query),
    ]);

    // Get job counts for each employer
    const employerIds = employers.map((e) => e.clerkId);
    const jobCounts = await db
      .collection("jobs")
      .aggregate([
        { $match: { postedBy: { $in: employerIds } } },
        { $group: { _id: "$postedBy", count: { $sum: 1 } } },
      ])
      .toArray();

    const jobCountMap = new Map(jobCounts.map((j: any) => [j._id, j.count]));

    return {
      employers: employers.map((employer) => ({
        ...employer,
        _id: employer._id.toString(),
        jobCount: jobCountMap.get(employer.clerkId) || 0,
      })),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch employers:", error);
    return { employers: [], total: 0, pages: 0, currentPage: 1 };
  }
}

function EmployersTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

async function EmployersTable({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { employers, total, pages, currentPage } = await getEmployers(
    searchParams
  );

  if (employers.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No employers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing {employers.length} of {total} employers
      </div>

      <div className="space-y-3">
        {employers.map((employer: any) => (
          <div
            key={employer._id}
            className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">
                  {employer.companyName || employer.email || employer.clerkId}
                </p>
                <Badge variant="outline" className="shrink-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {employer.email || `Clerk ID: ${employer.clerkId}`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              {employer.jobCount} jobs
            </div>

            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Joined {new Date(employer.createdAt).toLocaleDateString()}
            </div>

            <AdminUserActions
              userId={employer._id}
              clerkId={employer.clerkId}
              currentRole={employer.role}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/employers?page=${currentPage - 1}${
                  searchParams.search ? `&search=${searchParams.search}` : ""
                }`}
              >
                Previous
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {pages}
          </span>
          {currentPage < pages && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/employers?page=${currentPage + 1}${
                  searchParams.search ? `&search=${searchParams.search}` : ""
                }`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default async function AdminEmployersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Employers</h2>
        <p className="text-muted-foreground">
          Approve or ban employer accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <form
            className="flex flex-col sm:flex-row gap-4"
            action="/admin/employers"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search employers..."
                defaultValue={params.search}
                className="pl-9"
              />
            </div>
            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<EmployersTableSkeleton />}>
            <EmployersTable searchParams={params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
