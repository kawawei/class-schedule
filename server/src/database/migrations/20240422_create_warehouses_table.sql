-- 創建倉庫表 Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(20),
    notes TEXT,
    company_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加列註釋 Add column comments
COMMENT ON COLUMN warehouses.name IS '倉庫名稱 / Warehouse name';
COMMENT ON COLUMN warehouses.address IS '地址 / Address';
COMMENT ON COLUMN warehouses.contact_phone IS '聯絡電話 / Contact phone';
COMMENT ON COLUMN warehouses.notes IS '備註 / Notes';
COMMENT ON COLUMN warehouses.company_code IS '公司代碼 / Company code';

-- 添加公司代碼索引 Add company code index
CREATE INDEX idx_warehouses_company_code ON warehouses(company_code);

-- 添加更新時間觸發器 Add updated_at trigger
CREATE TRIGGER update_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 