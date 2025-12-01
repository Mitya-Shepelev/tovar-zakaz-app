"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Plus,
  Phone,
  User,
  Pencil,
  Package,
  X,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";

interface CalculatorItem {
  id: string;
  name: string;
  price: number;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  orderAmount: number;
  calculatorItems?: CalculatorItem[];
}

interface Deal {
  id: string;
  date: string;
  supplierCommission: number;
  sellerCommission: number;
  clients: Client[];
}

function DealCard({ 
  deal, 
  onOpenItemsModal,
  onDelete,
  formatCurrency 
}: { 
  deal: Deal, 
  onOpenItemsModal: (name: string, items: CalculatorItem[]) => void,
  onDelete: (id: string) => void,
  formatCurrency: (amount: number) => string
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleClients = isExpanded ? deal.clients : deal.clients.slice(0, 1);
  const hasMoreClients = deal.clients.length > 1;

  const baseAmount = deal.clients.reduce((sum, client) => sum + client.orderAmount, 0);
  const supplierCommAmount = baseAmount * ((deal.supplierCommission || 0) / 100);
  const intermediateAmount = baseAmount + supplierCommAmount;
  const sellerCommAmount = intermediateAmount * ((deal.sellerCommission || 0) / 100);
  const grandTotal = intermediateAmount + sellerCommAmount;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              #{deal.id.slice(-4)}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                Заказ от {new Date(deal.date).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(deal.date).getFullYear()}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-6">
             <div className="flex items-center gap-2">
               <Link
                  href={`/dashboard/deals/${deal.id}/edit`}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="Редактировать заказ"
               >
                  <Pencil size={18} />
               </Link>
               <button
                  onClick={() => onDelete(deal.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Удалить заказ"
               >
                  <Trash2 size={18} />
               </button>
             </div>
             <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">Клиентов</div>
                <div className="font-medium text-slate-900 dark:text-white">{deal.clients.length}</div>
             </div>
             <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">Итого</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(grandTotal)}
                </div>
             </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 w-[45%] sm:w-[40%]">Клиент</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:table-cell sm:w-[30%]">Телефон</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 w-[55%] sm:w-[30%]">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {visibleClients.map((client) => (
                <tr key={client.id}>
                  <td className="py-2.5 px-4 text-sm text-slate-900 dark:text-white truncate">
                    <div className="flex items-center gap-2 truncate">
                        <User size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{client.name}</span>
                    </div>
                    <div className="sm:hidden text-xs text-slate-500 mt-0.5 truncate">{client.phone}</div>
                  </td>
                  <td className="py-2.5 px-4 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell truncate">
                     {client.phone}
                  </td>
                  <td className="py-2.5 px-4 text-sm font-medium text-slate-900 dark:text-white text-right">
                    <div className="flex items-center justify-end gap-3">
                        <span className="truncate">{formatCurrency(client.orderAmount)}</span>
                        <button
                            onClick={() => onOpenItemsModal(client.name, client.calculatorItems || [])}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors shrink-0"
                            title="Посмотреть список товаров"
                        >
                            <Package size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50">
            <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Сумма заказов:</span>
                    <span>{formatCurrency(baseAmount)}</span>
                </div>
                {(deal.supplierCommission > 0) && (
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Комиссия поставщика ({deal.supplierCommission}%):</span>
                        <span>{formatCurrency(supplierCommAmount)}</span>
                    </div>
                )}
                {(deal.sellerCommission > 0) && (
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Комиссия продавца ({deal.sellerCommission}%):</span>
                        <span>{formatCurrency(sellerCommAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Итого:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(grandTotal)}</span>
                </div>
            </div>
          </div>

          {hasMoreClients && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-2 flex items-center justify-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-200 dark:border-slate-700"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} />
                  Свернуть
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Показать всех ({deal.clients.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Items Modal State
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState("");
  const [selectedClientItems, setSelectedClientItems] = useState<CalculatorItem[]>([]);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    try {
      const res = await fetch(`/api/deals?${params}`);
      const data = await res.json();
      setDeals(data);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот заказ?")) return;

    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeals((prev) => prev.filter((deal) => deal.id !== id));
      } else {
        alert("Ошибка при удалении заказа");
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
      alert("Ошибка при удалении заказа");
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeals();
    setIsFilterOpen(false);
  };

  const openItemsModal = (clientName: string, items: CalculatorItem[] = []) => {
    setSelectedClientName(clientName);
    setSelectedClientItems(items);
    setIsItemsModalOpen(true);
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Items Modal */}
      {isItemsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Package size={24} />
                Товары клиента
              </div>
              <button 
                onClick={() => setIsItemsModalOpen(false)}
                className="p-1 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                 <div className="text-sm text-slate-500 dark:text-slate-400">Клиент</div>
                 <div className="font-bold text-lg text-slate-900 dark:text-white">{selectedClientName}</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 max-h-64 overflow-y-auto">
                {selectedClientItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Нет списка товаров
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {selectedClientItems.map((item, idx) => (
                      <li key={item.id || idx} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                         <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                              {item.name || "Товар"}
                            </span>
                         </div>
                         <span className="font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap ml-2">
                            {formatCurrency(item.price)}
                         </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Итого по списку</span>
                  <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedClientItems.reduce((acc, item) => acc + item.price, 0))}
                  </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Список заказов</h1>
          <p className="text-slate-500 dark:text-slate-400">История всех ваших сделок и продаж</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              isFilterOpen || startDate || endDate
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400"
                : "bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Filter size={18} />
            Фильтр
          </button>
          <Link
            href="/dashboard/deals/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 text-sm font-medium"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Новый заказ</span>
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      {(isFilterOpen || startDate || endDate) && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                С даты
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                По дату
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-700 transition text-sm font-medium"
              >
                Применить
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setIsFilterOpen(false);
                  setTimeout(() => {
                      const params = new URLSearchParams();
                      fetch(`/api/deals?${params}`).then(res => res.json()).then(data => setDeals(data));
                  }, 0);
                }}
                className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-medium"
              >
                Сбросить
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Заказы не найдены</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Попробуйте изменить параметры фильтра или создайте новый заказ</p>
          <Link
            href="/dashboard/deals/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 text-sm font-medium"
          >
            <Plus size={18} />
            Создать заказ
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {deals.map((deal) => (
            <DealCard 
              key={deal.id} 
              deal={deal} 
              onOpenItemsModal={openItemsModal}
              onDelete={handleDeleteDeal}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}
    </div>
  );
}