// Простой in-memory rate limiter
// В продакшене лучше использовать Redis

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Настройки лимитов (можно менять через админку)
export const rateLimitSettings = {
  registrationEnabled: true,
  loginEnabled: true,
};

// Очистка устаревших записей каждые 5 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Сброс всех лимитов
export function clearAllRateLimits(): number {
  const count = rateLimitStore.size;
  rateLimitStore.clear();
  return count;
}

// Сброс лимитов по типу (register, login, etc.)
export function clearRateLimitsByType(type: string): number {
  let count = 0;
  for (const key of rateLimitStore.keys()) {
    if (key.startsWith(`${type}:`)) {
      rateLimitStore.delete(key);
      count++;
    }
  }
  return count;
}

// Получить статистику лимитов
export function getRateLimitStats() {
  const stats: Record<string, number> = {};
  for (const key of rateLimitStore.keys()) {
    const type = key.split(':')[0];
    stats[type] = (stats[type] || 0) + 1;
  }
  return {
    total: rateLimitStore.size,
    byType: stats,
    settings: { ...rateLimitSettings },
  };
}

interface RateLimitOptions {
  // Максимальное количество запросов
  max: number;
  // Окно времени в миллисекундах
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  // Проверяем, отключён ли лимит для данного типа
  const type = identifier.split(':')[0];
  if (type === 'register' && !rateLimitSettings.registrationEnabled) {
    return { success: true, remaining: options.max, resetTime: 0 };
  }
  if (type === 'login' && !rateLimitSettings.loginEnabled) {
    return { success: true, remaining: options.max, resetTime: 0 };
  }

  const now = Date.now();
  const key = identifier;

  let entry = rateLimitStore.get(key);

  // Если записи нет или время истекло - создаём новую
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    rateLimitStore.set(key, entry);
    return {
      success: true,
      remaining: options.max - 1,
      resetTime: entry.resetTime,
    };
  }

  // Проверяем лимит
  if (entry.count >= options.max) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Увеличиваем счётчик
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: options.max - entry.count,
    resetTime: entry.resetTime,
  };
}

// Предустановленные лимиты
export const rateLimits = {
  // Логин: 10 попыток за 15 минут
  login: { max: 10, windowMs: 15 * 60 * 1000 },
  // Регистрация: 10 аккаунтов за час
  register: { max: 10, windowMs: 60 * 60 * 1000 },
  // API: 100 запросов в минуту
  api: { max: 100, windowMs: 60 * 1000 },
  // Тикеты поддержки: 5 за час
  supportTicket: { max: 5, windowMs: 60 * 60 * 1000 },
  // Сообщения в тикете: 20 за 10 минут
  supportMessage: { max: 20, windowMs: 10 * 60 * 1000 },
};

// Получение IP из заголовков
export function getClientIp(request: Request): string {
  // Проверяем стандартные заголовки прокси
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback
  return "unknown";
}
