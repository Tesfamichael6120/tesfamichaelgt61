import { Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import clientPromise from "@/lib/db";
import { AdminJobActions } from "@/components/admin/admin-job-actions";

interface SearchParams {
  search?: string;
  status?: string;
  page?: string;
}

async function getJobs(searchParams: SearchParams) {
  try {
    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    const query: any = {};

    if (searchParams.search) {
      query.$or = [
        { title: { $regex: searchParams.search, $options: "i" } },
        { company: { $regex: searchParams.search, $options: "i" } },
      ];
    }

    if (searchParams.status && searchParams.status !== "all") {
      query.status = searchParams.status;
    }

    const page = parseInt(searchParams.page || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      db
        .collection("jobs")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("jobs").countDocuments(query),
    ]);

    return {
      jobs: jobs.map((job) => ({
        ...job,
        _id: job._id.toString(),
      })),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return { jobs: [], total: 0, pages: 0, currentPage: 1 };
  }
}

function JobsTableSkeleton() {
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

async function JobsTable({ searchParams }: { searchParams: SearchParams }) {
  const { jobs, total, pages, currentPage } = await getJobs(searchParams);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No jobs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing {jobs.length} of {total} jobs
      </div>

      <div className="space-y-3">
        {jobs.map((job: any) => (
          <div
            key={job._id}
            className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  {job.company[0]}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{job.title}</h3>
                <Badge
                  variant={job.status === "active" ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {job.status === "active" ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {job.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{job.company}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.type}</span>
                <span>•</span>
                <span>{job.applicationsCount || 0} applications</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {new Date(job.createdAt).toLocaleDateString()}
            </div>

            <AdminJobActions jobId={job._id} status={job.status} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/jobs?page=${currentPage - 1}${
                  searchParams.search ? `&search=${searchParams.search}` : ""
                }${
                  searchParams.status ? `&status=${searchParams.status}` : ""
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
                href={`/admin/jobs?page=${currentPage + 1}${
                  searchParams.search ? `&search=${searchParams.search}` : ""
                }${
                  searchParams.status ? `&status=${searchParams.status}` : ""
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

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Jobs</h2>
          <p className="text-muted-foreground">
            Review, approve, or remove job listings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <form className="flex-1 flex gap-2" action="/admin/jobs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search jobs..."
                  defaultValue={params.search}
                  className="pl-9"
                />
              </div>
              <select
                name="status"
                defaultValue={params.status || "all"}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
              <Button type="submit">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<JobsTableSkeleton />}>
            <JobsTable searchParams={params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
