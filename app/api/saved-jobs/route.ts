import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    const savedJobs = await db
      .collection("savedJobs")
      .aggregate([
        { $match: { userId } },
        {
          $lookup: {
            from: "jobs",
            localField: "jobId",
            foreignField: "_id",
            as: "job",
          },
        },
        { $unwind: "$job" },
        { $sort: { savedAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({
      savedJobs: savedJobs.map((saved) => ({
        ...saved.job,
        _id: saved.job._id.toString(),
        savedAt: saved.savedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch saved jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId || !ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    // Check if already saved
    const existing = await db.collection("savedJobs").findOne({
      userId,
      jobId: new ObjectId(jobId),
    });

    if (existing) {
      return NextResponse.json({ error: "Job already saved" }, { status: 400 });
    }

    await db.collection("savedJobs").insertOne({
      userId,
      jobId: new ObjectId(jobId),
      savedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId || !ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    await db.collection("savedJobs").deleteOne({
      userId,
      jobId: new ObjectId(jobId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unsave job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
