/*
  Warnings:

  - You are about to drop the column `address` on the `Employee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company_id]` on the table `bank_details` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `city` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `offers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PREPARED', 'SHIPPED', 'DELIVERED');

-- DropIndex
DROP INDEX "offer_items_offer_id_key";

-- DropIndex
DROP INDEX "offers_bank_details_id_key";

-- DropIndex
DROP INDEX "offers_customer_id_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "address",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'at',
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "zip" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "bank_details" ADD COLUMN     "company_id" TEXT,
ALTER COLUMN "reference" DROP NOT NULL;

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "reference" TEXT,
ADD COLUMN     "service_end" TIMESTAMP(3),
ADD COLUMN     "service_start" TIMESTAMP(3),
ADD COLUMN     "subject" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "legal_form" TEXT NOT NULL,
    "registration_number" TEXT,
    "vat_id" TEXT,
    "tax_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "fax" TEXT,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Österreich',
    "founding_year" TEXT,
    "employees" TEXT,
    "industry" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_notes" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "delivery_date" TIMESTAMP(3) NOT NULL,
    "customer_id" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "tax_rate" DECIMAL(5,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "processor" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PREPARED',
    "order_number" TEXT,
    "shipping_method" TEXT,
    "tracking_number" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_items" (
    "id" TEXT NOT NULL,
    "delivery_note_id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "artNr" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_company_name" ON "companies"("name");

-- CreateIndex
CREATE INDEX "idx_company_vat_id" ON "companies"("vat_id");

-- CreateIndex
CREATE INDEX "idx_delivery_customer_id" ON "delivery_notes"("customer_id");

-- CreateIndex
CREATE INDEX "idx_delivery_status" ON "delivery_notes"("status");

-- CreateIndex
CREATE INDEX "idx_delivery_item_delivery_note_id" ON "delivery_items"("delivery_note_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_company_id_key" ON "bank_details"("company_id");

-- AddForeignKey
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_items" ADD CONSTRAINT "delivery_items_delivery_note_id_fkey" FOREIGN KEY ("delivery_note_id") REFERENCES "delivery_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
