import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkUserBan } from "@/lib/check-ban";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

// Разрешенные MIME-типы изображений
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Максимальный размер файла (5 MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Rate limit для загрузки файлов
const UPLOAD_RATE_LIMIT = { max: 10, windowMs: 60 * 1000 }; // 10 файлов в минуту

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Проверка бана (кроме админов)
    if (session.user.role !== "admin") {
      const banStatus = await checkUserBan(session.user.id);
      if (banStatus) {
        return NextResponse.json(
          { error: "Ваш аккаунт заблокирован", banned: true },
          { status: 403 }
        );
      }
    }

    // Rate limiting
    const rateLimitResult = rateLimit(
      `upload:${session.user.id}`,
      UPLOAD_RATE_LIMIT
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Слишком много загрузок. Попробуйте позже" },
        { status: 429 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Файл не загружен" }, { status: 400 });
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимум 5 МБ" },
        { status: 400 }
      );
    }

    // Проверка MIME-типа
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Недопустимый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WebP)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Проверка magic bytes для дополнительной валидации типа файла
    if (!isValidImageBuffer(buffer)) {
      return NextResponse.json(
        { error: "Файл не является допустимым изображением" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Ignore error if directory exists
    }

    // Генерируем безопасное имя файла (случайный UUID + расширение)
    const extension = getExtensionFromMimeType(file.type);
    const randomName = crypto.randomUUID();
    const filename = `${randomName}${extension}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Ошибка загрузки файла" }, { status: 500 });
  }
}

// Проверка magic bytes изображения
function isValidImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }

  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length > 11 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
}

// Получение расширения по MIME-типу
function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };
  return extensions[mimeType] || ".bin";
}
