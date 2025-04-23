-- 使用數據庫 Use database
\c class_schedule;

-- 創建租戶表（如果不存在）Create tenants table if not exists
CREATE TABLE IF NOT EXISTS tenants (
    company_code VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建租戶表索引（如果不存在）Create index if not exists
CREATE INDEX IF NOT EXISTS idx_tenants_company_name ON tenants(company_name);

-- 設置權限 Set permissions
ALTER TABLE tenants OWNER TO postgres;

-- 創建課程表（如果不存在）Create courses table if not exists
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    company_code VARCHAR(50) NOT NULL REFERENCES tenants(company_code),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建課程表索引（如果不存在）Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_courses_company_code ON courses(company_code);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- 設置權限 Set permissions
ALTER TABLE courses OWNER TO postgres;

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
    company_code VARCHAR(50) NOT NULL REFERENCES tenants(company_code),
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

-- 創建 QR Code 表（如果不存在）Create QR Code table if not exists
CREATE TABLE IF NOT EXISTS qrcodes (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    qrcode_url VARCHAR(255) NOT NULL,
    redirect_url VARCHAR(255) NOT NULL,
    actual_url VARCHAR(255) NOT NULL,
    tenant_id INTEGER NOT NULL,
    scan_count INTEGER DEFAULT 0,
    random_string VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT qrcodes_random_string_unique UNIQUE (random_string)
);

-- 創建 QR Code 表索引（如果不存在）Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_qrcodes_tenant_id ON qrcodes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qrcodes_created_at ON qrcodes(created_at);

-- 設置權限 Set permissions
ALTER TABLE qrcodes OWNER TO postgres;

-- 創建庫存表（如果不存在）Create inventories table if not exists
CREATE TABLE IF NOT EXISTS inventories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course_type VARCHAR(255) NOT NULL,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit_price_currency VARCHAR(10) NOT NULL DEFAULT 'NT$',
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost_currency VARCHAR(10) NOT NULL DEFAULT 'NT$',
    notes TEXT,
    qrcode_url VARCHAR(255),
    qrcode_name VARCHAR(255),
    image_url VARCHAR(255),
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventories_name_unique UNIQUE (name)
);

-- 創建庫存表索引（如果不存在）Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_inventories_course_type ON inventories(course_type);
CREATE INDEX IF NOT EXISTS idx_inventories_created_at ON inventories(created_at);

-- 設置權限 Set permissions
ALTER TABLE inventories OWNER TO postgres;

-- 創建倉庫庫存表（如果不存在）Create warehouse inventories table if not exists
CREATE TABLE IF NOT EXISTS warehouse_inventories (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER NOT NULL REFERENCES inventories(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    location_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 創建倉庫庫存表索引（如果不存在）Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_warehouse_inventories_inventory_id ON warehouse_inventories(inventory_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventories_location_id ON warehouse_inventories(location_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventories_created_at ON warehouse_inventories(created_at);

-- 設置權限 Set permissions
ALTER TABLE warehouse_inventories OWNER TO postgres;

-- 添加更新時間觸發器 Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為所有表添加更新時間觸發器 Add updated_at trigger to all tables
CREATE TRIGGER update_inventories_updated_at
    BEFORE UPDATE ON inventories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouse_inventories_updated_at
    BEFORE UPDATE ON warehouse_inventories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加註釋 Add comments
COMMENT ON TABLE inventories IS '庫存主表 / Inventory main table';
COMMENT ON COLUMN inventories.id IS '庫存ID / Inventory ID';
COMMENT ON COLUMN inventories.name IS '貨物名稱 / Item name';
COMMENT ON COLUMN inventories.course_type IS '課程種類 / Course type';
COMMENT ON COLUMN inventories.min_quantity IS '最小庫存量 / Minimum quantity';
COMMENT ON COLUMN inventories.unit_price IS '單價 / Unit price';
COMMENT ON COLUMN inventories.unit_price_currency IS '單價貨幣 / Unit price currency';
COMMENT ON COLUMN inventories.cost IS '成本 / Cost';
COMMENT ON COLUMN inventories.cost_currency IS '成本貨幣 / Cost currency';
COMMENT ON COLUMN inventories.notes IS '備註 / Notes';
COMMENT ON COLUMN inventories.qrcode_url IS 'QR Code URL';
COMMENT ON COLUMN inventories.qrcode_name IS 'QR Code 名稱 / QR Code name';
COMMENT ON COLUMN inventories.image_url IS '圖片URL / Image URL';
COMMENT ON COLUMN inventories.specifications IS '規格 / Specifications';
COMMENT ON COLUMN inventories.created_at IS '創建時間 / Created time';
COMMENT ON COLUMN inventories.updated_at IS '更新時間 / Updated time';

COMMENT ON TABLE warehouse_inventories IS '倉庫庫存表 / Warehouse inventory table';
COMMENT ON COLUMN warehouse_inventories.id IS '倉庫庫存ID / Warehouse inventory ID';
COMMENT ON COLUMN warehouse_inventories.inventory_id IS '庫存ID / Inventory ID';
COMMENT ON COLUMN warehouse_inventories.quantity IS '數量 / Quantity';
COMMENT ON COLUMN warehouse_inventories.location_id IS '位置ID / Location ID';
COMMENT ON COLUMN warehouse_inventories.created_at IS '創建時間 / Created time';
COMMENT ON COLUMN warehouse_inventories.updated_at IS '更新時間 / Updated time'; 