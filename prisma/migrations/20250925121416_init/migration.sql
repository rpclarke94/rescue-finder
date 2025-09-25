-- CreateTable
CREATE TABLE "public"."Dog" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "link" TEXT,
    "age" TEXT,
    "sex" TEXT,
    "breed" TEXT,
    "location" TEXT,
    "county" TEXT,
    "region" TEXT,
    "ageCategory" TEXT,
    "charity" TEXT,
    "description" TEXT,
    "scrapedDate" TIMESTAMP(3),
    "seoSlug" TEXT,
    "seoTitle" TEXT,
    "seoDesc" TEXT,
    "lastSeen" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dog_externalId_key" ON "public"."Dog"("externalId");
