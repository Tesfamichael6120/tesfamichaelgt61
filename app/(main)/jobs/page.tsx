import { Suspense } from "react";
import { Metadata } from "next";
import { JobCard } from "@/components/jobs/job-card";
import { JobCardSkeleton } from "@/components/jobs/job-card-skeleton";
import { SearchFilters } from "@/components/jobs/search-filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description:
    "Find remote and local job opportunities in Ethiopia. Browse through our curated list of positions from top companies.",
};

// ISR: Revalidate every 30 seconds
export const revalidate = 30;

interface SearchParams {
  keyword?: string;
  location?: string;
  workMode?: string;
  type?: string;
  category?: string;
  sort?: string;
  page?: string;
}

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
  deadline: Date | string;
  createdAt: Date | string;
}

async function getJobs(searchParams: SearchParams) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const params = new URLSearchParams();

    params.set("status", "active");
    if (searchParams.keyword) params.set("keyword", searchParams.keyword);
    if (searchParams.location) params.set("location", searchParams.location);
    if (searchParams.workMode) params.set("workMode", searchParams.workMode);
    if (searchParams.type) params.set("type", searchParams.type);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    if (searchParams.page) params.set("page", searchParams.page);

    const res = await fetch(`${baseUrl}/api/jobs?${params.toString()}`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return { jobs: [], pagination: { page: 1, totalPages: 1, total: 0 } };
    }

    return await res.json();
  } catch {
    return { jobs: [], pagination: { page: 1, totalPages: 1, total: 0 } };
  }
}

async function JobsList({ searchParams }: { searchParams: SearchParams }) {
  const { jobs, pagination } = await getJobs(searchParams);

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
        title="No jobs found"
        description="We couldn&apos;t find any jobs matching your criteria. Try adjusting your filters or search terms."
        action={{
          label: "Clear Filters",
          href: "/jobs",
        }}
      />
    );
  }

  return (
    <>
      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {jobs.length} of {pagination.total} jobs
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job: Job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
          />
        </div>
      )}
    </>
  );
}

function JobsListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(12)].map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Find Jobs</h1>
        <p className="text-muted-foreground">
          Discover your next career opportunity
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <Suspense fallback={null}>
          <SearchFilters
            initialValues={{
              keyword: params.keyword,
              location: params.location,
              workMode: params.workMode,
              type: params.type,
              category: params.category,
              sort: params.sort,
            }}
          />
        </Suspense>
      </div>

      {/* Jobs List */}
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsList searchParams={params} />
      </Suspense>
    </div>
  );
}
