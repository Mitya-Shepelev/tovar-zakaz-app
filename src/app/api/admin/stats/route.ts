import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    // Fetch all deals with clients to calculate exact commissions
    const [deals, totalUsers, newUsersToday, newUsersWeek] = await Promise.all([
      prisma.deal.findMany({
        include: {
          clients: true,
        },
      }),
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
    ]);

    const totalDeals = deals.length;
    const totalClients = deals.reduce((acc, deal) => acc + deal.clients.length, 0);

    let totalBaseAmount = 0;
    let totalSupplierCommission = 0;
    let totalSellerCommission = 0;
    let totalGrandTotal = 0;

    deals.forEach((deal) => {
      const dealBase = deal.clients.reduce((sum, c) => sum + c.orderAmount, 0);
      const suppComm = dealBase * ((deal.supplierCommission || 0) / 100);
      const intermediate = dealBase + suppComm;
      const sellComm = intermediate * ((deal.sellerCommission || 0) / 100);
      const grandTotal = intermediate + sellComm;

      totalBaseAmount += dealBase;
      totalSupplierCommission += suppComm;
      totalSellerCommission += sellComm;
      totalGrandTotal += grandTotal;
    });

    return NextResponse.json({
      totalUsers,
      newUsersToday,
      newUsersWeek,
      totalDeals,
      totalClients,
      totalAmount: totalBaseAmount, // Base amount (cost of goods)
      totalSupplierCommission,
      totalSellerCommission,
      totalGrandTotal,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении статистики" },
      { status: 500 }
    );
  }
}
