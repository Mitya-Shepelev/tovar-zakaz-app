import Link from "next/link";
import { getPublicSettings, getFooterPages } from "@/lib/public-data";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import Pricing from "@/components/landing/Pricing";

export default async function LandingPage() {
  const settings = await getPublicSettings();
  const footerPages = await getFooterPages();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-indigo-500 selection:text-white font-sans transition-colors duration-300">
      <Navbar settings={settings} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-semibold mb-8 border border-indigo-100 dark:border-indigo-800">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Новое: Авторасчет комиссий и Темная тема
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 max-w-4xl mx-auto leading-[1.1]">
            Умный контроль <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient">
              ваших продаж
            </span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Единая платформа для продавцов: автоматический расчет прибыли с учетом комиссий,
            управление клиентами и аналитика в современном интерфейсе.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10"
            >
              Начать бесплатно
            </Link>
            <Link
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Возможности
            </Link>
          </div>

          {/* Dashboard Preview Component */}
          <DashboardPreview />
        </div>
      </section>

      {/* Features Grid */}
      <section id="demo" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Всё для эффективной торговли
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Мы обновили функционал, чтобы вы могли сосредоточиться на главном — росте прибыли.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {/* Feature 1: Auto Calculations (New) */}
            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Умный расчет</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Задайте % комиссии поставщика и продавца один раз. Система автоматически рассчитает итоговую прибыль по каждой сделке.
              </p>
            </div>

             {/* Feature 2: Dark Mode (New) */}
            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Темная тема</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Комфортная работа в любое время суток. Переключайтесь между темами одним кликом для снижения нагрузки на глаза.
              </p>
            </div>

            {/* Feature 3: Fast Creation (Existing) */}
            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Скорость</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Мгновенное создание заказов. Автозаполнение данных клиента и удобный поиск по базе экономят ваше время.
              </p>
            </div>

            {/* Feature 4: Analytics (Existing) */}
            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-violet-50 dark:bg-violet-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Контроль</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Полная прозрачность финансов. Отслеживайте статусы заказов и динамику прибыли в реальном времени.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* Pricing Section */}
      <Pricing />

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="bg-slate-900 dark:bg-indigo-900/20 rounded-3xl p-8 sm:p-16 text-center relative overflow-hidden border border-transparent dark:border-indigo-500/30">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Начните контролировать продажи прямо сейчас
            </h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
              Регистрация займет меньше минуты. Никаких сложных настроек — просто начните работать.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-lg shadow-lg"
            >
              Создать аккаунт
            </Link>
          </div>
        </div>
      </section>

      <Footer settings={settings} pages={footerPages} />
    </div>
  );
}
