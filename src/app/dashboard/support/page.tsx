"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Plus, Clock, CheckCircle, ChevronRight } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: { message: string }[];
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/support/tickets");
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });

      if (res.ok) {
        setNewTicket({ subject: "", message: "" });
        setIsCreateModalOpen(false);
        fetchTickets();
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setCreating(false);
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Поддержка</h1>
          <p className="text-slate-500 dark:text-slate-400">Свяжитесь с нами по любым вопросам</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 text-sm font-medium"
        >
          <Plus size={18} />
          Новое обращение
        </button>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/dashboard/support/${ticket.id}`}
            className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {ticket.subject}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                      ticket.status === "open"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {ticket.status === "open" ? (
                      <>
                        <Clock size={12} /> Открыто
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} /> Закрыто
                      </>
                    )}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm truncate">
                  {ticket.messages[0]?.message || "Нет сообщений"}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                  <span>ID: {ticket.id.slice(-6)}</span>
                  <span>•</span>
                  <span>{new Date(ticket.updatedAt).toLocaleDateString("ru-RU")}</span>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Link>
        ))}

        {tickets.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">У вас пока нет обращений</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Если у вас возникли вопросы, создайте тикет</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Создать первое обращение
            </button>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Новое обращение</h3>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Тема
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="Кратко опишите проблему"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Сообщение
                </label>
                <textarea
                  required
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors h-32 resize-none"
                  placeholder="Опишите детали вашего вопроса..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {creating ? "Отправка..." : "Отправить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
