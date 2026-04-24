import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ApplicationStatus } from "@/lib/validations";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// PATCH /api/applications/[id] - Update application status
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
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    const applications = await getCollection("applications");
    const application = await applications.findOne({ _id: new ObjectId(id) });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Get the job to verify ownership
    const jobs = await getCollection("jobs");
    const job = await jobs.findOne({ _id: new ObjectId(application.jobId) });

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
        { error: "Not authorized to update this application" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate status
    const parsedStatus = ApplicationStatus.safeParse(body.status);
    if (!parsedStatus.success) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    await applications.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: parsedStatus.data } }
    );

    // Revalidate
    revalidatePath("/employer");
    revalidatePath(`/employer/jobs/${application.jobId}/applicants`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
