"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Ban, Clock, LogOut } from "lucide-react";

interface BannedViewProps {
  banExpires?: string | null;
  banReason?: string | null;
}

export function BannedView({ banExpires, banReason }: BannedViewProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!banExpires) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(banExpires).getTime();
      const distance = expires - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("Время блокировки истекло. Попробуйте обновить страницу.");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}д ${hours}ч ${minutes}м ${seconds}с`);
    }, 1000);

    return () => clearInterval(interval);
  }, [banExpires]);

  const isPermanent = !banExpires;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30 p-8 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ban size={40} className="text-red-600 dark:text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Доступ ограничен
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Ваш аккаунт был временно заблокирован администратором.
          {banReason && (
            <span className="block mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
              Причина: {banReason}
            </span>
          )}
        </p>

        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 mb-8 border border-red-100 dark:border-red-900/30">
          <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-400 font-medium mb-1">
            <Clock size={18} />
            <span>До снятия блокировки:</span>
          </div>
          <div className="text-2xl font-bold text-red-800 dark:text-red-300 font-mono">
            {isPermanent ? "Навсегда" : timeLeft || "Загрузка..."}
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
        >
          <LogOut size={18} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
