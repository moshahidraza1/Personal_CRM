-- CreateTable
CREATE TABLE "Interaction" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "occuredAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interaction_userId_idx" ON "Interaction"("userId");

-- CreateIndex
CREATE INDEX "Interaction_contactId_idx" ON "Interaction"("contactId");

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
