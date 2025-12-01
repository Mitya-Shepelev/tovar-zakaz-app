import Link from "next/link";

interface FooterProps {
  settings: Record<string, string>;
  pages: { title: string; slug: string }[];
}

export function Footer({ settings, pages }: FooterProps) {
  const siteName = settings.siteName || "ТоварЗаказ";
  const siteDesc = settings.siteDescription || "Система управления продажами.";
  const email = settings.supportEmail;

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-lg">
                {siteName}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              {siteDesc}
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </div>
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Информация</h3>
            <ul className="space-y-2 text-sm">
              {pages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/${page.slug}`}
                    className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Продукт</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#demo" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Возможности</Link></li>
              <li><Link href="/auth/login" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Вход</Link></li>
              <li><Link href="/auth/register" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Регистрация</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Контакты</h3>
            {email && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Email</p>
                <a href={`mailto:${email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  {email}
                </a>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Адрес</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                г. Москва, ул. Примерная, д. 10
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} {siteName}. Все права защищены.
          </p>
          <div className="flex gap-6">
             <a href="#" className="text-slate-400 text-xs hover:text-slate-600 dark:hover:text-slate-300">Политика конфиденциальности</a>
             <a href="#" className="text-slate-400 text-xs hover:text-slate-600 dark:hover:text-slate-300">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
