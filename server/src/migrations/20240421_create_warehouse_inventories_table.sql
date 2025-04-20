-- 創建倉庫庫存關聯表 Create warehouse inventories table
CREATE TABLE IF NOT EXISTS warehouse_inventories (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER NOT NULL,
    location VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    defective_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory
        FOREIGN KEY (inventory_id)
        REFERENCES inventories (id)
        ON DELETE CASCADE,
    CONSTRAINT warehouse_inventory_unique UNIQUE (inventory_id, location)
);

-- 創建索引 Create indexes
CREATE INDEX idx_warehouse_inventories_inventory_id ON warehouse_inventories(inventory_id);
CREATE INDEX idx_warehouse_inventories_location ON warehouse_inventories(location);

-- 添加更新時間觸發器 Add updated_at trigger
CREATE TRIGGER update_warehouse_inventories_updated_at
    BEFORE UPDATE ON warehouse_inventories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加註釋 Add comments
COMMENT ON TABLE warehouse_inventories IS '倉庫庫存關聯表 / Warehouse inventory association table';
COMMENT ON COLUMN warehouse_inventories.id IS '倉庫庫存ID / Warehouse inventory ID';
COMMENT ON COLUMN warehouse_inventories.inventory_id IS '庫存ID / Inventory ID';
COMMENT ON COLUMN warehouse_inventories.location IS '倉庫位置 / Warehouse location';
COMMENT ON COLUMN warehouse_inventories.quantity IS '當前數量 / Current quantity';
COMMENT ON COLUMN warehouse_inventories.defective_quantity IS '不良品數量 / Defective quantity';
COMMENT ON COLUMN warehouse_inventories.created_at IS '創建時間 / Created time';
COMMENT ON COLUMN warehouse_inventories.updated_at IS '更新時間 / Updated time'; 