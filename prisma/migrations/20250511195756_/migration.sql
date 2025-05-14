/*
  Warnings:

  - The primary key for the `offer_items` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "offer_items" DROP CONSTRAINT "offer_items_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "offer_items_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "offer_items_id_seq";
