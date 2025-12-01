"use client";

import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  Search, 
  Bell, 
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Package,
  ArrowUpRight
} from "lucide-react";
import { useState } from "react";

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Mock Data
  const recentDeals = [
    { id: 1, client: "Алексей Петров", amount: "45 900 ₽", status: "Новый", items: 3 },
    { id: 2, client: "Ирина Смирнова", amount: "12 500 ₽", status: "В работе", items: 1 },
    { id: 3, client: "ООО 'Вектор'", amount: "128 000 ₽", status: "Завершен", items: 15 },
    { id: 4, client: "Максим Волков", amount: "3 400 ₽", status: "Новый", items: 2 },
  ];

  return (
    <div className="relative max-w-5xl mx-auto perspective-[2000px] group/preview">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20 group-hover/preview:opacity-40 transition-opacity duration-1000 animate-pulse"></div>
      
      <div className="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden rotate-x-12 transform-gpu transition-all duration-700 ease-out hover:rotate-x-0 hover:scale-[1.02]">
        
        {/* Top Bar */}
        <div className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
             <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <div className="hidden sm:block ml-4 w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
             <div className="hidden sm:flex items-center gap-2 ml-2 text-slate-400">
               <Search size={16} />
               <span className="text-xs">Поиск...</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={18} className="text-slate-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              A
            </div>
          </div>
        </div>

        <div className="flex h-[500px] sm:h-[600px] overflow-hidden">
          {/* Sidebar */}
          <div className="w-16 sm:w-60 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col py-6 hidden sm:flex">
            <div className="px-6 mb-8 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
              <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight hidden sm:block">ТоварЗаказ</span>
            </div>
            
            <div className="flex-1 px-3 space-y-1">
              {[
                { id: "dashboard", icon: LayoutDashboard, label: "Обзор" },
                { id: "deals", icon: ShoppingBag, label: "Заказы" },
                { id: "clients", icon: Users, label: "Клиенты" },
                { id: "settings", icon: Settings, label: "Настройки" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm translate-x-1"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <item.icon size={20} strokeWidth={2} />
                  <span className="hidden sm:block">{item.label}</span>
                </button>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
               <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Pro Plan</p>
                  <p className="text-[10px] text-indigo-700 dark:text-indigo-400 mb-2">Действует до 25 дек</p>
                  <div className="w-full bg-indigo-200 dark:bg-indigo-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-3/4 rounded-full"></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto p-6 sm:p-8 scrollbar-hide">
              
              {/* Page Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Панель управления</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Добро пожаловать обратно, Александр</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95">
                  + Новый заказ
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                         <DollarSign size={20} />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <ArrowUpRight size={12} /> 12%
                      </span>
                   </div>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Выручка за месяц</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">542 000 ₽</h3>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                         <ShoppingBag size={20} />
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <ArrowUpRight size={12} /> 8%
                      </span>
                   </div>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Активных заказов</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">24</h3>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-violet-50 dark:bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300">
                         <Users size={20} />
                      </div>
                      <span className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <ArrowUpRight size={12} /> 5%
                      </span>
                   </div>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Новых клиентов</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">156</h3>
                </div>
              </div>

              {/* Chart & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Chart */}
                 <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="font-bold text-slate-900 dark:text-white">Динамика продаж</h3>
                       <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                          <MoreHorizontal size={20} />
                       </button>
                    </div>
                    <div className="h-48 flex items-end justify-between gap-3 px-2">
                      {[40, 65, 50, 80, 65, 90, 75, 95, 85, 70, 85, 95].map((h, i) => (
                        <div key={i} className="relative w-full h-full flex items-end group/bar">
                           <div 
                             className="w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-t-md relative overflow-hidden transition-all duration-500 group-hover/bar:bg-indigo-100 dark:group-hover/bar:bg-indigo-900/40"
                             style={{ height: `${h}%` }}
                           >
                             <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-indigo-500 to-violet-500 opacity-80 group-hover/bar:opacity-100 transition-opacity"></div>
                           </div>
                           
                           {/* Tooltip */}
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-all duration-300 shadow-xl whitespace-nowrap z-10 pointer-events-none transform translate-y-2 group-hover/bar:translate-y-0">
                              {(h * 1250).toLocaleString()} ₽
                           </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium">
                       <span>Янв</span><span>Фев</span><span>Мар</span><span>Апр</span><span>Май</span><span>Июн</span>
                       <span>Июл</span><span>Авг</span><span>Сен</span><span>Окт</span><span>Ноя</span><span>Дек</span>
                    </div>
                 </div>

                 {/* Recent Activity List */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Последние заказы</h3>
                    <div className="space-y-4">
                       {recentDeals.map((deal) => (
                          <div 
                            key={deal.id} 
                            onMouseEnter={() => setHoveredRow(deal.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className={`flex items-center justify-between p-3 rounded-xl transition-colors duration-200 cursor-pointer border ${
                              hoveredRow === deal.id 
                                ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
                                : "border-transparent"
                            }`}
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm">
                                   {deal.client[0]}
                                </div>
                                <div>
                                   <p className="text-sm font-medium text-slate-900 dark:text-white">{deal.client}</p>
                                   <p className="text-xs text-slate-500 dark:text-slate-400">{deal.items} товара</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{deal.amount}</p>
                                <p className={`text-[10px] font-medium ${
                                  deal.status === "Новый" ? "text-blue-500" : 
                                  deal.status === "В работе" ? "text-amber-500" : "text-emerald-500"
                                }`}>
                                  {deal.status}
                                </p>
                             </div>
                          </div>
                       ))}
                       <button className="w-full py-3 mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors">
                          Смотреть все
                       </button>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
