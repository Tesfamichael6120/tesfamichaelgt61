import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import clientPromise from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    let user = await db.collection("users").findOne({ clerkId: userId });

    // If user doesn't exist in our DB, create them
    if (!user) {
      const clerkUser = await currentUser();
      const newUser = {
        clerkId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
        name: clerkUser?.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : null,
        role: "jobseeker" as const,
        createdAt: new Date(),
      };

      await db.collection("users").insertOne(newUser);
      user = newUser;
    }

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id?.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to get user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role, companyName } = body;

    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    const updateData: any = { updatedAt: new Date() };

    if (role && ["jobseeker", "employer"].includes(role)) {
      updateData.role = role;
    }

    if (companyName) {
      updateData.companyName = companyName;
    }

    const result = await db.collection("users").updateOne(
      { clerkId: userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
