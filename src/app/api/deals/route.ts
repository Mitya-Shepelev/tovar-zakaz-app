import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkUserBan } from "@/lib/check-ban";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Проверка бана в реальном времени
    const banStatus = await checkUserBan(session.user.id);
    if (banStatus) {
      return NextResponse.json(
        { error: "Ваш аккаунт заблокирован", banned: true },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: {
      userId: string;
      date?: { gte?: Date; lte?: Date };
    } = {
      userId: session.user.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        clients: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Get deals error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении заказов" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Проверка бана в реальном времени
    const banStatus = await checkUserBan(session.user.id);
    if (banStatus) {
      return NextResponse.json(
        { error: "Ваш аккаунт заблокирован", banned: true },
        { status: 403 }
      );
    }

    const { date, clients } = await request.json();

    if (!clients || clients.length === 0) {
      return NextResponse.json(
        { error: "Добавьте хотя бы одного клиента" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { supplierCommission: true, sellerCommission: true },
    });

    const deal = await prisma.deal.create({
      data: {
        userId: session.user.id,
        date: date ? new Date(date) : new Date(),
        supplierCommission: user?.supplierCommission || 0,
        sellerCommission: user?.sellerCommission || 0,
        clients: {
          create: clients.map((client: { name: string; phone: string; orderAmount: number; totalItems?: number; calculatorItems?: any[] }) => ({
            name: client.name,
            phone: client.phone,
            orderAmount: client.orderAmount,
            totalItems: client.totalItems || 0,
            calculatorItems: client.calculatorItems || [],
          })),
        },
      },
      include: {
        clients: true,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error: any) {
    console.error("Create deal error:", error);
    return NextResponse.json(
      { error: `Ошибка при создании заказа: ${error.message}` },
      { status: 500 }
    );
  }
}
