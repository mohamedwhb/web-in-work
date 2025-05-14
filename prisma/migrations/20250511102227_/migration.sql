/*
  Warnings:

  - You are about to drop the column `group` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "group",
ADD COLUMN     "groupId" TEXT,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "stock" DROP NOT NULL,
ALTER COLUMN "stock" SET DEFAULT 0,
ALTER COLUMN "artNr" DROP NOT NULL,
ALTER COLUMN "minStock" SET DEFAULT 0,
ALTER COLUMN "taxRate" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
