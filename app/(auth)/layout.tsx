import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-green-700" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-8 w-8" />
            <span className="font-bold text-xl">Ethiopia Remote Talent</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Connect with Ethiopia&apos;s top talent and opportunities
            </h1>
            <p className="text-lg opacity-90">
              Join thousands of professionals finding their next career move or
              hiring the best talent in Ethiopia.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold">5,000+</div>
                <div className="text-sm opacity-80">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl font-bold">20,000+</div>
                <div className="text-sm opacity-80">Job Seekers</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm opacity-80">Companies</div>
              </div>
            </div>
          </div>

          <p className="text-sm opacity-70">
            Trusted by leading Ethiopian companies and international employers
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">Ethiopia Remote Talent</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
