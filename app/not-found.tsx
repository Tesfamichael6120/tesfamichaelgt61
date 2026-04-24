import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
          Page Not Found
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          The page you are looking for does not exist or has been moved.
          Let us help you find your way back.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/jobs">
              <Search className="mr-2 h-4 w-4" />
              Browse Jobs
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
