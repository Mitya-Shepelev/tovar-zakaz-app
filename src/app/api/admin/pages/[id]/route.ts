import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json({ error: "Страница не найдена" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Get page error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении страницы" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, isPublished, showInFooter } = body;

    // Check if slug exists for other pages
    if (slug) {
      const existingPage = await prisma.page.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existingPage) {
        return NextResponse.json(
          { error: "Страница с таким URL уже существует" },
          { status: 400 }
        );
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        isPublished,
        showInFooter,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Update page error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении страницы" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Страница удалена" });
  } catch (error) {
    console.error("Delete page error:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении страницы" },
      { status: 500 }
    );
  }
}
