import { Suspense } from "react";
import Link from "next/link";
import { Search, Filter, Users, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clientPromise from "@/lib/db";
import { AdminUserActions } from "@/components/admin/admin-user-actions";

interface SearchParams {
  search?: string;
  role?: string;
  page?: string;
}

async function getUsers(searchParams: SearchParams) {
  try {
    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    const query: any = {};

    if (searchParams.search) {
      query.$or = [
        { email: { $regex: searchParams.search, $options: "i" } },
        { name: { $regex: searchParams.search, $options: "i" } },
      ];
    }

    if (searchParams.role && searchParams.role !== "all") {
      query.role = searchParams.role;
    }

    const page = parseInt(searchParams.page || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const [users, total, roleStats] = await Promise.all([
      db
        .collection("users")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("users").countDocuments(query),
      db
        .collection("users")
        .aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
        .toArray(),
    ]);

    const stats = {
      total: 0,
      jobseeker: 0,
      employer: 0,
      admin: 0,
    };

    roleStats.forEach((s: any) => {
      if (s._id in stats) {
        stats[s._id as keyof typeof stats] = s.count;
      }
      stats.total += s.count;
    });

    return {
      users: users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats,
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return {
      users: [],
      total: 0,
      pages: 0,
      currentPage: 1,
      stats: { total: 0, jobseeker: 0, employer: 0, admin: 0 },
    };
  }
}

function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

async function UsersTable({ searchParams }: { searchParams: SearchParams }) {
  const { users, total, pages, currentPage, stats } = await getUsers(
    searchParams
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
          <div className="p-2 rounded-lg bg-blue-100">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
          <div className="p-2 rounded-lg bg-green-100">
            <UserCheck className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.jobseeker}</p>
            <p className="text-xs text-muted-foreground">Job Seekers</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
          <div className="p-2 rounded-lg bg-amber-100">
            <Users className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.employer}</p>
            <p className="text-xs text-muted-foreground">Employers</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
          <div className="p-2 rounded-lg bg-red-100">
            <UserX className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.admin}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Showing {users.length} of {total} users
          </div>

          <div className="space-y-3">
            {users.map((user: any) => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {user.name || user.email || user.clerkId}
                    </p>
                    <Badge
                      variant={
                        user.role === "admin"
                          ? "destructive"
                          : user.role === "employer"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email || `Clerk ID: ${user.clerkId}`}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>

                <AdminUserActions
                  userId={user._id}
                  clerkId={user.clerkId}
                  currentRole={user.role}
                />
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {currentPage > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/admin/users?page=${currentPage - 1}${
                      searchParams.search
                        ? `&search=${searchParams.search}`
                        : ""
                    }${searchParams.role ? `&role=${searchParams.role}` : ""}`}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {pages}
              </span>
              {currentPage < pages && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/admin/users?page=${currentPage + 1}${
                      searchParams.search
                        ? `&search=${searchParams.search}`
                        : ""
                    }${searchParams.role ? `&role=${searchParams.role}` : ""}`}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Users</h2>
        <p className="text-muted-foreground">
          View and manage all user accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <form className="flex flex-col sm:flex-row gap-4" action="/admin/users">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search users..."
                defaultValue={params.search}
                className="pl-9"
              />
            </div>
            <select
              name="role"
              defaultValue={params.role || "all"}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="jobseeker">Job Seekers</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>
            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<UsersTableSkeleton />}>
            <UsersTable searchParams={params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
