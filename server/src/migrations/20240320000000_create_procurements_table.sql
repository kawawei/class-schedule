-- 創建採購單表 Create procurements table
CREATE TABLE IF NOT EXISTS procurements (
    id SERIAL PRIMARY KEY,
    procurement_no VARCHAR(50) NOT NULL,
    procurement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    supplier VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'TWD',
    remark TEXT,
    extra_charges JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT procurements_procurement_no_unique UNIQUE (procurement_no)
);

-- 添加更新時間觸發器 Add updated_at trigger
CREATE TRIGGER update_procurements_updated_at
    BEFORE UPDATE ON procurements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加索引 Add indexes
CREATE INDEX idx_procurements_procurement_no ON procurements(procurement_no);
CREATE INDEX idx_procurements_supplier ON procurements(supplier);
CREATE INDEX idx_procurements_status ON procurements(status);
CREATE INDEX idx_procurements_procurement_date ON procurements(procurement_date);

-- 添加註釋 Add comments
COMMENT ON TABLE procurements IS '採購單主表 / Procurement main table';
COMMENT ON COLUMN procurements.id IS '採購單ID / Procurement ID';
COMMENT ON COLUMN procurements.procurement_no IS '採購單號 / Procurement Number';
COMMENT ON COLUMN procurements.procurement_date IS '採購日期 / Procurement Date';
COMMENT ON COLUMN procurements.supplier IS '供應商名稱 / Supplier Name';
COMMENT ON COLUMN procurements.status IS '採購狀態 / Procurement Status';
COMMENT ON COLUMN procurements.items IS '採購項目列表 / Procurement Items List';
COMMENT ON COLUMN procurements.total_amount IS '總金額 / Total Amount';
COMMENT ON COLUMN procurements.currency IS '幣種 / Currency';
COMMENT ON COLUMN procurements.remark IS '備註 / Remarks';
COMMENT ON COLUMN procurements.extra_charges IS '額外費用列表 / Extra Charges List';
COMMENT ON COLUMN procurements.created_at IS '創建時間 / Created time';
COMMENT ON COLUMN procurements.updated_at IS '更新時間 / Updated time'; 