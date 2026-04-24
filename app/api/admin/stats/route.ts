import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";

// GET /api/admin/stats - Get admin dashboard stats
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin role
    const user = await currentUser();
    const role = (user?.publicMetadata?.role as string) || "jobseeker";

    if (role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const jobs = await getCollection("jobs");
    const applications = await getCollection("applications");
    const users = await getCollection("users");

    // Get counts
    const totalJobs = await jobs.countDocuments();
    const activeJobs = await jobs.countDocuments({ status: "active" });
    const closedJobs = await jobs.countDocuments({ status: "closed" });
    const totalApplications = await applications.countDocuments();
    const totalUsers = await users.countDocuments();
    const totalEmployers = await users.countDocuments({ role: "employer" });
    const totalJobSeekers = await users.countDocuments({ role: "jobseeker" });

    // Get recent jobs
    const recentJobs = await jobs
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get recent applications
    const recentApplications = await applications
      .find()
      .sort({ appliedAt: -1 })
      .limit(5)
      .toArray();

    // Jobs by category
    const jobsByCategory = await jobs
      .aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    // Applications by status
    const applicationsByStatus = await applications
      .aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray();

    return NextResponse.json({
      stats: {
        totalJobs,
        activeJobs,
        closedJobs,
        totalApplications,
        totalUsers,
        totalEmployers,
        totalJobSeekers,
      },
      recentJobs: recentJobs.map((j) => ({ ...j, _id: j._id.toString() })),
      recentApplications: recentApplications.map((a) => ({
        ...a,
        _id: a._id.toString(),
      })),
      jobsByCategory,
      applicationsByStatus,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
