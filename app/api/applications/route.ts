import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ApplicationSchema, sanitizeHtml } from "@/lib/validations";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// GET /api/applications - Get user's applications or job applications
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");
    const applicantId = searchParams.get("applicantId");

    const applications = await getCollection("applications");

    let query: Record<string, unknown> = {};

    if (jobId) {
      // Get applications for a specific job (employer view)
      query.jobId = jobId;
    } else if (applicantId) {
      // Get applications by applicant
      query.applicantId = applicantId;
    } else {
      // Default: get current user's applications
      query.applicantId = userId;
    }

    const applicationsList = await applications
      .find(query)
      .sort({ appliedAt: -1 })
      .toArray();

    // If getting applications for a job, join with job data
    if (jobId) {
      const jobs = await getCollection("jobs");
      const job = await jobs.findOne({ _id: new ObjectId(jobId) });

      // Verify the requester owns the job
      if (job && job.postedBy !== userId) {
        return NextResponse.json(
          { error: "Not authorized to view these applications" },
          { status: 403 }
        );
      }
    }

    // Get job info for each application
    const jobs = await getCollection("jobs");
    const enrichedApplications = await Promise.all(
      applicationsList.map(async (app) => {
        const job = await jobs.findOne({ _id: new ObjectId(app.jobId) });
        return {
          ...app,
          _id: app._id.toString(),
          job: job
            ? {
                _id: job._id.toString(),
                title: job.title,
                company: job.company,
                companyLogo: job.companyLogo,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ applications: enrichedApplications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST /api/applications - Submit a job application
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate
    const applicationData = ApplicationSchema.parse({
      ...body,
      applicantId: userId,
      coverLetter: sanitizeHtml(body.coverLetter),
      appliedAt: new Date(),
    });

    // Check if job exists and is active
    const jobs = await getCollection("jobs");
    const job = await jobs.findOne({ _id: new ObjectId(body.jobId) });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.status !== "active") {
      return NextResponse.json(
        { error: "This job is no longer accepting applications" },
        { status: 400 }
      );
    }

    // Check if already applied
    const applications = await getCollection("applications");
    const existingApplication = await applications.findOne({
      jobId: body.jobId,
      applicantId: userId,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Insert application
    const result = await applications.insertOne(applicationData);

    // Update job applications count
    await jobs.updateOne(
      { _id: new ObjectId(body.jobId) },
      { $inc: { applicationsCount: 1 } }
    );

    // Revalidate
    revalidatePath(`/jobs/${body.jobId}`);
    revalidatePath("/dashboard");

    return NextResponse.json({
      success: true,
      applicationId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error creating application:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
