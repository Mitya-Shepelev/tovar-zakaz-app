"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle, ChevronRight, User } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { name: string | null; email: string };
  messages: { message: string }[];
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/admin/support/tickets");
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Поддержка пользователей</h2>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/admin/support/${ticket.id}`}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {ticket.subject}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                      ticket.status === "open"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
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
                
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-300">
                  <User size={14} />
                  <span className="font-medium">{ticket.user.name || ticket.user.email}</span>
                  <span className="text-gray-400">({ticket.user.email})</span>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                  {ticket.messages[0]?.message || "Нет сообщений"}
                </p>
                
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <span>{new Date(ticket.updatedAt).toLocaleDateString("ru-RU")}</span>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Link>
        ))}

        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Обращений пока нет
          </div>
        )}
      </div>
    </div>
  );
}
