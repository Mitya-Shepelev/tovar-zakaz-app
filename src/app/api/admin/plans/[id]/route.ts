import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { planSchema, idSchema, safeParseJson } from "@/lib/validation";

export async function PUT(
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
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    // Проверяем существование плана
    const existingPlan = await prisma.plan.findUnique({
      where: { id },
    });
    if (!existingPlan) {
      return NextResponse.json({ error: "Тариф не найден" }, { status: 404 });
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

    const plan = await prisma.plan.update({
      where: { id },
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
    console.error("Update plan error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении тарифа" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    // Проверяем существование плана
    const existingPlan = await prisma.plan.findUnique({
      where: { id },
    });
    if (!existingPlan) {
      return NextResponse.json({ error: "Тариф не найден" }, { status: 404 });
    }

    // Проверяем, не назначен ли план каким-то пользователям
    const usersWithPlan = await prisma.user.count({
      where: { planId: id },
    });
    if (usersWithPlan > 0) {
      return NextResponse.json(
        { error: `Невозможно удалить: тариф назначен ${usersWithPlan} пользователям` },
        { status: 400 }
      );
    }

    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete plan error:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении тарифа" },
      { status: 500 }
    );
  }
}
