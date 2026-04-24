import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sendJobToTelegram } from "@/lib/telegram";
import clientPromise from "@/lib/db";

async function isEmployerOrAdmin(clerkId: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");
    const user = await db.collection("users").findOne({ clerkId });
    return user?.role === "employer" || user?.role === "admin";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isEmployerOrAdmin(userId);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const job = await request.json();

    const success = await sendJobToTelegram(job);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send to Telegram" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
