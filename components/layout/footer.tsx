import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Ethiopia Remote Talent</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting Ethiopian talent with global opportunities. Find remote
              jobs, local positions, and freelance work.
            </p>
          </div>

          {/* For Job Seekers */}
          <div className="space-y-4">
            <h3 className="font-semibold">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/jobs"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs?workMode=remote"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Remote Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Companies
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-4">
            <h3 className="font-semibold">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/employer/jobs/new"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  href="/employer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Popular Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/jobs?category=Software+Development"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Software Development
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs?category=Design+%26+Creative"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Design & Creative
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs?category=Marketing"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Marketing
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs?category=Customer+Support"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ethiopia Remote Talent. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-foreground"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
