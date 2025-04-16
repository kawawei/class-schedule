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

-- 創建課程排課表（如果不存在）Create course schedules table if not exists
CREATE TABLE IF NOT EXISTS course_schedules (
    id SERIAL PRIMARY KEY,
    series_id VARCHAR(36) DEFAULT NULL,
    school_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    course_type VARCHAR(50) NOT NULL,
    teacher_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    course_fee DECIMAL(10, 2) NOT NULL,
    teacher_fee DECIMAL(10, 2) NOT NULL,
    company_code VARCHAR(50) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_days JSON DEFAULT '[]',
    recurring_start_date DATE,
    recurring_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建課程排課表索引（如果不存在）Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_schedule_teacher_id ON course_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON course_schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedule_company_code ON course_schedules(company_code);
CREATE INDEX IF NOT EXISTS idx_schedule_is_recurring ON course_schedules(is_recurring);
CREATE INDEX IF NOT EXISTS idx_schedule_recurring_start_date ON course_schedules(recurring_start_date);
CREATE INDEX IF NOT EXISTS idx_schedule_recurring_end_date ON course_schedules(recurring_end_date);
CREATE INDEX IF NOT EXISTS idx_schedule_series_id ON course_schedules(series_id);

-- 設置權限 Set permissions
ALTER TABLE course_schedules OWNER TO postgres;

-- 創建 QR Code 表 Create QR Code table
CREATE TABLE IF NOT EXISTS qrcodes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- QR Code 名稱 QR Code Name
    qrcode_url TEXT NOT NULL, -- QR Code URL
    redirect_url TEXT NOT NULL, -- 重定向 URL Redirect URL
    actual_url TEXT NOT NULL, -- 實際目標 URL Actual Target URL
    scan_count INTEGER DEFAULT 0, -- 掃描次數 Scan Count
    tenant_id INTEGER NOT NULL, -- 租戶 ID Tenant ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 創建時間 Created Time
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 更新時間 Updated Time
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 創建 QR Code 掃描記錄表 Create QR Code scan records table
CREATE TABLE IF NOT EXISTS qrcode_scans (
    id SERIAL PRIMARY KEY,
    qr_code_id INTEGER NOT NULL, -- QR Code ID
    ip_address VARCHAR(45), -- IP 地址 IP Address
    user_agent TEXT, -- 用戶代理 User Agent
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 掃描時間 Scan Time
    FOREIGN KEY (qr_code_id) REFERENCES qrcodes(id) ON DELETE CASCADE
);

-- 創建索引 Create indexes
CREATE INDEX IF NOT EXISTS idx_qrcodes_tenant_id ON qrcodes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qrcodes_name ON qrcodes(name);
CREATE INDEX IF NOT EXISTS idx_qrcodes_qrcode_url ON qrcodes(qrcode_url);
CREATE INDEX IF NOT EXISTS idx_qrcode_scans_qr_code_id ON qrcode_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qrcode_scans_scan_time ON qrcode_scans(scan_time);

-- 設置權限 Set permissions
ALTER TABLE qrcodes OWNER TO postgres;
ALTER TABLE qrcode_scans OWNER TO postgres; 