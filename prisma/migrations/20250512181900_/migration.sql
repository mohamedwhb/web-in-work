/*
  Warnings:

  - You are about to drop the column `company_id` on the `bank_details` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bankDetailsId]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bankDetailsId` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bank_details" DROP CONSTRAINT "bank_details_company_id_fkey";

-- DropIndex
DROP INDEX "bank_details_company_id_key";

-- AlterTable
ALTER TABLE "bank_details" DROP COLUMN "company_id";

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "bankDetailsId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "companies_bankDetailsId_key" ON "companies"("bankDetailsId");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_bankDetailsId_fkey" FOREIGN KEY ("bankDetailsId") REFERENCES "bank_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
