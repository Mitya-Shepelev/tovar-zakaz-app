import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const settings = await prisma.settings.findMany();

    // Convert to object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении настроек" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const settings = await request.json();

    // Update or create each setting
    for (const [key, value] of Object.entries(settings)) {
      await prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ message: "Настройки сохранены" });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { error: "Ошибка при сохранении настроек" },
      { status: 500 }
    );
  }
}
