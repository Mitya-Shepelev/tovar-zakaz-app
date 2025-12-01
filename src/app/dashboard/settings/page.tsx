"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    supplierCommission: 0,
    sellerCommission: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/user/settings");
      const data = await res.json();
      if (res.ok) {
        setSettings({
          supplierCommission: data.supplierCommission || 0,
          sellerCommission: data.sellerCommission || 0,
        });
      }
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
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            supplierCommission: Number(settings.supplierCommission),
            sellerCommission: Number(settings.sellerCommission)
        }),
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
      <h2 className="text-2xl font-bold text-white mb-6">Настройки аккаунта</h2>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-gray-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Комиссия поставщика (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={settings.supplierCommission}
              onChange={(e) =>
                setSettings({ ...settings, supplierCommission: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
             <p className="text-xs text-gray-400 mt-1">
              Этот процент будет добавлен к сумме заказа (Комиссия поставщика).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Комиссия продавца (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={settings.sellerCommission}
              onChange={(e) =>
                setSettings({ ...settings, sellerCommission: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
             <p className="text-xs text-gray-400 mt-1">
              Этот процент будет добавлен к сумме заказа + комиссия поставщика.
            </p>
          </div>

          {message && (
            <div
              className={`px-4 py-2 rounded-lg ${
                message.includes("Ошибка")
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
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
