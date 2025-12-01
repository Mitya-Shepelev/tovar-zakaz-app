"use client";

import { useEffect, useState } from "react";
import { Shield, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";

interface RateLimitStats {
  total: number;
  byType: Record<string, number>;
  settings: {
    registrationEnabled: boolean;
    loginEnabled: boolean;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "",
    siteDescription: "",
    supportEmail: "",
    currency: "RUB",
    logoType: "text", // 'text' | 'image'
    logoText: "ТоварЗаказ",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Rate limits state
  const [rateLimits, setRateLimits] = useState<RateLimitStats | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState("");

  useEffect(() => {
    fetchSettings();
    fetchRateLimits();
  }, []);

  const fetchRateLimits = async () => {
    try {
      const res = await fetch("/api/admin/rate-limits");
      if (res.ok) {
        const data = await res.json();
        setRateLimits(data);
      }
    } catch (error) {
      console.error("Error fetching rate limits:", error);
    }
  };

  const handleRateLimitAction = async (action: string, type?: string) => {
    try {
      const res = await fetch("/api/admin/rate-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, type }),
      });
      const data = await res.json();
      setRateLimitMessage(data.message);
      fetchRateLimits();
      setTimeout(() => setRateLimitMessage(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setRateLimitMessage("Ошибка выполнения");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings({
        siteName: data.siteName || "ТоварЗаказ",
        siteDescription: data.siteDescription || "Система управления заказами",
        supportEmail: data.supportEmail || "",
        currency: data.currency || "RUB",
        logoType: data.logoType || "text",
        logoText: data.logoText || "ТоварЗаказ",
        logoUrl: data.logoUrl || "",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage("Настройки сохранены");
      } else {
        setMessage("Ошибка при сохранении");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Ошибка при сохранении");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Настройки системы</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Site Settings */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6 border border-gray-200 dark:border-transparent shadow-sm h-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Название сайта
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) =>
                setSettings({ ...settings, siteName: e.target.value })
              }
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание сайта
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) =>
                setSettings({ ...settings, siteDescription: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Логотип
            </label>
            
            <div className="flex items-center space-x-6 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="logoType"
                  value="text"
                  checked={settings.logoType === "text"}
                  onChange={(e) => setSettings({ ...settings, logoType: e.target.value })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Текст</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="logoType"
                  value="image"
                  checked={settings.logoType === "image"}
                  onChange={(e) => setSettings({ ...settings, logoType: e.target.value })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Изображение (URL)</span>
              </label>
            </div>

            {settings.logoType === "text" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Текст логотипа
                </label>
                <input
                  type="text"
                  value={settings.logoText}
                  onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="ТоварЗаказ"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL изображения
                </label>
                <input
                  type="text"
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="https://example.com/logo.png"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Рекомендуемый размер: высота 32px
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email поддержки
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, supportEmail: e.target.value })
              }
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="support@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Валюта
            </label>
            <select
              value={settings.currency}
              onChange={(e) =>
                setSettings({ ...settings, currency: e.target.value })
              }
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="RUB">Рубль (RUB)</option>
              <option value="USD">Доллар (USD)</option>
              <option value="EUR">Евро (EUR)</option>
              <option value="KZT">Тенге (KZT)</option>
              <option value="UAH">Гривна (UAH)</option>
            </select>
          </div>

          {message && (
            <div
              className={`px-4 py-2 rounded-lg ${
                message.includes("Ошибка")
                  ? "bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                  : "bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить настройки"}
          </button>
          </div>
        </form>

        {/* Right Column - Rate Limits */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6 border border-gray-200 dark:border-transparent shadow-sm h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Управление лимитами
            </h3>
          {rateLimitMessage && (
            <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              {rateLimitMessage}
            </div>
          )}

          {/* Statistics */}
          {rateLimits && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Всего активных лимитов</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rateLimits.total}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">По типам</p>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {Object.entries(rateLimits.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {Object.keys(rateLimits.byType).length === 0 && (
                    <span className="text-gray-400">Нет данных</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Toggle Switches */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Лимит регистрации</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">10 аккаунтов в час с одного IP</p>
              </div>
              <button
                onClick={() => handleRateLimitAction("toggle_registration")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition"
              >
                {rateLimits?.settings.registrationEnabled ? (
                  <ToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
                <span className={rateLimits?.settings.registrationEnabled ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                  {rateLimits?.settings.registrationEnabled ? "Вкл" : "Выкл"}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Лимит логина</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">10 попыток за 15 минут с одного IP</p>
              </div>
              <button
                onClick={() => handleRateLimitAction("toggle_login")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition"
              >
                {rateLimits?.settings.loginEnabled ? (
                  <ToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
                <span className={rateLimits?.settings.loginEnabled ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                  {rateLimits?.settings.loginEnabled ? "Вкл" : "Выкл"}
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={() => handleRateLimitAction("clear_type", "register")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/30 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Сбросить лимиты регистрации
            </button>

            <button
              onClick={() => handleRateLimitAction("clear_type", "login")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/30 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Сбросить лимиты логина
            </button>

            <button
              onClick={() => handleRateLimitAction("clear_all")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Сбросить все лимиты
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
