import { getPageBySlug, getPublicSettings, getFooterPages } from "@/lib/public-data";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { sanitizeContent } from "@/lib/sanitize";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  // Валидация slug - только буквы, цифры и дефис
  if (!/^[a-z0-9-]+$/i.test(slug) || slug.length > 100) {
    notFound();
  }

  const page = await getPageBySlug(slug);
  const settings = await getPublicSettings();
  const footerPages = await getFooterPages();

  if (!page) {
    notFound();
  }

  // Санитизация HTML контента для защиты от XSS
  const safeContent = sanitizeContent(page.content);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <Navbar settings={settings} />

      <main className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8">
            {page.title}
          </h1>
          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        </article>
      </main>

      <Footer settings={settings} pages={footerPages} />
    </div>
  );
}
