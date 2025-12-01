"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  Plus,
  ShoppingBag
} from "lucide-react";

interface Stats {
  totalDeals: number;
  totalClients: number;
  totalAmount: number;
  totalSupplierCommission: number;
  totalSellerCommission: number;
  totalGrandTotal: number;
  dailyStats: Record<string, { deals: number; clients: number; amount: number; grandTotal: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    const now = new Date();
    let startDate = "";

    if (period === "today") {
      startDate = now.toISOString().split("T")[0];
    } else if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = weekAgo.toISOString().split("T")[0];
    } else if (period === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = monthAgo.toISOString().split("T")[0];
    }

    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    params.append("endDate", now.toISOString().split("T")[0]);

    try {
      const res = await fetch(`/api/stats?${params}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Обзор</h1>
          <p className="text-slate-500 dark:text-slate-400">Статистика и показатели вашего бизнеса</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-sm">
            {[
              { value: "today", label: "День" },
              { value: "week", label: "Неделя" },
              { value: "month", label: "Месяц" },
              { value: "all", label: "Все" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setPeriod(item.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  period === item.value
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/deals/new"
            className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 text-sm font-medium"
          >
            <Plus size={18} />
            Новый заказ
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Base Amount */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                    <ShoppingBag size={20} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Заказы (База)</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(stats?.totalAmount || 0)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Сумма без комиссий</div>
              </div>
            </div>

            {/* Card 2: Supplier Commission */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Комиссия пост.</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(stats?.totalSupplierCommission || 0)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Доход поставщика</div>
              </div>
            </div>

            {/* Card 3: Seller Commission (Profit) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Комиссия прод.</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {formatCurrency(stats?.totalSellerCommission || 0)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Ваша чистая прибыль</div>
              </div>
            </div>

            {/* Card 4: Grand Total */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-violet-200 dark:hover:border-violet-800 transition-colors">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-violet-600 dark:text-violet-400">
                    <ArrowUpRight size={20} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Общий оборот</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(stats?.totalGrandTotal || 0)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Итоговая сумма с комиссиями</div>
              </div>
            </div>
          </div>

          {/* Daily Stats Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar size={20} className="text-indigo-500" />
                Детализация по дням
              </h2>
            </div>
            
            {stats?.dailyStats && Object.keys(stats.dailyStats).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Заказов
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                        Сумма (База)
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Итого
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(stats.dailyStats)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([date, data]) => (
                        <tr key={date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              {new Date(date).toLocaleDateString("ru-RU", {
                                weekday: "short",
                                day: "numeric",
                                month: "long",
                              })}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 text-right">
                            {data.deals} <span className="text-slate-400 text-xs">({data.clients} кл.)</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 text-right hidden sm:table-cell">
                            {formatCurrency(data.amount)}
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white text-right">
                            {formatCurrency(data.grandTotal)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Нет данных за этот период</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Попробуйте выбрать другой период или создайте новый заказ</p>
                <Link
                  href="/dashboard/deals/new"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 text-sm font-medium"
                >
                  <Plus size={18} />
                  Создать заказ
                </Link>
              </div>
            )}
          </div>
        </>
      )}
      
      <Link
         href="/dashboard/deals/new"
         className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/40 z-30 hover:scale-105 transition-transform"
      >
         <Plus size={28} />
      </Link>
    </div>
  );
}