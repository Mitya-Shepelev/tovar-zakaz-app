"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, Ban, Lock, Unlock, X, AlertTriangle, Settings } from "lucide-react";

interface Plan {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBanned: boolean;
  createdAt: string;
  plan: { id: string; name: string } | null;
  _count: {
    deals: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ban Modal State
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banForm, setBanForm] = useState({
    duration: "24h",
    reason: "",
  });
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, plansRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/plans")
      ]);
      
      const usersData = await usersRes.json();
      const plansData = await plansRes.json();
      
      setUsers(usersData);
      setPlans(plansData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openBanModal = (user: User) => {
    setSelectedUser(user);
    setBanForm({ duration: "24h", reason: "" });
    setIsBanModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setSelectedPlanId(user.plan?.id || "");
    setIsEditModalOpen(true);
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBanned: true,
          banDuration: banForm.duration,
          banReason: banForm.reason,
        }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, isBanned: true } : u));
        setIsBanModalOpen(false);
      }
    } catch (error) {
      console.error("Error banning user:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleUnban = async (userId: string) => {
    if (!confirm("Разблокировать пользователя?")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBanned: false,
        }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isBanned: false } : u));
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlanId || null }),
      });

      if (res.ok) {
        const updatedPlan = plans.find(p => p.id === selectedPlanId) || null;
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, plan: updatedPlan } : u));
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setProcessing(false);
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Пользователи</h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-transparent shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Пользователь
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Роль
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Тариф
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Статус
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Сделок
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Дата регистрации
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${user.isBanned ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user.name || "Без имени"}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                        : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {user.role === "admin" ? "Админ" : "Пользователь"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {user.plan ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                      {user.plan.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                   {user.isBanned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                        <Ban size={12} />
                        Заблокирован
                      </span>
                   ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                        Активен
                      </span>
                   )}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {user._count.deals}
                </td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                        href={`/admin/users/${user.id}/stats`}
                        className="inline-flex items-center p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-gray-700/50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="Статистика"
                    >
                        <BarChart2 size={18} />
                    </Link>
                    
                    <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-gray-700/50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="Редактировать"
                    >
                        <Settings size={18} />
                    </button>

                    {user.role !== "admin" && (
                        user.isBanned ? (
                            <button
                                onClick={() => handleUnban(user.id)}
                                className="inline-flex items-center p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 bg-gray-50 hover:bg-green-50 dark:bg-gray-700/50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Разблокировать"
                            >
                                <Unlock size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={() => openBanModal(user)}
                                className="inline-flex items-center p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-50 hover:bg-red-50 dark:bg-gray-700/50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Заблокировать"
                            >
                                <Ban size={18} />
                            </button>
                        )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Ban Modal */}
        {isBanModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Ban className="text-red-500" size={20} />
                  Блокировка пользователя
                </h3>
                <button onClick={() => setIsBanModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                  Пользователь: <span className="font-medium text-slate-900 dark:text-white">{selectedUser.email}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Длительность блокировки
                  </label>
                  <select
                    value={banForm.duration}
                    onChange={(e) => setBanForm({ ...banForm, duration: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="24h">24 часа</option>
                    <option value="3d">3 дня</option>
                    <option value="7d">7 дней</option>
                    <option value="permanent">Навсегда</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Причина (опционально)
                  </label>
                  <textarea
                    value={banForm.reason}
                    onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                    className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                    placeholder="Например: Нарушение правил сервиса..."
                  />
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-800 dark:text-amber-400">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>Пользователь будет немедленно ограничен в доступе к панели управления.</p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => setIsBanModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleBan}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {processing ? "Блокировка..." : "Заблокировать"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="text-indigo-500" size={20} />
                  Редактирование пользователя
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                  Пользователь: <span className="font-medium text-slate-900 dark:text-white">{editingUser.email}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Тарифный план
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Без тарифа (Базовый)</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Выберите тариф для этого пользователя. В списке доступны как публичные, так и скрытые планы.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {processing ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        )}

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Пользователи не найдены
          </div>
        )}
      </div>
    </div>
  );
}
