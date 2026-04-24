import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { JobSchema, sanitizeHtml } from "@/lib/validations";
import { sendJobToTelegram } from "@/lib/telegram";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// GET /api/jobs - List all jobs with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const keyword = searchParams.get("keyword");
    const location = searchParams.get("location");
    const workMode = searchParams.get("workMode");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";
    const status = searchParams.get("status") || "active";
    const postedBy = searchParams.get("postedBy");

    const jobs = await getCollection("jobs");

    // Build query
    const query: Record<string, unknown> = {};

    if (status) query.status = status;
    if (postedBy) query.postedBy = postedBy;

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location && location !== "all") {
      query.location = { $regex: location, $options: "i" };
    }

    if (workMode && workMode !== "all") {
      query.workMode = workMode;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    // Get total count
    const total = await jobs.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get jobs with sorting and pagination
    const sortOrder = sort === "oldest" ? 1 : -1;
    const skip = (page - 1) * limit;

    const jobsList = await jobs
      .find(query)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Convert ObjectId to string
    const serializedJobs = jobsList.map((job) => ({
      ...job,
      _id: job._id.toString(),
    }));

    return NextResponse.json({
      jobs: serializedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job (employer only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user to check role
    const user = await currentUser();
    const role = (user?.publicMetadata?.role as string) || "jobseeker";

    if (role !== "employer" && role !== "admin") {
      return NextResponse.json(
        { error: "Only employers can post jobs" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Parse requirements from string to array
    const requirements = body.requirements
      ? body.requirements
          .split("\n")
          .map((r: string) => r.trim())
          .filter((r: string) => r.length > 0)
      : [];

    // Validate and sanitize
    const jobData = JobSchema.parse({
      ...body,
      requirements,
      description: sanitizeHtml(body.description),
      postedBy: userId,
      deadline: new Date(body.deadline),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const jobs = await getCollection("jobs");
    const result = await jobs.insertOne(jobData);

    // Send to Telegram
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ethiopia-remote-talent.vercel.app";
    await sendJobToTelegram({
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      salary: jobData.salary,
      type: jobData.type,
      deadline: jobData.deadline,
      jobUrl: `${appUrl}/jobs/${result.insertedId}`,
    });

    // Revalidate cache
    revalidatePath("/jobs");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      jobId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error creating job:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
