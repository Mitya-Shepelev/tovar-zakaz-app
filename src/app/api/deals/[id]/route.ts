import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;

    const deal = await prisma.deal.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        clients: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error("Get deal error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении заказа" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;
    const { date, clients } = await request.json();

    if (!clients || clients.length === 0) {
      return NextResponse.json(
        { error: "Добавьте хотя бы одного клиента" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingDeal = await prisma.deal.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existingDeal) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    // Update deal using transaction: delete old clients, create new ones
    // This is simpler than diffing for this use case
    const updatedDeal = await prisma.$transaction(async (tx) => {
      // Delete existing clients
      await tx.client.deleteMany({
        where: { dealId: id },
      });

      // Update deal date and create new clients
      return tx.deal.update({
        where: { id },
        data: {
          date: new Date(date),
          clients: {
            create: clients.map((client: any) => ({
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
    });

    return NextResponse.json(updatedDeal);
  } catch (error: any) {
    console.error("Update deal error:", error);
    return NextResponse.json(
      { error: `Ошибка при обновлении заказа: ${error.message}` },
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;

    const result = await prisma.deal.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete deal error:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении заказа" },
      { status: 500 }
    );
  }
}
