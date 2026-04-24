import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { UserRole } from "@/lib/validations";

// POST /api/users - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate role
    const parsedRole = UserRole.safeParse(body.role);
    if (!parsedRole.success) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const users = await getCollection("users");

    // Check if user exists
    const existingUser = await users.findOne({ clerkId: userId });

    const userData = {
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: parsedRole.data,
      companyName: body.companyName,
      companyLogo: body.companyLogo,
      companyDescription: body.companyDescription,
      updatedAt: new Date(),
    };

    if (existingUser) {
      await users.updateOne(
        { clerkId: userId },
        { $set: userData }
      );
    } else {
      await users.insertOne({
        ...userData,
        createdAt: new Date(),
      });
    }

    // Update Clerk user metadata with role
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: parsedRole.data,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// GET /api/users - Get current user profile
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const users = await getCollection("users");
    const user = await users.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
