import Link from "next/link";
import { MapPin, Clock, Banknote, Building2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime, getInitials } from "@/lib/utils";

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    company: string;
    companyLogo?: string;
    location: string;
    workMode: "remote" | "hybrid" | "on-site";
    type: string;
    salary: string;
    category: string;
    deadline: Date | string;
    createdAt: Date | string;
  };
}

export function JobCard({ job }: JobCardProps) {
  const workModeBadgeVariant =
    job.workMode === "remote"
      ? "success"
      : job.workMode === "hybrid"
        ? "warning"
        : "secondary";

  return (
    <Link href={`/jobs/${job._id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-4">
            {/* Company Logo */}
            <Avatar className="h-12 w-12 shrink-0 rounded-lg">
              {job.companyLogo ? (
                <AvatarImage src={job.companyLogo} alt={job.company} />
              ) : null}
              <AvatarFallback className="rounded-lg bg-muted text-sm font-medium">
                {getInitials(job.company)}
              </AvatarFallback>
            </Avatar>

            {/* Job Info */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold leading-tight text-foreground">
                    {job.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    {job.company}
                  </p>
                </div>
                <Badge variant={workModeBadgeVariant} className="shrink-0">
                  {job.workMode}
                </Badge>
              </div>

              {/* Meta Info */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {job.type}
                </span>
                <span className="flex items-center gap-1">
                  <Banknote className="h-3.5 w-3.5" />
                  {job.salary}
                </span>
              </div>

              {/* Footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <Badge variant="outline" className="text-xs">
                  {job.category}
                </Badge>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Posted {formatRelativeTime(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
