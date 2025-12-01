-- AlterTable
ALTER TABLE "SupportMessage" ADD COLUMN     "attachments" JSONB NOT NULL DEFAULT '[]';
