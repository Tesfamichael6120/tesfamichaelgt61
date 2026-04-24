import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { ApplicationStatusSelect } from "@/components/employer/application-status-select";

export const metadata: Metadata = {
  title: "Job Applicants",
  description: "View and manage job applicants",
};

interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  resumeLink: string;
  coverLetter: string;
  status: "pending" | "reviewed" | "shortlisted" | "hired" | "rejected";
  appliedAt: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  status: string;
  postedBy: string;
}

async function getJob(id: string): Promise<Job | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/jobs/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getApplications(jobId: string): Promise<Application[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/applications?jobId=${jobId}`, {
      cache: "no-store",
    });
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

async function ApplicantsContent({ jobId }: { jobId: string }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const job = await getJob(jobId);

  if (!job) {
    notFound();
  }

  // Verify ownership
  if (job.postedBy !== userId) {
    redirect("/employer");
  }

  const applications = await getApplications(jobId);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/employer/jobs"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Applicants for {job.title}</h1>
        <p className="text-muted-foreground">
          {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"} received
        </p>
      </div>

      {/* Applicants List */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No applicants yet</h3>
            <p className="text-muted-foreground">
              Applications will appear here as candidates apply
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application._id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Applicant Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {application.name}
                      </h3>
                      <StatusBadge status={application.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <a
                        href={`mailto:${application.email}`}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                        {application.email}
                      </a>
                      <a
                        href={`tel:${application.phone}`}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                        {application.phone}
                      </a>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Applied {formatRelativeTime(application.appliedAt)}
                      </span>
                    </div>

                    {/* Cover Letter */}
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium">Cover Letter</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {application.coverLetter}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:items-end">
                    <ApplicationStatusSelect
                      applicationId={application._id}
                      currentStatus={application.status}
                    />
                    <a
                      href={application.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Resume
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicantsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-6 h-5 w-32" />
      <Skeleton className="mb-2 h-9 w-64" />
      <Skeleton className="mb-8 h-5 w-40" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<ApplicantsSkeleton />}>
      <ApplicantsContent jobId={id} />
    </Suspense>
  );
}
