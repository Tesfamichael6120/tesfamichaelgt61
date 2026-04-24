import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Users,
  PlusCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Power,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import { JobActions } from "@/components/employer/job-actions";

export const metadata: Metadata = {
  title: "Manage Jobs",
  description: "View and manage your job postings",
};

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  type: string;
  status: "active" | "closed";
  applicationsCount: number;
  deadline: string;
  createdAt: string;
}

async function getEmployerJobs(userId: string): Promise<Job[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/jobs?postedBy=${userId}&limit=100`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs || [];
  } catch {
    return [];
  }
}

async function JobsListContent() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const jobs = await getEmployerJobs(userId);

  if (jobs.length === 0) {
    return (
      <div className="py-12 text-center">
        <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No jobs posted yet</h3>
        <p className="mb-4 text-muted-foreground">
          Create your first job listing to start receiving applications
        </p>
        <Link href="/employer/jobs/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Post Your First Job
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job._id}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Job Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{job.title}</h3>
                  <Badge
                    variant={job.status === "active" ? "success" : "secondary"}
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{job.location}</span>
                  <span className="capitalize">{job.type}</span>
                  <span className="capitalize">{job.workMode}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>Posted {formatRelativeTime(job.createdAt)}</span>
                  <span>Deadline: {formatDate(job.deadline)}</span>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-lg font-semibold">
                    <Users className="h-4 w-4" />
                    {job.applicationsCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Applicants</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/employer/jobs/${job._id}/applicants`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <JobActions job={job} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function JobsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-36" />
      ))}
    </div>
  );
}

export default function ManageJobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Jobs</h1>
          <p className="text-muted-foreground">
            View and manage your job postings
          </p>
        </div>
        <Link href="/employer/jobs/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Jobs List */}
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsListContent />
      </Suspense>
    </div>
  );
}
