import { prisma } from "./prisma";

interface BanStatus {
  isBanned: boolean;
  banExpires: Date | null;
  banReason: string | null;
}

/**
 * Проверяет статус блокировки пользователя в базе данных.
 * Возвращает null если пользователь не забанен или бан истёк.
 */
export async function checkUserBan(userId: string): Promise<BanStatus | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isBanned: true,
      banExpires: true,
      banReason: true,
    },
  });

  if (!user || !user.isBanned) {
    return null;
  }

  // Проверяем, не истёк ли бан
  if (user.banExpires && new Date(user.banExpires) < new Date()) {
    // Бан истёк — автоматически снимаем
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banExpires: null,
        banReason: null,
      },
    });
    return null;
  }

  return {
    isBanned: user.isBanned,
    banExpires: user.banExpires,
    banReason: user.banReason,
  };
}
