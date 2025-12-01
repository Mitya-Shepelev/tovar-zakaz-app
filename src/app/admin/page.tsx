"use client";

import { useEffect, useState } from "react";

interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalDeals: number;
  totalClients: number;
  totalAmount: number;
  totalSupplierCommission: number;
  totalSellerCommission: number;
  totalGrandTotal: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Обзор системы</h2>
        <p className="text-slate-500 dark:text-slate-400">Глобальная статистика по всем пользователям</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Users */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Пользователей</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
                {stats?.newUsersToday ? (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                    +{stats.newUsersToday} сегодня
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">0 сегодня</span>
                )}
              </div>
              {stats?.newUsersWeek ? (
                 <p className="text-xs text-slate-400 mt-1">+{stats.newUsersWeek} за неделю</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Deals */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Всего сделок</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalDeals || 0}</p>
                <span className="text-xs text-slate-400">({stats?.totalClients} кл.)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profit (Seller Commission) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Прибыль пользователей</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(stats?.totalSellerCommission || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Turnover (Grand Total) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Общий оборот</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats?.totalGrandTotal || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Детализация сумм</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-slate-600 dark:text-slate-300">Сумма заказов (общая база)</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(stats?.totalAmount || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-slate-600 dark:text-slate-300">Комиссия поставщиков (общая)</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(stats?.totalSupplierCommission || 0)}</span>
            </div>
             <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Прибыль пользователей (общая)</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(stats?.totalSellerCommission || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
           <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Быстрые действия</h3>
            <div className="grid grid-cols-1 gap-3">
            <a
                href="/admin/users"
                className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-600 group"
            >
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3 group-hover:scale-110 transition-transform">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-slate-900 dark:text-white font-medium">Пользователи</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Управление аккаунтами</p>
                </div>
            </a>
            <a
                href="/admin/settings"
                className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-600 group"
            >
                 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 mr-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                <p className="text-slate-900 dark:text-white font-medium">Настройки</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Глобальные параметры</p>
                </div>
            </a>
            </div>
        </div>
      </div>
    </div>
  );
}
