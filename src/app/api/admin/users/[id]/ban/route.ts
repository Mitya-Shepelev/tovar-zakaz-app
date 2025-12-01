import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Схема валидации
const banSchema = z.object({
  isBanned: z.boolean(),
  banDuration: z.enum(["24h", "3d", "7d", "permanent"]).optional(),
  banReason: z
    .string()
    .max(500, "Причина блокировки слишком длинная")
    .optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;

    // Валидация ID
    if (!/^[a-z0-9]+$/i.test(id)) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    const body = await request.json();

    // Валидация входных данных
    const validation = banSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { isBanned, banDuration, banReason } = validation.data;

    // Проверяем, что пользователь существует
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Нельзя заблокировать самого себя
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Нельзя заблокировать самого себя" },
        { status: 400 }
      );
    }

    // Нельзя заблокировать другого админа
    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "Нельзя заблокировать администратора" },
        { status: 403 }
      );
    }

    let banExpires: Date | null = null;

    if (isBanned && banDuration) {
      const now = new Date();
      switch (banDuration) {
        case "24h":
          banExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "3d":
          banExpires = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
          break;
        case "7d":
          banExpires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "permanent":
          banExpires = null;
          break;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBanned,
        banExpires,
        banReason: isBanned ? (banReason || null) : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
        banExpires: true,
        banReason: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Ban user error:", error);
    return NextResponse.json(
      { error: "Ошибка при блокировке пользователя" },
      { status: 500 }
    );
  }
}
