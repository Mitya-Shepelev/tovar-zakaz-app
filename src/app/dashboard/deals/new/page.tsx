"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  User, 
  Phone, 
  DollarSign,
  AlertCircle,
  Calculator,
  Package
} from "lucide-react";
import { CalculatorModal } from "@/components/CalculatorModal";

interface CalculatorItem {
  id: string;
  name: string;
  price: number;
}

interface ClientInput {
  id: string;
  name: string;
  phone: string;
  orderAmount: string;
  totalItems: string;
  calculatorItems: CalculatorItem[];
}

export default function NewDealPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [clients, setClients] = useState<ClientInput[]>([
    { id: "1", name: "", phone: "", orderAmount: "", totalItems: "0", calculatorItems: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculator State
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  const addClient = () => {
    setClients([
      ...clients,
      { id: Date.now().toString(), name: "", phone: "", orderAmount: "", totalItems: "0", calculatorItems: [] },
    ]);
  };

  const removeClient = (id: string) => {
    if (clients.length > 1) {
      setClients(clients.filter((c) => c.id !== id));
    }
  };

  const updateClient = (id: string, field: keyof ClientInput, value: string) => {
    setClients(
      clients.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const openCalculator = (id: string) => {
    setActiveClientId(id);
    setIsCalcOpen(true);
  };

  const handleCalculatorFinish = (total: number, count: number, items: CalculatorItem[]) => {
    if (activeClientId) {
      setClients(clients.map(c => {
        if (c.id === activeClientId) {
          return {
            ...c,
            orderAmount: total.toString(),
            totalItems: count.toString(),
            calculatorItems: items
          };
        }
        return c;
      }));
    }
  };

  const getTotalAmount = () => {
    return clients.reduce((sum, c) => sum + (parseFloat(c.orderAmount) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    const validClients = clients.filter(
      (c) => c.name.trim() && c.phone.trim() && parseFloat(c.orderAmount) > 0
    );

    if (validClients.length === 0) {
      setError("Добавьте хотя бы одного клиента с корректными данными (имя, телефон, сумма > 0)");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          clients: validClients.map((c) => ({
            name: c.name.trim(),
            phone: c.phone.trim(),
            orderAmount: parseFloat(c.orderAmount),
            totalItems: parseInt(c.totalItems) || 0,
            calculatorItems: c.calculatorItems || [],
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при создании заказа");
        return;
      }

      router.push("/dashboard/deals");
      router.refresh();
    } catch {
      setError("Произошла ошибка при создании заказа");
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

  const activeClient = clients.find(c => c.id === activeClientId);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <CalculatorModal 
        isOpen={isCalcOpen} 
        onClose={() => setIsCalcOpen(false)} 
        onFinish={handleCalculatorFinish} 
        initialItems={activeClient?.calculatorItems || []}
      />

      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Новый заказ</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Создание новой сделки и добавление клиентов</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Date Selection */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Дата сделки
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User size={20} className="text-indigo-500" />
                Список клиентов
             </h2>
             <button
              type="button"
              onClick={addClient}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus size={16} />
              Добавить клиента
            </button>
          </div>

          {clients.map((client, index) => (
            <div
              key={client.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm relative group"
            >
              <div className="absolute top-4 right-4">
                {clients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeClient(client.id)}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Удалить клиента"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
              </div>

              <div className="mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Клиент #{index + 1}
                </span>
              </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-20 gap-6">
                                                          <div className="space-y-1.5 md:col-span-7">
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                              Имя
                                                            </label>
                                                            <div className="relative">
                                                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                                <User size={16} />
                                                              </div>
                                                              <input
                                                                type="text"
                                                                value={client.name}
                                                                onChange={(e) =>
                                                                  updateClient(client.id, "name", e.target.value)
                                                                }
                                                                placeholder="Имя клиента"
                                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                                              />
                                                            </div>
                                                          </div>
                                          
                                                          <div className="space-y-1.5 md:col-span-6">
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                              Телефон
                                                            </label>
                                                            <div className="relative">
                                                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                                <Phone size={16} />
                                                              </div>
                                                              <input
                                                                type="tel"
                                                                value={client.phone}
                                                                onChange={(e) =>
                                                                  updateClient(client.id, "phone", e.target.value)
                                                                }
                                                                placeholder="+7 (999) 000-00-00"
                                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                                              />
                                                            </div>
                                                          </div>
                                          
                                                          <div className="space-y-1.5 md:col-span-5">
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                              Сумма
                                                            </label>
                                                            <div className="flex gap-2">
                                                              <div className="relative flex-1 min-w-0">
                                                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                                                  <DollarSign size={14} />
                                                                </div>
                                                                                                                  <input
                                                                                                                    type="number"
                                                                                                                    min="0"
                                                                                                                    step="0.01"
                                                                                                                    value={client.orderAmount}
                                                                                                                    onChange={(e) =>
                                                                                                                      updateClient(client.id, "orderAmount", e.target.value)
                                                                                                                    }
                                                                                                                    placeholder="0"
                                                                                                                    className="w-full pl-8 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                                                                                                  />                                                              </div>
                                                              <button
                                                                type="button"
                                                                onClick={() => openCalculator(client.id)}
                                                                title="Открыть калькулятор"
                                                                className="p-2.5 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors shrink-0"
                                                              >
                                                                <Calculator size={18} />
                                                              </button>
                                                            </div>
                                                          </div>
                                          
                                                                          <div className="space-y-1.5 md:col-span-2">
                                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                                                              Кол-во
                                                                            </label>
                                                                            <div className="relative">
                                                                              <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="1"
                                                                                value={client.totalItems}
                                                                                onChange={(e) =>
                                                                                  updateClient(client.id, "totalItems", e.target.value)
                                                                                }
                                                                                placeholder="0"
                                                                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-center"
                                                                              />
                                                                            </div>
                                                                          </div>                                                        </div>
            </div>
          ))}
        </div>

        {/* Footer / Total */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 sticky bottom-4 z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Итоговая сумма</div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(getTotalAmount())}
                </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 sm:flex-none px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save size={20} />
                            Создать заказ
                        </>
                    )}
                </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
