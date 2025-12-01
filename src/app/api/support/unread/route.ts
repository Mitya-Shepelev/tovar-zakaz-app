import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    // Count unread messages where sender is NOT the current user (so, from admin)
    // We join with SupportTicket to ensure it belongs to the user
    const count = await prisma.supportMessage.count({
      where: {
        ticket: {
          userId: session.user.id,
        },
        senderId: { not: session.user.id }, // Message NOT from me (so from admin)
        isRead: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    return NextResponse.json({ count: 0 });
  }
}
