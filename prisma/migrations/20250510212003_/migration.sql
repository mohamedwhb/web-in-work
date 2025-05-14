-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('manual', 'automatic');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('completed', 'in_progress', 'failed');

-- CreateEnum
CREATE TYPE "StorageLocation" AS ENUM ('local', 'cloud');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('daily', 'weekly', 'monthly');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('BUSINESS', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('payment', 'shipping', 'accounting', 'crm', 'email', 'storage', 'analytics', 'other');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('active', 'inactive', 'error', 'pending', 'configured');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('partial', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('bank_transfer', 'cash', 'credit_card', 'paypal', 'direct_debit', 'invoice', 'custom');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('active', 'inactive', 'on_leave');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive', 'on_leave');

-- CreateTable
CREATE TABLE "BackupSettings" (
    "id" TEXT NOT NULL,
    "automatic_backups" BOOLEAN NOT NULL DEFAULT true,
    "frequency" "Frequency" NOT NULL DEFAULT 'daily',
    "retention" INTEGER NOT NULL DEFAULT 30,
    "included_data" JSONB NOT NULL,
    "storageLocation" "StorageLocation" NOT NULL DEFAULT 'cloud',
    "cloud_provider" TEXT,
    "last_backup" TIMESTAMP(3),
    "next_backup" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackupSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BackupType" NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'completed',
    "location" "StorageLocation" NOT NULL,
    "size" TEXT NOT NULL,
    "settings_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "country" TEXT DEFAULT 'Österreich',
    "customer_number" TEXT,
    "vat_id" TEXT,
    "tax_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "type" "CustomerType" NOT NULL DEFAULT 'BUSINESS',
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "contact_person" TEXT,
    "last_order" TIMESTAMP(3),
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(13,2) DEFAULT 0.00,
    "notes" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardSetting" (
    "id" TEXT NOT NULL,
    "refresh_interval" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "compact_view" BOOLEAN NOT NULL,
    "auto_refresh" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WidgetConfig" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WidgetConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WidgetData" (
    "id" TEXT NOT NULL,
    "widget_id" TEXT NOT NULL,
    "date_range" TEXT,
    "custom_date_range" JSONB,
    "data" JSONB NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WidgetData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalText" (
    "id" TEXT NOT NULL,
    "invoice_disclaimer" TEXT NOT NULL,
    "invoice_disclaimer_enabled" BOOLEAN NOT NULL,
    "offer_disclaimer" TEXT NOT NULL,
    "offer_disclaimer_enabled" BOOLEAN NOT NULL,
    "delivery_note_disclaimer" TEXT NOT NULL,
    "delivery_note_disclaimer_enabled" BOOLEAN NOT NULL,
    "terms_and_conditions" TEXT NOT NULL,
    "terms_and_conditions_title" TEXT NOT NULL,
    "terms_and_conditions_enabled" BOOLEAN NOT NULL,
    "privacy_policy" TEXT NOT NULL,
    "privacy_policy_title" TEXT NOT NULL,
    "privacy_policy_enabled" BOOLEAN NOT NULL,
    "cancellation_policy" TEXT NOT NULL,
    "cancellation_policy_title" TEXT NOT NULL,
    "cancellation_policy_enabled" BOOLEAN NOT NULL,
    "legal_notice" TEXT NOT NULL,
    "legal_notice_title" TEXT NOT NULL,
    "legal_notice_enabled" BOOLEAN NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "preview" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "fonts" JSONB NOT NULL,
    "layout" TEXT NOT NULL,
    "show_logo" BOOLEAN NOT NULL,
    "show_signature" BOOLEAN NOT NULL,
    "show_footer" BOOLEAN NOT NULL,
    "show_watermark" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiIntegration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_url" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'inactive',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "documentation" TEXT,
    "version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiCredential" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiEndpoint" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "custom_content_type" TEXT,
    "request_body" TEXT,
    "response_example" TEXT,
    "last_tested" TIMESTAMP(3),
    "test_result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiHeader" (
    "id" TEXT NOT NULL,
    "endpoint_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiParameter" (
    "id" TEXT NOT NULL,
    "endpoint_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "customer_id" TEXT NOT NULL,
    "notes" TEXT,
    "payment_terms" TEXT NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "payment_method" "PaymentMethodType" NOT NULL,
    "payment_due_date" TIMESTAMP(3) NOT NULL,
    "payment_date" TIMESTAMP(3),
    "paymentAmount" DECIMAL(13,2) NOT NULL,
    "paymentReference" TEXT,
    "offerReference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "processing_time" TEXT NOT NULL,
    "fee" JSONB,
    "custom_fields" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "image" TEXT NOT NULL,
    "unit" TEXT,
    "barcode" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryUpdate" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "password_changed_at" TIMESTAMP(3),
    "password_expired_at" TIMESTAMP(3),
    "avatar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "role_key" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "perm_key" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'active',
    "join_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordPolicy" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "min_length" INTEGER NOT NULL DEFAULT 8,
    "require_uppercase" BOOLEAN NOT NULL DEFAULT true,
    "require_digits" BOOLEAN NOT NULL DEFAULT true,
    "require_special_chars" BOOLEAN NOT NULL DEFAULT true,
    "expiry_in_days" INTEGER NOT NULL DEFAULT 90,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "idx_backup_settings" ON "BackupSettings"("automatic_backups", "frequency");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_number_key" ON "customers"("customer_number");

-- CreateIndex
CREATE UNIQUE INDEX "customers_vat_id_key" ON "customers"("vat_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "idx_customer_name" ON "customers"("name");

-- CreateIndex
CREATE INDEX "idx_integration_type_status" ON "ApiIntegration"("type", "status");

-- CreateIndex
CREATE INDEX "idx_endpoint_integration_path_method" ON "ApiEndpoint"("integration_id", "path", "method");

-- CreateIndex
CREATE INDEX "idx_invoice_date_status" ON "Invoice"("date", "payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "License_key_key" ON "License"("key");

-- CreateIndex
CREATE INDEX "idx_license_status" ON "License"("status");

-- CreateIndex
CREATE INDEX "idx_license_validUntil" ON "License"("valid_until");

-- CreateIndex
CREATE INDEX "idx_paymentmethod_type_order" ON "PaymentMethod"("type", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "idx_product_name" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_role" ON "User"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_key_key" ON "Role"("role_key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_perm_key_key" ON "Permission"("perm_key");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_user_id_key" ON "Employee"("user_id");

-- CreateIndex
CREATE INDEX "idx_emp_status" ON "Employee"("status");

-- CreateIndex
CREATE INDEX "idx_emp_dep" ON "Employee"("department_id");

-- CreateIndex
CREATE INDEX "idx_dep_name" ON "Department"("name");

-- CreateIndex
CREATE INDEX "idx_pos_name" ON "Position"("name");

-- CreateIndex
CREATE INDEX "idx_log_user" ON "user_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_log_time" ON "user_logs"("timestamp");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "Backup" ADD CONSTRAINT "Backup_settings_id_fkey" FOREIGN KEY ("settings_id") REFERENCES "BackupSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiCredential" ADD CONSTRAINT "ApiCredential_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "ApiIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiEndpoint" ADD CONSTRAINT "ApiEndpoint_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "ApiIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiHeader" ADD CONSTRAINT "ApiHeader_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "ApiEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiParameter" ADD CONSTRAINT "ApiParameter_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "ApiEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryUpdate" ADD CONSTRAINT "InventoryUpdate_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_logs" ADD CONSTRAINT "user_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
