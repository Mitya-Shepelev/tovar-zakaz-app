import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { planSchema, safeParseJson } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const plans = await prisma.plan.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Admin get plans error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении тарифов" },
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

    const body = await request.json();

    // Преобразуем строковые значения в числа перед валидацией
    const dataToValidate = {
      ...body,
      price: typeof body.price === "string" ? parseFloat(body.price) : body.price,
      order: typeof body.order === "string" ? parseInt(body.order, 10) : body.order,
    };

    // Валидация входных данных
    const parseResult = safeParseJson(planSchema, dataToValidate);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const data = parseResult.data;

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        currency: data.currency,
        interval: data.interval,
        features: data.features,
        isPopular: data.isPopular,
        isActive: data.isActive,
        isPublic: data.isPublic,
        order: data.order,
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json(
      { error: "Ошибка при создании тарифа" },
      { status: 500 }
    );
  }
}
