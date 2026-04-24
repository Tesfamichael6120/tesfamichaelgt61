import { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin, Briefcase, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Companies",
  description: "Discover top companies hiring Ethiopian talent",
};

export const revalidate = 300; // Revalidate every 5 minutes

interface CompanyData {
  company: string;
  companyLogo?: string;
  location: string;
  jobCount: number;
}

async function getCompanies(): Promise<CompanyData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/jobs?limit=100&status=active`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const jobs = data.jobs || [];

    // Group by company
    const companyMap = new Map<string, CompanyData>();

    for (const job of jobs) {
      const existing = companyMap.get(job.company);
      if (existing) {
        existing.jobCount++;
      } else {
        companyMap.set(job.company, {
          company: job.company,
          companyLogo: job.companyLogo,
          location: job.location,
          jobCount: 1,
        });
      }
    }

    return Array.from(companyMap.values()).sort(
      (a, b) => b.jobCount - a.jobCount
    );
  } catch {
    return [];
  }
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Companies</h1>
        <p className="text-muted-foreground">
          Discover companies hiring Ethiopian professionals
        </p>
      </div>

      {/* Companies Grid */}
      {companies.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.company}
              href={`/jobs?keyword=${encodeURIComponent(company.company)}`}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 rounded-xl">
                      {company.companyLogo ? (
                        <AvatarImage
                          src={company.companyLogo}
                          alt={company.company}
                        />
                      ) : null}
                      <AvatarFallback className="rounded-xl bg-muted text-lg font-medium">
                        {getInitials(company.company)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{company.company}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {company.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="secondary">
                      <Briefcase className="mr-1 h-3 w-3" />
                      {company.jobCount} open{" "}
                      {company.jobCount === 1 ? "position" : "positions"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View Jobs
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No companies yet</h3>
          <p className="text-muted-foreground">
            Companies will appear here once they start posting jobs.
          </p>
        </div>
      )}
    </div>
  );
}
