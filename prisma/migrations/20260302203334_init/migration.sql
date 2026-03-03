-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "tagSlug" TEXT NOT NULL,
    "description" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#f7931a',
    "accentColor" TEXT NOT NULL DEFAULT '#0d0d0d',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_domain_key" ON "Site"("domain");
