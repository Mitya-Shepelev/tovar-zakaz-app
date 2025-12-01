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

    const pages = await prisma.page.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Get pages error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении страниц" },
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
    const { title, slug, content, isPublished, showInFooter } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Заполните обязательные поля" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "Страница с таким URL уже существует" },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        isPublished: isPublished || false,
        showInFooter: showInFooter || false,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Create page error:", error);
    return NextResponse.json(
      { error: "Ошибка при создании страницы" },
      { status: 500 }
    );
  }
}
