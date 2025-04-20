-- 創建庫存表 Create inventories table
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventories_name_unique UNIQUE (name)
);

-- 添加更新時間觸發器 Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventories_updated_at
    BEFORE UPDATE ON inventories
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
COMMENT ON COLUMN inventories.created_at IS '創建時間 / Created time';
COMMENT ON COLUMN inventories.updated_at IS '更新時間 / Updated time'; 