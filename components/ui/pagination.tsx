"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl = "/jobs",
}: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  };

  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  // Show ellipsis or pages near current
  if (currentPage > 3) {
    pages.push("...");
  }

  // Pages around current
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }

  // Show ellipsis or pages near end
  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  // Always show last page if more than 1 page
  if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      {/* Previous */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage === 1}
        asChild={currentPage !== 1}
      >
        {currentPage === 1 ? (
          <span>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </span>
        ) : (
          <Link href={createPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Link>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              className={cn("h-9 w-9", currentPage === page && "pointer-events-none")}
              asChild={currentPage !== page}
            >
              {currentPage === page ? (
                <span>{page}</span>
              ) : (
                <Link href={createPageUrl(page)}>{page}</Link>
              )}
            </Button>
          )
        )}
      </div>

      {/* Next */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage === totalPages}
        asChild={currentPage !== totalPages}
      >
        {currentPage === totalPages ? (
          <span>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </span>
        ) : (
          <Link href={createPageUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Link>
        )}
      </Button>
    </nav>
  );
}
