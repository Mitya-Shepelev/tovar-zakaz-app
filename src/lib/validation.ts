import { z } from "zod";

// Валидация пароля - минимум 8 символов, буквы и цифры
export const passwordSchema = z
  .string()
  .min(8, "Пароль должен быть не менее 8 символов")
  .regex(/[a-zA-Z]/, "Пароль должен содержать хотя бы одну букву")
  .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру");

// Валидация email
export const emailSchema = z
  .string()
  .email("Некорректный email")
  .max(255, "Email слишком длинный");

// Схема регистрации
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(2, "Имя должно быть не менее 2 символов")
    .max(100, "Имя слишком длинное")
    .optional(),
});

// Схема логина
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Введите пароль"),
});

// Схема клиента в сделке
export const clientSchema = z.object({
  name: z.string().min(1, "Имя клиента обязательно").max(255),
  phone: z.string().max(50).optional(),
  orderAmount: z.number().min(0, "Сумма не может быть отрицательной"),
});

// Схема создания сделки
export const dealSchema = z.object({
  clients: z.array(clientSchema).min(1, "Добавьте хотя бы одного клиента"),
});

// Схема настроек пользователя
export const userSettingsSchema = z.object({
  supplierCommission: z
    .number()
    .min(0, "Комиссия не может быть отрицательной")
    .max(100, "Комиссия не может превышать 100%"),
  sellerCommission: z
    .number()
    .min(0, "Комиссия не может быть отрицательной")
    .max(100, "Комиссия не может превышать 100%"),
});

// Схема настроек админа
export const adminSettingsSchema = z.record(
  z.string().regex(/^[a-zA-Z_]+$/, "Недопустимый ключ настройки"),
  z.string().max(10000, "Значение слишком длинное")
);

// Схема создания страницы
export const pageSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен").max(255),
  slug: z
    .string()
    .min(1, "URL обязателен")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "URL может содержать только буквы, цифры и дефис"),
  content: z.string().max(100000, "Контент слишком большой"),
  isPublished: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
});

// Валидация ID (CUID)
export const idSchema = z.string().regex(/^[a-z0-9]+$/i, "Некорректный ID");

// Схема создания тикета поддержки
export const supportTicketSchema = z.object({
  subject: z
    .string()
    .min(3, "Тема должна быть не менее 3 символов")
    .max(200, "Тема слишком длинная"),
  message: z
    .string()
    .min(10, "Сообщение должно быть не менее 10 символов")
    .max(5000, "Сообщение слишком длинное"),
});

// Схема сообщения в тикете
export const supportMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Сообщение не может быть пустым")
    .max(5000, "Сообщение слишком длинное"),
});

// Схема тарифного плана
export const planSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Название слишком длинное"),
  description: z.string().max(1000, "Описание слишком длинное").optional().nullable(),
  price: z
    .number()
    .min(0, "Цена не может быть отрицательной")
    .max(10000000, "Цена слишком большая"),
  currency: z.enum(["RUB", "USD", "EUR"]).default("RUB"),
  interval: z.enum(["month", "year"]).default("month"),
  features: z
    .array(z.string().max(200, "Слишком длинная особенность"))
    .max(20, "Максимум 20 особенностей")
    .default([]),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  order: z.number().int().min(0).max(1000).default(0),
});

// Схема назначения плана пользователю
export const userPlanSchema = z.object({
  planId: z.string().regex(/^[a-z0-9]+$/i, "Некорректный ID плана").nullable(),
});

// Хелпер для безопасного парсинга
export function safeParseJson<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map((e) => e.message).join(", "),
  };
}
