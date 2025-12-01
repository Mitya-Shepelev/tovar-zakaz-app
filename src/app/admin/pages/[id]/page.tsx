"use client";

import { useEffect, useState } from "react";
import PageForm from "@/components/admin/PageForm";
import { useParams } from "next/navigation";

export default function EditPage() {
  const params = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/admin/pages/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPage(data);
        }
      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPage();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!page) {
    return <div className="text-gray-500">Страница не найдена</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Редактирование страницы
      </h2>
      <PageForm initialData={page} pageId={params.id as string} />
    </div>
  );
}
