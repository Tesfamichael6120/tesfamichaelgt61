import Link from "next/link";
import { Suspense } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  Users,
  Building2,
  ArrowRight,
  Globe,
  Laptop,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/jobs/job-card";
import { JobCardSkeleton } from "@/components/jobs/job-card-skeleton";
import { JOB_CATEGORIES } from "@/lib/validations";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

async function getLatestJobs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/jobs?limit=6&status=active`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs || [];
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/jobs?status=active`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { total: 0 };
    const data = await res.json();
    return { total: data.pagination?.total || 0 };
  } catch {
    return { total: 0 };
  }
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 sm:py-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Connecting Ethiopian Talent with Global Opportunities
          </Badge>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Dream{" "}
            <span className="text-primary">Remote Job</span> in Ethiopia
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground sm:text-xl">
            Connect with top companies hiring Ethiopian professionals. Browse
            remote, hybrid, and on-site opportunities across all industries.
          </p>

          {/* Search Form */}
          <form action="/jobs" method="get" className="mx-auto max-w-xl">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  name="keyword"
                  placeholder="Job title, company, or keyword..."
                  className="h-12 pl-10 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12">
                Search Jobs
              </Button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/jobs?workMode=remote">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted"
              >
                <Globe className="mr-1 h-3 w-3" />
                Remote Jobs
              </Badge>
            </Link>
            <Link href="/jobs?type=full-time">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted"
              >
                <Briefcase className="mr-1 h-3 w-3" />
                Full-time
              </Badge>
            </Link>
            <Link href="/jobs?category=Software+Development">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted"
              >
                <Laptop className="mr-1 h-3 w-3" />
                Tech Jobs
              </Badge>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

async function StatsSection() {
  const stats = await getStats();

  const statsData = [
    {
      icon: Briefcase,
      value: stats.total.toString() + "+",
      label: "Active Jobs",
    },
    { icon: Building2, value: "500+", label: "Companies" },
    { icon: Users, value: "10,000+", label: "Job Seekers" },
    { icon: TrendingUp, value: "95%", label: "Success Rate" },
  ];

  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold sm:text-3xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const popularCategories = JOB_CATEGORIES.slice(0, 8);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold">Browse by Category</h2>
          <p className="text-muted-foreground">
            Explore opportunities across various industries
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {popularCategories.map((category) => (
            <Link key={category} href={`/jobs?category=${encodeURIComponent(category)}`}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{category}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/jobs">
            <Button variant="outline">
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

async function LatestJobsSection() {
  const jobs = await getLatestJobs();

  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold">Latest Jobs</h2>
            <p className="text-muted-foreground">
              Fresh opportunities posted recently
            </p>
          </div>
          <Link href="/jobs" className="hidden sm:block">
            <Button variant="outline">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job: { _id: string; title: string; company: string; companyLogo?: string; location: string; workMode: "remote" | "hybrid" | "on-site"; type: string; salary: string; category: string; deadline: Date | string; createdAt: Date | string }) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No jobs available yet.</p>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/jobs">
            <Button variant="outline">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function JobsSkeleton() {
  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="mb-2 text-3xl font-bold">Latest Jobs</h2>
          <p className="text-muted-foreground">
            Fresh opportunities posted recently
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {/* For Job Seekers */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">For Job Seekers</h3>
              <p className="mb-6 text-muted-foreground">
                Create your profile, upload your resume, and start applying to
                jobs that match your skills and experience.
              </p>
              <Link href="/sign-up">
                <Button>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* For Employers */}
          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
            <CardContent className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Building2 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">For Employers</h3>
              <p className="mb-6 text-muted-foreground">
                Post your job openings and connect with talented Ethiopian
                professionals ready to contribute to your team.
              </p>
              <Link href="/employer/jobs/new">
                <Button variant="secondary">
                  Post a Job
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function LocationsSection() {
  const locations = [
    "Addis Ababa",
    "Dire Dawa",
    "Mekelle",
    "Gondar",
    "Hawassa",
    "Bahir Dar",
    "Remote - Worldwide",
  ];

  return (
    <section className="border-t border-border bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold">Jobs by Location</h2>
          <p className="text-muted-foreground">
            Find opportunities in your city or work remotely
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {locations.map((location) => (
            <Link
              key={location}
              href={`/jobs?location=${encodeURIComponent(location)}`}
            >
              <Badge
                variant="outline"
                className="cursor-pointer px-4 py-2 text-sm hover:bg-muted"
              >
                <MapPin className="mr-1.5 h-3.5 w-3.5" />
                {location}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={null}>
        <StatsSection />
      </Suspense>
      <CategoriesSection />
      <Suspense fallback={<JobsSkeleton />}>
        <LatestJobsSection />
      </Suspense>
      <CTASection />
      <LocationsSection />
    </>
  );
}
