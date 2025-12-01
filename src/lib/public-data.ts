import { prisma } from "@/lib/prisma";

export async function getPublicSettings() {
  const settings = await prisma.settings.findMany();
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function getFooterPages() {
  return prisma.page.findMany({
    where: {
      isPublished: true,
      showInFooter: true,
    },
    orderBy: {
      order: "asc",
    },
    select: {
      title: true,
      slug: true,
    },
  });
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findFirst({
    where: {
      slug,
      isPublished: true,
    },
  });
}
