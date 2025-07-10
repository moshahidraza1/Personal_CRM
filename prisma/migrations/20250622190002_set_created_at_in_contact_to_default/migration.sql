/*
  Warnings:

  - You are about to drop the column `striprCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeCustomerId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `cancelAtPeriodEnd` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Subscription_striprCustomerId_key";

-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "striprCustomerId",
ADD COLUMN     "stripeCustomerId" TEXT NOT NULL,
DROP COLUMN "cancelAtPeriodEnd",
ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");
