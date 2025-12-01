import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  settings: Record<string, string>;
}

export function Navbar({ settings }: NavbarProps) {
  const logoType = settings.logoType || "text";
  const logoText = settings.logoText || "ТоварЗаказ";
  const logoUrl = settings.logoUrl || "";

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            {logoType === "image" && logoUrl ? (
              <img src={logoUrl} alt={logoText} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                  {logoText}
                </span>
              </>
            )}
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 mr-auto ml-8">
           <Link href="/pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
             Стоимость
           </Link>
        </nav>

        <div className="flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block"
          >
            Войти
          </Link>
          <Link
            href="/auth/register"
            className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            Регистрация
          </Link>
        </div>
      </div>
    </header>
  );
}
