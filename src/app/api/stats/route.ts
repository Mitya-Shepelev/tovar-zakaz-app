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
    });

    const totalDeals = deals.length;
    const totalClients = deals.reduce((acc, deal) => acc + deal.clients.length, 0);
    
    let totalBaseAmount = 0;
    let totalSupplierCommission = 0;
    let totalSellerCommission = 0;
    let totalGrandTotal = 0;

    // Статистика по дням
    const dailyStats = deals.reduce((acc, deal) => {
      const dateKey = deal.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { deals: 0, clients: 0, amount: 0, grandTotal: 0 };
      }

      const dealBase = deal.clients.reduce((sum, c) => sum + c.orderAmount, 0);
      const suppComm = dealBase * ((deal.supplierCommission || 0) / 100);
      const intermediate = dealBase + suppComm;
      const sellComm = intermediate * ((deal.sellerCommission || 0) / 100);
      const grandTotal = intermediate + sellComm;

      // Update totals
      totalBaseAmount += dealBase;
      totalSupplierCommission += suppComm;
      totalSellerCommission += sellComm;
      totalGrandTotal += grandTotal;

      // Update daily
      acc[dateKey].deals += 1;
      acc[dateKey].clients += deal.clients.length;
      acc[dateKey].amount += dealBase; // Base amount
      acc[dateKey].grandTotal += grandTotal; // Full amount with commissions

      return acc;
    }, {} as Record<string, { deals: number; clients: number; amount: number; grandTotal: number }>);

    return NextResponse.json({
      totalDeals,
      totalClients,
      totalAmount: totalBaseAmount, // Base Amount (Costs)
      totalSupplierCommission,
      totalSellerCommission,
      totalGrandTotal, // Final Amount
      dailyStats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении статистики" },
      { status: 500 }
    );
  }
}
