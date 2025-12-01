"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronUp,
  Settings,
  MessageSquare
} from "lucide-react";

import { BannedView } from "@/components/BannedView";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [status, pathname]); // Re-fetch on navigation too

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/support/unread");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Check for active ban
  if (session.user?.isBanned) {
    const expires = session.user.banExpires ? new Date(session.user.banExpires) : null;
    // If ban is permanent (expires is null) or expires in the future
    if (!expires || expires > new Date()) {
       return <BannedView banExpires={session.user.banExpires} banReason={session.user.banReason} />;
    }
  }

  const navigation = [
    { name: "Главная", href: "/dashboard", icon: LayoutDashboard },
    { name: "Заказы", href: "/dashboard/deals", icon: ShoppingBag },
    { name: "Новый заказ", href: "/dashboard/deals/new", icon: PlusCircle },
    { name: "Поддержка", href: "/dashboard/support", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white">ТоварЗаказ</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-white dark:bg-slate-950 pt-20 px-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                  {item.name === "Поддержка" && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors"
              >
                <User size={20} />
                Профиль
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors"
              >
                <Settings size={20} />
                Настройки
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
              >
                <LogOut size={20} />
                Выйти
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">ТоварЗаказ</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"} />
                {item.name}
                {item.name === "Поддержка" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 relative">
          <div className="flex items-center justify-between mb-4 px-2">
             <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Тема</span>
             <ThemeToggle />
          </div>
          
          {/* User Menu Dropdown Trigger */}
          <div className="relative">
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <User size={16} className="text-slate-400" />
                    Профиль
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Settings size={16} className="text-slate-400" />
                    Настройки
                  </Link>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Выйти
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Avatar" 
                  className="w-9 h-9 rounded-full object-cover bg-indigo-50 dark:bg-indigo-900/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {session.user?.name || "Пользователь"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {session.user?.email}
                </p>
              </div>
              <ChevronUp size={16} className={`text-slate-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}