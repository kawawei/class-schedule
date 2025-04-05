-- 創建數據庫 Create database
SELECT 'CREATE DATABASE class_schedule' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'class_schedule');

-- 連接到數據庫 Connect to database
\c class_schedule;

-- 創建租戶表 Create tenants table
CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "company_code" VARCHAR(50) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 創建課程表 Create courses table
CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" SERIAL PRIMARY KEY,
    "category" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "company_code" VARCHAR(50) NOT NULL REFERENCES "public"."tenants" ("company_code"),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
); 