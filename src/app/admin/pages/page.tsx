"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  showInFooter: boolean;
  createdAt: string;
}

export default function AdminPagesList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        setPages(data);
      } else {
        console.error("Failed to fetch pages:", data);
        setPages([]);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту страницу?")) return;

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPages(pages.filter((p) => p.id !== id));
      } else {
        alert("Ошибка при удалении");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Страницы</h2>
        <Link
          href="/admin/pages/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Создать страницу
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-transparent shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Название
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                URL (slug)
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Статус
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                В футере
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                  {page.title}
                </td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                  /{page.slug}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      page.isPublished
                        ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {page.isPublished ? "Опубликовано" : "Черновик"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      page.showInFooter
                        ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {page.showInFooter ? "Да" : "Нет"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <Link
                    href={`/${page.slug}`}
                    target="_blank"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Просмотр"
                  >
                    👁
                  </Link>
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    Ред.
                  </Link>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Уд.
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Страницы пока не созданы
          </div>
        )}
      </div>
    </div>
  );
}
