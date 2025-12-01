import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        supplierCommission: true,
        sellerCommission: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user settings error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении настроек" },
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

    const body = await request.json();
    const { supplierCommission, sellerCommission } = body;

    // Validate inputs
    if (typeof supplierCommission !== 'number' || typeof sellerCommission !== 'number') {
        return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }
    
    if (supplierCommission < 0 || sellerCommission < 0) {
        return NextResponse.json({ error: "Комиссия не может быть отрицательной" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        supplierCommission,
        sellerCommission,
      },
      select: {
        supplierCommission: true,
        sellerCommission: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user settings error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении настроек" },
      { status: 500 }
    );
  }
}
