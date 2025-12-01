import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getRateLimitStats,
  clearAllRateLimits,
  clearRateLimitsByType,
  rateLimitSettings,
} from "@/lib/rate-limit";

// GET - получить статистику лимитов
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = getRateLimitStats();
  return NextResponse.json(stats);
}

// POST - управление лимитами
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, type } = body;

    switch (action) {
      case "clear_all":
        const clearedAll = clearAllRateLimits();
        return NextResponse.json({
          message: `Сброшено ${clearedAll} лимитов`,
          cleared: clearedAll,
        });

      case "clear_type":
        if (!type) {
          return NextResponse.json(
            { error: "Укажите тип лимита" },
            { status: 400 }
          );
        }
        const clearedType = clearRateLimitsByType(type);
        return NextResponse.json({
          message: `Сброшено ${clearedType} лимитов типа "${type}"`,
          cleared: clearedType,
        });

      case "toggle_registration":
        rateLimitSettings.registrationEnabled =
          !rateLimitSettings.registrationEnabled;
        return NextResponse.json({
          message: rateLimitSettings.registrationEnabled
            ? "Лимит регистрации включён"
            : "Лимит регистрации отключён",
          enabled: rateLimitSettings.registrationEnabled,
        });

      case "toggle_login":
        rateLimitSettings.loginEnabled = !rateLimitSettings.loginEnabled;
        return NextResponse.json({
          message: rateLimitSettings.loginEnabled
            ? "Лимит логина включён"
            : "Лимит логина отключён",
          enabled: rateLimitSettings.loginEnabled,
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json(
      { error: "Ошибка обработки запроса" },
      { status: 500 }
    );
  }
}
