import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimits, getClientIp } from "@/lib/rate-limit";
import { registerSchema, safeParseJson } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(`register:${ip}`, rateLimits.register);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Слишком много попыток регистрации. Попробуйте позже." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const body = await request.json();

    // Валидация входных данных
    const validation = safeParseJson(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password, name } = validation.data;

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Не раскрываем информацию о существовании аккаунта
      return NextResponse.json(
        { error: "Ошибка регистрации. Проверьте введённые данные." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Увеличено до 12 раундов

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: "user",
      },
    });

    return NextResponse.json(
      {
        message: "Пользователь успешно создан",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при регистрации" },
      { status: 500 }
    );
  }
}
