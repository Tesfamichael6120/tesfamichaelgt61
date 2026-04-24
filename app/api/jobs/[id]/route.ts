import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { sanitizeHtml } from "@/lib/validations";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// GET /api/jobs/[id] - Get single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const jobs = await getCollection("jobs");
    const job = await jobs.findOne({ _id: new ObjectId(id) });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...job,
      _id: job._id.toString(),
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id] - Update job (owner or admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const jobs = await getCollection("jobs");
    const job = await jobs.findOne({ _id: new ObjectId(id) });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Check ownership or admin
    const user = await currentUser();
    const role = (user?.publicMetadata?.role as string) || "jobseeker";

    if (job.postedBy !== userId && role !== "admin") {
      return NextResponse.json(
        { error: "Not authorized to update this job" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Only update provided fields
    const allowedFields = [
      "title",
      "company",
      "companyLogo",
      "location",
      "workMode",
      "type",
      "salary",
      "category",
      "deadline",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (body.requirements) {
      updateData.requirements = body.requirements
        .split("\n")
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0);
    }

    if (body.description) {
      updateData.description = sanitizeHtml(body.description);
    }

    if (body.deadline) {
      updateData.deadline = new Date(body.deadline);
    }

    await jobs.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Revalidate cache
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/employer");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete job (owner or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const jobs = await getCollection("jobs");
    const job = await jobs.findOne({ _id: new ObjectId(id) });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Check ownership or admin
    const user = await currentUser();
    const role = (user?.publicMetadata?.role as string) || "jobseeker";

    if (job.postedBy !== userId && role !== "admin") {
      return NextResponse.json(
        { error: "Not authorized to delete this job" },
        { status: 403 }
      );
    }

    // Delete the job
    await jobs.deleteOne({ _id: new ObjectId(id) });

    // Also delete related applications
    const applications = await getCollection("applications");
    await applications.deleteMany({ jobId: id });

    // Revalidate cache
    revalidatePath("/jobs");
    revalidatePath("/employer");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
