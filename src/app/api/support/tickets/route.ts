import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkUserBan } from "@/lib/check-ban";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { supportTicketSchema, safeParseJson } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Проверка бана
    const banStatus = await checkUserBan(session.user.id);
    if (banStatus) {
      return NextResponse.json(
        { error: "Ваш аккаунт заблокирован", banned: true },
        { status: 403 }
      );
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Get tickets error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении обращений" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Проверка бана
    const banStatus = await checkUserBan(session.user.id);
    if (banStatus) {
      return NextResponse.json(
        { error: "Ваш аккаунт заблокирован", banned: true },
        { status: 403 }
      );
    }

    // Rate limiting - 5 тикетов в час
    const rateLimitResult = rateLimit(
      `support-ticket:${session.user.id}`,
      rateLimits.supportTicket
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Слишком много обращений. Попробуйте позже" },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Валидация входных данных
    const parseResult = safeParseJson(supportTicketSchema, body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const { subject, message } = parseResult.data;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        messages: {
          create: {
            senderId: session.user.id,
            message,
            isAdmin: false,
          },
        },
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { error: "Ошибка при создании обращения" },
      { status: 500 }
    );
  }
}
