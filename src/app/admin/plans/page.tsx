"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Star, CheckCircle, XCircle } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  isPopular: boolean;
  isActive: boolean;
  order: number;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот тариф?")) return;

    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPlans(plans.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Тарифы</h1>
        <Link
          href="/admin/plans/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 font-medium"
        >
          <Plus size={18} />
          Создать тариф
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Название</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Цена</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Статус</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Порядок</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{plan.name}</span>
                      {plan.isPopular && (
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {plan.price} {plan.currency} / {plan.interval === "month" ? "мес" : "год"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.isActive
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {plan.isActive ? (
                        <>
                          <CheckCircle size={12} /> Активен
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Скрыт
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {plan.order}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/plans/${plan.id}`}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Тарифов пока нет. Создайте первый тариф.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
