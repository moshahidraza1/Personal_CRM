-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetCode" TEXT,
ADD COLUMN     "passwordResetCodeExpires" TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP NOT NULL;
