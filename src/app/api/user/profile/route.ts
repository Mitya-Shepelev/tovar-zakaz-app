import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Схема валидации профиля
const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Имя должно быть не менее 2 символов")
    .max(100, "Имя слишком длинное")
    .optional(),
  email: z
    .string()
    .email("Некорректный email")
    .max(255, "Email слишком длинный")
    .optional(),
  image: z
    .string()
    .max(500, "URL изображения слишком длинный")
    .refine(
      (url) => !url || url.startsWith("https://") || url.startsWith("http://"),
      "URL изображения должен начинаться с http:// или https://"
    )
    .optional()
    .nullable(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, "Пароль должен быть не менее 8 символов")
    .regex(/[a-zA-Z]/, "Пароль должен содержать хотя бы одну букву")
    .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру")
    .optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении профиля" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Rate limiting для защиты от брутфорса пароля
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(`profile-update:${ip}`, {
      max: 10,
      windowMs: 15 * 60 * 1000, // 10 попыток за 15 минут
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Слишком много попыток. Попробуйте позже." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Валидация входных данных
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { name, email, image, currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const updateData: {
      name?: string;
      email?: string;
      image?: string | null;
      password?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    // Обработка смены пароля
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Необходимо ввести текущий пароль" },
          { status: 400 }
        );
      }

      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Неверный текущий пароль" },
          { status: 400 }
        );
      }

      updateData.password = await hash(newPassword, 12);
    }

    // Проверка уникальности email
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Этот email уже используется" },
          { status: 400 }
        );
      }
      updateData.email = email.toLowerCase();
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении профиля" },
      { status: 500 }
    );
  }
}
