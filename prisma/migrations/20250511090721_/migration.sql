/*
  Warnings:

  - Added the required column `artNr` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "artNr" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "group" TEXT NOT NULL,
ADD COLUMN     "minStock" INTEGER,
ADD COLUMN     "taxRate" INTEGER,
ALTER COLUMN "barcode" DROP NOT NULL;
