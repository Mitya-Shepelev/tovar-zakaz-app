import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/validation";

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

    // Валидация ID пользователя
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json({ error: "Некорректный ID пользователя" }, { status: 400 });
    }

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const { planId } = await request.json();

    // Валидация planId (если указан)
    if (planId !== null && planId !== undefined && planId !== "") {
      const planIdResult = idSchema.safeParse(planId);
      if (!planIdResult.success) {
        return NextResponse.json({ error: "Некорректный ID плана" }, { status: 400 });
      }

      // Проверяем существование плана
      const existingPlan = await prisma.plan.findUnique({
        where: { id: planId },
      });
      if (!existingPlan) {
        return NextResponse.json({ error: "Тариф не найден" }, { status: 404 });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { planId: planId || null }, // Allow null to remove plan
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user plan error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении плана пользователя" },
      { status: 500 }
    );
  }
}
