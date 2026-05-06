-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'BUSINESS');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- AlterTable
ALTER TABLE "User" ADD COLUMN "organizationId" TEXT,
ADD COLUMN "role" "Role";

-- Data migration: uma organização por usuário existente
DO $$
DECLARE
  u RECORD;
  oid TEXT;
  final_slug TEXT;
BEGIN
  FOR u IN SELECT id, name FROM "User" LOOP
    oid := 'org_' || replace(gen_random_uuid()::text, '-', '');
    final_slug := 'org-' || substr(md5(random()::text || clock_timestamp()::text || u.id::text), 1, 16);

    INSERT INTO "Organization" ("id", "name", "slug", "plan", "createdAt", "updatedAt")
    VALUES (
      oid,
      u.name || ' — Organização',
      final_slug,
      'FREE',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );

    UPDATE "User" SET "organizationId" = oid, "role" = 'OWNER'::"Role" WHERE "id" = u.id;
  END LOOP;
END $$;

ALTER TABLE "User" ALTER COLUMN "organizationId" SET NOT NULL;

UPDATE "User" SET "role" = 'OWNER'::"Role" WHERE "role" IS NULL;

ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MEMBER'::"Role";

-- AlterTable Category
ALTER TABLE "Category" ADD COLUMN "organizationId" TEXT;

UPDATE "Category" c SET "organizationId" = u."organizationId"
FROM "User" u WHERE c."userId" = u."id";

ALTER TABLE "Category" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable Transaction
ALTER TABLE "Transaction" ADD COLUMN "organizationId" TEXT;

UPDATE "Transaction" t SET "organizationId" = u."organizationId"
FROM "User" u WHERE t."userId" = u."id";

ALTER TABLE "Transaction" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable EntityRecord
ALTER TABLE "EntityRecord" ADD COLUMN "organizationId" TEXT;

UPDATE "EntityRecord" e SET "organizationId" = u."organizationId"
FROM "User" u WHERE e."userId" = u."id";

ALTER TABLE "EntityRecord" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Category" ADD CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EntityRecord" ADD CONSTRAINT "EntityRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX "Category_organizationId_idx" ON "Category"("organizationId");
CREATE INDEX "Transaction_organizationId_idx" ON "Transaction"("organizationId");
CREATE INDEX "EntityRecord_organizationId_idx" ON "EntityRecord"("organizationId");
