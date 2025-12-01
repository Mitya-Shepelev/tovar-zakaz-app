import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkUserBan } from "@/lib/check-ban";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { supportMessageSchema, idSchema, safeParseJson } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;

    // Валидация ID
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    // Проверка бана (кроме админов)
    if (session.user.role !== "admin") {
      const banStatus = await checkUserBan(session.user.id);
      if (banStatus) {
        return NextResponse.json(
          { error: "Ваш аккаунт заблокирован", banned: true },
          { status: 403 }
        );
      }
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Обращение не найдено" }, { status: 404 });
    }

    // Ensure user owns the ticket or is admin
    if (ticket.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const messages = await prisma.supportMessage.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read
    await prisma.supportMessage.updateMany({
      where: {
        ticketId: id,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении сообщений" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;

    // Валидация ID
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    // Проверка бана (кроме админов)
    if (session.user.role !== "admin") {
      const banStatus = await checkUserBan(session.user.id);
      if (banStatus) {
        return NextResponse.json(
          { error: "Ваш аккаунт заблокирован", banned: true },
          { status: 403 }
        );
      }
    }

    // Rate limiting - 20 сообщений за 10 минут
    const rateLimitResult = rateLimit(
      `support-message:${session.user.id}`,
      rateLimits.supportMessage
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Слишком много сообщений. Попробуйте позже" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, attachments } = body;

    // Валидация сообщения
    if (message) {
      const parseResult = safeParseJson(supportMessageSchema, { message });
      if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error }, { status: 400 });
      }
    }

    // Валидация attachments
    if (attachments) {
      if (!Array.isArray(attachments)) {
        return NextResponse.json({ error: "Некорректный формат вложений" }, { status: 400 });
      }
      if (attachments.length > 5) {
        return NextResponse.json({ error: "Максимум 5 вложений" }, { status: 400 });
      }
      // Проверяем что все URL начинаются с /uploads/ (наши загруженные файлы)
      const validAttachmentPattern = /^\/uploads\/[a-f0-9-]+\.(jpg|png|gif|webp)$/i;
      for (const url of attachments) {
        if (typeof url !== "string" || !validAttachmentPattern.test(url)) {
          return NextResponse.json({ error: "Недопустимый URL вложения" }, { status: 400 });
        }
      }
    }

    if (!message && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Сообщение не может быть пустым" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Обращение не найдено" }, { status: 404 });
    }

    if (ticket.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        senderId: session.user.id,
        message: message || "",
        attachments: attachments || [],
        isAdmin: session.user.role === "admin",
      },
    });

    // Update ticket timestamp
    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json(
      { error: "Ошибка при отправке сообщения" },
      { status: 500 }
    );
  }
}
