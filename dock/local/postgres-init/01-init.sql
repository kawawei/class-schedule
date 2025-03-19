-- 創建租戶表（如果不存在）Create tenants table if not exists
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    company_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建租戶表索引（如果不存在）Create index if not exists
CREATE INDEX IF NOT EXISTS idx_tenants_company_code ON tenants(company_code);

-- 設置權限 Set permissions
ALTER TABLE tenants OWNER TO postgres; 