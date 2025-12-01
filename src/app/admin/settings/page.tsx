"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetchSettings();
  }, []);

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

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6 border border-gray-200 dark:border-transparent shadow-sm">
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
    </div>
  );
}
