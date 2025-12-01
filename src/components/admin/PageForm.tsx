"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageFormProps {
  initialData?: {
    title: string;
    slug: string;
    content: string;
    isPublished: boolean;
    showInFooter: boolean;
  };
  pageId?: string;
}

export default function PageForm({ initialData, pageId }: PageFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    isPublished: true,
    showInFooter: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !pageId ? slugify(title) : prev.slug, // Only auto-slug on create
    }));
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = pageId ? `/api/admin/pages/${pageId}` : "/api/admin/pages";
      const method = pageId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при сохранении");
      } else {
        router.push("/admin/pages");
        router.refresh();
      }
    } catch {
      setError("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Заголовок
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleTitleChange}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            placeholder="Например: О нас"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL (slug)
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
              /
            </span>
            <input
              type="text"
              name="slug"
              required
              value={formData.slug}
              onChange={handleChange}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="about-us"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Контент (HTML поддерживается)
        </label>
        <textarea
          name="content"
          required
          rows={12}
          value={formData.content}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono text-sm"
          placeholder="<h1>Заголовок</h1><p>Текст страницы...</p>"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Вы можете использовать HTML теги для форматирования.
        </p>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Опубликовано
          </span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="showInFooter"
            checked={formData.showInFooter}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Показывать в футере
          </span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Сохранение..." : "Сохранить страницу"}
        </button>
      </div>
    </form>
  );
}
