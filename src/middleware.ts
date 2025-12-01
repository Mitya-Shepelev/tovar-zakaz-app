import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const { pathname } = request.nextUrl;

  // Публичные роуты - пропускаем
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/admin/login"];
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // Статические файлы и API auth - пропускаем
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") // статические файлы
  ) {
    return NextResponse.next();
  }

  // Защита админских роутов (кроме /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (token.role !== "admin") {
      // Если пользователь не админ - редирект на его dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Защита пользовательского dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Защита API роутов (кроме auth)
  if (pathname.startsWith("/api/admin")) {
    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }
  }

  // Страницы логина - пропускаем, чтобы показать предупреждение о конфликте сессий
  // Логика переключения сессий обрабатывается на самих страницах логина

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
