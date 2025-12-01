import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Get admin tickets error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении обращений" },
      { status: 500 }
    );
  }
}
