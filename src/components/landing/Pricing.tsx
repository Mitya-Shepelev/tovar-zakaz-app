"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isPopular: boolean;
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState<"month" | "year">("month");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (res.ok) {
          const data = await res.json();
          setPlans(data);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <div className="py-20 text-center">Загрузка тарифов...</div>;
  }

  if (plans.length === 0) return null;

  const filteredPlans = plans.filter((p) => p.interval === interval);

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Простые и прозрачные тарифы
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Выберите план, который подходит именно вашему бизнесу. Никаких скрытых платежей.
          </p>
        </div>

        <div className="flex justify-center mb-16">
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 inline-flex relative shadow-sm">
            <button
              onClick={() => setInterval("month")}
              className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                interval === "month"
                  ? "text-indigo-600 dark:text-white bg-indigo-50 dark:bg-indigo-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Ежемесячно
            </button>
            <button
              onClick={() => setInterval("year")}
              className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                interval === "year"
                  ? "text-indigo-600 dark:text-white bg-indigo-50 dark:bg-indigo-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Ежегодно
              <span className="absolute -top-2 -right-2 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative transition-all duration-300 hover:-translate-y-2 ${
                plan.isPopular ? "z-10 md:-mt-4 md:mb-4" : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -inset-[2px] rounded-[18px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur-sm" />
              )}
              
              <div className={`relative h-full bg-white dark:bg-slate-800 rounded-2xl p-8 flex flex-col ${
                plan.isPopular 
                  ? "border-0 shadow-2xl shadow-indigo-500/20" 
                  : "border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none"
              }`}>
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                    Популярный
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm min-h-[40px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 pb-8 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {plan.price.toLocaleString("ru-RU")}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2 font-medium">
                       {plan.currency === "RUB" ? "₽" : plan.currency}/{plan.interval === "month" ? "мес" : "год"}
                    </span>
                  </div>
                  {interval === "year" && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                      Вы экономите {(plan.price * 0.2).toFixed(0)} {plan.currency === "RUB" ? "₽" : plan.currency} в год
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        plan.isPopular ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full py-4 px-6 rounded-xl text-center font-bold transition-all duration-200 ${
                    plan.isPopular
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02]"
                      : "bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600"
                  }`}
                >
                  {plan.price === 0 ? "Попробовать бесплатно" : "Выбрать тариф"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-16">
          <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-10">
            Часто задаваемые вопросы
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                q: "Как сменить тариф?",
                a: "Вы можете изменить тариф в любое время в настройках профиля. Изменения вступят в силу немедленно."
              },
              {
                q: "Есть ли бесплатный пробный период?",
                a: "Да, у нас есть бесплатный тариф с ограниченным функционалом, чтобы вы могли оценить возможности платформы."
              },
              {
                q: "Безопасны ли мои данные?",
                a: "Мы используем современное шифрование и регулярное резервное копирование. Ваши данные под надежной защитой."
              },
              {
                q: "Какие способы оплаты доступны?",
                a: "Мы принимаем банковские карты, переводы и электронные кошельки. Для юрлиц доступна оплата по счету."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.q}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
