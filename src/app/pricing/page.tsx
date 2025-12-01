import Pricing from "@/components/landing/Pricing";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getPublicSettings, getFooterPages } from "@/lib/public-data";

export default async function PricingPage() {
  const settings = await getPublicSettings();
  const footerPages = await getFooterPages();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-[family-name:var(--font-geist-sans)]">
      <Navbar settings={settings} />
      <div className="pt-20">
        <Pricing />
      </div>
      <Footer settings={settings} pages={footerPages} />
    </div>
  );
}
