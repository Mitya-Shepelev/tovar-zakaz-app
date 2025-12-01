import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true, isPublic: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении тарифов" },
      { status: 500 }
    );
  }
}
