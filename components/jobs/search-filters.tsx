"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_CATEGORIES, LOCATIONS } from "@/lib/validations";
import { useCallback, useState, useTransition } from "react";

interface SearchFiltersProps {
  initialValues?: {
    keyword?: string;
    location?: string;
    workMode?: string;
    type?: string;
    category?: string;
    sort?: string;
  };
}

export function SearchFilters({ initialValues = {} }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(initialValues.keyword || "");

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      newParams.delete("page");

      return newParams.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string | null) => {
    startTransition(() => {
      const queryString = createQueryString({ [key]: value });
      router.push(`/jobs${queryString ? `?${queryString}` : ""}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("keyword", keyword || null);
  };

  const clearFilters = () => {
    setKeyword("");
    startTransition(() => {
      router.push("/jobs");
    });
  };

  const hasFilters =
    initialValues.keyword ||
    initialValues.location ||
    initialValues.workMode ||
    initialValues.type ||
    initialValues.category;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search jobs by title, company, or keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          Search
        </Button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Location */}
        <Select
          value={initialValues.location || "all"}
          onValueChange={(value) => handleFilterChange("location", value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {LOCATIONS.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Work Mode */}
        <Select
          value={initialValues.workMode || "all"}
          onValueChange={(value) => handleFilterChange("workMode", value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Work Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="on-site">On-site</SelectItem>
          </SelectContent>
        </Select>

        {/* Job Type */}
        <Select
          value={initialValues.type || "all"}
          onValueChange={(value) => handleFilterChange("type", value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          value={initialValues.category || "all"}
          onValueChange={(value) => handleFilterChange("category", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {JOB_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={initialValues.sort || "newest"}
          onValueChange={(value) => handleFilterChange("sort", value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
