import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Banknote,
  Building2,
  Calendar,
  Globe,
  Briefcase,
  ArrowLeft,
  Share2,
  BookmarkPlus,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getInitials, formatRelativeTime } from "@/lib/utils";
import { ApplyButton } from "@/components/jobs/apply-button";
import { JobCard } from "@/components/jobs/job-card";

interface Job {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: "remote" | "hybrid" | "on-site";
  type: string;
  salary: string;
  category: string;
  requirements: string[];
  description: string;
  deadline: Date | string;
  status: string;
  applicationsCount: number;
  createdAt: Date | string;
  postedBy: string;
}

async function getJob(id: string): Promise<Job | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/jobs/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getRelatedJobs(category: string, currentId: string): Promise<Job[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/jobs?category=${encodeURIComponent(category)}&limit=3&status=active`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || []).filter((job: Job) => job._id !== currentId);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    return { title: "Job Not Found" };
  }

  return {
    title: `${job.title} at ${job.company}`,
    description: job.description.slice(0, 160),
    openGraph: {
      title: `${job.title} at ${job.company}`,
      description: job.description.slice(0, 160),
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    notFound();
  }

  const relatedJobs = await getRelatedJobs(job.category, job._id);
  const isDeadlinePassed = new Date(job.deadline) < new Date();
  const isClosed = job.status === "closed";

  const workModeBadgeVariant =
    job.workMode === "remote"
      ? "success"
      : job.workMode === "hybrid"
        ? "warning"
        : "secondary";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/jobs" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Job Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Company Logo */}
                <Avatar className="h-16 w-16 rounded-xl">
                  {job.companyLogo ? (
                    <AvatarImage src={job.companyLogo} alt={job.company} />
                  ) : null}
                  <AvatarFallback className="rounded-xl bg-muted text-lg font-medium">
                    {getInitials(job.company)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-bold">{job.title}</h1>
                      <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={workModeBadgeVariant}>{job.workMode}</Badge>
                      {isClosed && <Badge variant="destructive">Closed</Badge>}
                      {isDeadlinePassed && !isClosed && (
                        <Badge variant="destructive">Deadline Passed</Badge>
                      )}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Banknote className="h-4 w-4" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {job.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Mobile */}
              <div className="mt-6 flex gap-2 lg:hidden">
                <ApplyButton
                  jobId={job._id}
                  jobTitle={job.title}
                  disabled={isClosed || isDeadlinePassed}
                />
                <Button variant="outline" size="icon">
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {job.description.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card - Desktop */}
          <Card className="hidden lg:block">
            <CardContent className="p-6">
              <ApplyButton
                jobId={job._id}
                jobTitle={job.title}
                disabled={isClosed || isDeadlinePassed}
                className="w-full"
              />
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Posted</span>
                <span className="text-sm font-medium">
                  {formatRelativeTime(job.createdAt)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deadline</span>
                <span className="text-sm font-medium">
                  {formatDate(job.deadline)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Applications
                </span>
                <span className="text-sm font-medium">
                  {job.applicationsCount}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Work Mode</span>
                <Badge variant={workModeBadgeVariant}>{job.workMode}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Job Type</span>
                <span className="text-sm font-medium capitalize">
                  {job.type}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About the Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-lg">
                  {job.companyLogo ? (
                    <AvatarImage src={job.companyLogo} alt={job.company} />
                  ) : null}
                  <AvatarFallback className="rounded-lg bg-muted">
                    {getInitials(job.company)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{job.company}</p>
                  <Link
                    href={`/companies?search=${encodeURIComponent(job.company)}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View Company Profile
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Jobs */}
      {relatedJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Related Jobs</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedJobs.slice(0, 3).map((relatedJob) => (
              <JobCard key={relatedJob._id} job={relatedJob} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
