-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "employeeId" TEXT;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
