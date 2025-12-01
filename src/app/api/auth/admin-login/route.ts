import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimits, getClientIp } from "@/lib/rate-limit";
import { loginSchema, safeParseJson } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - строже для админского логина
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(`admin-login:${ip}`, rateLimits.login);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Слишком много попыток входа. Попробуйте через 15 минут." },
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
    const validation = safeParseJson(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Универсальная ошибка для защиты от enumeration
    const genericError = "Неверный email или пароль";

    // Если пользователь не найден - всё равно делаем bcrypt.compare
    // чтобы время ответа было одинаковым (timing attack protection)
    if (!user) {
      // Имитируем проверку пароля для защиты от timing attacks
      await bcrypt.compare(password, "$2a$12$dummy.hash.for.timing.attack.protection");
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    // Проверяем роль ПОСЛЕ пароля (чтобы не раскрывать существование аккаунта)
    if (user.role !== "admin") {
      // Возвращаем ту же ошибку, чтобы не раскрывать информацию
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    // Возвращаем успех - клиент затем вызовет signIn
    return NextResponse.json({
      success: true,
      isAdmin: true,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка сервера" },
      { status: 500 }
    );
  }
}
